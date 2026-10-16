# Price Resolution Workflow

Use this reference for existing transaction lines, prospective sales pricing, customer-item pricing, item-price questions, and pricing discrepancies.

## Contents

- [Define the target value](#define-the-target-value)
- [Resolve the evaluation context](#resolve-the-evaluation-context)
- [Existing transaction workflow](#existing-transaction-workflow)
- [Prospective transaction workflow](#prospective-transaction-workflow)
- [Configuration hierarchy](#configuration-hierarchy)
- [Currency, quantity, and units](#currency-quantity-and-units)
- [Item-only inquiries](#item-only-inquiries)
- [Discrepancy workflow](#discrepancy-workflow)

## Define the target value

Do not assume that "price" means one number. Distinguish:

| Target | Meaning | Strongest evidence |
| --- | --- | --- |
| Price Level | The level selected or sourced for the line | Transaction line or native price evaluation; otherwise resolved configuration |
| Unit Rate | The amount per returned sales unit before separate line/order discounts and tax unless the field says otherwise | Transaction line or native price evaluation |
| Extended line amount | Quantity multiplied or calculated under the transaction's pricing and rounding behavior | Saved/evaluated transaction line |
| Tax-inclusive rate or amount | A value explicitly returned as tax-inclusive | A field with verified tax-inclusive semantics |
| Final amount payable | Transaction total after discounts, promotions, tax, shipping, and other charges | Saved/evaluated transaction totals, outside pure item-price resolution |

If the user asks why a transaction total differs, explain the item-rate portion and identify separate adjustments. Do not calculate unreturned tax, discounts, promotions, exchange, or rounding.

## Resolve the evaluation context

For a prospective price, establish the minimum context below. A missing value can produce multiple valid answers.

| Context | Why it matters |
| --- | --- |
| Customer or parent Customer | Selects customer-specific rules and traditional customer pricing |
| Item | Selects rule and item-price scope |
| Transaction type or channel | Price Rules may not apply uniformly to every sales surface |
| Pricing date | Qualifies Price Rule start and end dates |
| Transaction currency | Determines which Price Level amounts are viable |
| Subsidiary and its base currency, when applicable | Supports eligibility and documented base-currency fallback |
| Quantity and pricing aggregate | Selects quantity behavior; the driver may be line, overall item, parent, or schedule quantity |
| Sales unit | Prevents comparison of incompatible unit prices |
| Tax-inclusive context | Prevents mixing tax-inclusive and tax-exclusive values |
| Existing manual/custom selection | Can supersede automatic sourcing on a transaction |

Use the current date only when the user asks for a current price and supplies no date. State the date used. Do not use today's configuration to explain a historical transaction.

When no transaction currency is supplied for a customer-item inquiry, do not silently substitute the Customer's primary currency. Either ask for the intended transaction currency or return separate currency-specific possibilities.

## Existing transaction workflow

1. Resolve the transaction type and internal ID from the supplied record or document number.
2. Read the transaction header fields needed for pricing context: entity, date, currency, subsidiary when applicable, exchange-rate context only when needed, and any verified channel or form field that changes pricing.
3. Retrieve the relevant item line or the complete item sublist when a field-scoped read cannot return lines. Preserve line identity, Item, quantity, unit, Price Level, Rate, amount, tax-inclusive indicators, and any exposed pricing details or applied-rule reference.
4. Determine whether the line contains explicit evidence of automatic sourcing, a Price Rule, customer pricing, base pricing, or a manual/custom override. A `Custom` Price Level can support a manual/custom classification, but do not infer who entered it or why without history evidence.
5. If the Rate is returned but provenance is not, report an **recorded assigned price with source unresolved**. Explain current configuration only as a comparison, not as historical causation.
6. If Pricing Details or an applied-rule reference is exposed and its semantics are live-validated, retrieve the referenced rule or pricing source narrowly and explain the match.
7. When multiple lines use the same Item, identify the exact line by line key or returned line number. Do not merge quantities or rates unless the question explicitly requires an overall-quantity pricing analysis and the record supplies the required aggregate.

For a saved transaction, the returned Rate is authoritative for what is stored on that line. It does not prove the amount was engine-generated, and it does not prove that saving, editing, or repricing the transaction today would produce the same result.

## Prospective transaction workflow

### Native evaluation available

Use a non-persisting pricing operation only when its documentation and live tests establish all of the following:

- it invokes the NetSuite pricing engine rather than merely reading Item Price rows;
- it accepts or derives every material context field for the request;
- it does not create, save, submit, or update a record;
- it returns the evaluated currency, unit, quantity context, Rate, Price Level, and provenance or an explicit statement that provenance is unavailable; and
- its output matches controlled transaction tests for Advanced Pricing, traditional customer pricing, quantity pricing, currency fallback, and no-price cases.

Label a qualifying result **engine-evaluated preview**. If the tool omits provenance, explain the returned price but do not invent the rule or path.

### No native evaluation available

Reconstruct the current configuration using the hierarchy below. Return one **configuration-resolved expected price** only when every relevant branch is complete and all dimensions are compatible. Otherwise return **candidate values** or **unresolved**.

Do not create an Estimate, Sales Order, or other record as a pricing probe. If the user later creates a transaction in the authorized NetSuite UI, verify the sourced line only when asked and through a read-only path.

## Configuration hierarchy

Use this order for automatic sales pricing when Advanced Pricing is available in the connected account:

1. Customer-specific Price Rules.
2. Traditional customer pricing:
   1. Customer Item Pricing for the exact Customer and Item.
   2. Customer Group Pricing whose Pricing Group matches the Item.
   3. Customer header Price Level.
3. Price Rules that apply to all customers.
4. General Item Pricing, normally the compatible Base Price or documented online fallback for a supported online context.

Without Advanced Pricing, omit rule tiers 1 and 3. Without Multiple Prices, do not invent named-level customer paths.

This order is a source hierarchy, not permission to skip viability checks or fabricate a fall-through. If a selected path returns a Price Level but the amount or engine fallback behavior cannot be verified, stop at **amount or fallback unresolved** rather than silently trying the next path.

### Price Rule qualification

For each bounded rule candidate, retrieve and evaluate separately:

- active/inactive state;
- start and end dates against the pricing date;
- audience: all customers, direct Customer, or materialized customer-group membership;
- item scope: all eligible items, explicit Item entry, or materialized Item Collection membership;
- selected Price Level and its active state when exposed;
- a compatible Item Price for the Item and selected level in transaction currency or the documented subsidiary base-currency fallback;
- any returned rule preference or priority only when its meaning and ordering are documented and live-validated for this account/release; and
- the account's highest/lowest tie-breaker preference when more than one otherwise qualifying rule remains.

If any required audience or item-scope result is capped, partially paged, inaccessible, or dynamic membership is unavailable, do not reject or select the rule. A dynamic customer group or Item Collection uses stored materialized membership for price evaluation; running the defining saved search as the current role is not an equivalent substitute.

When several rules remain and the rule-preference semantics or highest/lowest account preference cannot be retrieved reliably, list the rules and their compatible amounts under **winning rule unresolved**.

### Traditional customer pricing

- **Customer Item Pricing, Custom**: use the stored amount returned for the exact Item and compatible currency. Keep tax-inclusive and tax-exclusive amounts distinct. Do not apply Item Price quantity tiers to a Custom amount unless an engine-resolved source proves that behavior.
- **Customer Item Pricing, named Price Level**: resolve the assigned level to compatible Item Price rows.
- **Customer Group Pricing**: first prove that the Item's Pricing Group matches the Customer's group-pricing assignment, then resolve its Price Level to compatible Item Price rows.
- **Customer header Price Level**: resolve the returned default level to compatible Item Price rows. It is a fallback path, not proof that every item uses it.

Do not confuse a CRM customer group used by Price Rules with a Pricing Group used by traditional Customer Group Pricing.

### General Item Pricing

Retrieve the Item's compatible price matrix cells or Basic Sales Price according to the account's exposed feature surface. Preserve Item, Price Level, currency, sales unit, and exact quantity threshold when returned. An Item Price row does not have a subsidiary pricing dimension; subsidiary context can still affect currency fallback and item/customer eligibility.

## Currency, quantity, and units

### Currency

- Compare or rank amounts only within one currency context.
- For rule, named-level, and general Item Pricing, first look for the transaction-currency amount. Use a subsidiary base-currency row only when the applicable NetSuite behavior and subsidiary are verified.
- A base-currency row can support price-level viability, but do not convert it or present it as the transaction-currency Rate unless NetSuite returns the conversion result.
- A Custom Customer Item Pricing amount remains tied to its returned currency.
- If no usable transaction or base-currency amount exists, return no resolved amount for that path; do not substitute another currency.

### Quantity and units

Retrieve the Item's quantity-pricing type, marginal-rate setting, sales unit, and exact price-matrix quantity thresholds when quantity can change the answer.

- **By line quantity**: use the line quantity.
- **By overall item quantity**: use the total transaction quantity for that Item.
- **By overall parent quantity**: use the total for the verified parent context.
- **By overall schedule quantity**: use the total for items that share the verified schedule.

Do not substitute line quantity for an unavailable aggregate. Do not convert units unless NetSuite returns the conversion used for pricing.

For complete non-marginal price rows, select the row with the greatest exact minimum quantity less than or equal to the applicable quantity. For marginal pricing, do not calculate a blended unit Rate unless an engine-evaluated or saved transaction result supplies it; list the reached tiers and mark the final Rate unresolved.

A tier sequence is an identifier, not a quantity. If the exact minimum quantity is unavailable, retain all compatible rows as quantity-unresolved candidates.

## Item-only inquiries

For a question such as "what are this item's prices?":

1. Resolve the Item.
2. Retrieve Basic Sales Price or price-matrix rows available for that Item.
3. Preserve Price Level, currency, sales unit, minimum quantity, and active state.
4. Group only compatible rows; do not choose a customer price without a Customer and transaction context.
5. If the user asks for the lowest configured price, calculate the minimum separately within each Item, currency, sales-unit, and exact quantity partition. Preserve zero unless the user asks for the lowest positive price.

## Discrepancy workflow

When an observed transaction Rate differs from a configured or expected amount:

1. Treat the stored transaction line as the observed result.
2. Check whether the line shows a manual/custom Price Level or override.
3. Compare the transaction's date, currency, subsidiary, quantity aggregate, unit, customer or parent Customer, and channel with the context used for the expectation.
4. Inspect exposed Pricing Details or applied-rule provenance before reconstructing current configuration.
5. Check current Price Rule date, audience, item scope, Price Level amount, dynamic group/collection materialization, and conflict preference.
6. Clearly separate a historical fact from current configuration. A current mismatch can mean the configuration changed after the transaction.
7. State only evidenced causes. If several remain possible, present them as diagnostic possibilities with the missing evidence needed to distinguish them.

Do not recommend a pricing change. Route a Price Rule applicability proposal, including a required new Price Level or static Customer Group/Item Collection prerequisite, to `netsuite-advanced-pricing-price-rule-management` only when that skill is installed. Otherwise provide the verified pricing evidence and state that Price Rule change proposals are outside this package. Direct Item Price changes and standalone Price Level amount maintenance remain outside both skills.
