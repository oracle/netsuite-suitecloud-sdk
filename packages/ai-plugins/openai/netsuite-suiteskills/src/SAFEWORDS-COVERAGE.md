# SafeWords coverage — SuiteSkills 0.8.1

Static structure and link verification only. Native model adherence, account behavior and security approval remain not_run. Paths and hashes describe the final unsuffixed packaged files.

## Policy owners

| Path | Lines | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/SKILL.md | 29–45 | `7d97fa59b99f57e101533ca88cc65090c04e762b9d7b2863daec5a16177f2d39` |
| skills/netsuite-suiteskills-finance/SKILL.md | 43–59 | `af5c206ce746e6fba60f7634159c741d22653230b42cfc581bd772d1dd012225` |
| skills/netsuite-suiteskills-onboarding/SKILL.md | 23–39 | `6d3edfe0f9663b024f0d62c57039dffe70899115bf253dcd31518946b500e766` |
| skills/netsuite-suiteskills-operations/SKILL.md | 35–51 | `eeaef0dbaff4cddfe1cf5fd95ab150319236d7465e54cf2d3d224484ad3004cc` |
| skills/netsuite-suiteskills-people/SKILL.md | 26–42 | `395c24ed7e5dbaf5a2902273cd4cc9a6bfb23157536779ca9d7f92e90f24e758` |

## Mandatory application references

48 runbooks and 15 workflows load their owning policy before tool use, including direct loads. Missing policy stops dependent operations.

| Path | Line | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-advanced-pricing-price-rule-management/RUNBOOK.md | 14 | `b930e996bbc19fd00565cc87f4c9e797cd1abc58c489e8dcaecf1957d976e3cb` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-service-order-triage/RUNBOOK.md | 14 | `8a861b7501dfd170abf6042960d0c6fcc5df7a52090a514c09669375a71d9eef` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-support-assistant/RUNBOOK.md | 16 | `754c6fbcdd2c9761b60687139613a82a0b12062edb784d82587877a38ec1d414` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-knowledge-quality-assistant/RUNBOOK.md | 14 | `6dec044c776b168585f76eceda486d1d6dd69d0b7a035de7b16d5d926f81b54e` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-lead-management-assistant/RUNBOOK.md | 14 | `8b458e3b60b138e2b80527ec81dd1d65b12e8cb115aa4e21421a63da6d4eabd7` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-marketing-campaign-assistant/RUNBOOK.md | 14 | `f9b613b221d5b5cf2ab2b8f256b0d081fe3a4be33afe4daa76bf866c206fe447` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-pricing-policy-and-exception-review/RUNBOOK.md | 14 | `7ac3f17d0aca7c93a8e0104db0c03f6107f614fe7f754c7e46579f372040e3e3` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-sales-assistant/RUNBOOK.md | 14 | `de0f0e82df167cac9c8e8f2243f34b8b6dbb6fb0c7299d1bb1f6eac16e06a6a5` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-bank-reconciliation-prioritization/RUNBOOK.md | 14 | `608388e1bff5caa978f4749242c134fc64be84d7132b31079b3c639bd749168a` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cash-and-liquidity/RUNBOOK.md | 14 | `1febe9f3bf5bc8dde3ed8da76abdf087640a47735d231a0482f861f993b614fc` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cohort-analysis/RUNBOOK.md | 14 | `37b2a91e1189f98add8e1a86dda2f9eb0022113efa9f67c7a97418b71a6743a2` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-credit-management/RUNBOOK.md | 14 | `1c56654afd9c43215f23f28b18efafceab62afadf75f3dc9614d0cec63f3e492` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-executive-finance-reporting/RUNBOOK.md | 14 | `99e3bb116d4d6a40ca5f10b9f47109b52c537ef44f1d7825b6c7e434e5dfc23b` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-expense-close-assistant/RUNBOOK.md | 14 | `f5de32aed0e828edb3043e2389400d99698d0b692d1514f053677633fe3a62aa` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-finance-controls-review/RUNBOOK.md | 14 | `5466dbac11a50481a7686c8dbe34b9eb53729019fad04a492475aec1699f096b` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-financial-statement-review/RUNBOOK.md | 14 | `1a8dbddb2afa24af1efa2987d0d32be020a05bb6c9989dcce7835e45a4d45550` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-intercompany-balance-explorer/RUNBOOK.md | 14 | `95b5dbfdbef2d3eee0fef8487de03ccb3b47c771ac37775139a557f9b0d26e1c` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-invoice-collections/RUNBOOK.md | 14 | `d60cbad7a8c468d8934a8e6e46397d0038bfaab64e6e5c2fd25cb6a58aeecf22` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-journal-entry-review/RUNBOOK.md | 14 | `2eb4681609ae0a7906fc2e8c91343cd7eb32f56463630414e3d13f885bb789c8` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-labor-cost-advisor/RUNBOOK.md | 14 | `f446c7ffc08741d20a56c272149d4b96db902e6b814ee98bac03e81588206da3` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-match-vendor-credits-to-bills/RUNBOOK.md | 14 | `e496a016f12d330a77a943da60019c97676a4539de23fbd97c8f16f5889b35c7` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-overdue-invoice-change-review/RUNBOOK.md | 14 | `185c5a9391f4bd89bcb3d56671caf9fb67d446b42c2391a1a709bc4eb5175d43` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-payment-prioritization/RUNBOOK.md | 14 | `1ea16dfae98d7e36f6e8db0ed52116a2e424052f414226216fd18a11a561d747` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-period-close-status/RUNBOOK.md | 14 | `869a8c6d282c2e16ed91f0051528741c926a2d380c1b8dc88ae1b8f5e2d38953` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-project-financial-assistant/RUNBOOK.md | 14 | `7b3cd78afb9b06fa5629e44979434d6c8e5780fdfb08bdeb8ddca831698b01f2` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-revenue-leakage/RUNBOOK.md | 14 | `6e9d83d2ab27f5bbda6867f04e81fdcc86a635aa96929dca1a6f3e6217268d8c` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-suitetax-nexus-explainer/RUNBOOK.md | 14 | `c0c37d5dddf4152c5226ed099ab6e3d701fd310e2b0d318405d4b4778647e871` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-variance-analysis/RUNBOOK.md | 14 | `da73e8940fcacd8aa508c8c7c0a9c12c7f2df3392928c3d57f02b63f26d6e3e4` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-bill-processing-time/RUNBOOK.md | 14 | `cff80cfc4c5275e63eb0862e5f09fb2109705b99c45e35fa10f94328064362d7` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-spend-analysis/RUNBOOK.md | 14 | `0c2f0980986d3d9467b524cf9b0735250a311a417aeb1177b74336c809413b66` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization/RUNBOOK.md | 13 | `5966ce1880ff8bfbf6efaf6ae08ee7a03563cb8c6cbbf8c8f61e7ffca14cb334` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/RUNBOOK.md | 14 | `a351b6d6fe5151be3390d0e7daa97e5bc34f93b3f6c3659590ba654977c6bc66` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/configuration.md | 1 | `20567ebec7b732921136be60dcdc2004ea501a770ba747c90b9d5eb83d68ca0b` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/custom-record-mobile.md | 1 | `10b3b51494cf16c2635de0c5d9f3e96f1849e61949ae4e7da7aababb84a38a77` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/scheduling-patterns.md | 1 | `e9083b8a18b70a4d18db3a154b5385f0d86fad468583bd7bded111588b99bc8a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/scheduling.md | 1 | `102d4649b79eb0aa20ea526428c70824cac927d5350d72c7b357716c6fae6237` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/service-reports/coordinate-agents.md | 1 | `dd0aae3a94450ae39b5241c2f8bf386fa41b0e970ed4959413e3946e359825f8` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/service-reports/index.md | 1 | `d7949e062995519cd43181d21e4b9933821f54eb612962acf04cb00974b95c49` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/service-reports/publication.md | 1 | `4230922490acc150f7936be1d9a8e0fd3e2ea47c1a648793f28044c5a4e5939a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/service-reports/template.md | 1 | `e178743f8ab4e57f666c987603d39ecb838a86fdea44a6482e9c387d49999cc3` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/service-work.md | 1 | `9dd07d08d5012363fcbcbc5a4788a6d41e67da7c233291e33f03ec378637d06d` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/tailor-fsm-skill.md | 1 | `1a7d3a6547eda7ed74aa8acd68558d8b814f8615356bd074ece275c5bfefc3fe` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/workflows/work-records.md | 1 | `459963c6e3c374803285e970492f4e156f0abe0039e7b61e1ab8c4c616e6601a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-fulfillment-performance-insights/RUNBOOK.md | 17 | `3fdd2721645c8d8107826f90332260efc08a5af1b160dd944416f1de2e364b75` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-availability-lookup/RUNBOOK.md | 17 | `fa38b804c13e2aaedb162693adf8b632df6c7c9258da6de485b5b387a19d7451` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-balance-viewer/RUNBOOK.md | 17 | `dddd80a5ec6264a8157e694c2e3c3fe71e57ffc366bd80c87ce8041acd0afd1c` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-exceptions-review/RUNBOOK.md | 17 | `c50083d7991e0badc10dcaf3d17ba76bc6e7c9a6a2bc7a49e5f2e45a65cf2657` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-impact-review/RUNBOOK.md | 14 | `139b402266af0cd11036585507a8e1597cc34eb5b12e57584941b48cd756d622` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-movement-insights/RUNBOOK.md | 17 | `020d9a2fbc2353bef6b10040d81ac0721f3aa927ce3482d3a654481063c4ec8a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-item-purchasing-history/RUNBOOK.md | 14 | `55794ce462a213a7c08989839d7fa3236480ba629457cba50270e063590c0b8a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-project-risk-assistant/RUNBOOK.md | 14 | `7fa2e971ef0fd9853434fcec35df600e57129c78435f593dd54cea6f9b3e0a82` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-return-authorization-assistant/RUNBOOK.md | 14 | `ca7034c6190468a1dc7d4e6092666bafb28555bd472bd0cde6ff8ce00f865469` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-supply-chain-persona-based-responses/RUNBOOK.md | 14 | `2f2e88e094c856dd8b0d38757bb6597f0fed35bfc129b59db975581e47a55a87` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-vendor-optimization/RUNBOOK.md | 14 | `574f6fe3de9977bb7208901f9e07e7e1aaff06216067739b45df944a17f3e3ab` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-absence-management-advisor/RUNBOOK.md | 14 | `a1d2981e2ee2ba52f6593c485a9de107de9e8ca29204a4fca31732253d715bc8` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-absence-management-advisor/workflows/balance-explanation/WORKFLOW.md | 1 | `9abd203c23cddb8cd7cc2bd30a0dc9fbc7ea7d42b3aaa5da5395aecc5d6c4280` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-absence-management-advisor/workflows/low-time-off-usage/WORKFLOW.md | 1 | `e394c2d13ee1b9d4bf3ab5c80935a2de0944c4ed00f5d18d0e39030ad4e51f14` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-absence-management-advisor/workflows/time-off-balance/WORKFLOW.md | 1 | `f1a8e42df8d0570f0e168ee9231f30925d27121237f2e6ef49ad68e6e38749b2` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-absence-management-advisor/workflows/time-off-request/WORKFLOW.md | 1 | `1f0a45157c96073ffd504607d5b6e4639d85335e0a702841d24c39335e6a8b7b` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-benefits-portfolio-monitor/RUNBOOK.md | 14 | `5cd7914c93291b725a66d36232160ab24681be1e4abdf3dedcb6c361b99d327a` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-payroll-clarity-readiness/RUNBOOK.md | 14 | `ec0897bfb6a5c325f87cd685589f34e1026d962f99c23fca2c2fa760006b072f` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-time-approval-review/RUNBOOK.md | 14 | `c3cedc7a84a590f886e56b9c44c097f0de4c81306f33e28a32a75b4a1f67a63f` |
| skills/netsuite-suiteskills-people/runbooks/netsuite-time-entry-creation/RUNBOOK.md | 14 | `174d7e97e5a3894734db253c507e6932be39e7f77a50d9b9e2cc5869592c46f5` |

## Consolidated sections

Sixteen repeated general policy sections were removed; domain exclusions, review gates and recovery requirements remain in their procedures. See SAFEWORDS-COVERAGE.json for the removed-section register.
