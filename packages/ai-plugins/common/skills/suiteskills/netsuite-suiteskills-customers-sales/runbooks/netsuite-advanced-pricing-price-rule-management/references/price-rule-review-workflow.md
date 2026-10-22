# Price Rule review workflow

Read this reference only for a proposed new or revised Advanced Pricing Price Rule.

1. Resolve a selected existing Rule narrowly and read it directly. For a new Rule, perform a bounded duplicate-name check when a suitable read source is available. A possible match requires human review; it is not proof of a duplicate.
2. Verify the current Price Level and any named customer, customer group, item, or item collection through focused read sources. Record the current associations, date scope, and active state. Confirm account-specific field meaning and selected item eligibility before describing expected applicability.
3. For a requested change to a linked Price Level, identify other accessible Price Rules that reference it. If completeness cannot be established, say shared impact is unknown. Do not infer item-price changes from a proposed method or percentage.
4. Assemble a chat proposal with the Rule's proposed fields, the selected or proposed prerequisite records, the intended scope, and all unknowns. Label any proposed new Price Level, static group, or collection as a human task. Note when the optional native item-price update choice could affect more items than the selected Rule, and do not choose it on the user's behalf.
5. Return the reviewed proposal in chat without execution instructions. The skill never creates or modifies a Rule, Price Level, group, collection, Item, or item-price record, regardless of confirmation.

If a record, relationship, field, or permission is unavailable, give the narrower verified result and the exact fact the human reviewer still needs. Do not substitute a different record type or guess a SuiteQL join.
