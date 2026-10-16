"""Read-only content association and destination observations; never a transport.

An absence check is not a reservation. A hash is not authentication, destination
permissions evidence, or proof of no replacement. Native delivery needs actual
host observations in addition to this module's content-validation result.
"""
import datetime
import hashlib
import json
import os
import pathlib
import re
import secrets
import stat
from contract import basename,shape,validate,validate_binding
from publication import open_directory
from renderer import validate_html

MAX_BYTES=64*1024*1024
FIELDS=('schema','sha256','bytes','filename','format','model_sha256','binding_sha256','status')


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False,allow_nan=False,separators=(',',':')).encode()).hexdigest()


def read_artifact(path):
    path=pathlib.Path(path)
    fd=open_directory(path.parent)
    try:leaf=os.open(path.name,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK,dir_fd=fd)
    finally:os.close(fd)
    with os.fdopen(leaf,'rb') as handle:
        info=os.fstat(handle.fileno())
        if not stat.S_ISREG(info.st_mode) or info.st_size>MAX_BYTES:raise ValueError('Regular artifact within 64 MiB required')
        raw=handle.read(MAX_BYTES+1)
        after=os.fstat(handle.fileno())
        if (len(raw)>MAX_BYTES or len(raw)!=info.st_size or
                (info.st_size,info.st_mtime_ns,info.st_ctime_ns)!=(after.st_size,after.st_mtime_ns,after.st_ctime_ns)):
            raise ValueError('Artifact changed or exceeds readback limit')
    return raw


def delivery_name(base,fmt):
    basename(base)
    if fmt not in ('html','pdf','pptx'):raise ValueError('Unsupported format')
    return basename(base+'-'+secrets.token_hex(16)+'.'+fmt)


def checked_handoff(handoff):
    shape(handoff,FIELDS)
    if (handoff['schema']!='suiteskills-visual-handoff-1' or handoff['status']!='validated' or
            handoff['format'] not in ('html','pdf','pptx') or
            type(handoff['bytes']) is not int or not 0<handoff['bytes']<=MAX_BYTES):
        raise ValueError('Invalid artifact handoff')
    basename(handoff['filename'])
    if not handoff['filename'].endswith('.'+handoff['format']):raise ValueError('Filename/format mismatch')
    for key in ('sha256','model_sha256','binding_sha256'):
        if type(handoff[key]) is not str or not re.fullmatch('[0-9a-f]{64}',handoff[key]):raise ValueError('Invalid handoff digest')
    return handoff


def artifact_identity(path,model,binding,fmt):
    model=validate(model);binding=validate_binding(binding) if binding is not None else None
    path=pathlib.Path(path);basename(path.name)
    if fmt not in ('html','pdf','pptx') or not path.name.endswith('.'+fmt):raise ValueError('Filename/format mismatch')
    raw=read_artifact(path)
    if fmt=='html':
        if validate_html(raw.decode('utf-8'),binding)!=model:raise ValueError('Artifact snapshot mismatch')
    else:
        from exports import validate_pdf,validate_pptx
        (validate_pdf if fmt=='pdf' else validate_pptx)(raw,model,binding)
    return {'schema':'suiteskills-visual-handoff-1','sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),
            'filename':path.name,'format':fmt,'model_sha256':digest(model),'binding_sha256':digest(binding),'status':'validated'}


def verify(handoff,destination,model,binding,fmt):
    checked_handoff(handoff)
    actual=artifact_identity(destination,model,binding,fmt)
    if actual!=handoff:raise ValueError('Delivered artifact identity mismatch')
    return actual


def precheck_destination(handoff,directory):
    checked_handoff(handoff)
    fd=open_directory(directory)
    try:
        try:os.stat(handoff['filename'],dir_fd=fd,follow_symlinks=False)
        except FileNotFoundError:pass
        else:raise FileExistsError('Destination already exists; transfer refused')
    finally:os.close(fd)
    return {'schema':'suiteskills-visual-transfer-check-1','handoff_sha256':digest(handoff),
            'directory':os.fspath(directory),'filename':handoff['filename'],
            'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'observation':'absent','destination_guarantee':'collision_avoidance_not_atomic'}
