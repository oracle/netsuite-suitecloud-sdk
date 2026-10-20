# SafeWords coverage — SuiteSkills 1.0.0

Static structure and link verification only. Native model adherence, account behavior and security approval remain not_run. Paths and hashes describe the final unsuffixed packaged files.

## Policy owners

| Path | Lines | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/SKILL.md | 33–49 | `875f9d15748aebad912450b05de4999a20138fcb34fdc9eb8f4361dcf5ad106e` |
| skills/netsuite-suiteskills-finance/SKILL.md | 47–63 | `83e618bceede4aee36bb882effa41f939c140f37b1dcc0f1e0b28cd88d61e379` |
| skills/netsuite-suiteskills-onboarding/SKILL.md | 27–43 | `d101321772b1ed384d630449c2b56cee66eb1a948e87bc027bb388c73ffe900f` |
| skills/netsuite-suiteskills-operations/SKILL.md | 39–55 | `d1db79f2986262dc5ba1798d768d0ed6fcb208d2f09bdf7309d8fd064ab9ce38` |
| skills/netsuite-suiteskills-workforce/SKILL.md | 30–46 | `9613a85d751574ed17715788391d0bff1a18c1826be1d4421fc87eec906bf837` |

## Mandatory application references

48 runbooks and 15 workflows load their owning policy before tool use, including direct loads. Missing policy stops dependent operations.

| Path | Line | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-advanced-pricing-price-rule-management/RUNBOOK.md | 14 | `c3aa4afaa29560e7d53b74e59a6de99700c6d2d55b239c5be93b72df94cf12e7` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-service-order-triage/RUNBOOK.md | 14 | `afb951e4d020d7f50466b01a69711ae25c8054655a4b31f967bf37405db4bf67` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-support-assistant/RUNBOOK.md | 16 | `02bd3ddc1d3466da05c9e78df91a91ac342dc2944566c71d8c422ae1d27ffbc3` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-knowledge-quality-assistant/RUNBOOK.md | 14 | `c10a60fa83738d7ab7648d03ea011efaa84f734b6f75bcaa10180631a0264daf` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-lead-management-assistant/RUNBOOK.md | 14 | `7504b74c408d60195f382f1194178d3edca0e21c4b27bd9ac50a365c17fc8bae` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-marketing-campaign-assistant/RUNBOOK.md | 14 | `76f9e35121f462adcbd8da448018ee2f86a7cb2dba6f0e1c147688415952dd23` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-pricing-policy-and-exception-review/RUNBOOK.md | 14 | `ffad1655a632c275c3b1176a97f02e371c911bd74a263215ceb4d4383e93500b` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-sales-assistant/RUNBOOK.md | 14 | `47754df88fd9992e703bbcbcb770ddae27516deb2ac95690c0d4e326332df6c8` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-bank-reconciliation-prioritization/RUNBOOK.md | 14 | `b22db49181daf8d7ba5eef8dd0df1f493045cf7920802d35e394ee76e7fda20d` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cash-and-liquidity/RUNBOOK.md | 14 | `ceb98a604b53762f18e89e73e0e4a527c86ea6d403ba0fb22b3e3c11fda7d9b8` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cohort-analysis/RUNBOOK.md | 14 | `163a5023aa6e245d193b7a5186d332573991b58b59d3169b6ed365e4d208ecc9` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-credit-management/RUNBOOK.md | 14 | `3990fecf6d6340c86a1e7fc0431bc9213ebe2b08d3fb732af29b7799ef1d2309` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-executive-finance-reporting/RUNBOOK.md | 14 | `699cdcec1853abe518f8916a462db83e031692c00b5ce1623ddfa1ac31284d38` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-expense-close-assistant/RUNBOOK.md | 14 | `68c876e7e37da3d1de293244cd7e049ef92d397f773fee28c3bc9776fb6994a1` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-finance-controls-review/RUNBOOK.md | 14 | `a8bb52dcc56fc38a9b809321cb78744d47f3734eb54606c92eb9814b54c02b69` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-financial-statement-review/RUNBOOK.md | 14 | `98ec8ef30112402f573eab346a1d4fc85fb103d68d9aec510abe5f0b8149a453` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-intercompany-balance-explorer/RUNBOOK.md | 14 | `d7cf02b0498628dd3e4c378696219a23b9605ad822e43f2cf59b65d578d5eb80` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-invoice-collections/RUNBOOK.md | 14 | `2960e596777f7d52aca95b9e53165c0b86c9ff6ad6a096735fc5310b9cf84826` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-journal-entry-review/RUNBOOK.md | 14 | `43e41148f9d2953bfd4c0a1eb6e952e61e03b82f646a032500740a31c9506162` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-labor-cost-advisor/RUNBOOK.md | 14 | `33a00877d88af1ffa2b130796bb124d212eaaf74e47e4ddaf5127b3343ab9b45` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-match-vendor-credits-to-bills/RUNBOOK.md | 14 | `309cbad351488e1c8cb1c731f6e9f38f865a4ec47a151e354458ffb4b21cd1b9` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-overdue-invoice-change-review/RUNBOOK.md | 14 | `233f250c02494469befc4ab97c9456b45825d64b3474d87f38bec85ed81ce075` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-payment-prioritization/RUNBOOK.md | 14 | `874db0c785c0de3fead980107f889eff392545f83ba96db38f687d9999b65a73` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-period-close-status/RUNBOOK.md | 14 | `211be3dd864b601d0962215a1b4a23fa1769241ce4e958d8780c5634fdd1c124` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-project-financial-assistant/RUNBOOK.md | 14 | `5f7cb2e11eecfb5529bb1565282e9576c01209b7261d1f9b29b9aaa6d459c2ab` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-revenue-leakage/RUNBOOK.md | 14 | `f21a8b78d5bd32cc1cee63c721826453da22cf3cbedbcf45cb0d21415c2dcd86` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-suitetax-nexus-explainer/RUNBOOK.md | 14 | `d341af31ec3b38cf26bc162a13f9c47aee374d0b8c3b15b6841bdffbebab1679` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-variance-analysis/RUNBOOK.md | 14 | `b55f9b018e963ec085eb3931a0d274189d7fdeb2fc9a373d1f0b5a2886aca31e` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-bill-processing-time/RUNBOOK.md | 14 | `1a8ec0c22d0158faf690f7768bba05288c0da418ecd6e1d10f6c52bf4de3e70e` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-spend-analysis/RUNBOOK.md | 14 | `d0ee05f7fed43f50f4d0e2f57dbefd3938ac926e729c5115421a728ba79ff745` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization/RUNBOOK.md | 13 | `5966ce1880ff8bfbf6efaf6ae08ee7a03563cb8c6cbbf8c8f61e7ffca14cb334` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/RUNBOOK.md | 14 | `9e2afb57736d7d0c20882e98fd461a021862c7f014098fbbec48cb5d226934ce` |
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
| skills/netsuite-suiteskills-operations/runbooks/netsuite-fulfillment-performance-insights/RUNBOOK.md | 17 | `395b44f83ff27aa98d7b41c728bfb912795fa656b21e0f2dbc20f0f63eaa3347` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-availability-lookup/RUNBOOK.md | 17 | `645b696cac70db661997a2d3f35bdb50130648d6f8e3059173187d7cf35c60bd` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-balance-viewer/RUNBOOK.md | 17 | `5394538c68d005b635d5a8a97c135c3eb91b4a1198b936d04c64f254e418f442` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-exceptions-review/RUNBOOK.md | 17 | `fd54930741c14172d6231726856417a91d6f464cf1963a365fa525d800e64b04` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-impact-review/RUNBOOK.md | 14 | `8070ece82af1ea885a0d36e011f81942c2f5393444bf83fb70d5d52c5e459afe` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-movement-insights/RUNBOOK.md | 17 | `5f105c884fa89d9b47912dfc504d368e1a139be9ab72644b0cf89dbc03697f1d` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-item-purchasing-history/RUNBOOK.md | 14 | `04760f157d3b4d69430eb095f3861a67f7c8ccde5ce82ed125a94cf8dbbbee8e` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-project-risk-assistant/RUNBOOK.md | 14 | `d05eb501d64847f9dc56ab2faad6f7ad1df94dd66badc05081ec4d541eab319c` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-return-authorization-assistant/RUNBOOK.md | 14 | `24fe7c0f1f902f6721c8d6de8d03532dadf473efa5a9c71ceea41cbb40ab7bbb` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-supply-chain-persona-based-responses/RUNBOOK.md | 14 | `70eda965ca352b0239ecdca006fcacee190d58bc8c9ecdc4861035d753dbf1db` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-vendor-optimization/RUNBOOK.md | 14 | `d0736842a926460c38761e160ae2a6093c591b62d9a1356eae48e7332e344d5f` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/RUNBOOK.md | 14 | `9e38df3326dfb5d33eb02ab06c8d83c86e26f0d20f933bd3364d663b44b04fcf` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/balance-explanation/WORKFLOW.md | 1 | `9abd203c23cddb8cd7cc2bd30a0dc9fbc7ea7d42b3aaa5da5395aecc5d6c4280` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/low-time-off-usage/WORKFLOW.md | 1 | `e394c2d13ee1b9d4bf3ab5c80935a2de0944c4ed00f5d18d0e39030ad4e51f14` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/time-off-balance/WORKFLOW.md | 1 | `f1a8e42df8d0570f0e168ee9231f30925d27121237f2e6ef49ad68e6e38749b2` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/time-off-request/WORKFLOW.md | 1 | `1f0a45157c96073ffd504607d5b6e4639d85335e0a702841d24c39335e6a8b7b` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-benefits-portfolio-monitor/RUNBOOK.md | 14 | `18f3dc31efc5291007940018d3a8289d8ba216ad1e000fe87dc46ae0430ba2e4` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-payroll-clarity-readiness/RUNBOOK.md | 14 | `a43ca96b47bff0d498e6416a20e33ac70abe7e1a426335acb7928d26eac97923` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-time-approval-review/RUNBOOK.md | 14 | `7540414da6fd46e5fba080df480fd022cae1299d92602dee8adae4cd4c1b00f1` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-time-entry-creation/RUNBOOK.md | 14 | `ed2c52f539f8b9523ea255b9a7ba56c87fc8f9a03560b0003c5b244bb49fde2d` |

## Consolidated sections

Sixteen repeated general policy sections were removed; domain exclusions, review gates and recovery requirements remain in their procedures. See SAFEWORDS-COVERAGE.json for the removed-section register.
