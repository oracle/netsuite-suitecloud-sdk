"""POSIX-only exclusive atomic publication. All artifact engines return bytes.

Requires trusted local filesystem/ancestry and no hostile same-UID/privileged actor.
Directory FDs bind operations even if a pathname is renamed; no symlink is followed.
Atomicity is per artifact, not a crash-durable transaction across multiple artifacts.
"""
import os
import pathlib
import secrets
import stat
import sys
from runtime import filesystem_profile, RuntimeUnavailable
from contract import basename


def require_filesystem(fd):
    return filesystem_profile(fd)


class PublicationIncomplete(OSError):
    published = True
    code = 'publication_incomplete'


def installed(fd):
    names = set(os.listdir(fd))
    return bool(names & {'.claude-plugin', '.codex-plugin', 'plugin.json', 'CATALOG.json',
                         'FOUNDATION-SNAPSHOT.json', 'FOUNDATION-LOCK.json', 'SKILL.md', 'RUNBOOK.md'})


def open_directory(directory):
    if os.name != 'posix' or not all(hasattr(os,n) for n in ('O_DIRECTORY','O_NOFOLLOW')):
        raise RuntimeUnavailable('unsupported_os','Directory-relative operations unavailable')
    raw = os.fspath(directory)
    if not os.path.isabs(raw) or '..' in pathlib.PurePath(raw).parts:
        raise ValueError('Explicit absolute directory required; no parent traversal')
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for component in pathlib.PurePath(raw).parts[1:]:
            nxt = os.open(component, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = nxt
            if installed(fd): raise ValueError('Output inside installed/candidate package forbidden')
        return fd
    except BaseException:
        os.close(fd)
        raise


class Publisher:
    def __init__(self, directory, inputs=()):
        if os.name != 'posix' or not hasattr(os, 'O_NOFOLLOW') or os.link not in os.supports_dir_fd:
            raise ValueError('Required POSIX directory-bound publication guarantees unavailable')
        self.published = False
        self.fd = open_directory(directory)
        try:
            info = os.fstat(self.fd)
            if info.st_uid != os.getuid() or info.st_mode & 0o022 or not info.st_mode & 0o200:
                raise ValueError('Selected output directory must be owned and private to its user')
            self.profile = require_filesystem(self.fd)
            self.inputs = {(os.stat(p).st_dev, os.stat(p).st_ino) for p in inputs}
        except BaseException:
            os.close(self.fd); self.fd = None
            raise

    def __enter__(self): return self

    def __exit__(self, exc_type, exc, traceback):
        fd = self.fd
        self.fd = None
        if fd is not None:
            try: os.close(fd)
            except OSError as close_error:
                if self.published:
                    if isinstance(exc, PublicationIncomplete): return False
                    raise PublicationIncomplete('Validated final file was linked; output directory close confirmation failed') from close_error
                raise

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
        linked = False
        try:
            try:
                fd = os.open('artifact', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=sfd)
                try:
                    handle = os.fdopen(fd, 'wb')
                except BaseException:
                    os.close(fd)
                    raise
                with handle:
                    handle.write(data); handle.flush(); os.fsync(handle.fileno())
                if validator is not None: validator(data)
                os.link('artifact', name, src_dir_fd=sfd, dst_dir_fd=self.fd, follow_symlinks=False)
                linked = True
                self.published = True
                os.fsync(self.fd)
            finally:
                try:
                    try: os.unlink('artifact', dir_fd=sfd)
                    except FileNotFoundError: pass
                finally:
                    try: os.close(sfd)
                    finally: os.rmdir(stage, dir_fd=self.fd)
        except OSError as exc:
            if linked:
                raise PublicationIncomplete('Validated final file was linked; durability or cleanup confirmation failed') from exc
            raise
        return name


def probe_publication(directory):
    """Explicit synthetic write probe; removes its private directory on completion."""
    with Publisher(directory) as parent:
        stage = '.dv-probe-' + secrets.token_hex(16)
        os.mkdir(stage, 0o700, dir_fd=parent.fd)
        try:
            sfd = os.open(stage, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent.fd)
        except BaseException:
            os.rmdir(stage, dir_fd=parent.fd)
            raise
        try:
            fd = os.open('source', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=sfd)
            with os.fdopen(fd, 'wb') as handle:
                handle.write(b'synthetic-publication-probe');handle.flush();os.fsync(handle.fileno())
            os.link('source','target',src_dir_fd=sfd,dst_dir_fd=sfd,follow_symlinks=False)
            try:
                os.link('source','target',src_dir_fd=sfd,dst_dir_fd=sfd,follow_symlinks=False)
            except FileExistsError: pass
            else: raise RuntimeUnavailable('unsafe_output','Exclusive publication probe failed')
            os.fsync(sfd);os.fsync(parent.fd)
            return {**parent.profile,'exclusive_create':True,'fsync':True}
        finally:
            try:
                for name in ('target','source'):
                    try: os.unlink(name,dir_fd=sfd)
                    except FileNotFoundError: pass
            finally:
                os.close(sfd);os.rmdir(stage,dir_fd=parent.fd)
