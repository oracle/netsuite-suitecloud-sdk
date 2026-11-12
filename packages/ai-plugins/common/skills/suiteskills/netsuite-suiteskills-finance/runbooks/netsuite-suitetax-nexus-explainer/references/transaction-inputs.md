# Transaction input contract

Use this contract for a transaction-specific nexus explanation. The skill can explain general rules without these fields, but it cannot claim a transaction result without enough evidence.

## Minimum common inputs

- transaction type and direction: sale or purchase;
- subsidiary;
- transaction date (used for nexus registration validity); Tax Point Date and its override are separate rate-calculation inputs;
- the resolved jurisdictions the decision rests on: Ship From and Ship To for a sale, Ship To alone for a purchase;
- the source record/field used for each resolved address;
- active subsidiary tax registrations, including jurisdiction and validity dates;
- automatic nexus result, error, and any explicit Nexus Override.

For USA and Canada, include state/province where the rule or registration is subnational. Country alone may be insufficient.

## Additional sales inputs

- whether Multiple Shipping Routes is enabled and whether a line-level Ship To applies;
- line and header Location addresses;
- Transaction Shipping and Billing Addresses;
- Customer Default Billing Address;
- Subsidiary Shipping and Main Addresses;
- Customer Tax Registration Number selected on the transaction, including blank versus populated;

## Additional purchase inputs

- whether this is a drop-ship scenario, and whether the Shipping Address was set through a proper Ship To entity plus selected address, versus a bare unlinked country value;
- line and header Location addresses;
- Subsidiary Shipping and Main Addresses.

Purchase nexus works from Ship To alone. There is no purchase Ship From, and the Vendor or Transaction Billing Address plays no part in it, so do not ask for either.

Transaction Shipping Address is only relevant for purchase record types and drop-ship flows that actually expose it. In the tested NetSuite connector, Vendor Bill did not expose this field at all, while Purchase Order exposed it for a properly configured Ship To entity/address flow. Treat this as an observation from that specific connector, not a universal claim about every NetSuite UI or configuration — confirm the record type and field availability before asking for a Transaction Shipping Address that may not exist on the record in front of you.

## Handling missing data

Do not ask for every possible field. Identify the earliest missing fact in the decision tree that can change the answer.

- **Missing Country on the first source:** treat that address as unusable and inspect the next source.
- **Unknown source of the displayed address:** nexus may be visible, but the explanation of why that jurisdiction was selected is incomplete.
- **Unknown selected Customer Tax Registration Number:** a sales B2B/B2C conclusion is not supportable.
- **Unknown transaction date or registration validity:** a candidate can be identified, but registration validation and final nexus are unresolved.
- **Only a list of registrations, without subsidiary or validity:** do not assume they apply.
- **Multiple active fallback registrations:** do not choose one without another product rule or explicit transaction result.
- **Only the final nexus is provided:** explain what evidence would be needed to validate the path; do not reverse-engineer one definite path.
- **Connected account access is unavailable:** clearly switch to a hypothetical/general explanation or request a screenshot/export of the decisive fields.

## Read-only account use

When account tools are available, retrieve only the transaction, address, subsidiary registration, and date fields needed for the explanation. Do not save records, change roles, create integrations, install SuiteApps, enable features, or alter tax setup as part of this skill.

The MCP connection grants access to account data; it does not itself provide the SuiteTax decision logic. Role permissions and record visibility still limit what can be concluded.
