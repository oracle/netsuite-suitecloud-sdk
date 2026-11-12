"""On-request exports. Engines return bytes; publication belongs to Publisher only."""
import copy
import base64
import io
import json
import os
import pathlib
import subprocess
import sys
import functools
import hashlib
import posixpath
import struct
import zlib
import unicodedata
import zipfile
import xml.etree.ElementTree as E
from contract import validate, export_name, links
from renderer import render, validate_html
A='http://schemas.openxmlformats.org/drawingml/2006/main'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL='http://schemas.openxmlformats.org/package/2006/relationships'
C='http://schemas.openxmlformats.org/package/2006/content-types'
PDF_FONT=pathlib.Path('/System/Library/Fonts/Supplemental/Arial Unicode.ttf')
PDF_FONT_SHA256='876af2cd4854644e7f3e7feb2f688997fdb3343c6df6693611209c9dfb47ccec'
for prefix,ns in [('a',A),('p',P),('r',R)]: E.register_namespace(prefix,ns)


def el(parent,ns,tag,attrs=None,text=None):
    q=E.SubElement(parent,'{'+ns+'}'+tag,attrs or {})
    if text is not None:q.text=str(text)
    return q


def xml(root):
    # OPC package roots use explicit default namespaces for Office interoperability.
    ns=root.tag.split('}')[0][1:]
    if ns in (REL,C):
        root=copy.deepcopy(root)
        for item in root.iter():item.tag=item.tag.split('}',1)[1]
        root.set('xmlns',ns)
    return E.tostring(root,encoding='utf-8',xml_declaration=True)


def _qualified_pdf_font():
    if not PDF_FONT.is_file() or hashlib.sha256(PDF_FONT.read_bytes()).hexdigest()!=PDF_FONT_SHA256:
        raise ValueError('PDF requires the qualified host Arial Unicode MS 1.01x font; font unavailable or changed')


def browser(document,mode='pdf',binding=None):
    validate_html(document,binding)
    if mode not in ('pdf','panels','proof','probe'):raise ValueError('Unsupported browser mode')
    if mode=='pdf':_qualified_pdf_font()
    node=os.environ.get('DV_NODE','node')
    bridge=pathlib.Path(__file__).with_name('browser.cjs')
    envelope=json.dumps({'document':document,'binding':binding},ensure_ascii=False,allow_nan=False,separators=(',',':')).encode('utf-8')
    environment=dict(os.environ,DV_EXPORT_PYTHON=sys.executable,PYTHONDONTWRITEBYTECODE='1')
    proc=subprocess.run([node,str(bridge),mode],input=envelope,env=environment,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=90,check=False)
    if proc.returncode:raise ValueError('Browser export failed: '+proc.stderr.decode(errors='replace')[:1000])
    result=json.loads(proc.stdout)
    if mode in ('pdf','proof'):return base64.b64decode(result['pdf' if mode=='pdf' else 'png'],validate=True)
    return proc.stdout


def make(model,fmt,name=None,binding=None,suffix=None,fallback='visualization'):
    # Name validation happens independently of path and before either export engine.
    export_name(name,model.get('export_name'),fallback,suffix)
    model=validate(model)
    if fmt=='pptx':
        data=pptx(model,binding);validate_pptx(data,model,binding);return data
    if fmt=='pdf':
        _qualified_pdf_font()
        doc=render(model,binding);validate_html(doc,binding)
        data=_pdf(doc,json.dumps(binding,sort_keys=True,separators=(',',':')));validate_pdf(data,model,binding);return data
    raise ValueError('Unsupported export format')


def visual_width(value):
    return sum(0 if unicodedata.combining(c) else 2 if unicodedata.east_asian_width(c) in ('W','F') or c in 'WM@' else 1 for c in value)


def wrap_visual(value,budget=70):
    lines=[];line='';width=0
    for char in value:
        w=visual_width(char)
        if char=='\n':lines.append(line);line='';width=0;continue
        if line and width+w>budget:lines.append(line);line='';width=0
        line+=char;width+=w
    if line:lines.append(line)
    return lines or ['']


@functools.lru_cache(maxsize=4)
def _pdf(document,binding_json):
    # Only trusted canonical HTML can populate expected bytes; never cache supplied PDF.
    return browser(document,'pdf',json.loads(binding_json))


@functools.lru_cache(maxsize=4)
def _panels(document,binding_json):
    payload=json.loads(browser(document,'panels',json.loads(binding_json)))
    if set(payload)!={'panels'} or not isinstance(payload['panels'],list):raise ValueError('Unexpected panel response')
    result=[]
    for panel in payload['panels']:
        if set(panel)!={'png'}:raise ValueError('Unexpected panel image')
        raw=base64.b64decode(panel['png'],validate=True);png_size(raw);result.append(raw)
    return tuple(result)


def pptx(model,binding=None):
    model=validate(model)
    document=render(model,binding);validate_html(document,binding)
    images=_panels(document,json.dumps(binding,sort_keys=True,separators=(',',':')))
    if len(images)!=len(model['charts']):raise ValueError('Panel/chart parity')
    parts={};expected_links=links(model,binding);slides=[]
    def slide(title,lines,chart=None): slides.append((title,lines,chart))
    s=model['source'];cols=model['columns'];cm={c['key']:c for c in cols}
    # Full title/question are paginated as body text, never squeezed into fixed title boxes.
    metadata=[('Source: '+s['label'],None),('Retrieved: '+s['retrieved_at'],None),('Scope: '+s['scope'],None),('Filters: '+('; '.join(s['filters']) or 'None stated'),None),('Population: '+s['completeness']+'; '+str(len(model['rows']))+' retrieved rows',None),('Grain: '+' + '.join(s['grain']),None),('No local aggregation, unit conversion or currency conversion.',None)]
    metadata += [('Unit: '+c['label']+' = '+c['unit'],None) for c in cols if c['type']=='number']
    metadata += [('Limitation: '+t,None) for t in s['limitations']]
    metadata += [('Local interaction reuses supplied snapshot. Links do not prove permissions or navigation.',None)]
    if not expected_links or any(u is None for u in expected_links): metadata += [('Plain-text references: source binding or supported route unavailable.',None)]
    def pages(title,items):
        wrapped=[]
        for value,url in items:
            wrapped += [(t,url) for t in wrap_visual(str(value),70)]
        for start in range(0,len(wrapped),8):slide(title,wrapped[start:start+8])
    pages('Data Visualization',[(model['title'],None),(model['question'],None),('Snapshot view · '+s['status'].upper(),None)])
    pages('Scope, source and limitations',metadata)
    for c,image in zip(model['charts'],images):
        pages('Analytical view',[(c['title'],None)])
        slide(c['title'],[],image)
    for i,row in enumerate(model['rows']):
        items=[]
        for c in cols:
            url=next((u for ref,u in zip(model['references'],expected_links) if ref['row']==i and ref['column']==c['key']),None)
            items.append((c['label']+': '+str(row[c['key']]),url))
        pages('Snapshot row '+str(i+1),items)
    if len(slides)>300:raise ValueError('Export exceeds bounded slide count')
    # A new minimal OOXML template; no source-template binaries or third-party ZIP engine.
    master=E.Element('{'+P+'}sldMaster');cs=el(master,P,'cSld');tree=el(cs,P,'spTree');group(tree)
    el(master,P,'clrMap',{'bg1':'lt1','tx1':'dk1','bg2':'lt2','tx2':'dk2','accent1':'accent1','accent2':'accent2','accent3':'accent3','accent4':'accent4','accent5':'accent5','accent6':'accent6','hlink':'hlink','folHlink':'folHlink'})
    ids=el(master,P,'sldLayoutIdLst');el(ids,P,'sldLayoutId',{'id':'2147483649','{'+R+'}id':'rId1'})
    el(master,P,'txStyles');parts['ppt/slideMasters/slideMaster1.xml']=xml(master)
    layout=E.Element('{'+P+'}sldLayout',{'type':'blank','preserve':'1'});cs=el(layout,P,'cSld',{'name':'Data Visualization blank'});group(el(cs,P,'spTree'));el(el(layout,P,'clrMapOvr'),A,'masterClrMapping')
    parts['ppt/slideLayouts/slideLayout1.xml']=xml(layout)
    parts['ppt/slideMasters/_rels/slideMaster1.xml.rels']=rels([('rId1',R+'/slideLayout','../slideLayouts/slideLayout1.xml',None),('rId2',R+'/theme','../theme/theme1.xml',None)])
    parts['ppt/slideLayouts/_rels/slideLayout1.xml.rels']=rels([('rId1',R+'/slideMaster','../slideMasters/slideMaster1.xml',None)])
    theme=E.Element('{'+A+'}theme',{'name':'Redwood candidate'});te=el(theme,A,'themeElements');cl=el(te,A,'clrScheme',{'name':'Redwood'})
    for key,color in [('dk1','13212C'),('lt1','FFFFFF'),('dk2','264759'),('lt2','FBF9F8'),('accent1','245D63'),('accent2','D7790F'),('accent3','31A09C'),('accent4','4E4137'),('accent5','699E61'),('accent6','B47282'),('hlink','F0CC71'),('folHlink','F0CC71')]:el(el(cl,A,key),A,'srgbClr',{'val':color})
    fs=el(te,A,'fontScheme',{'name':'System fonts'})
    for k in ('majorFont','minorFont'):
        ff=el(fs,A,k);el(ff,A,'latin',{'typeface':'Arial'});el(ff,A,'ea',{'typeface':''});el(ff,A,'cs',{'typeface':''})
    fmt=el(te,A,'fmtScheme',{'name':'Minimal'})
    for name2 in ('fillStyleLst','bgFillStyleLst'):
        lst=el(fmt,A,name2)
        for _ in range(3):el(el(lst,A,'solidFill'),A,'schemeClr',{'val':'phClr'})
    lst=el(fmt,A,'lnStyleLst')
    for width in (6350,12700,19050):
        ln=el(lst,A,'ln',{'w':str(width),'cap':'flat','cmpd':'sng','algn':'ctr'});el(el(ln,A,'solidFill'),A,'schemeClr',{'val':'phClr'});el(ln,A,'prstDash',{'val':'solid'});el(ln,A,'miter',{'lim':'800000'})
    lst=el(fmt,A,'effectStyleLst')
    for _ in range(3):el(el(lst,A,'effectStyle'),A,'effectLst')
    fmt[:]=sorted(fmt,key=lambda child:['fillStyleLst','lnStyleLst','effectStyleLst','bgFillStyleLst'].index(child.tag.split('}')[1]))
    parts['ppt/theme/theme1.xml']=xml(theme)
    pres=E.Element('{'+P+'}presentation');ids=el(pres,P,'sldMasterIdLst');el(ids,P,'sldMasterId',{'id':'2147483648','{'+R+'}id':'rId1'});ids=el(pres,P,'sldIdLst')
    pr=[('rId1',R+'/slideMaster','slideMasters/slideMaster1.xml',None)]
    for i,(title,lines,chart) in enumerate(slides,1):
        rid='rId'+str(i+1);el(ids,P,'sldId',{'id':str(255+i),'{'+R+'}id':rid});pr.append((rid,R+'/slide','slides/slide'+str(i)+'.xml',None))
        doc=E.Element('{'+P+'}sld');cs=el(doc,P,'cSld');bg=el(el(cs,P,'bg'),P,'bgPr');el(el(bg,A,'solidFill'),A,'srgbClr',{'val':'13212C'});el(bg,A,'effectLst');tree=el(cs,P,'spTree');group(tree)
        sr=[('rId1',R+'/slideLayout','../slideLayouts/slideLayout1.xml',None)]
        header_lines=wrap_visual(title,55)
        header='\n'.join(header_lines[:2]) + ('…' if len(header_lines)>2 else '')
        shape_text(tree,2,header,35,20,890,76,size=26)
        shape_text(tree,3,s['status'].upper()+' · '+s['completeness']+' population',35,98,890,25,size=12,color='F0CC71')
        sid=4
        for j,(value,url) in enumerate(lines):
            linkid=None
            if url:
                linkid='rId'+str(len(sr)+1);sr.append((linkid,R+'/hyperlink',url,'External'))
            shape_text(tree,sid,value,35,140+j*35,890,34,size=17,color='F0CC71' if url else 'FFFFFF',linkid=linkid);sid+=1
        if chart:
            image_name='image'+str(i)+'.png';parts['ppt/media/'+image_name]=chart
            image_id='rId'+str(len(sr)+1);sr.append((image_id,R+'/image','../media/'+image_name,None))
            width,height=png_size(chart);scale=min(890/width,355/height)
            picture(tree,sid,image_id,35+(890-width*scale)/2,135+(355-height*scale)/2,width*scale,height*scale);sid+=1
        shape_text(tree,sid,'Oracle NetSuite · Data Visualization · '+str(i)+' / '+str(len(slides)),35,500,890,25,size=11)
        el(el(doc,P,'clrMapOvr'),A,'masterClrMapping')
        parts['ppt/slides/slide'+str(i)+'.xml']=xml(doc);parts['ppt/slides/_rels/slide'+str(i)+'.xml.rels']=rels(sr)
    el(pres,P,'sldSz',{'cx':str(960*12700),'cy':str(540*12700),'type':'screen16x9'});el(pres,P,'notesSz',{'cx':'6858000','cy':'9144000'});parts['ppt/presentation.xml']=xml(pres)
    parts['ppt/_rels/presentation.xml.rels']=rels(pr);parts['_rels/.rels']=rels([('rId1',R+'/officeDocument','ppt/presentation.xml',None)])
    ct=E.Element('{'+C+'}Types');el(ct,C,'Default',{'Extension':'png','ContentType':'image/png'});el(ct,C,'Default',{'Extension':'rels','ContentType':'application/vnd.openxmlformats-package.relationships+xml'});el(ct,C,'Default',{'Extension':'xml','ContentType':'application/xml'})
    for name in parts:
        kind=None
        if name=='ppt/presentation.xml':kind='presentation'
        elif name.startswith('ppt/slides/') and name.endswith('.xml'):kind='slide'
        elif name.startswith('ppt/slideMasters/') and name.endswith('.xml'):kind='slideMaster'
        elif name.startswith('ppt/slideLayouts/') and name.endswith('.xml'):kind='slideLayout'
        if kind:el(ct,C,'Override',{'PartName':'/'+name,'ContentType':'application/vnd.openxmlformats-officedocument.presentationml.'+kind+('.main+xml' if kind=='presentation' else '+xml')})
        elif name=='ppt/theme/theme1.xml':el(ct,C,'Override',{'PartName':'/'+name,'ContentType':'application/vnd.openxmlformats-officedocument.theme+xml'})
    parts['[Content_Types].xml']=xml(ct);out=io.BytesIO()
    with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_STORED) as z:
        for name,raw in sorted(parts.items()):
            info=zipfile.ZipInfo(name,date_time=(2026,10,15,0,0,0));info.external_attr=0o600<<16;z.writestr(info,raw)
    return out.getvalue()


def group(tree):
    n=el(tree,P,'nvGrpSpPr');el(n,P,'cNvPr',{'id':'1','name':'Group'});el(n,P,'cNvGrpSpPr');el(n,P,'nvPr');el(tree,P,'grpSpPr')


def shape_text(tree,sid,value,x,y,w,h,size=17,color='FFFFFF',linkid=None):
    sp=el(tree,P,'sp');nv=el(sp,P,'nvSpPr');el(nv,P,'cNvPr',{'id':str(sid),'name':'Text '+str(sid)});el(nv,P,'cNvSpPr',{'txBox':'1'});el(nv,P,'nvPr');props=el(sp,P,'spPr');geometry(props,x,y,w,h)
    tx=el(sp,P,'txBody');el(tx,A,'bodyPr',{'wrap':'square'});el(tx,A,'lstStyle');p=el(tx,A,'p');run=el(p,A,'r');rp=el(run,A,'rPr',{'lang':'en-US','sz':str(size*100)});el(el(rp,A,'solidFill'),A,'srgbClr',{'val':color});el(rp,A,'latin',{'typeface':'Arial'})
    if linkid:el(rp,A,'hlinkClick',{'{'+R+'}id':linkid})
    el(run,A,'t',text=value);el(p,A,'endParaRPr',{'lang':'en-US'})


def geometry(props,x,y,w,h):
    xf=el(props,A,'xfrm');el(xf,A,'off',{'x':str(round(x*12700)),'y':str(round(y*12700))});el(xf,A,'ext',{'cx':str(round(w*12700)),'cy':str(round(h*12700))});g=el(props,A,'prstGeom',{'prst':'rect'});el(g,A,'avLst')


def rect(tree,sid,x,y,w,h,color):
    sp=el(tree,P,'sp');nv=el(sp,P,'nvSpPr');el(nv,P,'cNvPr',{'id':str(sid),'name':'Bar '+str(sid)});el(nv,P,'cNvSpPr');el(nv,P,'nvPr');pr=el(sp,P,'spPr');geometry(pr,x,y,w,h);el(el(pr,A,'solidFill'),A,'srgbClr',{'val':color});el(el(pr,A,'ln'),A,'noFill')


def rels(items):
    root=E.Element('{'+REL+'}Relationships')
    for rid,typ,target,mode in items:
        attrs={'Id':rid,'Type':typ,'Target':target}
        if mode:attrs['TargetMode']=mode
        el(root,REL,'Relationship',attrs)
    return xml(root)


def png_size(raw):
    if not isinstance(raw,bytes) or len(raw)>32*1024*1024 or raw[:8]!=b'\x89PNG\r\n\x1a\n':raise ValueError('Invalid PNG image')
    offset=8;size=None;ended=False;idat=False
    while offset<len(raw):
        if offset+12>len(raw):raise ValueError('Truncated PNG')
        length=struct.unpack('>I',raw[offset:offset+4])[0];kind=raw[offset+4:offset+8]
        if length>32*1024*1024 or offset+12+length>len(raw):raise ValueError('Invalid PNG chunk size')
        chunk=raw[offset+8:offset+8+length];crc=struct.unpack('>I',raw[offset+8+length:offset+12+length])[0]
        if zlib.crc32(kind+chunk)&0xffffffff!=crc:raise ValueError('PNG CRC')
        if size is None:
            if kind!=b'IHDR' or length!=13:raise ValueError('Missing PNG header')
            w,h,depth,color,compression,filtering,interlace=struct.unpack('>IIBBBBB',chunk)
            if not 1<=w<=4096 or not 1<=h<=32768 or w*h>32*1024*1024 or depth!=8 or color not in (2,6) or compression or filtering or interlace:raise ValueError('Unsupported PNG geometry')
            size=(w,h)
        elif kind==b'IHDR':raise ValueError('Duplicate PNG header')
        if kind==b'IDAT':idat=True
        if kind==b'IEND':
            if length or not idat:raise ValueError('Invalid PNG ending')
            ended=True;offset+=12;break
        # Chromium output contains these inert raster chunks only; reject text/EXIF payloads.
        if kind not in (b'IHDR',b'IDAT',b'sRGB',b'gAMA',b'cHRM',b'pHYs'):raise ValueError('Unexpected PNG chunk')
        offset+=12+length
    if not ended or offset!=len(raw):raise ValueError('PNG trailing or missing data')
    return size


def picture(tree,sid,rid,x,y,w,h):
    pic=el(tree,P,'pic');nv=el(pic,P,'nvPicPr');el(nv,P,'cNvPr',{'id':str(sid),'name':'Reviewed chart image '+str(sid)})
    el(el(nv,P,'cNvPicPr'),A,'picLocks',{'noChangeAspect':'1'});el(nv,P,'nvPr')
    fill=el(pic,P,'blipFill');el(fill,A,'blip',{'{'+R+'}embed':rid});el(el(fill,A,'stretch'),A,'fillRect')
    geometry(el(pic,P,'spPr'),x,y,w,h)


def validate_pptx(data,model,binding=None):
    model=validate(model)
    if not isinstance(data,bytes) or len(data)>128*1024*1024:raise ValueError('PPTX size/type')
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            names=z.namelist()
            if len(names)!=len(set(names)) or len(names)>2000 or sum(i.file_size for i in z.infolist())>128*1024*1024:raise ValueError('PPTX part bounds')
            if z.testzip() is not None:raise ValueError('PPTX CRC')
            expected={u for u in links(model,binding) if u};seen=set();texts=[];allowed_annotations=set();allowed_actions=set();image_parts=set();image_targets=set()
            for n in names:
                if n.startswith('/') or '\\' in n or '..' in pathlib.PurePosixPath(n).parts:raise ValueError('Unsafe PPTX part name')
                raw=z.read(n)
                if n.startswith('ppt/media/') and n.endswith('.png'):
                    png_size(raw);image_parts.add(n);continue
                if not n.endswith(('.xml','.rels')) or b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():raise ValueError('Unexpected PPTX part')
                root=E.fromstring(raw);texts.extend(t.text or '' for t in root.iter('{'+A+'}t'))
                relationships={}
                for rel in root.iter('{'+REL+'}Relationship'):
                    rid=rel.get('Id');typ=rel.get('Type');target=rel.get('Target');mode=rel.get('TargetMode')
                    if set(rel.attrib)-{'Id','Type','Target','TargetMode'} or not rid or rid in relationships or not target:raise ValueError('Invalid PPTX relationship')
                    relationships[rid]=rel
                    if mode=='External':
                        if typ!=R+'/hyperlink' or target not in expected:raise ValueError('Unsupported export link')
                        seen.add(target)
                    else:
                        if mode is not None or typ not in {R+'/'+t for t in ('officeDocument','slideMaster','slideLayout','theme','slide','image')}:raise ValueError('Unsupported PPTX relationship')
                        source='' if n=='_rels/.rels' else posixpath.dirname(posixpath.dirname(n))
                        resolved=posixpath.normpath(posixpath.join(source,target))
                        if '\\' in target or ':' in target or '#' in target or '?' in target or target.startswith('/') or resolved not in names:raise ValueError('Missing/unsafe PPTX relationship target')
                        if typ==R+'/image':
                            if not resolved.startswith('ppt/media/') or not resolved.endswith('.png'):raise ValueError('Unexpected image target')
                            image_targets.add(resolved)
                if n.startswith('ppt/slides/') and n.endswith('.xml'):
                    relname=posixpath.join(posixpath.dirname(n),'_rels',posixpath.basename(n)+'.rels')
                    if relname not in names:raise ValueError('Missing slide relationships')
                    slide_rels={r.get('Id'):r for r in E.fromstring(z.read(relname))}
                    for blip in root.iter('{'+A+'}blip'):
                        if set(blip.attrib)!={'{'+R+'}embed'} or list(blip):raise ValueError('Active or external image')
                        rel=slide_rels.get(blip.get('{'+R+'}embed'))
                        if rel is None or rel.get('Type')!=R+'/image' or rel.get('TargetMode'):raise ValueError('Invalid image relationship')
                    for link in root.iter('{'+A+'}hlinkClick'):
                        if set(link.attrib)!={'{'+R+'}id'} or list(link):raise ValueError('Unsupported hyperlink action')
                        rel=slide_rels.get(link.get('{'+R+'}id'))
                        if rel is None or rel.get('TargetMode')!='External' or rel.get('Target') not in expected:raise ValueError('Invalid hyperlink relationship')
            if seen!=expected or image_parts!=image_targets or len(image_parts)!=len(model['charts']):raise ValueError('PPTX link/image parity')
    except (zipfile.BadZipFile,E.ParseError,KeyError,struct.error) as exc:raise ValueError('Malformed PPTX') from exc
    # Compare against canonical HTML screenshots and complete deterministic OOXML. This also
    # rejects substituted raster content, shape/value drift, extra parts and active payloads.
    if data!=pptx(model,binding):raise ValueError('Noncanonical PPTX: changed images, values, parts, relationships or geometry')
    return True


def _pdf_graph_policy(reader,allowed_annotations,allowed_actions):
    """Closed generated-document policy over all reachable dictionaries, including metadata."""
    from pypdf.generic import DictionaryObject,ArrayObject,IndirectObject
    root=reader.trailer['/Root']
    if set(root)-{'/Type','/Pages','/ViewerPreferences'}:raise ValueError('Unsupported PDF catalog content')
    forbidden={'/OpenAction','/AA','/AcroForm','/Outlines','/Names','/Next','/JS','/JavaScript','/EmbeddedFiles','/EF','/AF','/XFA','/Collection','/RichMediaContent','/RichMediaSettings','/Rendition','/PresSteps','/Requirements','/AlternatePresentations','/Threads','/Beads','/OCProperties'}
    allowed_types={'/Catalog','/Pages','/Page','/Annot','/Action','/Font','/Encoding','/FontDescriptor','/ViewerPreferences','/XObject','/ExtGState','/Mask'}
    stack=[(reader.trailer,0)];visited=set();nodes=0
    while stack:
        obj,depth=stack.pop();nodes+=1
        if nodes>100000 or depth>200:raise ValueError('PDF object graph bounds')
        if isinstance(obj,IndirectObject):obj=obj.get_object()
        if not isinstance(obj,(DictionaryObject,ArrayObject)):continue
        if id(obj) in visited:continue
        visited.add(id(obj))
        if isinstance(obj,ArrayObject):stack.extend((value,depth+1) for value in obj);continue
        if forbidden.intersection(obj):raise ValueError('Active or unsupported PDF object content')
        if '/Type' in obj and str(obj['/Type']) not in allowed_types:raise ValueError('Unsupported PDF object type')
        if '/A' in obj and id(obj) not in allowed_annotations:raise ValueError('PDF action outside canonical link annotation')
        # Generated PDFs use /S exclusively for validated URI actions. Reject unknown
        # action names, embedded/chained trees and even allowed URI actions elsewhere.
        if '/S' in obj or obj.get('/Type')=='/Action':
            if id(obj) not in allowed_actions:raise ValueError('Unsupported PDF action object')
        if '/URI' in obj and id(obj) not in allowed_actions:raise ValueError('URI outside canonical PDF action')
        stack.extend((value,depth+1) for value in obj.values())


def _pdf_graph_digest(reader):
    """Fingerprint complete reachable structure, drawings, resources and stream bytes.

    PDF object numbers are storage identities, so references receive traversal-order
    IDs. Only trailer /ID and document-info creation/modification dates are omitted.
    Dictionary ordering and compression offsets are serialization details; all keys,
    values and decoded stream content otherwise remain in the fingerprint.
    """
    from pypdf.generic import DictionaryObject,ArrayObject,IndirectObject,StreamObject,BooleanObject,NullObject,NameObject
    digest=hashlib.sha256();visited={};nodes=0;stream_bytes=0
    trailer=reader.trailer;info=trailer.get('/Info')
    if isinstance(info,IndirectObject):info=info.get_object()
    def atom(tag,value=b''):
        digest.update(tag);digest.update(str(len(value)).encode('ascii'));digest.update(b':');digest.update(value)
    def walk(obj,depth=0):
        nonlocal nodes,stream_bytes
        nodes+=1
        if nodes>100000 or depth>200:raise ValueError('PDF fingerprint bounds')
        if isinstance(obj,IndirectObject):obj=obj.get_object()
        if isinstance(obj,(DictionaryObject,ArrayObject)):
            key=id(obj)
            if key in visited:atom(b'R',str(visited[key]).encode('ascii'));return
            visited[key]=len(visited)
            if isinstance(obj,DictionaryObject):
                atom(b'D')
                for k in sorted(obj):
                    if obj is trailer and k=='/ID':continue
                    if obj is info and k in ('/CreationDate','/ModDate'):continue
                    atom(b'K',str(k).encode('utf-8'));walk(obj.raw_get(k),depth+1)
                if isinstance(obj,StreamObject):
                    raw=obj.get_data();stream_bytes+=len(raw)
                    if stream_bytes>256*1024*1024:raise ValueError('PDF decoded stream bounds')
                    atom(b'S',raw)
                atom(b'E');return
            atom(b'[')
            for value in obj:walk(value,depth+1)
            atom(b']');return
        if isinstance(obj,NullObject):atom(b'0')
        elif isinstance(obj,BooleanObject):atom(b'B',b'1' if obj.value else b'0')
        elif isinstance(obj,NameObject):atom(b'N',str(obj).encode('utf-8'))
        elif isinstance(obj,bytes):atom(b'Y',bytes(obj))
        elif isinstance(obj,str):atom(b'T',obj.encode('utf-8'))
        elif isinstance(obj,(int,float)):atom(b'#',str(obj).encode('ascii'))
        else:raise ValueError('Unsupported PDF primitive')
    walk(trailer)
    return digest.hexdigest()


def validate_pdf(data,model,binding=None):
    # External validation dependency; never writes a PDF or selects its destination.
    from pypdf import PdfReader
    model=validate(model)
    if not isinstance(data,bytes) or len(data)>128*1024*1024:raise ValueError('PDF size/type')
    reader=PdfReader(io.BytesIO(data),strict=True)
    root=reader.trailer['/Root']
    if any(k in root for k in ['/OpenAction','/AA','/AcroForm']):raise ValueError('Active PDF content')
    if '/Names' in root and any(k in root['/Names'] for k in ['/JavaScript','/EmbeddedFiles']):raise ValueError('Active PDF names')
    expected={u for u in links(model,binding) if u};seen=set();texts=[];allowed_annotations=set();allowed_actions=set()
    for page in reader.pages:
        if '/AA' in page:raise ValueError('Page actions')
        texts.append(page.extract_text() or '')
        for ref in page.get('/Annots',[]):
            a=ref.get_object()
            if a.get('/Subtype')!='/Link' or '/AA' in a:raise ValueError('Unsupported annotation')
            action=a.get('/A')
            if hasattr(action,'get_object'):action=action.get_object()
            if not isinstance(action,dict) or set(action)-{'/Type','/S','/URI'} or action.get('/Type','/Action')!='/Action':raise ValueError('Unexpected or chained PDF action')
            if '/Dest' in a or action.get('/S')!='/URI' or action.get('/URI') not in expected:raise ValueError('Unexpected PDF link')
            seen.add(str(action['/URI']));allowed_annotations.add(id(a));allowed_actions.add(id(action))
    _pdf_graph_policy(reader,allowed_annotations,allowed_actions)
    if seen!=expected:raise ValueError('PDF link parity')
    compact=lambda value:''.join(str(value).split())
    alltext=compact('\n'.join(texts))
    for value in [model['title'],model['question'],*[c['title'] for c in model['charts']],*[c['label'] for c in model['columns']],*[c['unit'] for c in model['columns'] if c['type']=='number'],model['source']['scope'],model['source']['label'],model['source']['retrieved_at'],model['source']['status'].upper(),*model['source']['filters'],*model['source']['limitations'],*[str(row[c['key']]) for row in model['rows'] for c in model['columns']]]:
        if compact(value) not in alltext:raise ValueError('PDF lost required source/limitation text')
    if not 1<=len(reader.pages)<=100:raise ValueError('Unsupported PDF page count')
    document=render(model,binding);validate_html(document,binding)
    _qualified_pdf_font()
    expected_pdf=_pdf(document,json.dumps(binding,sort_keys=True,separators=(',',':')))
    canonical=PdfReader(io.BytesIO(expected_pdf),strict=True)
    if _pdf_graph_digest(reader)!=_pdf_graph_digest(canonical):raise ValueError('Noncanonical PDF: changed snapshot, drawings, resources, objects or link associations')
    return True
