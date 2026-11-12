# Enums

Use these exact values to interpret SuiteQL record fields. Keep Actual Time separate from the other time types.

## Time type

Interpret `timebill.timeType` through this record contract:

```sql
SELECT name, type FROM TimelineType
```

| Name | Type |
| --- | --- |
| Actual Time | A |
| Planned Time | P |
| Allocated Time | B |
| Available Time | V |

## Approval status

Use Advanced Approvals on Time Records to interpret the native entry value in `approval_status`:

- When disabled, read `timebill.supervisorApproval`. Interpret `false` or `'F'` as unapproved and display `Pending`.
  Interpret `true` or `'T'` as `Approved`.
- When enabled, read `timebill.approvalStatus` and use the numeric enum below.

Use the checkbox values for `supervisorApproval`, not the numeric enum. For unexpected returned values, follow
[Incomplete retrieval and qualification](recovery.md#incomplete-retrieval-and-qualification).

Interpret a real `timesheet` record's own computed `approvalStatus` through the numeric enum regardless of the entry
field selected above. Keep it separate from `supervisorApproval` and the entry's approval value.

Use this record contract for the numeric enum:

```sql
SELECT name, key FROM timeLineApprovalStatus
```

| Name | Key |
| --- | --- |
| Open | 1 |
| Pending | 2 |
| Approved | 3 |
| Rejected | 4 |
