# Local calculation checks

The optional helper performs sum, equality, ratio, unique-key and scope checks with exact decimal arithmetic (80-digit working precision; values at most 1e30 and 18 decimal places). It makes no connector calls. It does not calculate business eligibility, choose allocation priorities, invent control totals or obtain an analyst handoff.

All checks require unique id and kind. Sum adds a row field; equal compares a left JSON pointer; ratio divides numerator/denominator pointers. Those three checks also require expected (a pointer under /sources/N/data/...), nonnegative tolerance and a nonempty justification in basis. The named source must be declared independent_control:true. This is a reviewer-assessed assertion, not authenticated independence: copying a calculated total into a source object is not a valid control. Missing operands and zero denominators produce not_run. Full-population sum controls require complete/empty coverage; source coverage itself remains an evidence claim to review.

Unique checks declare fields and inspect distinct composite row keys. Scope checks declare fields and compare source scopes with the result scope. Domain review must judge the selected fields and whether additional checks are necessary. Passing a uniqueness check alone never verifies an entire financial result.

Receipt status is failed if any check fails, incomplete if any check is not_run or no checks exist, otherwise passed. Receipt authority is local_mechanical_only; domain_review remains not_run in the receipt irrespective of any separately supplied review evidence. Changed inputs/checks/results invalidate replay. Hashes are integrity evidence, not signatures or accounting approval.

Python example (synthetic result supplied separately):

```python
from result_evidence import create_receipt, verify_receipt
checks = [{"id":"cash-control", "kind":"sum", "field":"amount", "expected":"/sources/0/data/total", "tolerance":"0", "basis":"Exact independently supplied source total"}]
receipt = create_receipt(result, checks)
errors = verify_receipt(result, receipt)
# Inspect errors AND receipt['status']; then apply existing domain/analyst requirements.
```

Cash checks distinguish restriction categories and posted versus forecast amounts. Credit allocation checks cover both credit and bill conservation without changing existing priority rules. Executive checks retain per-figure lineage and reconcile composed calculations against compatible upstream evidence. A helper cannot establish that these checks were sufficient or that a proposed transaction is executable.
