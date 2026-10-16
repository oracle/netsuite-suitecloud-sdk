# NetSuite Knowledge Base behavior

Use this reference only when assessing the **NetSuite Knowledge Base** feature, reviewing NetSuite
Solution metadata, or proposing a reviewer-ready NetSuite Solution draft. It does not apply to a
local, external, or other-vendor knowledge base. It describes the NetSuite feature model; always
confirm that the feature, fields, configuration, and invoking user's access are available in the
connected account before presenting account-specific conclusions.

This skill does not set up a knowledge base, create or edit topics or solutions, reorder content,
publish content, or attach a solution to a case. Use these facts to assess evidence and draft
content, not to imply authority for those actions.

## Contents

- [Feature model and availability](#feature-model-and-availability)
- [Solution lifecycle and visibility](#solution-lifecycle-and-visibility)
- [Coverage and duplicate review](#coverage-and-duplicate-review)
- [Efficient, bounded coverage retrieval](#efficient-bounded-coverage-retrieval)
- [Reviewer-ready solution draft](#reviewer-ready-solution-draft)
- [Official reference](#official-reference)

## Feature model and availability

- Knowledge Base requires CRM and the Knowledge Base feature to be enabled. Lack of an accessible
  record or endpoint is an access limitation, not proof that the feature is disabled.
- A knowledge base organizes solutions under topics and subtopics. A solution can belong to more
  than one topic or subtopic; the same subject may therefore be intentionally represented in more
  than one navigational context.
- A parent-topic publication includes its published descendants and their attached solutions.
  Inactivating a topic removes it and its subtopics from that publication context, although a
  solution can remain published through another active topic. Do not call a solution unavailable
  merely because one topic is inactive.
- Knowledge bases can be internal, website-based, or targeted to particular audiences. Do not
  infer a customer's, employee's, partner's, vendor's, group's, department's, or role's access
  from a solution record alone.
- Content creation, approval, and publication are separate responsibilities. Do not assume that
  the author, solution assignee, or requesting user can approve or publish a draft; route those
  decisions using the organization's ownership and permission model.

## Solution lifecycle and visibility

Treat a solution as a draft until its record evidence supports the relevant claim. For a solution
to be published, verify the applicable conditions rather than relying on its title or content:

- the solution is active;
- its status is Approved;
- Display Online is enabled;
- it is attached to an active, published topic; and
- the publication destination has an audience.

The account can also be configured to allow only approved, Display Online solutions to be linked
to cases. Do not claim a support representative can attach a specific solution without checking
the applicable solution state and account preference.

New or changed solutions are indexed overnight, so search results may not immediately reflect a
record update. Website or intranet publication changes can also take time to appear. Describe a
specific article as searchable or visible only from verified record and current publication
evidence.

## Coverage and duplicate review

- Search accessible solutions first, using the subject and, where available, solution code or
  title. Review the abstract and description before judging relevance; a matching title alone is
  insufficient.
- Compare problem scope, supported product/process, prerequisites, steps, limitations, topic
  placement, and audience. Similar articles can be complementary—for different audiences,
  products, or stages of a procedure—rather than duplicates.
- Check related-solution links when accessible. A related link signals intended navigation, not
  approval, currentness, or factual correctness.
- Separate a content gap from a findability problem. Topic hierarchy, the order of solutions,
  publication destination, center-tab presentation, and layout can affect how readers locate an
  otherwise suitable article. Flag these as navigation or presentation review items; do not claim
  they have been configured correctly without record evidence.
- State whether the evidence supports an observed gap only for the accessible population and time
  window. Do not convert a handful of cases, inaccessible solutions, or missing search results
  into an organization-wide coverage conclusion.

## Efficient, bounded coverage retrieval

Use this procedure when a coverage assessment needs an accessible case population after the
solution or knowledge-base check. It is not a substitute for defining the population, time
window, or coverage threshold.

1. Discover all currently needed native tools together once, then reuse tool availability and
   successfully confirmed table metadata from the current conversation. Do not rediscover tools
   or repeat the same metadata request without a new reason. A saved-search directory is not
   evidence of Knowledge Base content; enumerate it only when a known saved search can answer the
   content or defined-population question.
2. Before the first custom SuiteQL query for a table, confirm its metadata. Do not guess field
   names or query a taxonomy table speculatively. If metadata is empty, unavailable, or identifies
   a broken custom field, treat that discovery path as limited. Use an independently supported narrow record read only with established record-interface schema and access, or a query only when applicable current-session SuiteQL evidence already establishes all required fields and relationships. An empty schema never establishes that so-called standard fields are queryable. Stop a denied underlying population; do not probe it through another interface.
   State the limitation. Do not infer that the record type, feature, or data is absent.
3. For case evidence, establish the requested time window and population. If none is supplied,
   say that any all-accessible-history review is a fallback rather than a recurrence baseline.
   After confirming `supportcase` metadata, count the bounded population **before any
   title/subject search**.
4. If the count fits within one conservative explicit row cap, retrieve that population once with
   only the case ID, title/subject, and created date needed for the assessment; filter or classify
   the returned titles locally. Do not retrieve case bodies, notes, messages, attachments, or
   other free text merely to find recurring titles. State that title-only evidence can miss cases
   logged under unrelated subjects.
5. If the population exceeds that cap, use one bounded title query that combines the user's
   wording and relevant variants with `OR`, then clearly label its recall limitation. Query an
   issue/category taxonomy only when confirmed metadata shows a populated, relevant field and the
   result could materially change the coverage assessment.

Report the source, time window, row cap, and whether the result is title-only. A small accessible
population, an empty title search, or a metadata failure supports only the corresponding bounded
finding—not a claim that the organization has no recurring issue or no knowledge content.

## Reviewer-ready solution draft

Structure a proposed draft around the NetSuite solution model without implying that it has been
saved:

```text
Proposed title and abstract
Problem / intended outcome
Prerequisites and supported scope
Verified steps
Limitations, exceptions, and safety notes
Suggested topics, intended audience, and related solutions (for reviewer confirmation)
Facts or policy requiring validation; suggested owner/approver
```

Keep the abstract a concise statement of the problem solved and the description focused on
verified guidance. Include topic and audience suggestions only when evidence supports them;
they are editorial recommendations, not a publication decision. Flag HTML, JavaScript, links,
attachments, security content, or customer-specific material for the appropriate reviewer rather
than assuming it is safe for an audience.

## Official reference

Use these Oracle pages to resolve feature behavior when it materially affects an assessment or
draft; do not treat generic documentation as proof of an account's configuration or permissions.

- [Knowledge Base overview](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2445950.html)
- [Knowledge Base Setup Checklist](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2446166.html)
- [Setting Up a Knowledge Base](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2447719.html)
- [Creating Knowledge Base Topics](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2447915.html)
- [Creating Knowledge Base Solutions](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2448156.html)
- [Publishing a Knowledge Base](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2448614.html)
- [Adding a Knowledge Base as a Center Tab](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4399840186.html)
- [Customizing Knowledge Base Layout](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2448942.html)
- [Arranging Solutions in a Published Knowledge Base](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2449221.html)
- [Attaching Knowledge Base Solutions to Cases](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2449315.html)
