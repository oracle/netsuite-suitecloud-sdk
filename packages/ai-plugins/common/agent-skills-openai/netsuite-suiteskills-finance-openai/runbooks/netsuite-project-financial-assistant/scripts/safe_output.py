"""Exclusive publication of local project artifacts.

The caller must choose an existing private directory whose ancestors cannot be
changed by lower-trust actors. Reject linked ancestors (including Windows
junctions), existing destinations, and output inside the installed plugin.
No predictable staging file and no overwrite mode are used.
"""
from pathlib import Path
import os
import stat

PLUGIN_ROOT = Path(__file__).resolve().parents[1]

def _is_linked(path):
    try:
        info = path.lstat()
    except FileNotFoundError:
        return False
    # Windows junctions and other reparse points are refused without requiring
    # Path.is_junction(), preserving compatibility with pre-3.12 Python.
    return stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
    )


def write_new_text(output, content, *, encoding="utf-8"):
    output = Path(os.path.abspath(output))
    if _is_linked(output):
        raise ValueError("Linked output paths are unsupported")
    for directory in (output.parent, *output.parent.parents):
        if _is_linked(directory):
            raise ValueError("Linked output directories are unsupported")
    if not output.parent.is_dir():
        raise ValueError("An existing private output directory is required")
    if output.resolve().is_relative_to(PLUGIN_ROOT):
        raise ValueError("Output must be outside the installed plugin")
    # O_EXCL refuses pre-existing files, hardlinks, and leaf symlinks atomically.
    # Directory checks are defense in depth, not a lock against ancestor swaps;
    # the private-directory precondition is essential on every supported OS.
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    flags |= getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_BINARY", 0)
    fd = os.open(output, flags, 0o600)
    with os.fdopen(fd, "w", encoding=encoding, newline="") as handle:
        handle.write(content)
