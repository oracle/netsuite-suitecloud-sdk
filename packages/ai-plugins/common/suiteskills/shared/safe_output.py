"""Compatibility adapter preserving explicit --output-dir publication contracts.

All writes use shared/publication.py. Qualified Darwin/local APFS only; output
roots must exist outside installed packages, be user owned and not group/world
writable. Existing targets and symlink ancestry are refused. Directory FDs bind
publication through concurrent renames. No hostile same-UID actor is in scope.
"""
import importlib.util
import os
from pathlib import Path
import secrets

_spec = importlib.util.spec_from_file_location('suiteskills_safe_publication', Path(__file__).with_name('publication.py'))
_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)


def publish(data, destination, *, output_dir, inputs=()):
    if output_dir is None:
        raise ValueError('An explicit --output-dir is required')
    root = Path(output_dir)
    dest = Path(destination)
    raw = os.fspath(destination)
    if '..' in dest.parts or '\\' in raw or ':' in raw:
        raise ValueError('Unsafe output filename')
    if dest.is_absolute():
        if dest.parent != root:
            raise ValueError('Destination must be directly inside --output-dir')
        name = dest.name
    else:
        if len(dest.parts) != 1:
            raise ValueError('Destination must be a basename or a direct absolute child')
        name = raw
    payload = data.encode('utf-8') if isinstance(data, str) else data
    with _module.Publisher(root, inputs=inputs, forbidden_roots=(Path(__file__).absolute().parent,)) as publisher:
        publisher.publish(name, payload)
    return root / name
