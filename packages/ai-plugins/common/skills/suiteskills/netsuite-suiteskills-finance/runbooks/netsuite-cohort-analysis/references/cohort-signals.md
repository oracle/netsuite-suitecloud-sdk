# Cohort signal methods

Use package-local [SaaS metric definitions](saas-metrics.md) and [cohort acquisition guidance](subscription-metrics.md) with governed filters available to the connected role. Every cohort is a customer-acquisition month. For durability, compare cohorts at the same lifetime month, not a new cohort's month two with an older cohort's month twelve. A renewal window filters verified members/terms and is not a cohort. State whether a measured unit is customer, parent customer, contract, subscription, or product; check population completeness before ranking.

When drilling into impacts, resolve the account's category and reporting-level labels and reconcile one level to the governed surface. The same event may appear at Customer and Contract levels with different classifications; never sum both. Reconcile the whole-population and fixed-base bridges separately, with New and No Impact distinct. For every signal, retain period, denominator, dollars, customer count, source, and limitation. “Not observed” requires a complete accessible population; if source, permission, history, join, or acquisition-date integrity is inadequate, say **couldn't check**. A high downsell share is not proof that a few customers drive loss. Do not rank a cohort whose material members have actual recurring activity before their stated acquisition month unless that conflict has been resolved or a verified-subset calculation replaces the full-cohort figures.

## Nine portfolio signals

### 1. Broad GRR decline

- **Method:** Compare monthly beginning-base-weighted GRR, median cohort GRR, gross churn-plus-downsell, and count of declining matched cohorts on one Current/Committed basis; check customer breadth.
- **Needs:** Stable starting membership, beginning recurring amount, two comparable periods, and customer-level loss for a breadth claim.
- **Decision:** CFO sponsors a segment retention response; Product, Customer Success, and account owners investigate repeated loss reasons.

### 2. Healthy NRR masking weak GRR

- **Method:** Read both rates on the same starting base and period; separate expansion from churn/downsell and rank customer contributors if accessible.
- **Needs:** Governed rates or reconciled components, consistent currency/view, and customer movement for concentration.
- **Decision:** Protect the eroding base and examine dependence on a few expanding customers.

### 3. Losses clustered in a renewal window

- **Method:** Within acquisition months, select validated active terms ending in the requested window; compare exposure, gross movement, and successor status with an equal window or declared seasonal baseline. Missing successor does not prove nonrenewal.
- **Needs:** Verified acquisition months, complete active term population, end dates, current recurring amounts, renewal links, and comparable movement.
- **Source check:** Use the package-local [renewal population guide](renewal-population.md) across accessible subscription, order-based, and imported mechanisms. Positive metric balance plus end date is only a candidate; confirm current active status and end date. Unmatched or inaccessible mechanisms are gaps, not zero exposure.
- **Decision:** Sponsor renewal readiness; Billing clears process blockers and account owners decide commercial steps.

### 4. Weakening after a price or package change

- **Method:** Compare loss before and after a documented change with a matched unchanged group; report association and dollars, not causal effect.
- **Needs:** Price/package history, effective dates, adequate customers, and comparable product, term, segment, currency.
- **Decision:** Pricing and Product propose a controlled test for CFO approval, not a blanket discount.

### 5. Overdue AR paired with contraction

- **Method:** Join authorized as-of past-due AR to the same customers' renewal dates and governed contraction; show AR and ARR separately.
- **Needs:** Historical/as-of AR, billing-account mapping, active renewal population, and balance permissions.
- **Decision:** Finance/AR reviews approved collections or terms; Billing resolves invoice disputes.

### 6. A few customers drive most loss

- **Method:** Rank customer or parent-customer churn/downsell within each acquisition month and calculate top contributors' share of full gross loss.
- **Needs:** Complete member list, consistent parent mapping, beginning amounts, customer-level movement.
- **Decision:** Assign executive account coverage instead of changing portfolio policy for a one-account pattern.

### 7. NRR falls while GRR stays steady

- **Method:** Compare both rates on the same base across comparable periods, then verify whether expansion dollars declined.
- **Needs:** Two periods, stable definition, reliable expansion classification; rates alone do not identify cause.
- **Decision:** Product and Pricing test adoption or expansion paths for the affected segment.

### 8. Usage weakens or unpaid usage grows

- **Method:** Compare usage in the same unit and equal periods; separately compare rated charges, overdue AR, and recurring movement for the same customers.
- **Needs:** Complete meter feeds, unchanged units/rating or bridge, charge records, AR access for cash-risk claims.
- **Decision:** Separate Customer Success adoption support from AR credit control; consider commit tiers/alerts only with evidence.

### 9. Logos stay while recurring revenue shrinks

- **Method:** Compare fixed-base logo retention and GRR for the same cohort/period; separate downsell from complete logo churn and rank downsell dollars.
- **Needs:** Verified starting/ending customer identity, positive beginning ARR, complete movement, consistent parent rule.
- **Decision:** CFO sponsors Product, Pricing, and Customer Success review of the affected plan/segment and targeted tests.

## CFO decisions and delegated follow-through

For each verified exception, state the CFO sponsorship or decision, observed recurring-revenue amount, open exposure only when requested, measurable success signal, and executing owner. Billing/AR may resolve process friction under existing policy; Pricing, Product, Customer Success, and account owners own commercial/customer-facing work. Do not turn the brief into a Billing Specialist queue or claim an action was completed.
