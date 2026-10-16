#!/usr/bin/env python3
"""Build a read-only financial dashboard from reconciled source evidence."""
import argparse, json, math, re
from datetime import date
from pathlib import Path
from safe_output import write_new_text

def unbilled_summary(data):
    """Check supplied population membership; this does not authenticate source truth."""
    spec = data.get("unbilledAggregation")
    unavailable = {"state": "unavailable", "value": None,
                   "note": "Population non-overlap evidence was not supplied; observations are not additive."}
    if spec is None:
        return unavailable
    if not isinstance(spec, dict) or spec.get("state") not in ("verified_disjoint", "unavailable"):
        raise ValueError("unbilledAggregation state required")
    if not isinstance(spec.get("note"), str) or not spec["note"].strip():
        raise ValueError("unbilledAggregation note required")
    if spec["state"] == "unavailable":
        return {**unavailable, "note": spec["note"]}
    namespace = spec.get("populationNamespace")
    if not isinstance(namespace, str) or not namespace.strip():
        raise ValueError("unbilledAggregation populationNamespace required")
    refs = spec.get("sourceRefs")
    if not isinstance(refs, list) or not refs or any(not isinstance(r,str) or not r.strip() for r in refs):
        raise ValueError("Unbilled aggregation provenance required")
    if not set(refs) <= set(data["coverage"]["unbilled"]["sourceRefs"]):
        raise ValueError("Unbilled aggregation provenance outside stage")
    if data["coverage"]["unbilled"]["state"] == "unavailable":
        raise ValueError("Unavailable unbilled source cannot establish aggregation")
    seen = set()
    for row in data["unbilled"]:
        keys = row.get("populationKeys")
        if not isinstance(keys,list) or not keys or any(not isinstance(k,str) or not k.strip() for k in keys):
            raise ValueError("Unbilled populationKeys required")
        if len(set(keys)) != len(keys):
            raise ValueError("Duplicate unbilled population key within row")
        if seen.intersection(keys):
            raise ValueError("Overlapping unbilled population")
        seen.update(keys)
    if not data["unbilled"] and data["coverage"]["unbilled"]["state"] != "complete":
        return {**unavailable, "note": "Empty partial source does not establish a zero subtotal."}
    value = math.fsum(row["amount"] for row in data["unbilled"])
    if not math.isfinite(value):
        raise ValueError("Unbilled subtotal must be finite")
    return {"state": "verified_disjoint", "value": value, "note": spec["note"]}

def validate(data):
    def text(value,label):
        if not isinstance(value,str) or not value.strip():raise ValueError(label+" must be nonempty text")
    def number(value,label):
        if type(value) not in (int,float):raise ValueError(label+" must be numeric")
        try:finite=math.isfinite(value)
        except OverflowError:finite=False
        if not finite:raise ValueError(label+" must be finite")
    def refs(value):
        if not isinstance(value,list) or not value:raise ValueError("Source references required")
        for ref in value:text(ref,"source reference")
    if not isinstance(data,dict):raise ValueError("Financial JSON object required")
    for field in ("scope","sources","period","accountingBook","revenueBasis"):
        text(data.get(field),field)
    if not isinstance(data.get("currency"),str) or not re.fullmatch(r"[A-Z]{3}",data["currency"]):
        raise ValueError("Verified three-letter currency required")
    if "agingNote" in data:raise ValueError("Use structured aging evidence; see references/financial-input.md")
    coverage=data.get("coverage")
    if not isinstance(coverage,dict):raise ValueError("Coverage required")
    for stage in ("profitability","unbilled"):
        value=coverage.get(stage,{})
        if not isinstance(value,dict):raise ValueError("Coverage object required")
        if value.get("state") not in ("complete","partial","unavailable"):raise ValueError("Explicit coverage state required")
        text(value.get("note"),stage+" coverage note");refs(value.get("sourceRefs"))
    for group in ("projects","unbilled"):
        rows=data.get(group)
        if not isinstance(rows,list):raise ValueError(group+" must be an array")
        stage="profitability" if group=="projects" else "unbilled"
        if coverage[stage]["state"]=="unavailable" and rows:raise ValueError("Unavailable source cannot establish rows")
        ids=set()
        for row in rows:
            if not isinstance(row,dict):raise ValueError("Row object required")
            text(row.get("id"),"stable row ID")
            if row["id"] in ids:raise ValueError("Duplicate row ID")
            ids.add(row["id"]);text(row.get("name"),"row name");refs(row.get("sourceRefs"))
            if not set(row["sourceRefs"])<=set(coverage[stage]["sourceRefs"]):raise ValueError("Row source outside stage provenance")
            for context in ("currency","accountingBook","period"):
                if row.get(context)!=data[context]:raise ValueError("Mixed or missing financial context: "+context)
            if group=="projects":
                if row.get("grain")!="project":raise ValueError("Verified project-grain evidence required; names/prefixes are insufficient")
                text(row.get("customer"),"customer");number(row.get("revenue"),"revenue")
                if type(row.get("hasCost")) is not bool:raise ValueError("Boolean hasCost required")
                if row["hasCost"]:number(row.get("cost"),"cost")
                elif row.get("cost") is not None:raise ValueError("Unknown cost must be null")
            else:
                if row.get("grain") not in ("project","customer"):raise ValueError("Unbilled grain required")
                number(row.get("amount"),"unbilled amount")
    unbilled_summary(data)
    aging=data.get("aging")
    if not isinstance(aging,dict) or aging.get("state") not in ("complete","partial","unavailable"):
        raise ValueError("Structured aging coverage required")
    text(aging.get("note"),"aging note");text(aging.get("asOf"),"aging cutoff")
    try: date.fromisoformat(aging["asOf"])
    except ValueError: raise ValueError("aging.asOf must be a valid ISO date") from None
    refs(aging.get("sourceRefs"))
    rows=aging.get("rows")
    if not isinstance(rows,list):raise ValueError("Aging rows required")
    if aging["state"]=="unavailable" and rows:raise ValueError("Unavailable aging cannot establish rows")
    ids=set()
    for row in rows:
        if not isinstance(row,dict):raise ValueError("Aging row object required")
        text(row.get("id"),"aging ID");text(row.get("name"),"aging entity")
        if row["id"] in ids:raise ValueError("Duplicate aging ID")
        ids.add(row["id"])
        if row.get("grain") not in ("project","customer"):raise ValueError("Actual aging grain required")
        if row.get("currency")!=data["currency"]:raise ValueError("Mixed aging currency")
        refs(row.get("sourceRefs"))
        if not set(row["sourceRefs"])<=set(aging["sourceRefs"]):raise ValueError("Unverified aging provenance")
        number(row.get("overdue"),"overdue balance")
    threshold=data.get("unbilledThreshold")
    if threshold is not None:
        if not isinstance(threshold,dict) or threshold.get("currency")!=data["currency"]:raise ValueError("Threshold currency mismatch")
        number(threshold.get("amount"),"threshold")
        if threshold["amount"]<0:raise ValueError("Threshold must be nonnegative")
        text(threshold.get("basis"),"threshold basis")
    # Reject arithmetic overflow before producing an artifact.
    projects=data["projects"];matched=[p for p in projects if p["hasCost"]]
    for values in ([p["revenue"] for p in projects],[p["cost"] for p in matched],[p["revenue"] for p in matched],
                   [a["overdue"] for a in rows]):number(sum(values),"aggregate")
    for p in matched:
        number(p["revenue"]-p["cost"],"profit")
        if p["revenue"]>0:number((p["revenue"]-p["cost"])/p["revenue"]*100,"margin")
    revenue=sum(p["revenue"] for p in matched);cost=sum(p["cost"] for p in matched)
    if revenue>0:number((revenue-cost)/revenue*100,"matched margin")

def render(data):
    validate(data)
    output = {**data, "unbilledSummary": unbilled_summary(data)}
    encoded=json.dumps(output,ensure_ascii=False,allow_nan=False)
    for char,escaped in (("&",r"\u0026"),("<",r"\u003c"),(">",r"\u003e"),("\u2028",r"\u2028"),("\u2029",r"\u2029")):
        encoded=encoded.replace(char,escaped)
    template=(Path(__file__).resolve().parents[1]/"assets/dashboard-template.html").read_text(encoding="utf-8")
    if template.count("{{REPORT_DATA}}")!=1:raise ValueError("Unexpected template marker")
    return template.replace("{{REPORT_DATA}}",encoded)

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("input",type=Path);parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    try:write_new_text(args.output,render(json.loads(args.input.read_text(encoding="utf-8"))))
    except (json.JSONDecodeError, UnicodeDecodeError):
        print("Dashboard refused [input_json]: invalid JSON or text encoding.");return 2
    except ValueError as exc:
        print("Dashboard refused [validation]: " + str(exc));return 2
    except (TypeError,KeyError,OSError,OverflowError):
        print("Dashboard refused [input_or_output]: verify field types, finite calculations and a safe new output path.");return 2
    print("Created local read-only dashboard; no account operations performed.");return 0
if __name__=="__main__":raise SystemExit(main())
