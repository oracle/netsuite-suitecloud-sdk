# FSM data dictionary

Look up FSM records and fields by `script_id` in [data-dictionary.json](data-dictionary.json). The dictionary contains client package definitions. An entry does not prove that the object is installed in the current account.

The dictionary is not a source for internal administration or synchronization-monitor diagnostics. An absent entry does not prove that an object is absent from the account. Apply the [diagnostic scope](../RUNBOOK.md#scope-and-unavailable-diagnostics) boundary; do not guess an identifier or treat a similarly labeled client field as a diagnostic replacement.

## Targeted lookup

Resolve the file relative to the skill directory and retrieve only the entries needed. A full-file `view` or dump of `data-dictionary.json` produces truncated JSON in model context; do not use either. Run a targeted lookup from the skill directory, for example:

```python
import json
from pathlib import Path

path = Path("references/data-dictionary.json")
data = json.loads(path.read_text())
entry = next(e for e in data["entries"] if e["script_id"] == "custevent_nx_task_asset")
print(json.dumps(entry, indent=2, ensure_ascii=False))
```

### Find an identifier from a label or record family

Labels can identify several objects. When the script ID is unknown, search the label, family or containing record and print a bounded list of candidates with their type and scope. For example, from the skill directory:

```python
import json
from pathlib import Path

data = json.loads(Path("references/data-dictionary.json").read_text())
query = "asset"
matches = [
    e for e in data["entries"]
    if query.casefold() in " ".join(
        e[key] or "" for key in ("label", "family", "root_record")
    ).casefold()
]
print(f"{len(matches)} matches; showing the first 10")
for e in matches[:10]:
    print(json.dumps({key: e[key] for key in (
        "script_id", "label", "type", "root_record", "applicability", "source_scope"
    )}, ensure_ascii=False))
```

Use the containing record, standard-record applicability and source scope to select the intended object. Narrow a broad query, then retrieve the chosen entry by exact `script_id`. A matching label alone does not identify a report binding or a supported account field.

## Reading field definitions

- `source_scope` is `client` for client package definitions. Definitions do not establish installation, current schema or write support.
- `description` gives the purpose when one was supplied. An empty value means no description was supplied. `notes` adds operational qualifications. Do not infer a missing purpose from a label. Configuration can change workflow behavior.
- `type` gives the field datatype or `customrecordtype`. `root_record` identifies the containing custom record. Fields on standard records use `applicability`. Resolve raw numeric `rectype` values on other custom fields in the account. Printing and presentation flags do not identify record types.
- `select_target` identifies a list or record relationship. Negative numbers identify native metadata, not customer records. Custom targets use symbolic `[scriptid=...]` references.
- `source` and `filter` describe field sourcing and filtering. Historical records may lack values even when a field is sourced.
- `cardinality` gives the maximum number of values and the mandatory flag. SELECT allows one value; MULTISELECT allows several. Cardinality does not establish reciprocal uniqueness or every workflow requirement.
- Interpret `storevalue`, `displaytype`, `mandatory`, and `formula` separately. A STATICTEXT display can still store a value. `custevent_nx_unbilled_total` is a nonstored formula.
- `T` and `F` mean true and false. Null means unspecified or inapplicable. An empty string means the property is explicitly empty. Preserve these distinctions.

Do not assume that a record API property is a SuiteQL column. A dictionary entry does not establish installation or prove that a generic operation is equivalent to a specialized FSM action.

For task completion, see [work management](work-management.md); for billing, see [billing](billing.md). For assignment, time zones, and calendars, see [scheduling](scheduling.md); for recurrence, see [recurrence and programs](recurrence-and-programs.md).
