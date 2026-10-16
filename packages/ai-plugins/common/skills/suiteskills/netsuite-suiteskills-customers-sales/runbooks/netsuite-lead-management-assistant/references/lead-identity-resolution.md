# Lead Identity Resolution

Read this reference only when a seller names one lead by email, name, or company name. Do not list
reports or saved searches first. Confirm the `customer` table and required fields through SuiteQL
metadata before first use in a conversation unless already confirmed.

Leads use the `customer` entity surface and can be companies or individuals. Resolve only a small
candidate set and confirm the selected record before interpreting lifecycle or qualification. A
numeric or coded entity value can be an auto-generated Customer ID/entity identifier, not the
internal `id`; validate it through the applicable identifier field and any supplied name before
using a returned internal ID for the focused read.

When the seller supplies an email, prefer this exact capped resolver:

```sql
SELECT id, entityid, altname, firstname, lastname, email
FROM customer
WHERE UPPER(email) = UPPER('[ESCAPED_EMAIL]')
  AND ROWNUM <= 5
```

When the seller supplies a name or company name without an email, use this capped resolver:

```sql
SELECT id, entityid, altname, firstname, lastname, phone, email
FROM customer
WHERE (
  UPPER(altname) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(entityid) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(lastname) LIKE '%[ESCAPED_NAME]%'
  OR UPPER(firstname) LIKE '%[ESCAPED_NAME]%'
)
  AND ROWNUM <= 10
```

Use only escaped seller-supplied values. A capped response is a candidate set, not proof that no other matches exist. If results hit the cap or continuation/completeness is unclear, refine the supplied identifier or use supported continuation within the same scope before selecting. If exactly one plausible candidate is sufficiently established, use its
internal `id` for the smallest lead record read. If multiple candidates are plausible, show only
enough distinguishing facts for the seller to choose. If none is returned, state that no matching
accessible entity was returned; do not broaden the search, infer that the lead does not exist, or
treat the missing result as a qualification outcome.

When metadata confirms it is available, use `altname` as the display name for company and
individual lead records. Do not present `companyname` as a person's name: it can identify that
person's employer instead.

Before interpreting a selected entity as a lead, retrieve its accessible lifecycle or status value
and treat its meaning as account-defined. If it identifies the record as a prospect or customer,
state the lifecycle mismatch and route the seller to NetSuite Sales Assistant's Account
conversation mode. If lifecycle cannot be verified, state that limitation; do not infer it from
the `customer` entity record type.
