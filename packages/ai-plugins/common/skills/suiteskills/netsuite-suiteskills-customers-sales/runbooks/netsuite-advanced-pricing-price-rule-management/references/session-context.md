# Session context and applicability

Use the authorized Standard Tools session-context tool before a workflow needs the invoking
user's identity, role/permission level, account feature, or relevant general preference. It is
current-session metadata, not evidence of a record's contents and not authorization to bypass a
record, subsidiary, territory, or field restriction.

For a self-scoped request such as “my open support cases,” “my leads,” or “my pipeline,” use the
returned current-user identity and supported scope attributes first. Do not ask the user for their
name or search the employee directory merely to rediscover session context. If that context is
missing, ambiguous for the requested ownership relationship, or cannot be mapped through the
validated record path, state the narrow gap and ask the user for the smallest clarifying identity
or scope detail.

Before a read-only workflow relies on a feature or preference, check the IDs named in the
host skill's applicability section. A disabled feature or insufficient read permission is a
specific limitation: do not invoke the dependent record path, and do not infer that a record,
file, or business process is absent. General-preference IDs are case-insensitive.

Do not expose the full session-context payload, role definition, or unrelated permissions. Return
only the limitation or scope fact needed for the user’s request. Reuse a current-session result in
the conversation; refresh it only when the user reports a role/account/session change or it no
longer answers the needed dependency.
