# Personal Assignment Lookup

Use this reference only after a user supplies their NetSuite employee name for a personal case
queue and no dedicated personal saved search is already known to answer that request.

Do not assume an Employee or Entity table is queryable solely to resolve the name. When metadata
confirms the assignment display path, use a narrow `supportcase` lookup as the first identity
lookup. Do not search or display Employee/Entity roster candidates. A zero-row exact match means
only that no exact assignment display was returned. Before requesting an employee ID, make one
bounded, metadata-confirmed normalized or partial-match lookup on the same assignment path. A
zero result after that fallback does not establish that the employee has no cases or does not
exist.

The first lookup must not add status, stage, priority, or other queue filters. Use the
metadata-confirmed version of this narrow shape, selecting only fields needed for the requested
queue:

```sql
SELECT id,
       caseNumber,
       title,
       BUILTIN.DF(status) AS status,
       BUILTIN.DF(priority) AS priority,
       BUILTIN.DF(assigned) AS assignedTo
FROM supportcase
WHERE BUILTIN.DF(assigned) = :employee_name
```

Evaluate returned lifecycle/status values to identify the requested open subset. This keeps name
resolution separate from lifecycle interpretation and avoids filtering away the user's cases
before the assignment match is established.
