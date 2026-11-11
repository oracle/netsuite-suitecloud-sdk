# Showcase Prompts - Match vendor credits to bills

1. Match open vendor credits to eligible bills for [vendor/subsidiary], but do not guess any remaining amount field if the connector cannot verify it.
2. Show which vendor credits are compatible with open bills by vendor, subsidiary, currency, and AP account, separating verified amount matches from `REMAINING_AMOUNT_NOT_VERIFIED` rows.
3. Review open credits for [vendor] and return stable record references even if the connector cannot provide canonical record URLs.
4. Prepare a read-only proposed credit-to-bill allocation and explain why any credit or bill is blocked or unverified.
5. If I ask you to apply the selected vendor credit, explain that this skill is read-only and hand off the proposed action instead of starting an update confirmation flow.
