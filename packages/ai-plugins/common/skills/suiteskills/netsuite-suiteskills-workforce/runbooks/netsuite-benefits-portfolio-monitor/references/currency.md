# Currency for monetary answers

The submitted procedure uses a single company-base-currency model. Before monetary aggregation, verify that the assignment amount fields actually use that basis in the selected account from applicable field configuration or owner-confirmed documentation. A root subsidiary currency alone does not establish the units of custom amount fields. If their basis is unverified or mixed, stop affected monetary totals and retain supported nonmonetary results. Then check the company currency below.

- Resolve exactly one root subsidiary with a nonblank currency ID, a three letter ISO code, and precision 2. Reuse currency only when checked under the same account.
- If access is denied, roots are not unique, the code is unresolved, or precision differs, block the affected monetary answer and report the reason.
- Use the root currency. Do not infer it from child subsidiaries, payroll items, or location. Do not imply conversion.
- Skip this read for nonmonetary Benefit, missing field, and coverage questions.

### currency_root

Use this query for the root currency check above.

<!-- BEGIN SQL currency_root -->
```sql
SELECT s.id AS root_subsidiary_id, s.currency AS currency_id,
       c.symbol AS currency_code, c.currencyprecision AS precision
FROM subsidiary s JOIN currency c ON c.id = s.currency
WHERE s.parent IS NULL ORDER BY s.id
```
<!-- END SQL currency_root -->
