#!/usr/bin/env python3
"""PRIMARY-2.0.0: source-first v12 calculations and safe dashboard assembly.
Consumes normalized evidence from actual discovered tools; never queries accounts, grants approval,
authenticates a connector, or performs writes. A trusted host must bind source receipts and disclosure.
Synthetic fixtures may be used only by tests, never as live-account evidence.
"""
from __future__ import annotations
import argparse, copy, json, hashlib, re, html, difflib
from pathlib import Path
from decimal import Decimal, InvalidOperation
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
import task_execution
import pm_scope
import presentation_disclosure as disclosure

ROOT = Path(__file__).resolve().parents[1]
VERSION = "PRIMARY-2.0.0"
DOMAINS = {"risk","financial"}
GROUPS = {
"financial":["projects","unbilled","aging"],
"health":["projects","tasks","time_entries"],
"operations":["resources","projects","allocations","tasks"],
"risk":["projects","tasks","overages","staffing","native"],
}
REQUIRED = {
"financial":["profitability","unbilled","aging"],
"health":["projects","tasks","hours","estimated-cost","revenue-cost"],
"operations":["resources","allocations","tasks","status","titles"],
"risk":["deadline","schedule","overage","staffing"],
}
FIELDS = {
"projects":set("id name customer manager_id manager_name manager_entity_type manager_state inactive start end lifecycle task_count contract contract_verified revenue cost estimated_cost allocated_hours hours currency book period needs_staffing template risk_flag scope_role source_refs".split()),
"tasks":set("id project title start end complete leaf owner owner_kind hours planned_hours estimated_cost percent_complete priority currency scope_role source_refs".split()),
"resources":set("id name title entity_type eligible scope_role source_refs".split()),
"allocations":set("id resource project task start end percent hours unit base additive scope_role source_refs".split()),
"time_entries":set("id project resource day hours labor_rate scope_role source_refs".split()),
"unbilled":set("id project name customer amount currency book period scope_role source_refs".split()),
"aging":set("id project name customer overdue currency book period scope_role source_refs".split()),
"overages":set("id project name hours_gap amount_gap unit scope_role source_refs".split()),
"staffing":set("id project task owner_kind name scope_role source_refs".split()),
"native":set("id project type status severity message evaluated_at scope_role source_refs".split()),
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

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def num(value):
    if value is None:return None
    if isinstance(value,bool):raise ValueError("Boolean is not a quantity")
    try:
        n=Decimal(str(value))
        if not n.is_finite():raise ValueError()
        return n
    except (ValueError,InvalidOperation):raise ValueError("Invalid finite numeric quantity") from None
def display(n):
    if n is None:return None
    n=num(n)
    return int(n) if n==n.to_integral_value() else float(n)
def day(value):
    return date.fromisoformat(value) if value else None
def refs(rows):
    return sorted({s for r in rows for s in r.get("source_refs",[])})
def fallback(need,reason):
    if not isinstance(reason,str) or not reason.strip():raise ValueError("Unresolved primary requirement required")
    needs=json.loads((ROOT/"references/primary/fallback-index.json").read_text())["needs"]
    if need not in needs:raise ValueError("Unsupported fallback need")
    return {"need":need,"reason":reason,"files":needs[need]["files"],"priority":"primary-unresolved-only"}

def validate(data):
    if data.get("version")!=VERSION or data.get("domain") not in DOMAINS:raise ValueError("Primary input contract required")
    sc=data.get("scope",{})
    if not sc.get("description"):raise ValueError("Explicit scope required")
    now=datetime.fromisoformat(sc["as_of"].replace("Z","+00:00"))
    if now.tzinfo is None:raise ValueError("Timezone-aware as-of instant required")
    today=now.astimezone(ZoneInfo(sc["timezone"])).date()
    sources=data.get("sources")
    if not isinstance(sources,list) or not sources:raise ValueError("Actual sources required")
    source_ids={s.get("id") for s in sources}
    if None in source_ids or len(source_ids)!=len(sources):raise ValueError("Distinct source IDs required")
    for s in sources:
        if s.get("state") not in {"read_verified","denied","tool_missing","incompatible","unknown","feature_absent_confirmed"}:
            raise ValueError("Actual source state required")
        if s["state"]!="read_verified" and not s.get("limitation"):raise ValueError("Unavailable source explanation required")
    coverage=data.get("coverage",[])
    seen=set()
    for c in coverage:
        if c.get("stage") in seen:raise ValueError("Duplicate coverage stage")
        seen.add(c.get("stage"))
        if c.get("state") not in {"complete","unavailable","not_applicable"}:raise ValueError("Required stage unfinished")
        if not c.get("source_refs") or not set(c["source_refs"])<=source_ids:raise ValueError("Coverage provenance required")
        if c["state"]=="complete":
            if not any(s["id"] in c["source_refs"] and s["state"]=="read_verified" for s in sources):
                raise ValueError("Completed stage needs successful source evidence")
            if c.get("pages_complete") is not True or c.get("periods_complete") is not True:
                raise ValueError("Pages/periods unfinished")
            if c.get("expected")!=c.get("evaluated") or type(c.get("expected")) is not int or c["expected"]<0:
                raise ValueError("Population denominators not reconciled")
        elif c["state"]=="unavailable":
            if not c.get("limitation") or not c.get("attempts") or c.get("remaining_usable_channels")!=[]:
                raise ValueError("Alternatives/limitations required")
        elif not c.get("reason"):raise ValueError("Nonapplicability explanation required")
    if not set(REQUIRED[data["domain"]])<=seen:raise ValueError("Primary workflow stages missing")
    for group in GROUPS[data["domain"]]:
        rows=data.get(group,[])
        if not isinstance(rows,list):raise ValueError("Record list required")
        ids=set()
        for row in rows:
            if not row.get("id") or row["id"] in ids:raise ValueError("Stable distinct rows required")
            ids.add(row["id"])
            if not row.get("source_refs") or not set(row["source_refs"])<=source_ids:raise ValueError("Row evidence missing")
            if any(next(s for s in sources if s["id"]==sid)["state"]!="read_verified" for sid in row["source_refs"]):
                raise ValueError("Unavailable source cannot establish a factual row")
    pm_scope.validate(data)
    return today
def context_key(row):
    return tuple(row.get(k) for k in ("currency","book","period"))
def card(key,label,value,unit="",basis="",source_refs=None):
    return {"key":key,"label":label,"value":value,"unit":unit,"basis":basis,"source_refs":source_refs or []}
def section(key,title,columns,rows,source_refs,note="",state="complete"):
    return {"key":key,"title":title,"columns":columns,"rows":rows,"source_refs":source_refs,"note":note,"state":state}
def stages(data):
    return {c["stage"]:c for c in data["coverage"]}
def stage_refs(data,*keys):
    return sorted({r for c in data["coverage"] if c["stage"] in keys for r in c["source_refs"]})
def state(data,key):
    return stages(data)[key]["state"]
def financial(data):
    ps=data.get("projects",[]);cards=[];rows=[];issues=[];buckets={}
    for p in ps:
        key=context_key(p)
        if not all(key):
            if p.get("revenue") is not None or p.get("cost") is not None:
                raise ValueError("Financial currency/book/period context required")
            rows.append([p.get("name"),p.get("customer"),None,None,None,None,p.get("currency"),"Financial detail unavailable"])
            issues.append([p.get("name"),"Financial detail not supplied for this directory project",None,p.get("currency"),"No zero amounts or loss inferred"])
            continue
        rev,cost=num(p.get("revenue")),num(p.get("cost"))
        profit=rev-cost if rev is not None and cost is not None else None
        margin=profit/rev*100 if profit is not None and rev!=0 else None
        flag="Cost not available" if cost is None else ("Cost with zero source revenue" if rev==0 and cost>0 else "No configured exception")
        if cost is None and rev is not None and rev>0:
            issues.append([p.get("name"),"Revenue with unavailable cost",display(rev),p["currency"],"Cause not established"])
        if rev==0 and cost is not None and cost>0:
            issues.append([p.get("name"),"Cost with zero source revenue",display(cost),p["currency"],"Not proof of uninvoiced work"])
        rows.append([p.get("name"),p.get("customer"),display(rev),display(cost),display(profit),display(margin),p["currency"],flag])
        b=buckets.setdefault(key,{"rev":[],"cost":[],"paired":[],"gap":[],"refs":[]})
        if rev is not None:b["rev"].append(rev)
        if cost is not None:b["cost"].append(cost)
        if rev is not None and cost is not None:b["paired"].append((rev,cost))
        if cost is None and rev is not None:b["gap"].append(rev)
        b["refs"]+=p["source_refs"]
    for (ccy,book,period),b in buckets.items():
        basis=f"{ccy} / {book} / {period}; observed values only"
        paired_rev=sum(x[0] for x in b["paired"]);paired_cost=sum(x[1] for x in b["paired"])
        sr=sorted(set(b["refs"]))
        group_unbilled=[u for u in data.get("unbilled",[]) if context_key(u)==(ccy,book,period)]
        ub_total=(sum(num(u["amount"]) for u in group_unbilled)
                  if state(data,"unbilled")=="complete" and all(num(u.get("amount")) is not None for u in group_unbilled) else None)
        cards += [card("revenue","Source revenue",display(sum(b["rev"])) if b["rev"] else None,ccy,basis,sr),
                  card("cost","Tracked cost",display(sum(b["cost"])) if b["cost"] else None,ccy,basis,sr),
                  card("margin","Cost-tracked margin",display((paired_rev-paired_cost)/paired_rev*100) if paired_rev else None,"%",
                       f"Only matched revenue/cost rows; {basis}",sr),
                  card("unbilled","Unbilled WIP",display(ub_total),ccy,basis,stage_refs(data,"unbilled")),
                  card("exceptions","Exceptions flagged",sum(1 for q in ps if context_key(q)==(ccy,book,period) and
                       ((num(q.get("cost")) is None and num(q.get("revenue")) is not None and num(q["revenue"])>0) or
                        (num(q.get("revenue"))==0 and num(q.get("cost")) is not None and num(q["cost"])>0))),"",
                       f"Missing-cost or zero-source-revenue observations; revenue with unavailable cost: {display(sum(b['gap']))} {ccy}",sr)]
    missing_context=sum(not all(context_key(p)) for p in ps)
    if missing_context:
        for c in cards:c["basis"]+=f"; {missing_context} directory projects lack measurable financial context and are excluded from monetary aggregates"
    ub=[]
    for r in data.get("unbilled",[]):
        a=num(r.get("amount"))
        if a is not None and a>0:
            tier="Unclassified"
            threshold=data.get("options",{}).get("unbilled_threshold")
            if threshold and threshold.get("currency")==r.get("currency"):
                tier="High (source-profile threshold)" if a>num(threshold["amount"]) else "Medium (source-profile threshold)"
            ub.append([r.get("name"),display(a),r.get("currency"),tier])
    ar=[[r.get("name") or r.get("customer"),display(r.get("overdue")),r.get("currency")] for r in data.get("aging",[]) if num(r.get("overdue")) is not None and num(r["overdue"])>0]
    if not buckets:cards=[card("projects","Projects returned",len(ps) if state(data,"profitability")=="complete" else None,"","Observed source rows; not all authorized projects",stage_refs(data,"profitability"))]
    return cards,[
        section("exceptions","Flagged exceptions",["Project","Finding","Amount","Currency","Qualification"],issues,refs(ps)),
        section("financial","Revenue vs. cost by project",["Project","Customer","Revenue","Cost","Profit","Margin %","Currency","Cost data"],rows,refs(ps),"A missing cost has no cost bar; profit and margin stay unknown."),
        section("unbilled","Unbilled WIP",["Project","Unbilled cost","Currency","Classification"],ub,stage_refs(data,"unbilled"),state=state(data,"unbilled")),
        section("aging","A/R aging",["Entity","Overdue amount","Currency"],ar,stage_refs(data,"aging"),
                "No overdue balances found only when this source population was successfully exhausted.",state(data,"aging"))]
def task_overdue(ts,today):
    return [r for r in ts if r.get("leaf") is True and r.get("complete") is False and day(r.get("end")) and day(r["end"])<today]
def health(data,today):
    ps=data.get("projects",[]);ts=data.get("tasks",[]);options=data.get("options",{})
    scoped=ps  # Exact PM/personal/explicit scope was resolved before aggregation.
    visible=[];categories={"Active":0,"Upcoming":0,"No plan yet":0,"Dates unresolved":0}
    for p in scoped:
        start,end=day(p.get("start")),day(p.get("end"))
        if end and end<today:cat="Past scheduled end"
        elif start and start>today:cat="Upcoming"
        elif start and end and start<=today<=end:cat="Active"
        elif p.get("task_count")==0:cat="No plan yet"
        else:cat="Dates unresolved"
        q=dict(p);q["category"]=cat;visible.append(q);categories[cat]=categories.get(cat,0)+1
    ids={p["id"] for p in visible}
    ots=task_overdue([t for t in ts if t.get("project") in ids],today)
    cards=[card("projects","Total projects",len(scoped),"","Complete resolved project population; past scheduled end is not confirmed closed; no date-only exclusions",refs(scoped))]
    cards += [card(k,k,v,"","Date-based category, not decoded lifecycle status",refs(scoped)) for k,v in categories.items() if k!="Dates unresolved" or v>0]
    cards.append(card("overdue","Overdue tasks",len(ots) if state(data,"tasks")=="complete" else None,"","Incomplete executable tasks in displayed project population",stage_refs(data,"tasks")))
    rows=[];att=[];fin=[];drills=[]
    for p in visible:
        times=[r for r in data.get("time_entries",[]) if r.get("project")==p["id"]]
        hours=sum(num(r.get("hours")) for r in times) if times and all(num(r.get("hours")) is not None for r in times) else None
        labor=sum(num(r["hours"])*num(r["labor_rate"]) for r in times) if times and all(num(r.get("hours")) is not None and num(r.get("labor_rate")) is not None for r in times) else None
        p_tasks=[t for t in ts if t.get("project")==p["id"] and t.get("leaf") is True]
        estimated=sum(num(t["estimated_cost"]) for t in p_tasks) if p_tasks and all(num(t.get("estimated_cost")) is not None for t in p_tasks) else None
        contract=num(p.get("contract")) if p.get("contract_verified") is True else None
        allocated=num(p.get("allocated_hours"));own=[t for t in ots if t.get("project")==p["id"]]
        gaps=[]
        if contract is not None and contract>0 and estimated is not None and estimated>contract:gaps.append(f"Estimated cost exceeds verified contract value by {estimated-contract}")
        if hours is not None and allocated is not None and allocated>0 and hours>allocated*Decimal("1.25"):gaps.append(f"Logged hours exceed allocated-hour baseline by {display((hours/allocated-1)*100)}%")
        if own:gaps.append(f"{len(own)} overdue tasks; oldest {max((today-day(t['end'])).days for t in own)} days")
        if gaps:att.append([p.get("name"),p.get("customer"),"; ".join(gaps),"Recorded differences; cause not established"])
        if contract==0 and ((labor is not None and labor>0) or (hours is not None and hours>0)):
            att.append([p.get("name"),p.get("customer"),"Zero selected contract value with recorded activity","Data/definition gap; no loss inferred"])
        rows.append([p.get("name"),p.get("customer"),p["category"],p.get("end"),len(own),display(hours),display(contract),display(estimated),p.get("currency")])
        drills.append({"columns":["Task","Due date","Days late","Resource","Complete %"],"rows":[
            [t.get("title"),t["end"],(today-day(t["end"])).days,t.get("owner") or t.get("owner_kind","unknown"),t.get("percent_complete")] for t in own],
            "financial":[display(contract),display(p.get("revenue")),display(labor),p.get("currency")]})
        fin.append([p["id"],p.get("name"),display(contract),display(p.get("revenue")),display(labor),p.get("currency")])
    all_times=[r for r in data.get("time_entries",[]) if r.get("project") in ids]
    total_hours=sum(num(r["hours"]) for r in all_times) if all_times and all(num(r.get("hours")) is not None for r in all_times) else None
    cards.append(card("hours","Hours logged",display(total_hours),"hours","Displayed projects; actual source time only",stage_refs(data,"hours")))
    currencies=sorted({p.get("currency") for p in visible if p.get("currency")})
    for cc in currencies:
        pr=[r for r in visible if r.get("currency")==cc]
        contracts=[num(r.get("contract")) if r.get("contract_verified") else None for r in pr]
        estimates=[num(r[7]) for r in rows if r[8]==cc]
        cards.append(card("contracts","Verified contract value",display(sum(contracts)) if contracts and all(x is not None for x in contracts) else None,cc,"Only consistently verified contract definitions",refs(pr)))
        cards.append(card("estimated","Estimated task cost",display(sum(estimates)) if estimates and all(x is not None for x in estimates) else None,cc,"Nonoverlapping executable task estimates",stage_refs(data,"estimated-cost")))
    attention_names={r[0] for r in att}
    fin.sort(key=lambda r:(r[1] not in attention_names,str(r[1])))
    ors=[[t["project"],t.get("title"),t["end"],(today-day(t["end"])).days,t.get("percent_complete"),t.get("owner") or t.get("owner_kind","unknown"),t.get("priority"),t.get("estimated_cost")] for t in ots]
    sections=[
        section("financial-picker","Financial overview",["Project key","Project","Verified contract value","Recognized source revenue","Time-derived labor cost","Currency"],fin,refs(visible)+refs(data.get("time_entries",[])),"Labor cost does not include all project cost; missing rates remain unknown."),
        section("attention","Needs attention",["Project","Client","Confirmed","Interpretation"],att,refs(visible)+refs(ots)),
        section("timeline","Timeline",["Project","Start","Calculated end"],[[p.get("name"),p.get("start"),p.get("end")] for p in visible],refs(visible),"All resolved projects retained, including past-end and missing-date rows; missing dates have no invented timeline bar."),
        section("projects","Project table",["Project","Client","Date category","Scheduled end","Overdue","Hours logged","Contract value","Estimated cost","Currency"],rows,refs(visible)+refs(ts)),
        section("overdue","Overdue task drill-down",["Project","Task","Due date","Days late","Complete %","Resource","Priority","Estimated cost"],ors,stage_refs(data,"tasks"),state=state(data,"tasks"))]
    next(s for s in sections if s["key"]=="projects")["drilldowns"]=drills
    return cards,sections
def overlaps(rows):
    """Sweep exact intervals, preserving incompatible/missing percent rows separately."""
    points={}
    for r in rows:
        a,b=day(r.get("start")),day(r.get("end"))
        if not a or not b or b<a:raise ValueError("Valid allocation interval required")
        points.setdefault(a,[]).append(("add",r))
        points.setdefault(b+timedelta(days=1),[]).append(("remove",r))
    active={};windows=[];dates=sorted(points)
    for i,d in enumerate(dates[:-1]):
        for op,r in points[d]:
            if op=="add":active[r["id"]]=r
            else:active.pop(r["id"],None)
        if not active:continue
        rr=list(active.values())
        percent=sum(num(r["percent"]) for r in rr) if all(r.get("unit")=="percent" and num(r.get("percent")) is not None for r in rr) else None
        bases={r.get("base") for r in rr}
        verified=percent is not None and len(bases)==1 and None not in bases and all(r.get("additive") is True for r in rr)
        windows.append({"start":d.isoformat(),"end":(dates[i+1]-timedelta(days=1)).isoformat(),"percent":display(percent),"verified":verified,"projects":sorted({r["project"] for r in rr}),"source_refs":refs(rr)})
    return windows
def operations(data,today):
    resources=data.get("resources",[]);allocs=data.get("allocations",[]);tasks=data.get("tasks",[])
    ps={p["id"]:p for p in data.get("projects",[])};dist=[];over=[];available=[];bench=[];focus=[]
    people=[r for r in resources if r.get("entity_type") in {"employee","vendor"} and r.get("eligible") is not False]
    for r in people:
        ar=[a for a in allocs if a["resource"]==r["id"]]
        ws=overlaps(ar);peak=max([w["percent"] for w in ws if w["percent"] is not None],default=None)
        verified=all(w["verified"] for w in ws)
        current=[a for a in ar if day(a.get("end")) and day(a["end"])>=today]
        active_tasks=[t for t in tasks if t.get("owner")==r["id"] and t.get("complete") is False and day(t.get("end")) and day(t["end"])>=today]
        task_end=max((day(t["end"]) for t in active_tasks),default=None)
        allocation_end=max((day(a["end"]) for a in ar),default=None)
        mismatch=task_end is not None and (allocation_end is None or task_end>allocation_end)
        if mismatch:focus.append([r.get("name"),"Task schedule extends beyond recorded allocations","Do not infer free capacity"])
        if not current and not active_tasks:
            available.append([r.get("name"),r.get("title"),"No current/future recorded allocation","Actual availability not confirmed without calendars/leave/competing commitments"])
        if ar:
            dist.append([r.get("name"),r.get("title"),peak,len({a["project"] for a in ar}),"Verified additive allocation" if verified else "Recorded overlap; semantics unresolved"])
        for w in ws:
            if w["percent"] is not None and w["percent"]>100:
                over.append([r.get("name"),r.get("title"),w["start"],w["end"],w["percent"],", ".join(ps.get(p,{}).get("name",p) for p in w["projects"]),"Allocation overload" if w["verified"] else "Candidate overlap"])
        if ar and current and peak is not None and peak<30 and not mismatch:
            bench.append([r.get("name"),r.get("title"),peak,"Low recorded allocation (<30% display threshold), not confirmed free hours"])
    unstaffed=[]
    for p in ps.values():
        if p.get("template") is True:continue
        if p.get("needs_staffing") is True and not any(a["project"]==p["id"] for a in allocs):
            unstaffed.append([p.get("name"),p.get("lifecycle"),"No recorded allocation; confirm task ownership and actual staffing"])
    pipe=[]
    titles=data.get("options",{}).get("required_titles",{})
    for p in ps.values():
        if not any(x[0]==p.get("name") for x in unstaffed):continue
        needed=titles.get(p["id"])
        if not needed:
            pipe.append([p.get("name"),"Title requirement not recorded","No match inferred"]);continue
        terms=set(re.findall(r"\w+",needed.lower()))
        candidates=[]
        for r in people:
            if not any(a[0]==r.get("name") for a in available+bench):continue
            if terms & set(re.findall(r"\w+",str(r.get("title","")).lower())):candidates.append(r.get("name"))
        pipe.append([p.get("name"),needed,", ".join(candidates) if candidates else "No title-overlap candidate identified"])
    sr=refs(resources)+refs(allocs)+refs(tasks)+refs(list(ps.values()))
    return [card("resources","Resources observed",len(resources),"","Declared accessible population; generic/inactive shown separately",sr)],[
        section("focus","Focus now",["Entity","Confirmed","Qualification"],focus[:3],sr,"Up to three evidenced priorities; no invented padding."),
        section("available","What resources are available?",["Person","Title","Recorded position","Limitation"],available,sr,state=state(data,"allocations")),
        section("distribution","Load by person, peak concurrent %",["Person","Title","Peak %","Projects","Basis"],dist,sr),
        section("understaffed","Which projects are understaffed?",["Project","Status","Evidence"],unstaffed,sr),
        section("overloaded","Which resources are overloaded?",["Person","Title","Start","End","Percent","Projects","Classification"],over,sr),
        section("bench","Who has bench time?",["Person","Title","Peak %","Qualification"],bench,sr),
        section("pipeline","Pipeline placement",["Project","Required title","First-pass candidates"],pipe,sr,"Title similarity only; no skills/certification or capacity guarantee and no assignment approval."),
        section("excluded-resources","Separately classified resources",["Resource","Type","Eligibility"],[[r.get("name"),r.get("entity_type"),r.get("eligible")] for r in resources if r not in people],refs(resources))]
def risk(data,today):
    ts=data.get("tasks",[]);ps={p["id"]:p for p in data.get("projects",[])}
    ot=task_overdue(ts,today);ovs=data.get("overages",[]);sr=refs(ot)+refs(ovs)+refs(list(ps.values()))
    late={t["project"] for t in ot};overids={t["project"] for t in ovs};flagged=late|overids|{p for p,r in ps.items() if r.get("risk_flag") is True}
    buckets=[("1–15",1,15),("16–30",16,30),("31–60",31,60),("61–100",61,100),("101+",101,10**9)]
    ages=[[name,sum(lo<=(today-day(t["end"])).days<=hi for t in ot)] for name,lo,hi in buckets]
    counts={p:sum(t["project"]==p for t in ot) for p in late}
    staffing=data.get("staffing",[])
    split={k:sum(r.get("owner_kind")==k for r in staffing) for k in ["unassigned","generic","named","unknown"]}
    cards=[card("at-risk","Source-flagged projects",len(flagged),"","Distinct deadline/overage candidates; not invented severity",sr),
           card("overdue","Overdue tasks",len(ot),"","Complete queried population; nonoverlapping age bands",stage_refs(data,"schedule")),
           card("worst","Worst recorded delay",max(((today-day(t["end"])).days for t in ot),default=None),"days","Only verified overdue rows",stage_refs(data,"schedule")),
           card("unowned","Unowned tasks",split["unassigned"],"","Verified blank assignment; not failed identity resolution",refs(staffing)),
           card("placeholder","Placeholder-staffed tasks",split["generic"],"","Verified resource kind, not name prefix",refs(staffing))]
    cases=[[ps.get(p,{}).get("name",p),"Appears in both overdue and overage results","Review schedule and scope together; cause not established"] for p in sorted(late&overids)]
    client={}
    for p in flagged:
        c=ps.get(p,{}).get("customer")
        if c:client[c]=client.get(c,0)+1
    native=[[r.get("type"),r.get("status"),r.get("severity"),r.get("message"),r.get("evaluated_at")] for r in data.get("native",[])]
    return cards,[
        section("age","Overdue-age distribution",["Age in days","Tasks"],ages,stage_refs(data,"schedule"),state=state(data,"schedule")),
        section("top","Projects by overdue task count",["Project","Overdue tasks"],[[ps.get(p,{}).get("name",p),n] for p,n in sorted(counts.items(),key=lambda x:(-x[1],x[0]))],sr),
        section("overage","Hours / budget overage",["Project","Hours gap","Amount gap","Unit"],[[r.get("name") or ps.get(r["project"],{}).get("name"),r.get("hours_gap"),r.get("amount_gap"),r.get("unit")] for r in ovs],refs(ovs)),
        section("cases","Confirmed and interpretation",["Project","Confirmed","Interpretation"],cases[:4],sr),
        section("projects","Source-flagged projects",["Project","Client","Calculated end"],[[ps.get(p,{}).get("name",p),ps.get(p,{}).get("customer"),ps.get(p,{}).get("end")] for p in sorted(flagged)],sr),
        section("staffing","Task ownership",["Kind","Tasks"],[[k,n] for k,n in split.items()],stage_refs(data,"staffing"),state=state(data,"staffing")),
        section("client","Client grouping",["Client","Flagged projects"],[[c,n] for c,n in sorted(client.items())],sr,"Descriptive concentration, not disproportionate exposure without comparison population."),
        section("native","Native observations (when used)",["Type","Status","Severity","Message","Evaluated"],native,refs(data.get("native",[])),"Native state remains separate from derived findings. No native rows supplied is not evidence of Green.",state="complete" if native else "not_applicable")]
def build(data):
    today=validate(data)
    # Only documented normalization fields enter analysis; raw extra fields cannot flow to output.
    clean,scope_summary=pm_scope.apply(data)
    for group in GROUPS[data["domain"]]:
        clean[group]=[{k:v for k,v in r.items() if k in FIELDS[group]} for r in clean.get(group,[])]
    domain=clean["domain"]
    cards,sections=financial(clean) if domain=="financial" else (health(clean,today) if domain=="health" else operations(clean,today) if domain=="operations" else risk(clean,today))
    # A complete directory is independent of task/report joins and inactive/date filters.
    group_rows=pm_scope.manager_groups(clean)
    if group_rows:
        sections.insert(0,section("managers","Projects grouped by manager",
          ["Manager","Project count in group","Project","Lifecycle","Calculated end"],group_rows,
          scope_summary["source_refs"],"Exact scoped directory; counts use unique projects. Manager-unassigned and identity-unknown groups remain distinct."))
    clean["coverage"].insert(0,{"stage":"pm-scope","state":"unavailable" if scope_summary["state"]=="limited" else "complete",
        "expected":data["pm_scope"]["directory"].get("expected"),"evaluated":scope_summary["directory_evaluated"],
        "pages_complete":data["pm_scope"]["directory"].get("pages_complete",False),
        "periods_complete":data["pm_scope"]["directory"].get("periods_complete",False),
        "source_refs":scope_summary["source_refs"],
        "limitation":"; ".join(scope_summary["gaps"]),
        "reason":f"Selected {scope_summary['selected']} projects; {scope_summary['excluded_by_explicit_scope']} outside the explicit request selection; {scope_summary['unresolved_identities']} unresolved identity selections."})
    if scope_summary["state"]=="limited":
        for c in cards:
            c["basis"]+="; partial resolved scope, not the complete requested population"
        for s in sections:
            s["note"]+=" Scope is limited to verified directory/identity evidence."
        if not clean["projects"] and data["domain"]!="operations":
            for c in cards:c["value"]=None
        if not clean["projects"] and data["domain"]=="operations" and data["pm_scope"]["mode"]!="all_accessible":
            for s in sections:s["rows"]=[];s["state"]="unavailable"
            for c in cards:c["value"]=None
    # Missing declared evidence cannot be transformed into a zero or a negative-result assertion.
    unavailable={c["stage"] for c in clean["coverage"] if c["state"]=="unavailable"}
    if unavailable:
        cards_by_stage={
          "financial":{"revenue":["profitability"],"cost":["profitability"],"margin":["profitability"],"unbilled":["unbilled"],"exceptions":["profitability"],"projects":["profitability"]},
          "health":{"projects":["projects"],"Active":["projects"],"Upcoming":["projects"],"No plan yet":["projects","tasks"],"Dates unresolved":["projects"],"overdue":["tasks"],"hours":["hours"],"contracts":["revenue-cost"],"estimated":["estimated-cost"]},
          "operations":{"resources":["resources"]},
          "risk":{"at-risk":["deadline","schedule","overage","staffing"],"overdue":["schedule"],"worst":["schedule"],"unowned":["staffing"],"placeholder":["staffing"]}}
        sections_by_stage={
          "financial":{"exceptions":["profitability"],"financial":["profitability"],"unbilled":["unbilled"],"aging":["aging"]},
          "health":{"financial-picker":["revenue-cost","hours"],"attention":["tasks","hours","estimated-cost","revenue-cost"],"timeline":["projects"],"projects":["projects","tasks","hours","estimated-cost"],"overdue":["tasks"]},
          "operations":{"focus":["allocations","tasks"],"available":["resources","allocations","tasks"],"distribution":["allocations"],"understaffed":["allocations","tasks","status"],"overloaded":["allocations"],"bench":["allocations","tasks"],"pipeline":["allocations","tasks","status","titles"]},
          "risk":{"age":["schedule"],"top":["schedule"],"overage":["overage"],"cases":["schedule","overage"],"projects":["deadline","schedule","overage"],"staffing":["staffing"],"client":["deadline","schedule","overage"]}}
        for c in cards:
            missing=unavailable & set(cards_by_stage[domain].get(c["key"],[]))
            if missing:
                c["value"]=None;c["basis"]+="; required evidence unavailable: "+", ".join(sorted(missing))
        for s in sections:
            missing=unavailable & set(sections_by_stage[domain].get(s["key"],[]))
            if not missing:continue
            s["state"]="partial" if s["rows"] else "unavailable"
            s["note"]+=" Required evidence unavailable: "+", ".join(sorted(missing))+"."
            if domain=="risk" and s["key"] in {"age","staffing"}:
                s["rows"]=[[r[0],None] for r in s["rows"]]
            if domain=="operations" and s["key"] in {"available","understaffed","bench","pipeline"}:
                s["rows"]=[];s["state"]="unavailable"
            if domain=="health" and s["key"]=="projects" and "tasks" in missing:
                for row in s["rows"]:row[4]=None
    for component in cards+sections:
        component["source_refs"]=sorted(set(component.get("source_refs",[])))
    out={"version":VERSION,"domain":domain,"title":{"health":"PM Portfolio Health Dashboard","operations":"Staffing & Resourcing","financial":"Project Financial Dashboard","risk":"NetSuite Project Risk Dashboard"}[domain],
         "as_of":clean["scope"]["as_of"],"timezone":clean["scope"]["timezone"],"scope":clean["scope"]["description"],
         "cards":cards,"sections":sections,"coverage":clean["coverage"],"sources":clean["sources"],
         "source_input_sha256":digest(data),
         "conclusion":"Complete with evidence limitations" if unavailable else "Source workflow complete"}
    return out

def publish(result,policy,now=None):
    # Reuse the retained v10 host-bound text/figure policy rather than silently weakening disclosure.
    disclosure.validate_policy(result,policy,now)
    p=disclosure.Projector(result,policy)
    def val(v,path,kind="value",text=False):
        if text and (not policy["allow_figures"] or not policy["allow_identifiers"]):
            return p.hide()  # mixed factual prose may contain figures/names, not safely separable
        return p.value(v,path,kind)
    out={k:val(result[k],"/"+k,k,text=k in {"title","scope"}) for k in ("title","scope","as_of","timezone","conclusion")}
    out.update(version=VERSION,domain=result["domain"],cards=[],sections=[],coverage=[],sources=[])
    for i,c in enumerate(result["cards"]):
        cp=f"/cards/{i}"
        out["cards"].append({k:(p.refs(v) if k=="source_refs" else val(v,cp+"/"+k,k,text=k in {"basis"})) for k,v in c.items() if k in {"key","label","value","unit","basis","source_refs"}})
    for i,s in enumerate(result["sections"]):
        sp=f"/sections/{i}";safe={}
        for k in ("key","title","note","state"):
            safe[k]=val(s[k],sp+"/"+k,k,text=k in {"note"})
        safe["columns"]=[val(v,sp+f"/columns/{j}","label") for j,v in enumerate(s["columns"])]
        safe["rows"]=[]
        for j,row in enumerate(s["rows"]):
            rr=[]
            for q,v in enumerate(row):
                col=s["columns"][q].lower()
                key="project_name" if col in {"project","client","entity","resource","person","customer","project key","manager"} else "value"
                if isinstance(v,str) and re.search(r"\d",v) and not policy["allow_figures"]:rr.append(p.hide())
                elif isinstance(v,str) and not policy["allow_identifiers"] and key=="value":rr.append(p.hide())
                else:rr.append(val(v,sp+f"/rows/{j}/{q}",key))
            safe["rows"].append(rr)
        if "drilldowns" in s:
            safe["drilldowns"]=[]
            for j,dd in enumerate(s["drilldowns"]):
                dp=sp+f"/drilldowns/{j}"
                item={"columns":[val(v,dp+f"/columns/{q}","label") for q,v in enumerate(dd["columns"])],"rows":[]}
                for n,rr in enumerate(dd["rows"]):
                    item["rows"].append([val(v,dp+f"/rows/{n}/{q}","project_name" if q in (0,3) else "value")
                        if not (isinstance(v,str) and re.search(r"\d",v) and not policy["allow_figures"]) else p.hide() for q,v in enumerate(rr)])
                item["financial"]=[val(v,dp+f"/financial/{q}","value") for q,v in enumerate(dd["financial"])]
                safe["drilldowns"].append(item)
        safe["source_refs"]=p.refs(s["source_refs"]);out["sections"].append(safe)
    for i,c in enumerate(result["coverage"]):
        cp=f"/coverage/{i}"
        safe={k:val(c[k],cp+"/"+k,k,text=k in {"limitation","reason"}) for k in ("stage","state","expected","evaluated","pages_complete","periods_complete","limitation","reason") if k in c}
        safe["source_refs"]=p.refs(c["source_refs"]);out["coverage"].append(safe)
    for i,s in enumerate(result["sources"]):
        sp=f"/sources/{i}"
        safe={"id":p.alias(s["id"],"Source")}
        safe.update({k:val(s[k],sp+"/"+k,k,text=k in {"label","limitation"}) for k in ("label","kind","state","retrieved_at","evaluated_at","limitation") if k in s})
        out["sources"].append(safe)
    out["disclosure"]={"withheld":p.withheld,"dropped":p.dropped,"note":"Audience-reviewed output; private input and receipts are not embedded."}
    out["presentation_version"]="PRIMARY-PRESENTATION-1.1.0"
    out["content_sha256"]=digest(out)
    return out

def esc(v):
    return html.escape("—" if v is None else str(v),quote=True)
def table(s):
    body=[]
    for i,row in enumerate(s["rows"]):
        cells=[]
        for j,v in enumerate(row):
            if j==4 and s.get("key")=="projects" and i<len(s.get("drilldowns",[])):
                dd=s["drilldowns"][i]
                mini={"columns":dd["columns"],"rows":dd["rows"],"state":s["state"]}
                details=table(mini)
                details+="<p>Verified contract / source recognized revenue / time-derived labor cost: "+esc(" / ".join("—" if x is None else str(x) for x in dd["financial"]))+"</p>"
                cells.append("<td><details><summary>Overdue: "+esc(v)+"</summary>"+details+"</details></td>")
            else:cells.append("<td>"+esc(v)+"</td>")
        body.append("<tr>"+"".join(cells)+"</tr>")
    if not body:
        msg="No matching rows in the verified source scope." if s["state"]=="complete" else "This evidence is unavailable or not applicable; see coverage."
        body=["<tr><td colspan=\""+str(max(1,len(s["columns"])))+"\">"+esc(msg)+"</td></tr>"]
    return '<div class="table-scroll"><table><thead><tr>'+''.join('<th><button type="button" data-sort="'+str(i)+'">'+esc(c)+'</button></th>' for i,c in enumerate(s["columns"]))+"</tr></thead><tbody>"+''.join(body)+"</tbody></table></div>"
def bars(s,index=1):
    rr=[r for r in s["rows"] if len(r)>index and type(r[index]) in (int,float)]
    if not rr:return ""
    scale=max([abs(float(r[index])) for r in rr]+[1])
    return '<div class="bars" aria-label="'+esc(s["title"])+'">'+"".join(
        '<div class="bar-row"><span>'+esc(r[0])+'</span><div class="bar-track"><div class="bar-fill" style="width:'+str(abs(float(r[index]))/scale*100)+'%"></div></div><b>'+esc(r[index])+'</b></div>' for r in rr)+'</div>'
def render(pub):
    if pub.get("presentation_version")!="PRIMARY-PRESENTATION-1.1.0":raise ValueError("Only projected presentation may render")
    if pub.get("content_sha256")!=digest({k:v for k,v in pub.items() if k!="content_sha256"}):raise ValueError("Presentation changed after review")
    domain=pub["domain"]
    if domain not in DOMAINS:raise ValueError("Domain excluded from this distribution")
    templates={"financial":"../../skills/finance/runbooks/netsuite-project-financial-assistant/assets/dashboard-template.html"}
    template=ROOT/templates.get(domain,"assets/primary-dashboard.html")
    raw=template.read_text()
    cards=''.join('<article class="kpi"><div class="label">'+esc(c["label"])+'</div><div class="value">'+esc(c["value"])+(' '+esc(c["unit"]) if c["unit"] else '')+'</div><div class="sub">'+esc(c["basis"])+'</div><small>'+esc(", ".join(c["source_refs"]))+'</small></article>' for c in pub["cards"])
    blocks=[]
    for s in pub["sections"]:
        chart=""
        if s["key"] in {"age","top","staffing","client"}:chart=bars(s)
        elif s["key"]=="distribution":chart=bars(s,2)
        elif s["key"]=="overage":chart=bars(s,1)
        elif s["key"]=="financial":
            # Two values share a context only after normalization/reconciliation. Currency labels stay per row.
            chart=''.join('<div class="comparison"><strong>'+esc(r[0])+' · '+esc(r[6])+'</strong>'+bars({"rows":[["Revenue",r[2]],["Cost",r[3]]],"title":"Source revenue and cost"})+'</div>' for r in s["rows"])
        elif s["key"]=="timeline":
            dated=[r for r in s["rows"] if r[1] and r[2] and isinstance(r[1],str) and isinstance(r[2],str)]
            try:
                begin=min(day(r[1]) for r in dated);end=max(day(r[2]) for r in dated);span=max(1,(end-begin).days)
                chart='<div class="timeline">'+''.join('<div class="timeline-row"><span>'+esc(r[0])+'</span><div class="bar-track"><div class="bar-fill" style="margin-left:'+str((day(r[1])-begin).days/span*100)+'%;width:'+str(max(0,(day(r[2])-day(r[1])).days)/span*100)+'%"></div></div><small>'+esc(r[1])+' → '+esc(r[2])+'</small></div>' for r in dated)+'</div>'
                stamp=datetime.fromisoformat(str(pub["as_of"]).replace("Z","+00:00")).astimezone(ZoneInfo(str(pub["timezone"]))).date()
                if begin<=stamp<=end:
                    chart+='<div class="today-scale" aria-label="As-of marker"><span style="margin-left:'+str((stamp-begin).days/span*100)+'%">│ Today '+esc(stamp.isoformat())+'</span></div>'
                else:chart+='<p class="source">As-of date lies outside the recorded timeline range.</p>'
            except (ValueError,TypeError,KeyError):chart=""
        elif s["key"]=="financial-picker":
            opts='<select aria-label="Project financial selector" data-project-picker><option value="">All supplied projects</option>'+''.join('<option '+('selected ' if i==0 else '')+'value="'+str(i)+'">'+esc(r[1])+'</option>' for i,r in enumerate(s["rows"]))+'</select>'
            chart=opts+''.join('<div class="project-choice" '+('hidden ' if i>0 else '')+'data-project="'+str(i)+'"><h3>'+esc(r[1])+' · '+esc(r[5])+'</h3>'+bars({"title":"Project finance","rows":[["Verified contract",r[2]],["Source recognized revenue",r[3]],["Time-derived labor cost",r[4]]]})+'</div>' for i,r in enumerate(s["rows"]))
        if s["key"]=="managers" and s["rows"]:
            grouped={}
            # Each manager group remains separate even if display names coincide, via first row boundaries.
            for row in s["rows"]:grouped.setdefault(str(row[0]),[]).append(row)
            chart+='<div class="manager-groups">'+''.join(
                '<details open><summary>'+esc(label)+'</summary>'+''.join(
                '<p>'+esc(r[2])+' · '+esc(r[3])+' · '+esc(r[4])+'</p>' for r in rr)+'</details>'
                for label,rr in grouped.items())+'</div>'
        if s["key"] in {"cases","attention","focus","exceptions","pipeline"} and s["rows"]:
            chart+='<div class="finding-grid">'+''.join('<article class="finding"><h3>'+esc(row[0])+'</h3>'+''.join('<p><strong>'+esc(s["columns"][j])+':</strong> '+esc(v)+'</p>' for j,v in enumerate(row[1:],1))+'</article>' for row in s["rows"])+'</div>'
        if s["key"]=="available" and s["rows"]:
            groups={}
            for row in s["rows"]:groups.setdefault(str(row[1]),[]).append(row)
            chart+='<div class="role-groups">'+''.join('<details class="role-group"><summary>'+esc(title)+' · '+str(len(rr))+'</summary>'+''.join('<p>'+esc(row[0])+' — '+esc(row[2])+'; '+esc(row[3])+'</p>' for row in rr)+'</details>' for title,rr in groups.items())+'</div>'
        blocks.append('<section id="'+esc(s["key"])+'"><h2>'+esc(s["title"])+'</h2><p class="section-note">'+esc(s["note"])+'</p>'+chart+table(s)+'<p class="source">Source: '+esc(", ".join(s["source_refs"]))+'</p></section>')
    coverage='<section id="coverage"><h2>Coverage and definitions</h2>'+''.join(
        '<article class="coverage '+('warning' if c["state"]!="complete" else '')+'"><strong>'+esc(c["stage"])+' — '+esc(c["state"])+'</strong><p>'+esc(c.get("limitation") or c.get("reason") or "Declared source pages and periods completed.")+'</p><small>'+esc(", ".join(c["source_refs"]))+'</small></article>' for c in pub["coverage"])+'</section>'
    sources='<section id="sources"><h2>Source inventory</h2>'+''.join('<p>'+esc(s.get("id"))+' · '+esc(s.get("label"))+' · '+esc(s.get("state"))+' · retrieved '+esc(s.get("retrieved_at"))+' · evaluated '+esc(s.get("evaluated_at"))+'</p>' for s in pub["sources"])+'</section>'
    vals={"TITLE":esc(pub["title"]),"SCOPE":esc(pub["scope"]),"ASOF":esc(pub["as_of"])+" · "+esc(pub["timezone"]),
          "CONCLUSION":esc(pub["conclusion"]),"CARDS":cards,"SECTIONS":''.join(blocks),"COVERAGE":coverage,"SOURCES":sources}
    for k,v in vals.items():raw=raw.replace("{{"+k+"}}",v)
    if re.search(r"\{\{[A-Z]+\}\}",raw):raise ValueError("Unfilled template marker")
    return raw

def main():
    pa=argparse.ArgumentParser(description=__doc__);pa.add_argument("command",choices=["build","render"])
    pa.add_argument("input",type=Path);pa.add_argument("--output",type=Path,required=True)
    pa.add_argument("--policy",type=Path);pa.add_argument("--context",type=Path);pa.add_argument("--trace",type=Path)
    a=pa.parse_args()
    try:
        data=json.loads(a.input.read_text())
        if a.command=="build":
            if not a.context or not a.trace:raise ValueError("Actual task context and trace required")
            context=json.loads(a.context.read_text());trace=json.loads(a.trace.read_text())
            status=task_execution.gate(data,context,trace)
            if not status["proceed"]:
                print(status.get("message","Account-backed task stopped."));return 2
            result=build(data);publish_file(a.output, json.dumps(result,indent=2,allow_nan=False), inputs=cli_inputs(a))
        else:
            if not a.policy:raise ValueError("Audience-reviewed disclosure policy required")
            policy=json.loads(a.policy.read_text())
            publish_file(a.output, render(publish(data,policy)), inputs=cli_inputs(a))
        print("Completed local primary workflow operation; no NetSuite calls or writes performed by this helper.")
        return 0
    except (ValueError,KeyError,TypeError,OSError):
        print("Primary workflow blocked: validate protected source, scope, coverage, trace and audience context.")
        return 1
if __name__=="__main__":raise SystemExit(main())
