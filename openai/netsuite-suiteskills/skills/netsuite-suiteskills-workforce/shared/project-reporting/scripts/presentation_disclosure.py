#!/usr/bin/env python3
"""Audience-bound presentation projection for protected VISUAL datasets.
No network, permissions lookup, signature authority, or changes to underlying evidence.
A separate trusted host must authenticate audience, purpose and content review.
A digest/JSON policy is a binding check, never proof of authorization.
"""
from __future__ import annotations
import argparse, hashlib, json, math, re
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit
import visual_dataset as vd

VERSION = "PRESENTATION-2.0.0"
WITHHELD = "[Withheld for this audience]"
FIELDS = json.loads((Path(__file__).resolve().parents[1] /
    "references/shared/visual-config/presentation-fields.json").read_text(encoding="utf-8"))["profiles"]
SENSITIVE_KEY = re.compile(r"(?:passw(?:or)?d|secret|token|credential|private.?key|api.?key|"
    r"authorization.?header|cookie|leave.?reason|medical|diagnos|bank.?account|social.?security|ssn)", re.I)
SECRET_TEXT = re.compile(
    r"-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|"
    r"\bAKIA[A-Z0-9]{16}\b|"
    r"\bBearer\s+[A-Za-z0-9._~+/=-]{12,}|"
    r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}|"
    r"(?:password|access[_ -]?token|session[_ -]?token|private[_ -]?token|api[_ -]?key|client[_ -]?secret)"
    r"\s*[:=]\s*[\"']?[^\s\"']{6,}", re.I)
URL = re.compile(r"https?://[^\s<>\]\)\"']+|(?:javascript|data|file):[^\s<>]+",re.I)
IDENTITY_KEYS = set("""id project_id project project_ids project_name task_id title
task_name employee employee_id employee_name vendor vendor_id vendor_name entity_id
entity_reference entity_type resource_key resource_keys display_resource resource
resource_name customer customer_id customer_name owner owner_id actor approver
manager manager_type client entity role_ids account account_id account_domain environment subsidiary subsidiary_ids
existing_id target_id operation_id target_url native_result_id indicator_type
indicatortype assignment_id projecttaskassignment projecttask source_row_ids""".split())
FIXED_TEXT = set("""kind state status native_status native_severity risk_severity provenance
population_basis terminal_state conclusion execution_state scope_reconciled grain
resource_kind entity_type classification proposal_state queue_kind selection_state
historical_alignment assignment_state operation item_kind business_object record_type
control approval_state outcome amount_kind band unit currency book basis period
definition formula description note limitations limitation reason title label""".split())
MAPPED_FIELDS = set("""before_values proposed_values relationships field_evidence side_effects
variance measure_evidence target approval_scope categories price_context attempts context
assumptions validation_issues dependencies native_result values current previous""".split())
SAFE_MAP_KEYS = {
"context":set("currency book basis period".split()),
"price_context":set("currency unit effective_date price_type basis period".split()),
"native_result":set("""id project indicatortype status severity useractionrequired
message recommendedaction deadline createddate lastmodifieddate evaluated_at retrieved_at""".split()),
"target":set("account_id environment subsidiary_id customer_id project_id".split()),
}
# One reviewed publisher serves flat, category-mounted and runbook copies.
import importlib.util as _publication_import
import sys as _publication_sys
_publication_sys.dont_write_bytecode = True
_publication_candidates = [p / 'publication.py' if p.name == 'shared' else p / 'shared' / 'publication.py'
                           for p in Path(__file__).resolve().parents]
_publication_path = next((p for p in _publication_candidates if p.is_file()), None)
if _publication_path is None:
    raise ImportError('Required shared/publication.py is unavailable')
_publication_spec = _publication_import.spec_from_file_location('suiteskills_safe_publication', _publication_path)
_publication_module = _publication_import.module_from_spec(_publication_spec)
_publication_spec.loader.exec_module(_publication_module)
publish_file = _publication_module.publish_file
cli_inputs = _publication_module.cli_inputs

def sha(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":"),
        ensure_ascii=False,allow_nan=False).encode("utf-8")).hexdigest()

def pointer(path, key):
    return path+"/"+str(key).replace("~","~0").replace("/","~1")

def leaf_reviews(value, path=""):
    """Return digests only for external review tooling; NEVER auto-approve these at runtime."""
    out={}
    if isinstance(value,dict):
        for k,v in value.items():out.update(leaf_reviews(v,pointer(path,k)))
    elif isinstance(value,list):
        for i,v in enumerate(value):out.update(leaf_reviews(v,pointer(path,i)))
    elif isinstance(value,str):
        out[path]=sha(value)
    return out

def _now(value):
    if isinstance(value,str):
        value=datetime.fromisoformat(value.replace("Z","+00:00"))
    if value.tzinfo is None:raise ValueError("Disclosure clock must be timezone aware.")
    return value.astimezone(timezone.utc)

def validate_policy(data, policy, now=None):
    if not isinstance(policy,dict):raise ValueError("Separate host-reviewed disclosure policy required.")
    if data.get("presentation_version"):raise ValueError("Project from protected VISUAL input, not an edited presentation.")
    allowed={"version","audience","purpose","authorization_reference","review_reference",
        "input_sha256","expires_at","allow_figures","allow_identifiers","allow_prices",
        "allow_links","allowed_link_origins","reviewed_text"}
    if set(policy)-allowed:raise ValueError("Unknown disclosure-policy fields.")
    for k in ("audience","purpose","authorization_reference","review_reference","input_sha256","expires_at"):
        if not isinstance(policy.get(k),str) or not policy[k].strip():
            raise ValueError("Disclosure policy is missing required context.")
    if policy.get("version")!=VERSION:raise ValueError("Unsupported disclosure policy version.")
    if policy["input_sha256"]!=sha(data):raise ValueError("Disclosure review is bound to a different evidence object.")
    clock=_now(now or datetime.now(timezone.utc))
    if _now(policy["expires_at"])<=clock:raise ValueError("Disclosure review expired; revalidate audience and evidence.")
    for k in ("allow_figures","allow_identifiers","allow_prices","allow_links"):
        if type(policy.get(k)) is not bool:raise ValueError("Disclosure flags must be explicit booleans.")
    reviews=policy.get("reviewed_text")
    if not isinstance(reviews,dict) or any(not isinstance(p,str) or not re.fullmatch(r"[0-9a-f]{64}",h)
                                         for p,h in reviews.items()):
        raise ValueError("Per-value text review digests required.")
    for origin in policy.get("allowed_link_origins",[]):
        parts=urlsplit(origin)
        if parts.scheme!="https" or not parts.netloc or parts.path not in ("","/") or parts.query or parts.fragment or parts.username:
            raise ValueError("Only exact HTTPS origins can be approved.")
    # Data flags such as synthetic, approved, or disclosure never establish permission.
    return True

class Projector:
    def __init__(self, data, policy):
        self.data=data;self.policy=policy;self.withheld=0;self.dropped=0;self.aliases={};self.alias_counts={}
    def hide(self):
        self.withheld+=1
        return WITHHELD
    def alias(self, value, category="Record"):
        key=(category,sha(value))
        if key not in self.aliases:
            self.alias_counts[category]=self.alias_counts.get(category,0)+1
            self.aliases[key]=f"{category} {self.alias_counts[category]:03d}"
        return self.aliases[key]
    def string(self,value,path,key="",identity=False):
        if not isinstance(value,str):raise ValueError("Expected a string in presentation input.")
        if SECRET_TEXT.search(value):return self.hide()
        for match in URL.finditer(value):
            parts=urlsplit(match.group(0))
            origin=f"{parts.scheme}://{parts.netloc}"
            if (not self.policy["allow_links"] or origin not in self.policy.get("allowed_link_origins",[]) or
                parts.scheme!="https" or parts.username or
                SENSITIVE_KEY.search(parts.query) or SENSITIVE_KEY.search(parts.fragment)):
                return self.hide()
        if (identity or key in IDENTITY_KEYS) and not self.policy["allow_identifiers"]:
            self.withheld+=1
            category="Resource" if "resource" in key or "employee" in key or "vendor" in key else (
                "Project" if key in {"project","project_id","project_ids","project_name"} else "Record")
            return self.alias(value,category)
        if self.policy["reviewed_text"].get(path)!=sha(value):return self.hide()
        return value
    def value(self,value,path,key="",depth=0):
        if depth>12:raise ValueError("Presentation nesting exceeds the supported limit.")
        if SENSITIVE_KEY.search(key):return self.hide()
        if key in {"price","rate","unitprice","unit_price","cost_rate","billing_rate"} and not self.policy["allow_prices"]:
            return self.hide()
        if value is None or type(value) is bool:return value
        if isinstance(value,(int,float)) and key in IDENTITY_KEYS and not self.policy["allow_identifiers"]:
            self.withheld+=1
            return self.alias(value,"Record")
        if key in {"source_refs","evidence_refs"} and isinstance(value,list):
            return self.refs(value)
        if isinstance(value,(int,float)):
            if isinstance(value,float) and not math.isfinite(value):raise ValueError("Non-finite presentation value.")
            if not self.policy["allow_figures"]:return self.hide()
            return value
        if isinstance(value,str):
            # Numeric quantities serialized as strings still require figure permission.
            if re.fullmatch(r"-?\d+(?:\.\d+)?",value) and key not in IDENTITY_KEYS and not self.policy["allow_figures"]:
                return self.hide()
            return self.string(value,path,key)
        if isinstance(value,list):
            return [self.value(x,pointer(path,i),key,depth+1) for i,x in enumerate(value)]
        if isinstance(value,dict):
            # No arbitrary objects survive. Financial/identity/native maps have fixed keys.
            if key in SAFE_MAP_KEYS:
                return self.obj(value,path,SAFE_MAP_KEYS[key],depth+1)
            # SOW/custom fields become reviewed leaves, not a raw serialized record.
            entries=[]
            def flatten(node,prefix,source_path,level):
                if level>12:raise ValueError("Presentation nesting exceeds the supported limit.")
                if isinstance(node,dict):
                    for name,child in node.items():
                        if not isinstance(name,str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_.-]{0,95}",name) or SENSITIVE_KEY.search(name):
                            self.dropped+=1;continue
                        flatten(child,(prefix+"." if prefix else "")+name,pointer(source_path,name),level+1)
                elif isinstance(node,list):
                    for i,child in enumerate(node):flatten(child,prefix+f"[{i}]",pointer(source_path,i),level+1)
                else:
                    k=prefix.split(".")[-1].split("[")[0]
                    v=self.value(node,source_path,k,level+1)
                    if v==WITHHELD:
                        # Do not expose arbitrary field names when their values were not reviewed.
                        entries.append({"field":"Withheld field","value":v})
                    else:entries.append({"field":prefix,"value":v})
            flatten(value,"",path,depth+1)
            return entries
        raise ValueError("Unsupported presentation value type.")
    def obj(self,obj,path,keys,depth=0):
        if not isinstance(obj,dict):return self.hide()
        self.dropped+=len(set(obj)-set(keys))
        return {k:self.value(v,pointer(path,k),k,depth+1) for k,v in obj.items()
                if k in keys and not SENSITIVE_KEY.search(k)}
    def lineage(self,obj,path):
        if obj is None:return None
        result=self.obj(obj,path,{"formula","grain","filters","input_row_refs","context","source_refs"})
        if "input_row_refs" in obj:
            result["input_row_refs"]=[self.alias(x,"Evidence row") for x in obj["input_row_refs"]]
        return result
    def refs(self,values):
        return [self.alias(v,"Source") for v in values]
    def row(self,row,path,keys):
        result={"id":self.alias(row["id"],"Row"),
            "values":self.obj(row["values"],pointer(path,"values"),keys),
            "source_refs":self.refs(row["source_refs"]),
            "provenance":row["provenance"],
            "lineage":self.lineage(row.get("lineage"),pointer(path,"lineage"))}
        return result

def project(data,policy=None,*,now=None):
    """Create a safe presentation copy. Never mutates evidence, approval state, or executable SOW plan."""
    vd.validate(data)
    validate_policy(data,policy,now)
    p=Projector(data,policy);s=data["snapshot"]
    window=p.obj(s["window"],"/snapshot/window",{"start","end","label"})
    scope={"label":p.string(s["scope"]["label"],"/snapshot/scope/label",identity=True),
        "project_ids":[p.alias(v,"Project") for v in s["scope"]["project_ids"]],
        "resource_keys":[p.alias(v,"Resource") for v in s["scope"].get("resource_keys",[])],
        "exact_user":{"state":"Protected exact-user binding retained internally"}}
    snapshot={"id":p.alias(s["id"],"Snapshot"),"synthetic":s["synthetic"],"as_of":s["as_of"],
        "timezone":s["timezone"],"scope":scope,"window":window,
        "context":p.obj(s.get("context",{}),"/snapshot/context",{"currency","book","basis","period"}),
        "evaluation_times":p.value(s.get("evaluation_times",[]),"/snapshot/evaluation_times"),
        "filters":p.value(s.get("filters",[]),"/snapshot/filters")}
    sources=[]
    for i,src in enumerate(data["sources"]):
        allowed={"kind","reference","fields","grain","filters","retrieved_at","evaluated_at",
            "pages_complete","periods_complete","state","limitations","alternatives_accounted_for",
            "attempts","remaining_usable_channels"}
        item=p.obj(src,f"/sources/{i}",allowed);item["id"]=p.alias(src["id"],"Source");sources.append(item)
    cov=data["coverage"];risk=cov.get("risk_gate")
    cv={"state":cov["state"],"errors":p.value(cov.get("errors",[]),"/coverage/errors"),
        "request_gate":{"gate_passed":bool((cov.get("request_gate") or {}).get("gate_passed"))}
                       if cov.get("request_gate") else None,
        "risk_gate":p.obj(risk,"/coverage/risk_gate",{
            "gate_passed","expected","completed","unavailable_evaluations","coverage_pct","review_complete"})
                    if risk else None,
        "note":p.string(cov.get("note",""),"/coverage/note")}
    out={"presentation_version":VERSION,"visual_version":data["visual_version"],
        "runtime_contract":data["runtime_contract"],"profile":data["profile"],"owner":data["owner"],
        "title":p.string(data["title"],"/title"),"snapshot":snapshot,"sources":sources,
        "coverage":cv,"cards":[],"panels":[],"actions":[],
        "limitations":p.value(data["limitations"],"/limitations"),
        "selection":{"kind":"display_subset_only","root_population_unchanged":True},
         "requested_recipe":None}
    recipe=data.get("requested_recipe")
    if recipe is not None:
        allowed_recipes={x["id"] for x in json.loads((Path(__file__).resolve().parents[1] /
            "references/shared/visual-config/recipes.json").read_text())["profiles"][data["profile"]]}
        if recipe not in allowed_recipes:raise ValueError("Unknown requested presentation recipe.")
        out["requested_recipe"]=recipe
    for i,card in enumerate(data["cards"]):
        path=f"/cards/{i}"
        allowed={"kind","title","value","unit","scope","as_of","timezone","period","state","limitations",
            "denominator","definition","provenance","population_basis","native_status","risk_severity"}
        item=p.obj(card,path,allowed);item["id"]=p.alias(card["id"],"Measure");item["source_refs"]=p.refs(card["source_refs"])
        # Generic scalar cards must retain restrictions from their original evidence fields.
        # Source pointers are protected provenance, never values to disclose verbatim.
        origins=[]
        for ref in (card.get("lineage") or {}).get("input_row_refs",[]):
            if isinstance(ref,str) and ref.startswith("/"):
                origins.extend(x.replace("~1","/").replace("~0","~") for x in ref.split("/")[1:])
        if (any(SENSITIVE_KEY.search(x) for x in origins)
            or (not policy["allow_prices"] and any(x.lower() in {"price","rate","unitprice","unit_price","cost_rate","billing_rate"} for x in origins))
            or (not policy["allow_identifiers"] and any(x in IDENTITY_KEYS or x.lower() in {"name","entityid"} for x in origins))):
            item["value"]=p.hide()
        item["lineage"]=p.lineage(card.get("lineage"),pointer(path,"lineage"))
        item["disclosure_state"]="withheld" if item.get("value")==WITHHELD else "permitted"
        if item["disclosure_state"]=="withheld":item["value"]=None
        if item.get("denominator")==WITHHELD:item["denominator"]=None
        out["cards"].append(item)
    for i,panel in enumerate(data["panels"]):
        path=f"/panels/{i}";pid=panel["id"]
        regid="performance" if pid.startswith("performance-") else pid
        if regid not in FIELDS[data["profile"]]:
            # Preserve an unavailable recipe with a safe registry identity, never arbitrary labels.
            known={x["id"] for x in json.loads((Path(__file__).resolve().parents[1] /
                "references/shared/visual-config/recipes.json").read_text())["profiles"][data["profile"]]}
            if regid not in known or panel["rows"]:raise ValueError("No publication field contract for panel.")
        keys=set(FIELDS[data["profile"]].get(regid,[]))
        # For an unavailable undeclared view keep honest message, never data-driven columns.
        item=p.obj(panel,path,{"title","kind","description","state","limitations","definition",
            "grain","filters","context","window"})
        item["id"]=pid;item["source_refs"]=p.refs(panel["source_refs"])
        item["rows"]=[p.row(r,pointer(pointer(path,"rows"),j),keys) for j,r in enumerate(panel["rows"])]
        item["columns"]=[]
        for j,c in enumerate(panel["columns"]):
            if c["key"] in keys:
                item["columns"].append({"key":c["key"],"label":p.string(c["label"],
                    f"{path}/columns/{j}/label")})
        chart=panel.get("chart");item["chart"]=None
        if chart:
            ck={chart.get(k) for k in ("label","day","demand","capacity","state") if chart.get(k)}
            ck|={x["key"] for x in chart.get("series",[])}
            safe=ck<=keys and all(r["values"].get(k)!=WITHHELD for r in item["rows"] for k in ck)
            if safe:
                item["chart"]={k:v for k,v in chart.items() if k in {"label","day","demand","capacity","state"}}
                if "series" in chart:
                    item["chart"]["series"]=[{"key":x["key"],
                        "label":p.string(x["label"],f"{path}/chart/series/{j}/label"),
                        "unit":p.string(x["unit"],f"{path}/chart/series/{j}/unit")}
                        for j,x in enumerate(chart["series"])]
            else:item["limitations"].append("Chart withheld for this audience; permitted table details remain.")
        out["panels"].append(item)
    for i,action in enumerate(data["actions"]):
        path=f"/actions/{i}"
        item=p.obj(action,path,{"title","owner","proposed_action","execution_state","approval_state",
            "authority","recheck","impact","reason","required_approval","limitations"})
        item["control"]="display_only";item["source_refs"]=p.refs(action["source_refs"])
        out["actions"].append(item)
    # Scope/coverage changes are not redaction. Never filter rows or recompute evidence totals here.
    if not policy["allow_figures"]:
        # Even population cardinality is sensitive; require a narrower authorized input instead of a fake total.
        raise ValueError("Population/figure publication is not authorized; provide a narrower authorized review.")
    out["disclosure"]={"version":VERSION,"withheld_values":p.withheld,"excluded_fields":p.dropped,
        "audience_reviewed":True,"evidence_state_unchanged":True,"executable":False,
        "note":"Audience-limited presentation, not the protected evidence or approved execution plan. "
               "Withheld is not missing, zero, Green, or an unevaluated risk. "
               "The host must authenticate permission; hashes and review flags alone do not."}
    out["content_sha256"]=sha(out)
    validate(out)
    return out

def _schema_check(value, schema, root):
    if "$ref" in schema:
        ref=schema["$ref"]
        if not ref.startswith("#/"):raise ValueError("External schema reference not supported.")
        target=root
        for piece in ref[2:].split("/"):target=target[piece]
        return _schema_check(value,target,root)
    if "anyOf" in schema:
        for candidate in schema["anyOf"]:
            try:_schema_check(value,candidate,root);return
            except (ValueError,TypeError):pass
        raise ValueError("Presentation value does not match a permitted type.")
    if "const" in schema and (value!=schema["const"] or type(value)!=type(schema["const"])):
        raise ValueError("Presentation constant differs.")
    if "enum" in schema and value not in schema["enum"]:raise ValueError("Invalid presentation enum.")
    types=schema.get("type",[])
    if isinstance(types,str):types=[types]
    valid={"null":value is None,"string":isinstance(value,str),"boolean":type(value) is bool,
        "integer":type(value) is int,"number":type(value) in {int,float} and math.isfinite(value),
        "object":isinstance(value,dict),"array":isinstance(value,list)}
    if types and not any(valid[t] for t in types):raise ValueError("Presentation type mismatch.")
    if isinstance(value,dict):
        properties=schema.get("properties",{})
        if set(schema.get("required",[]))-set(value):raise ValueError("Missing presentation properties.")
        if schema.get("additionalProperties") is False and set(value)-set(properties):
            raise ValueError("Unexpected presentation properties.")
        for k,v in value.items():
            if k in properties:_schema_check(v,properties[k],root)
    if isinstance(value,list) and "items" in schema:
        for item in value:_schema_check(item,schema["items"],root)

TOP={"presentation_version","visual_version","runtime_contract","profile","owner","title","snapshot",
    "sources","coverage","cards","panels","actions","limitations","selection","requested_recipe","disclosure","content_sha256"}
def validate(out):
    schema=json.loads((Path(__file__).resolve().parents[1] /
        "references/shared/presentation-dataset.schema.json").read_text(encoding="utf-8"))
    _schema_check(out,schema,schema)
    if not isinstance(out,dict) or set(out)!=TOP:raise ValueError("Invalid presentation envelope.")
    if out["presentation_version"]!=VERSION or out["profile"] not in FIELDS:raise ValueError("Unknown presentation contract.")
    if out["disclosure"].get("executable") is not False:raise ValueError("Presentation cannot authorize execution.")
    if set(out["snapshot"])!={"id","synthetic","as_of","timezone","scope","window","context","evaluation_times","filters"}:
        raise ValueError("Unexpected snapshot field in presentation.")
    # Profile field allowlist is applied again to reject edits after projection.
    for panel in out["panels"]:
        regid="performance" if panel["id"].startswith("performance-") else panel["id"]
        keys=set(FIELDS[out["profile"]].get(regid,[]))
        if any(set(row["values"])-keys for row in panel["rows"]):raise ValueError("Unapproved presentation field.")
    def walk(v):
        if isinstance(v,dict):
            for k,x in v.items():
                if SENSITIVE_KEY.search(k):raise ValueError("Sensitive property in presentation.")
                walk(x)
        elif isinstance(v,list):
            for x in v:walk(x)
        elif isinstance(v,str) and SECRET_TEXT.search(v):raise ValueError("Secret-like text in presentation.")
    walk(out)
    raw=deepcopy(out);checksum=raw.pop("content_sha256",None)
    if not checksum or sha(raw)!=checksum:raise ValueError("Presentation bytes changed after projection.")
    return {"valid":True,"presentation_version":VERSION,
            "note":"Schema/content integrity only; host authorization is external."}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation",choices=["project","validate"])
    parser.add_argument("input",type=Path);parser.add_argument("--policy",type=Path)
    parser.add_argument("--output",type=Path)
    args=parser.parse_args()
    try:
        data=json.loads(args.input.read_text(encoding="utf-8"))
        if args.operation=="project":
            if not args.policy:raise ValueError("A separate host-reviewed policy is required.")
            out=project(data,json.loads(args.policy.read_text(encoding="utf-8")))
        else:out=validate(data)
        text=json.dumps(out,ensure_ascii=False,indent=2,allow_nan=False)+"\n"
        if args.output:publish_file(args.output, text, inputs=cli_inputs(args))
        else:print(text,end="")
        return 0
    except (ValueError,TypeError,KeyError,OSError):
        # Never echo exception contents: a bad key/value may contain confidential data.
        print(json.dumps({"input_error":"Presentation rejected; inspect protected local diagnostics."}))
        return 1
if __name__=="__main__":raise SystemExit(main())
