#!/usr/bin/env python3
"""Content-triggered delivery of an already gated and audience-reviewed dataset.
No NetSuite calls. Host capability declarations are input, not capability discovery or authorization.
"""
from __future__ import annotations
from pathlib import Path
import argparse,json
import visual_dataset as vd
import visual_render as renderer
import presentation_disclosure as disclosure
import fact_tiles
import task_execution

REASONS = {
    "host_unavailable":"Dashboard not used: this host has neither a supported inline renderer nor a deliverable HTML artifact channel.",
    "misrepresentation":"The requested chart is unsuitable; an HTML table-led view preserves the verified evidence and limitations.",
    "user_text":"Explicit current-user text-only override; evidence and disclosure controls remain active.",
    "simple_confirmation":"Verified single-sentence presence/absence confirmation.",
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

def deliver(data,policy,capabilities,*,broad=True,explicit_visual=False,text_requested=False,
            misrepresents=False,preset="auto",arrangement="balanced",presence_confirmation=False,
            execution_context=None,tool_trace=None,single_row=False):
    # Production account-backed delivery fails closed before rendering any evidence.
    # Synthetic execution is for local engineering only and remains visibly watermarked.
    if data.get("snapshot",{}).get("synthetic") is not True:
        if execution_context is None:
            raise ValueError("Live findings require a trusted task context and current-conversation tool trace")
        task_gate=task_execution.gate(data,execution_context,tool_trace)
        if not task_gate["proceed"]:
            return {"delivery":"stop" if task_gate["state"]=="unavailable" else "clarification",
                    "file_format":"text","fallback_reason":task_gate["state"],
                    "inline_rendered":False,"content":task_gate["message"]+"\n",
                    "note":"No account-backed report generated."}
    vd.validate(data)
    published=disclosure.project(data,policy)  # Authorization failure blocks EVERY output format.
    if type(presence_confirmation) is not bool:raise ValueError("Explicit presence-confirmation flag required.")
    simple=presence_confirmation and not broad and fact_tiles.presence_only(data) and fact_tiles.presence_only(published)
    scalar=(len(published["cards"])==1 and
            (published["cards"][0].get("lineage") or {}).get("grain")=="one requested scalar fact" and
            published["cards"][0].get("state")=="complete" and
            len(data.get("coverage",{}).get("obligations",[]))==1)
    if type(single_row) is not bool:raise ValueError("Explicit one-row intent required")
    # Row count alone cannot waive HTML: a row may contain several facts.
    gaps=(published.get("limitations",[])+published["coverage"].get("errors",[])+
          [x for c in published["cards"] for x in c.get("limitations",[])])
    complete=(not gaps and published["coverage"].get("complete") is True)
    # Older datasets expose completeness through the outcome and obligation states.
    if not gaps and published["coverage"].get("status")=="complete":complete=True
    if not gaps and all(o.get("terminal_state",o.get("state")) in {"Answered","complete"} for o in data.get("coverage",{}).get("obligations",[])) and (scalar or simple):
        complete=True
    allowed={"inline","html_artifact"}
    if not isinstance(capabilities,dict) or set(capabilities)!=allowed or any(type(v) is not bool for v in capabilities.values()):
        raise ValueError("Explicit actual-host capability flags required")
    choice=vd.select_mode(broad=broad,explicit_visual=explicit_visual,
        inline_available=capabilities["inline"],artifact_available=capabilities["html_artifact"],
        text_requested=text_requested,misrepresents=misrepresents,
        reason=REASONS["misrepresentation"] if misrepresents else None,
        has_findings=not simple,presence_only=simple,single_sentence=scalar or simple,
        single_fact=scalar,single_row=single_row,answer_complete=complete,
        data_point_count=1 if scalar or simple else None,structured_detail=not (scalar or simple),
        coverage_gap=bool(gaps))
    rich=choice["mode"] in {"html","inline"}
    if choice["mode"]=="unavailable":
        return {"delivery":"unavailable","file_format":"text","fallback_reason":"html_unavailable",
                "inline_rendered":False,"content":choice["reason"]+"\n",
                "note":"No dashboard or substitute data table was generated."}
    if rich:
        content=renderer.render_html(data,policy,preset=preset,arrangement="table-led" if misrepresents else arrangement,broad=broad)
        reason=None
    elif choice["mode"]=="concise":
        reason="simple_confirmation" if simple else "single_complete_fact"
        if scalar or simple:
            card=published["cards"][0]
            unit=card.get("unit")
            content=renderer.md(card["title"])+": "+renderer.md(disclosure.WITHHELD if card.get("disclosure_state")=="withheld" else card["value"])
            if unit and unit not in {"status","date","boolean","count","presence"}:
                content+=" "+renderer.md(unit)
            content+=" (basis: "+renderer.md(str(card.get("definition","")).rstrip("."))+"; Source: "+renderer.md(", ".join(card["source_refs"]))+"; as of "+renderer.md(card.get("as_of",published["snapshot"]["as_of"]))+")."
            content+="\n"
        else:
            content=renderer.render_markdown(data,policy,preset="compact",broad=False)
        if data["snapshot"].get("synthetic"):
            content="SYNTHETIC EXAMPLE — not live NetSuite data.\n\n"+content
    else:
        reason="user_text" if text_requested else ("misrepresentation" if misrepresents else "host_unavailable")
        # A concise host answer may select only the requested item upstream. The file fallback retains all detail.
        content=REASONS[reason]+"\n\n"+renderer.render_markdown(data,policy,preset=preset,broad=broad)
    return {"delivery":choice["mode"],"file_format":"html" if rich else "markdown",
            "fallback_reason":reason,"inline_rendered":False,"content":content,
            "note":"Inline output still requires actual host-tool execution. Generated HTML alone is an artifact."}
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("input",type=Path);p.add_argument("--policy",required=True,type=Path)
    p.add_argument("--capabilities",required=True,type=Path);p.add_argument("--output",required=True,type=Path)
    p.add_argument("--execution-context",type=Path);p.add_argument("--tool-trace",type=Path)
    p.add_argument("--explicit-visual",action="store_true");p.add_argument("--single-row",action="store_true")
    p.add_argument("--text-only",action="store_true");p.add_argument("--misrepresents",action="store_true")
    p.add_argument("--narrow",action="store_true");p.add_argument("--presence-confirmation",action="store_true")
    p.add_argument("--preset",default="auto",
        choices=["auto","narrative-review","pm-portfolio","compact","classic"])
    a=p.parse_args()
    try:
        result=deliver(json.loads(a.input.read_text()),json.loads(a.policy.read_text()),json.loads(a.capabilities.read_text()),
            broad=not a.narrow,text_requested=a.text_only,misrepresents=a.misrepresents,preset=a.preset,presence_confirmation=a.presence_confirmation,
            explicit_visual=a.explicit_visual,single_row=a.single_row,
            execution_context=json.loads(a.execution_context.read_text()) if a.execution_context else None,
            tool_trace=json.loads(a.tool_trace.read_text()) if a.tool_trace else None)
        if result["delivery"] in {"stop","clarification","unavailable"}:
            print(result["content"].strip())
            return 2
        publish_file(a.output, result.pop("content"), inputs=cli_inputs(a))
        print(json.dumps(result,indent=2));return 0
    except (ValueError,TypeError,KeyError,OSError):
        print('{"input_error":"Delivery rejected; review data, disclosure policy and host capability evidence."}');return 1
if __name__=="__main__":raise SystemExit(main())
