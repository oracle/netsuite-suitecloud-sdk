#!/usr/bin/env python3
"""PM-SCOPE-1.0.0: validate source-backed scope selections and preserve population accounting.
Local adapter keys are not NetSuite field claims. A host resolves identities and performs reads.
This module never queries an account, fuzzy-matches people, grants permission or widens scope.
"""
from __future__ import annotations
import copy
from collections import defaultdict

VERSION = "PM-SCOPE-1.0.0"
MODES = {"all_accessible", "named", "authenticated"}
ENTITY_TYPES = {"employee", "vendor"}
SCOPE_FIELDS = {"version","mode","requested_keys","resolved","unresolved","session_entity",
                "directory","explicit_filters","resource_ids","personal_work"}

def _refs(value, sources, *, readable=False):
    if not isinstance(value, list) or not value or any(not isinstance(x,str) for x in value):
        raise ValueError("Scope provenance required")
    if not set(value) <= set(sources):
        raise ValueError("Unknown scope source")
    if readable and not all(sources[x]["state"]=="read_verified" for x in value):
        raise ValueError("Identity/population evidence is not readable")

def _entity(obj):
    if not isinstance(obj,dict) or obj.get("entity_type") not in ENTITY_TYPES or not isinstance(obj.get("id"),str) or not obj["id"]:
        raise ValueError("Exact typed identity required")
    return obj["entity_type"],obj["id"]

def validate(data):
    s=data.get("pm_scope")
    if not isinstance(s,dict) or s.get("version")!=VERSION or s.get("mode") not in MODES:
        raise ValueError("Versioned PM scope selection required")
    sources={r["id"]:r for r in data["sources"]}
    keys=s.get("requested_keys")
    if not isinstance(keys,list) or any(not isinstance(k,str) or not k for k in keys) or len(keys)!=len(set(keys)):
        raise ValueError("Distinct request keys required")
    resolved=s.get("resolved");unresolved=s.get("unresolved")
    if not isinstance(resolved,list) or not isinstance(unresolved,list):
        raise ValueError("Identity outcomes required")
    outcomes=[]
    for r in resolved:
        _entity(r)
        if r.get("match_basis") not in {"exact_reference","verified_directory_match","authenticated_reference"}:
            raise ValueError("Unverified or fuzzy identity match")
        _refs(r.get("source_refs"),sources,readable=True)
        outcomes.append(r.get("request_key"))
    for r in unresolved:
        if not r.get("reason") or not r.get("attempts") or r.get("remaining_usable_channels")!=[]:
            raise ValueError("Resolve usable identity alternatives before reporting an exhausted gap")
        _refs(r.get("source_refs"),sources)
        outcomes.append(r.get("request_key"))
    if len(outcomes)!=len(set(outcomes)) or set(outcomes)!=set(keys):
        raise ValueError("Requested identity outcomes do not reconcile")
    if s["mode"]=="all_accessible":
        if keys or resolved or unresolved or s.get("session_entity") is not None:
            raise ValueError("All-manager scope cannot silently become personal or named scope")
    elif not keys:
        raise ValueError("Named/personal intent needs request keys")
    if s["mode"]=="authenticated":
        if keys!=["authenticated-user"]:raise ValueError("Exact authenticated intent required")
        if resolved:
            auth=_entity(s.get("session_entity"))
            _refs(s["session_entity"].get("source_refs"),sources,readable=True)
            if len(resolved)!=1 or _entity(resolved[0])!=auth or resolved[0]["match_basis"]!="authenticated_reference":
                raise ValueError("Session identity and resolved person differ")
    elif s.get("personal_work") is not None:
        raise ValueError("Assigned-work scope requires authenticated intent")
    d=s.get("directory",{})
    if d.get("state") not in {"complete","unavailable"}:
        raise ValueError("Project directory is pending or incomplete")
    _refs(d.get("source_refs"),sources,readable=d["state"]=="complete")
    n=len(data.get("projects",[]))
    if type(d.get("evaluated")) is not int or d["evaluated"]!=n:
        raise ValueError("Directory row count does not reconcile")
    if d["state"]=="complete":
        if type(d.get("expected")) is not int or d["expected"]!=n or d.get("unavailable")!=0:
            raise ValueError("Directory denominators do not reconcile")
        if d.get("pages_complete") is not True or d.get("periods_complete") is not True:
            raise ValueError("Directory pages or periods unfinished")
    else:
        if not d.get("limitation") or not d.get("attempts") or d.get("remaining_usable_channels")!=[]:
            raise ValueError("Directory alternatives/limitations required")
        if d.get("expected") is not None:
            if type(d["expected"]) is not int or d["expected"]<n or d.get("unavailable")!=d["expected"]-n:
                raise ValueError("Unavailable directory denominator invalid")
        elif d.get("unavailable") is not None:
            raise ValueError("Unknown expected population has unknown unavailable count")
    filters=s.get("explicit_filters")
    if not isinstance(filters,list):
        raise ValueError("Explicit request filter ledger required")
    for f in filters:
        if not isinstance(f,dict) or not f.get("name") or not f.get("request_basis") or f.get("applied") is not True:
            raise ValueError("A selection filter must be tied to an explicit request and applied")
    project_ids=set()
    for p in data.get("projects",[]):
        if p["id"] in project_ids:raise ValueError("Duplicate project")
        project_ids.add(p["id"])
        if p.get("manager_id") and p.get("manager_entity_type") not in ENTITY_TYPES:
            raise ValueError("Project manager requires a verified entity type")
        if p.get("manager_state","unknown") not in {"assigned","unassigned","unknown"}:
            raise ValueError("Unknown manager state")
        if p.get("manager_state")=="unassigned" and p.get("manager_id"):
            raise ValueError("Unassigned project has a manager reference")
    options=data.get("options",{})
    if "manager_id" in options or "all_managers" in options or "manager_ids" in options:
        raise ValueError("Legacy scope options conflict with versioned PM scope")
    if s.get("resource_ids") is not None:
        rr=s["resource_ids"]
        if not isinstance(rr,list) or not all(isinstance(x,str) and x for x in rr) or len(rr)!=len(set(rr)):
            raise ValueError("Exact resource filter invalid")
        if not any(f["name"]=="resources" for f in filters):raise ValueError("Resource filter lacks explicit intent")
    personal=s.get("personal_work")
    if personal is not None:
        if not isinstance(personal,dict) or personal.get("kind") not in {"tasks","priorities"}:
            raise ValueError("Assigned-work mode invalid")
        _refs(personal.get("source_refs"),sources,readable=True)
        if not resolved or _entity(personal.get("entity"))!=_entity(resolved[0]) or not personal.get("project_resource_id"):
            raise ValueError("Personal task resource is not linked to the authenticated entity")
    return s

def apply(data):
    """Return a copy filtered to the exact resolved intent; never fall back to a busy book."""
    s=validate(data);clean=copy.deepcopy(data)
    projects=clean.get("projects",[])
    identities={_entity(r) for r in s["resolved"]}
    personal=s.get("personal_work")
    if personal:
        resource=personal["project_resource_id"]
        owned=[t for t in clean.get("tasks",[]) if t.get("owner")==resource and t.get("scope_role")!="supporting_commitment"]
        ids={t.get("project") for t in owned}
        chosen=[p for p in projects if p["id"] in ids]
    elif s["mode"]=="all_accessible":
        chosen=projects
    else:
        chosen=[p for p in projects if (p.get("manager_entity_type"),p.get("manager_id")) in identities]
    for f in s["explicit_filters"]:
        if f["name"]=="projects":
            requested=f.get("ids")
            if not isinstance(requested,list) or any(not isinstance(x,str) or not x for x in requested):
                raise ValueError("Explicit project selection needs exact IDs")
            chosen=[p for p in chosen if p["id"] in set(requested)]
    ids={p["id"] for p in chosen}
    # Explicit project selectors, if present, are already applied in the upstream directory query.
    # Reject orphan source facts rather than allowing them to disappear from a complete review.
    directory_ids={p["id"] for p in projects}
    for group in ("tasks","time_entries","allocations","unbilled","aging","overages","staffing","native"):
        selected=[]
        for r in clean.get(group,[]):
            supporting=r.get("scope_role")=="supporting_commitment"
            if r.get("project") not in directory_ids and not supporting:
                raise ValueError("Project detail cannot be attributed to the verified directory")
            if data["domain"]=="operations" and supporting:
                selected.append(r)
            elif r.get("project") in ids and not supporting:
                if group!="tasks" or not personal or r.get("owner")==personal["project_resource_id"]:
                    selected.append(r)
        clean[group]=selected
    clean["projects"]=chosen
    if s.get("resource_ids") is not None:
        resource_ids=set(s["resource_ids"])
        clean["resources"]=[r for r in clean.get("resources",[]) if r["id"] in resource_ids]
        clean["allocations"]=[r for r in clean.get("allocations",[]) if r.get("resource") in resource_ids]
    if personal:
        clean["resources"]=[r for r in clean.get("resources",[]) if r["id"]==personal["project_resource_id"]]
        clean["allocations"]=[r for r in clean.get("allocations",[]) if r.get("resource")==personal["project_resource_id"]]
    labels={"all_accessible":"All accessible managers/projects","named":"Exactly the resolved named manager(s)",
            "authenticated":"Authenticated user's assigned work" if personal else "Authenticated user's managed projects"}
    gaps=[r["reason"] for r in s["unresolved"]]
    if s["directory"]["state"]!="complete":gaps.append(s["directory"]["limitation"])
    unknown_membership=[p for p in projects if not p.get("manager_id") and p.get("manager_state","unknown")!="unassigned"]
    if unknown_membership and s["mode"]!="all_accessible" and not personal:
        gaps.append("Project manager references are unavailable for part of the directory; exact named/personal membership is not fully established.")
    clean["scope"]["description"] += " · " + labels[s["mode"]]
    if gaps:clean["scope"]["description"] += " · Scope limited: "+"; ".join(gaps)
    summary={"mode":s["mode"],"directory_evaluated":len(projects),"selected":len(chosen),
             "excluded_by_explicit_scope":len(projects)-len(chosen),"unresolved_identities":len(s["unresolved"]),
             "state":"limited" if gaps else "complete","gaps":gaps,
             "source_refs":sorted(set(s["directory"]["source_refs"]+[sid for r in s["resolved"]+s["unresolved"] for sid in r["source_refs"]]))}
    return clean,summary

def manager_groups(data):
    """Protected exact grouping; no monetary totals or severity is inferred here."""
    groups=defaultdict(list)
    for p in data.get("projects",[]):
        key=(p.get("manager_entity_type"),p.get("manager_id")) if p.get("manager_id") else ("none",p.get("manager_state","unknown"))
        groups[key].append(p)
    rows=[];ordered=sorted(groups.items(),key=lambda x:str(x[0]))
    labels=[]
    for key,projects in ordered:
        labels.append(next((p.get("manager_name") for p in projects if p.get("manager_name")),None) or
                      ("Manager name unavailable" if key[0]!="none" else
                       "Unassigned manager" if key[1]=="unassigned" else "Manager identity unavailable"))
    for group_number,(key,projects) in enumerate(ordered,1):
        label=(next((p.get("manager_name") for p in projects if p.get("manager_name")),None) or
               ("Manager name unavailable" if key[0]!="none" else
                "Unassigned manager" if key[1]=="unassigned" else "Manager identity unavailable"))
        if labels.count(label)>1:label+=f" (separate manager group {group_number})"
        for p in projects:
            rows.append([label,len(projects),p.get("name"),p.get("lifecycle"),p.get("end")])
    return rows
