"""Optional local mechanical evidence checks. No connector or reviewer invocation."""
import copy
import hashlib
import json
import re
from decimal import Decimal, InvalidOperation, localcontext

STATES={'unknown','not_collected','denied','unavailable','not_applicable'}


def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()


def validate_result(result):
    errors=[]
    if not isinstance(result,dict):return ['result must be an object']
    required={'schema_version','producer','foundation_digest','scope','grain','observed_at','coverage','sources','rows','lineage','domain_review'}
    if set(result)!=required:return ['result fields do not match schema 1.0']
    if result['schema_version']!='1.0':errors.append('unsupported schema')
    producer=result['producer']
    if not isinstance(producer,dict) or set(producer)!={'id','version'} or not all(isinstance(v,str) and v for v in producer.values()):errors.append('invalid producer')
    if not isinstance(result['foundation_digest'],str) or not re.fullmatch('[0-9a-f]{64}',result['foundation_digest']):errors.append('invalid foundation digest')
    if not isinstance(result['observed_at'],str) or not result['observed_at'].strip():errors.append('missing observation')
    if result['coverage'] not in ('complete','partial','unknown','empty'):errors.append('invalid coverage')
    for field in ('scope','lineage','domain_review'):
        if not isinstance(result[field],dict):errors.append('invalid '+field)
    grain=result['grain']
    if not isinstance(grain,list) or not grain or not all(isinstance(k,str) and k for k in grain) or len(set(grain))!=len(grain):errors.append('invalid grain')
    rows=result['rows']
    if not isinstance(rows,list) or len(rows)>10000:errors.append('rows must be an array of at most 10000')
    else:
        for row in rows:
            if not isinstance(row,dict):errors.append('invalid row');continue
            for key,value in row.items():
                if not isinstance(key,str) or not key:errors.append('invalid field name')
                if value is None or isinstance(value,str) or type(value) is int:continue
                if isinstance(value,dict) and set(value)=={'state'} and isinstance(value['state'],str) and value['state'] in STATES:continue
                errors.append('cells require text, integer, null or unavailable state; decimals use strings')
    sources=result['sources']
    if not isinstance(sources,list):errors.append('invalid sources')
    else:
        ids=[]
        for s in sources:
            if not isinstance(s,dict) or set(s)!={'id','locator','scope','independent_control','data'}:
                errors.append('invalid source');continue
            if not all(isinstance(s[k],str) and s[k].strip() for k in ('id','locator')):errors.append('missing source identity')
            if not isinstance(s['scope'],dict) or not isinstance(s['data'],dict) or type(s['independent_control']) is not bool:errors.append('invalid source evidence')
            ids.append(s['id'])
        if len(ids)!=len(set(ids)):errors.append('duplicate source identity')
    if result['coverage']=='empty' and rows:errors.append('empty population contains rows')
    try:canonical(result)
    except (ValueError,TypeError):errors.append('result is not finite JSON')
    return errors


def digest_result(result):
    errors=validate_result(result)
    if errors:raise ValueError('; '.join(errors))
    return hashlib.sha256(canonical(result)).hexdigest()


def number(value):
    if value is None or isinstance(value,dict):raise LookupError('operand unavailable')
    if type(value) not in (str,int):raise ValueError('decimal operand must be string or integer')
    try:n=Decimal(value)
    except InvalidOperation as e:raise ValueError('invalid decimal') from e
    if not n.is_finite() or n.copy_abs()>Decimal('1e30') or n.as_tuple().exponent < -18:raise ValueError('decimal outside supported range/precision')
    return n


def pointer(result,path):
    if not isinstance(path,str) or not path.startswith('/'):raise ValueError('absolute JSON pointer required')
    node=result
    try:
        for raw in path[1:].split('/'):
            key=raw.replace('~1','/').replace('~0','~')
            node=node[int(key)] if isinstance(node,list) else node[key]
        return node
    except (KeyError,IndexError,TypeError,ValueError) as e:raise LookupError('pointer operand unavailable') from e


def check_result(result,check):
    if not isinstance(check,dict):raise ValueError('check must be object')
    kind=check.get('kind');common={'id','kind'}
    extras={'sum':{'field','expected','tolerance','basis'},'equal':{'left','expected','tolerance','basis'},'ratio':{'numerator','denominator','expected','tolerance','basis'},'unique':{'fields'},'scope':{'fields'}}
    if kind not in extras or set(check)!=common|extras[kind]:raise ValueError('invalid check fields')
    if not isinstance(check['id'],str) or not check['id']:raise ValueError('check id required')
    response={'id':check['id'],'status':'not_run','actual':None,'reason':None}
    if kind in ('unique','scope'):
        fields=check['fields']
        if not isinstance(fields,list) or not fields or not all(isinstance(k,str) and k for k in fields) or len(fields)!=len(set(fields)):raise ValueError('check fields required')
    else:
        tolerance=number(check['tolerance'])
        if tolerance<0 or not isinstance(check['basis'],str) or not check['basis'].strip():raise ValueError('nonnegative tolerance and basis required')
        path=check['expected']
        m=re.fullmatch(r'/sources/(0|[1-9][0-9]*)/data/.+',path) if isinstance(path,str) else None
        if not m:raise ValueError('expected control must reference source data')
        index=int(m[1])
        if index>=len(result['sources']):raise ValueError('control source absent')
        if result['sources'][index]['independent_control'] is not True:raise ValueError('independent source control required')
    try:
        if kind=='unique':
            if not result['rows']:raise LookupError('no observed rows for uniqueness check')
            keys=[]
            for row in result['rows']:
                values=[row.get(k) for k in fields]
                if any(v is None or isinstance(v,dict) for v in values):raise LookupError('grain key unavailable')
                keys.append(canonical(values))
            passed=len(set(keys))==len(keys);actual=str(len(set(keys)))
        elif kind=='scope':
            if not result['sources']:raise LookupError('source scope unavailable')
            scopes=[result['scope']]+[s['scope'] for s in result['sources']]
            if any(k not in s or s[k] is None or isinstance(s[k],dict) or (isinstance(s[k],str) and not s[k].strip()) for s in scopes for k in fields):raise LookupError('scope operand unavailable')
            passed=all(all(s[k]==scopes[0][k] for k in fields) for s in scopes[1:]);actual='compatible' if passed else 'conflict'
        else:
            expected=number(pointer(result,path))
            with localcontext() as ctx:
                ctx.prec=80
                if kind=='sum':
                    if result['coverage'] not in ('complete','empty'):raise LookupError('full-population control requires complete coverage')
                    actual=sum((number(row.get(check['field'])) for row in result['rows']),Decimal(0))
                elif kind=='equal':actual=number(pointer(result,check['left']))
                else:
                    numerator=number(pointer(result,check['numerator']));denominator=number(pointer(result,check['denominator']))
                    if not denominator:raise LookupError('zero denominator')
                    actual=numerator/denominator
                passed=abs(actual-expected)<=tolerance;actual=format(actual,'f')
        response.update(status='passed' if passed else 'failed',actual=actual)
    except LookupError as e:response['reason']=str(e)
    return response


def create_receipt(result,checks):
    digest=digest_result(result)
    if not isinstance(checks,list):raise ValueError('checks must be an array')
    results=[check_result(result,c) for c in checks]
    ids=[r['id'] for r in results]
    if len(ids)!=len(set(ids)):raise ValueError('duplicate check ids')
    status='failed' if any(r['status']=='failed' for r in results) else ('passed' if results and all(r['status']=='passed' for r in results) else 'incomplete')
    receipt={'schema_version':'1.0','result_digest':digest,'checks':copy.deepcopy(checks),'results':results,'status':status,'authority':'local_mechanical_only','domain_review':'not_run'}
    receipt['receipt_digest']=hashlib.sha256(canonical(receipt)).hexdigest()
    return receipt


def verify_receipt(result,receipt):
    try:
        if not isinstance(receipt,dict):return ['receipt must be object']
        expected=create_receipt(result,receipt.get('checks'))
        return [] if expected==receipt else ['receipt differs from replay or bound result']
    except (ValueError,TypeError,KeyError) as e:return [str(e)]
