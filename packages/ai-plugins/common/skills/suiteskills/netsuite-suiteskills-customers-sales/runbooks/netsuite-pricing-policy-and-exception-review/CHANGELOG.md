# Pricing Policy and Exception Review changelog

## Included in SuiteSkills 1.0.0

Component version: 1.0.0. Source version: unknown.

Before comparing a line rate with pricing, verify currency, price level, unit and quantity-break semantics. Establish whether pricing.quantity identifies a tier or a minimum quantity from actual metadata/source behavior; do not infer it from the name. Resolve the applicable tier using the transaction quantity and verified boundaries. A matching base-price row supports a policy conclusion only when it is the applicable currency/level/tier. Otherwise show the observed rate and the precise unverified policy input.
