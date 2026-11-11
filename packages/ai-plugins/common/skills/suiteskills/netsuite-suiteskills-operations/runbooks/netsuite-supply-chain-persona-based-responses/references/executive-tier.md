# Executive Tier Output

Use for Founder, CEO, CMO, COO, and Board of directors responses.

## Persona Header

For an explicit supported role, label the tier as a response style: `Response style: [role] / Exec.` For an inferred style, use `Response style: Exec (user role unconfirmed).` Suppress this diagnostic in a normal production answer when it does not help the user. A neutral role-free answer has no persona header.

## Output Order

1. **Headline:** State the decision-relevant conclusion in one sentence.
2. **Business impact:** Cover service, growth, capacity, execution reliability, customer promise, or capital allocation as appropriate.
3. **Evidence:** Give two to four verified KPIs or transaction drivers.
4. **Risk and options:** Present the material risk and practical options.
5. **Recommendation:** State the recommended decision; label any unevidenced owner or timing as proposed.
6. **Why it matters:** Add one or two sentences connecting the recommendation to the preceding evidence, risk, customer impact, capacity, or decision requested.
7. **Watch metric:** Name the measure that confirms improvement.

Keep the headline and `Why it matters` conclusion in short prose. Use concise bullets for evidence, options, recommendations, owners, timing, and watch metrics when more than one point is present. Introduce recommendations with `Here are some suggestions for [subject]:` or a direct goal statement such as `To improve fulfillment reliability:`. Begin every recommendation bullet with an explicit action verb.

For a board packet, explain why the requested content supports oversight or a decision. For example: `Why this matters: Showing the trend, mitigation milestones, accountable owners, and requested capacity decision lets the board assess whether management is reducing service risk and whether investment is warranted.`

Avoid transaction click paths unless the executive asks for them.

## Role Distinction

### Founder

Focus on capital-efficient growth, runway-sensitive operating choices, scaling constraints, and customer promise. Keep detailed cash, valuation, or financial-statement analysis outside this helper.

### CEO

Focus on strategic health, growth constraints, customer/service impact, cross-functional risk, and major decisions.

### CMO

Focus on campaign readiness, availability, demand signals, backorder exposure, launch timing, and customer experience.

### COO

Focus on throughput, bottlenecks, fulfillment reliability, operating leverage, capacity, and execution ownership.

### Board of directors

Focus on trend, variance to plan, governance risk, mitigation status, accountable owner, capital-allocation context, and the decision requested from the board.

## Access Boundary

Apply the permission-limited evidence rule in `netsuite-data-and-access.md`. Name the denied evidence and report usable authorized findings first. Suggest administrator help only if the denied evidence blocks the requested conclusion. Never fill gaps with assumptions or bypass permissions.
