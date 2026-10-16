#!/usr/bin/env python3
"""LAYOUT-1.0.0: data-bound, allowlisted presentation composition. No queries or writes."""
from __future__ import annotations
from copy import deepcopy
from pathlib import Path
import argparse, json
import presentation_disclosure as disclosure
VERSION="LAYOUT-1.0.0"
PRESETS={"auto","narrative-review","pm-portfolio","compact","classic"}
DENSITIES={"comfortable","compact","spacious"}
THEMES={"auto","light","dark"}
ARRANGEMENTS={"balanced","table-led","chart-led"}
INSIGHTS={"insights","combined","clients","exposure","native","native-gap","financial-gaps","staffing"}
DETAIL={"discovery-coverage","source-coverage","obligations","review-depth"}
PREFERRED={
    "portfolio-health":["attention","aging","timeline","milestones"],
    "operations":["work","capacity","approvals","staffing"],
    "operations-sow":["source","setup","delivery","people","commercial","decisions","preview"],
    "risk":["exposure","aging","native"],
    "financial":["performance-1","billing","cash","revenue"],
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

def build(data,*,preset="auto",density="comfortable",theme="auto",arrangement="balanced",
          cards=None,overview=None,broad=True):
    if preset not in PRESETS or density not in DENSITIES or theme not in THEMES or arrangement not in ARRANGEMENTS:
        raise ValueError("Unsupported layout option")
    if type(broad) is not bool:raise ValueError("Explicit breadth flag required")
    ids=[p["id"] for p in data["panels"]]
    if len(ids)!=len(set(ids)):raise ValueError("Duplicate panel identity")
    selected=preset
    if preset=="auto":
        selected="compact" if not broad else ("pm-portfolio" if "pm-projects" in ids else "narrative-review")
    if overview is None:
        preferences=(["pm-context","pm-projects","pm-financial","pm-timeline","pm-totals"]
                     if selected=="pm-portfolio" else PREFERRED[data["profile"]])
        first=data.get("requested_recipe")
        if first in ids:preferences=[first]+[x for x in preferences if x!=first]
        overview=[x for x in preferences if x in ids]
        if selected=="compact":
            scalar_cards=bool(data.get("cards")) and all(
                (c.get("lineage") or {}).get("grain")=="one requested scalar fact" for c in data["cards"])
            overview=[] if scalar_cards else overview[:1]
        elif broad:
            # Domain-appropriate chart overview, all other panels remain in details/insights.
            chartlike=[x for x in overview if next(p for p in data["panels"] if p["id"]==x).get("chart")
                       or x in {"capacity","timeline","pm-financial","pm-timeline"}]
            chosen=chartlike[:2]
            overview=([x for x in overview if x in {"pm-context","pm-projects"}]+chosen
                      if selected=="pm-portfolio" else (chosen or overview[:2]))
    if len(overview)!=len(set(overview)) or not set(overview)<=set(ids):
        raise ValueError("Unknown or repeated overview panel")
    # Mandatory audit sections are not removable; detail answers retain original request order.
    overview=[x for x in overview if x not in DETAIL]
    insights=[x for x in ids if x in INSIGHTS and x not in overview]
    insights.sort(key=lambda x:0 if x=="insights" else 1)
    detail=[x for x in ids if x not in overview and x not in insights]
    cardids=[c["id"] for c in data["cards"]]
    if cards is None:cards=cardids[:2] if selected=="compact" else cardids[:5]
    if len(cards)!=len(set(cards)) or not set(cards)<=set(cardids):raise ValueError("Unknown/repeated card selection")
    out={"layout_version":VERSION,"presentation_sha256":data["content_sha256"],
         "preset":selected,"density":density,"theme":theme,"arrangement":arrangement,
         "card_ids":cards,"overview_panels":overview,"insight_panels":insights,"detail_panels":detail,
         "root_scope_unchanged":True,"allow_execution":False,
         "show_charts":arrangement!="table-led" and selected!="compact",
         "interaction_scope":"approved_snapshot_only",
         "missing_preset_inputs":selected=="pm-portfolio" and "pm-projects" not in ids}
    out["layout_sha256"]=disclosure.sha(out)
    validate(data,out)
    return out

def validate(data,plan):
    disclosure.validate(data)
    expected={"layout_version","presentation_sha256","preset","density","theme","arrangement","card_ids",
              "overview_panels","insight_panels","detail_panels","root_scope_unchanged","allow_execution",
              "show_charts","interaction_scope","missing_preset_inputs","layout_sha256"}
    if not isinstance(plan,dict) or set(plan)!=expected:raise ValueError("Invalid layout shape")
    if plan["layout_version"]!=VERSION or plan["presentation_sha256"]!=data["content_sha256"]:
        raise ValueError("Layout belongs to a different disclosure-reviewed snapshot")
    if plan["preset"] not in PRESETS-{"auto"} or plan["density"] not in DENSITIES or plan["theme"] not in THEMES or plan["arrangement"] not in ARRANGEMENTS:
        raise ValueError("Unsupported layout enum")
    if plan["root_scope_unchanged"] is not True or plan["allow_execution"] is not False or plan["interaction_scope"]!="approved_snapshot_only":
        raise ValueError("Layout cannot change scope or authorize execution")
    for k in ("show_charts","missing_preset_inputs"):
        if type(plan[k]) is not bool:raise ValueError("Layout flags must be booleans")
    allids=[]
    for k in ("overview_panels","insight_panels","detail_panels"):
        if not isinstance(plan[k],list):raise ValueError("Panel IDs must be arrays")
        allids+=plan[k]
    ids=[p["id"] for p in data["panels"]]
    if len(allids)!=len(set(allids)) or set(allids)!=set(ids):
        raise ValueError("Every panel must remain available exactly once")
    if any(x in DETAIL and x not in plan["detail_panels"] for x in ids):
        raise ValueError("Required audit panels cannot leave the evidence detail")
    if (not isinstance(plan["card_ids"],list) or len(plan["card_ids"])!=len(set(plan["card_ids"])) or
        not set(plan["card_ids"])<={x["id"] for x in data["cards"]}):
        raise ValueError("Invalid measure selection")
    raw=deepcopy(plan);sig=raw.pop("layout_sha256")
    if disclosure.sha(raw)!=sig:raise ValueError("Layout integrity mismatch")
    return {"valid":True,"layout_version":VERSION,"note":"Local structural validation, not a host authorization grant."}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("input",type=Path)
    p.add_argument("--preset",choices=sorted(PRESETS),default="auto")
    p.add_argument("--density",choices=sorted(DENSITIES),default="comfortable")
    p.add_argument("--theme",choices=sorted(THEMES),default="auto")
    p.add_argument("--arrangement",choices=sorted(ARRANGEMENTS),default="balanced")
    p.add_argument("--narrow",action="store_true");p.add_argument("--output",required=True,type=Path)
    a=p.parse_args()
    try:
        d=json.loads(a.input.read_text(encoding="utf-8"));result=build(d,preset=a.preset,density=a.density,
            theme=a.theme,arrangement=a.arrangement,broad=not a.narrow)
        publish_file(a.output, json.dumps(result,indent=2)+"\n", inputs=cli_inputs(a));return 0
    except (ValueError,TypeError,KeyError,OSError):
        print('{"input_error":"Layout rejected; validate the approved presentation and requested options."}');return 1
if __name__=="__main__":raise SystemExit(main())
