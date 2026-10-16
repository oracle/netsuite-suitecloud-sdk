"""Qualified Darwin/APFS exclusive atomic publication. All artifact engines return bytes.

Requires trusted local filesystem/ancestry and no hostile same-UID/privileged actor.
Directory FDs bind operations even if a pathname is renamed; no symlink is followed.
Atomicity is per artifact, not a crash-durable transaction across multiple artifacts.
"""
import os
import pathlib
import secrets
import stat
import sys
import ctypes
import re


def basename(name):
    if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_. -]{0,119}', name) or name in {'.', '..'}:
        raise ValueError('A bounded ordinary output basename is required')
    return name


def filesystem_supported(kind, flags):
    return kind == 'apfs' and bool(flags & 0x00001000)  # Darwin MNT_LOCAL


def require_filesystem(fd):
    # Initial platform adapter is deliberately bounded to verified Darwin APFS.
    # Layout/constants: Darwin SDK sys/mount.h __DARWIN_STRUCT_STATFS64.
    if sys.platform != 'darwin': raise ValueError('Publication platform adapter unavailable')
    class Statfs(ctypes.Structure):
        _fields_ = [('bsize',ctypes.c_uint32),('iosize',ctypes.c_int32),
                    *[(n,ctypes.c_uint64) for n in ('blocks','bfree','bavail','files','ffree')],
                    ('fsid',ctypes.c_int32*2),('owner',ctypes.c_uint32),
                    ('type',ctypes.c_uint32),('flags',ctypes.c_uint32),('subtype',ctypes.c_uint32),
                    ('name',ctypes.c_char*16),('mount',ctypes.c_char*1024),
                    ('fromname',ctypes.c_char*1024),('flags_ext',ctypes.c_uint32),
                    ('reserved',ctypes.c_uint32*7)]
    libc=ctypes.CDLL('/usr/lib/libSystem.B.dylib',use_errno=True)
    fn=libc.fstatfs64;fn.argtypes=[ctypes.c_int,ctypes.POINTER(Statfs)];fn.restype=ctypes.c_int
    result=Statfs()
    if fn(fd,ctypes.byref(result)) != 0:raise OSError(ctypes.get_errno(),'Cannot establish filesystem guarantees')
    if not filesystem_supported(result.name.decode('ascii'),result.flags):
        raise ValueError('Only local APFS publication is currently qualified; other filesystems fail closed')


def installed(fd):
    names = set(os.listdir(fd))
    return bool(names & {'.claude-plugin', '.codex-plugin', 'plugin.json', 'CATALOG.json',
                         'FOUNDATION-SNAPSHOT.json', 'FOUNDATION-LOCK.json', 'SKILL.md', 'RUNBOOK.md'})


class Publisher:
    def __init__(self, directory, inputs=(), forbidden_roots=()):
        if os.name != 'posix' or not all(hasattr(os, n) for n in ('O_NOFOLLOW', 'O_DIRECTORY')) or not {os.open, os.link, os.unlink, os.mkdir, os.rmdir}.issubset(os.supports_dir_fd):
            raise ValueError('Required POSIX directory-bound publication guarantees unavailable')
        raw = os.fspath(directory)
        if not os.path.isabs(raw) or '..' in pathlib.PurePath(raw).parts:
            raise ValueError('Explicit absolute output directory required; no parent traversal')
        forbidden = {os.path.abspath(os.fspath(p)) for p in forbidden_roots}
        self.fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
        walked = pathlib.Path('/')
        try:
            for component in pathlib.PurePath(raw).parts[1:]:
                walked = walked / component
                if str(walked) in forbidden: raise ValueError('Output inside protected source/package forbidden')
                nxt = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=self.fd)
                os.close(self.fd); self.fd = nxt
                if installed(self.fd): raise ValueError('Output inside installed/candidate package forbidden')
            info = os.fstat(self.fd)
            if info.st_uid != os.getuid() or info.st_mode & 0o022:
                raise ValueError('Selected output directory must be owned and private to its user')
            require_filesystem(self.fd)
            self.inputs = {(os.stat(p).st_dev, os.stat(p).st_ino) for p in inputs}
        except BaseException:
            os.close(self.fd); self.fd = None
            raise

    def __enter__(self): return self

    def __exit__(self, *args):
        if self.fd is not None: os.close(self.fd); self.fd = None

    def publish(self, name, data, validator=None):
        basename(name)
        if type(data) is not bytes: raise ValueError('Completed immutable bytes required')
        if self.fd is None: raise ValueError('Publisher closed')
        # No replacement path exists, even if a caller requests one.
        try:
            os.stat(name, dir_fd=self.fd, follow_symlinks=False)
        except FileNotFoundError: pass
        else: raise FileExistsError(name)
        stage = '.dv-stage-' + secrets.token_hex(16)
        os.mkdir(stage, 0o700, dir_fd=self.fd)
        try:
            sfd = os.open(stage, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=self.fd)
        except BaseException:
            os.rmdir(stage, dir_fd=self.fd)
            raise
        try:
            fd = os.open('artifact', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=sfd)
            with os.fdopen(fd, 'wb') as handle:
                handle.write(data); handle.flush(); os.fsync(handle.fileno())
            if validator is not None: validator(data)
            # linkat is the exclusive no-replace publication point, never open(path, 'w').
            os.link('artifact', name, src_dir_fd=sfd, dst_dir_fd=self.fd, follow_symlinks=False)
            os.fsync(self.fd)
        finally:
            try: os.unlink('artifact', dir_fd=sfd)
            finally:
                os.close(sfd); os.rmdir(stage, dir_fd=self.fd)
        return name


# Legacy CLIs retain their explicit OUTPUT parent + basename interface. The
# selected existing parent is the sole bound output root for that operation.
def cli_inputs(namespace):
    return tuple(value for key, value in vars(namespace).items()
                 if key != 'output' and isinstance(value, pathlib.Path))


def publish_file(output, content, inputs=()):
    raw = os.fspath(output)
    if '..' in pathlib.PurePath(raw).parts:
        raise ValueError('Output parent traversal is unsupported')
    destination = pathlib.Path(raw).absolute()  # lexical only; never resolve symlinks
    data = content.encode('utf-8') if isinstance(content, str) else content
    with Publisher(str(destination.parent), inputs=inputs,
                   forbidden_roots=(pathlib.Path(__file__).absolute().parent,)) as publisher:
        return publisher.publish(destination.name, data)
