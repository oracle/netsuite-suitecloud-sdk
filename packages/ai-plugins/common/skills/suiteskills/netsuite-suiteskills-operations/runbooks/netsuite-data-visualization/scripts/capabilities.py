"""Runtime observations, not native-host certification or transfer authority."""
import importlib.util
import os
import pathlib
import shutil
import subprocess
import sys
from publication import Publisher, open_directory, probe_publication
from runtime import RuntimeUnavailable, filesystem_info

USER_FALLBACK='File delivery is unavailable in this session. Use the verified facts or table instead.'


def format_prerequisites(fmt):
    if fmt=='html':return {'available':True,'code':'available','dependencies':['python-standard-library']}
    if fmt not in ('pdf','pptx'):return {'available':False,'code':'format_unavailable'}
    if sys.platform!='darwin':return {'available':False,'code':'format_unavailable'}
    node=shutil.which(os.environ.get('DV_NODE','node'))
    modules=os.environ.get('DV_NODE_MODULES')
    if not node or not modules:return {'available':False,'code':'dependency_unavailable'}
    # Reviewed dependency directory is selected by the operator, never business data.
    script="const fs=require('node:fs'),p=require('node:path');const {chromium}=require(p.join(process.env.DV_NODE_MODULES,'playwright'));fs.accessSync(process.env.DV_CHROMIUM||chromium.executablePath(),fs.constants.X_OK);"
    try:
        result=subprocess.run([node,'-e',script],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=15)
        if result.returncode:return {'available':False,'code':'dependency_unavailable'}
        if fmt=='pdf':
            from exports import _qualified_pdf_font
            _qualified_pdf_font()
            if importlib.util.find_spec('pypdf') is None:return {'available':False,'code':'dependency_unavailable'}
    except (OSError,ValueError,subprocess.TimeoutExpired):return {'available':False,'code':'dependency_unavailable'}
    return {'available':True,'code':'available','dependencies':['reviewed-browser']+(['qualified-font','pypdf'] if fmt=='pdf' else [])}


def classify_destination(directory, host_contract):
    """Caller must independently establish the actual host contract/tool evidence.

    This input is an operational observation, not an authenticated receipt or a
    grant of permission. Business/spec JSON never supplies it.
    """
    if (type(host_contract) is not dict or set(host_contract)!={'directory','evidence'} or
            host_contract['directory']!=os.fspath(directory) or
            not isinstance(host_contract['evidence'],str) or not host_contract['evidence'].strip() or
            len(host_contract['evidence'])>200):
        raise ValueError('Actual host destination contract required')
    fd=open_directory(directory)
    try:info=filesystem_info(fd)
    finally:os.close(fd)
    if info['filesystem']!='fuse':raise ValueError('Managed destination profile not established')
    return {'code':'host_managed_destination','publication_available':False,
            'delivery_requires':'qualified_source_and_observed_host_transport',
            'delivery_state':'delivery_pending','user_message':USER_FALLBACK,
            'observation_authority':'caller_must_verify_actual_host_contract'}


def inspect(output_dir, fmt, *, probe=False, host_contract=None):
    result={'schema':'suiteskills-visual-capabilities-1','format':fmt,
            'publication_available':False,'delivery_state':'unavailable',
            'native_qualification':'not_run','prerequisites':format_prerequisites(fmt),'diagnostics':[]}
    try:
        if host_contract is not None:
            result.update(classify_destination(output_dir,host_contract));return result
        if output_dir is None:raise RuntimeUnavailable('unsafe_output','Existing output directory required')
        # Observe filesystem before owner/mode diagnosis. FUSE is not a user repair task.
        fd=open_directory(output_dir)
        try:info=filesystem_info(fd)
        finally:os.close(fd)
        if info['filesystem']=='fuse':
            result.update(code='publication_ineligible_mount',user_message=USER_FALLBACK,
                          delivery_requires='establish_host_contract_and_qualified_source')
            return result
        with Publisher(output_dir) as publisher:result['runtime']=publisher.profile
        if probe:result['probe']=probe_publication(output_dir)
        if not result['prerequisites']['available']:
            raise RuntimeUnavailable(result['prerequisites']['code'],'Requested export prerequisites unavailable')
        result['publication_available']=True;result['delivery_state']='delivery_pending';result['code']='available'
    except (ValueError,OSError) as exc:
        result['code']=getattr(exc,'code','unsafe_output')
        result['diagnostics']=[result['code']];result['user_message']=USER_FALLBACK
    return result
