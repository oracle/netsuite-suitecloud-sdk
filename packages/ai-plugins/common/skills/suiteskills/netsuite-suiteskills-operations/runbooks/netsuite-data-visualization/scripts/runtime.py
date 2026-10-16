"""Checked native filesystem profiles; a profile is not native-host certification.

Linux layout: glibc 2.39 bits/statfs.h and bits/typesizes.h, LP64 only.
Unknown native layouts are refused BEFORE passing an output buffer to libc.
"""
import ctypes
import platform
import sys


class RuntimeUnavailable(ValueError):
    def __init__(self, code, message):
        self.code = code
        super().__init__(message)


class LinuxStatfs(ctypes.Structure):
    _fields_ = [('kind', ctypes.c_long), ('bsize', ctypes.c_long),
                *[(n, ctypes.c_ulong) for n in ('blocks','bfree','bavail','files','ffree')],
                ('fsid', ctypes.c_int32 * 2), ('namelen', ctypes.c_long),
                ('frsize', ctypes.c_long), ('flags', ctypes.c_long),
                ('spare', ctypes.c_long * 4)]


class DarwinStatfs(ctypes.Structure):
    _fields_ = [('bsize',ctypes.c_uint32),('iosize',ctypes.c_int32),
                *[(n,ctypes.c_uint64) for n in ('blocks','bfree','bavail','files','ffree')],
                ('fsid',ctypes.c_int32*2),('owner',ctypes.c_uint32),
                ('type',ctypes.c_uint32),('flags',ctypes.c_uint32),('subtype',ctypes.c_uint32),
                ('name',ctypes.c_char*16),('mount',ctypes.c_char*1024),
                ('fromname',ctypes.c_char*1024),('flags_ext',ctypes.c_uint32),
                ('reserved',ctypes.c_uint32*7)]


def linux_statfs(fd):
    arch = platform.machine()
    if (arch not in ('x86_64','aarch64') or sys.byteorder != 'little' or
            ctypes.sizeof(ctypes.c_void_p) != 8 or ctypes.sizeof(ctypes.c_long) != 8 or
            ctypes.sizeof(LinuxStatfs) != 120 or LinuxStatfs.flags.offset != 80 or
            LinuxStatfs.fsid.offset != 56 or LinuxStatfs.spare.offset != 88):
        raise RuntimeUnavailable('unsupported_abi','Checked Linux LP64 ABI unavailable')
    try:
        libc = ctypes.CDLL(None, use_errno=True)
        version = libc.gnu_get_libc_version
        version.argtypes = []; version.restype = ctypes.c_char_p
        if version() != b'2.39':
            raise RuntimeUnavailable('unsupported_abi','Checked glibc 2.39 ABI required')
        fn = libc.fstatfs
        fn.argtypes = [ctypes.c_int,ctypes.POINTER(LinuxStatfs)]; fn.restype = ctypes.c_int
        result = LinuxStatfs()
        if fn(fd,ctypes.byref(result)) != 0:
            raise RuntimeUnavailable('unsupported_filesystem','Filesystem observation failed')
    except (AttributeError,OSError) as exc:
        raise RuntimeUnavailable('unsupported_abi','Required native interface unavailable') from exc
    return result.kind, result.flags, 'glibc-2.39-'+arch+'-lp64'


def filesystem_info(fd):
    """Read-only observation, including publication-ineligible filesystems."""
    if sys.platform == 'linux':
        kind, flags, abi = linux_statfs(fd)
        name = {0xEF53:'ext-family',0x65735546:'fuse'}.get(kind,'unsupported')
        return {'os':'linux','abi':abi,'filesystem':name,'flags':flags}
    if sys.platform != 'darwin':
        raise RuntimeUnavailable('unsupported_os','Publication runtime unavailable')
    try:
        libc=ctypes.CDLL('/usr/lib/libSystem.B.dylib',use_errno=True)
        fn=libc.fstatfs64
        fn.argtypes=[ctypes.c_int,ctypes.POINTER(DarwinStatfs)]; fn.restype=ctypes.c_int
        result=DarwinStatfs()
        if fn(fd,ctypes.byref(result)) != 0:
            raise RuntimeUnavailable('unsupported_filesystem','Filesystem observation failed')
        name=result.name.decode('ascii')
    except (AttributeError,OSError,UnicodeError) as exc:
        raise RuntimeUnavailable('unsupported_abi','Required Darwin native interface unavailable') from exc
    return {'os':'darwin','abi':'darwin-statfs64','filesystem':name,'flags':result.flags}


def filesystem_profile(fd):
    info=filesystem_info(fd)
    if info['os']=='darwin' and info['filesystem']=='apfs' and info['flags'] & 0x1000:
        return {**info,'profile':'darwin-local-apfs','qualification':'prior_local_profile'}
    if info['os']=='linux' and info['filesystem']=='ext-family' and not info['flags'] & 1:
        return {**info,'profile':'linux-glibc239-ext-family','qualification':'candidate'}
    raise RuntimeUnavailable('unsupported_filesystem','Selected storage is not a supported publication root')
