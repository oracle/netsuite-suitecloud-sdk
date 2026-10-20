# SafeWords coverage — SuiteSkills 0.8.2

Static structure and link verification only. Native model adherence, account behavior and security approval remain not_run. Paths and hashes describe the final unsuffixed packaged files.

## Policy owners

| Path | Lines | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/SKILL.md | 33–49 | `14e2de760d8194aacf05a4a6a488806f11a705510c274518f7f389547a14c9de` |
| skills/netsuite-suiteskills-finance/SKILL.md | 47–63 | `2abc9c475518532257ac177882b72826f11aa7c14d6b8e9d078a4abd0fbd5807` |
| skills/netsuite-suiteskills-onboarding/SKILL.md | 27–43 | `295293b0166202445d719fecf9a9fcda6447281d10a4bded72ad51f40a22ea1a` |
| skills/netsuite-suiteskills-operations/SKILL.md | 39–55 | `1ce9dfa50b63d0c9ad1503a3deae2e5ef216ebe443c373e631106efe6591e25a` |
| skills/netsuite-suiteskills-workforce/SKILL.md | 30–46 | `367239013158e90e91f534a908b09fdeb4f39330e0aeab24e729074844574bee` |

## Mandatory application references

48 runbooks and 15 workflows load their owning policy before tool use, including direct loads. Missing policy stops dependent operations.

| Path | Line | SHA-256 |
|---|---|---|
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-advanced-pricing-price-rule-management/RUNBOOK.md | 14 | `0ec155adc0e7c9295f036da705e30a160b11bdf984b99cd0e7906da3a90e7009` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-service-order-triage/RUNBOOK.md | 14 | `f281e8d9028c9528cd149c662b3726aa1660a9572bad80fa759e1e60a8aed2ad` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-customer-support-assistant/RUNBOOK.md | 16 | `23a236441ce28f16a61018a93eb5f92ceeb0ee8b2fc2ce6a3744b017d386ce44` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-knowledge-quality-assistant/RUNBOOK.md | 14 | `ce70ae3a403a8ba060caa9b41528a952052036e898a184905b8ca8806b911d1f` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-lead-management-assistant/RUNBOOK.md | 14 | `a009e108f7a754b0fbc04a1641b1137b436ad9ce023111c172eaa61570ea9bb2` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-marketing-campaign-assistant/RUNBOOK.md | 14 | `6f4016f0e64ae9903a6a71d128ac38670195917e76e0f7bca8b3cb33d3ebe3ee` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-pricing-policy-and-exception-review/RUNBOOK.md | 14 | `73c8c9952342cde3bb4b9c8d6591114042b7d69076f2fbb9b5ca989b8b80de85` |
| skills/netsuite-suiteskills-customers-sales/runbooks/netsuite-sales-assistant/RUNBOOK.md | 14 | `c720e94d84997c25c446a3b94925c62694dd557e76b9e54a1d55e8e0916f18b1` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-bank-reconciliation-prioritization/RUNBOOK.md | 14 | `7f7bc865752f467bb8c821c0179a0e7eac70a2f20bbd9c19c071d1c34e64b65d` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cash-and-liquidity/RUNBOOK.md | 14 | `b212fd9f99fc09a3180493af9fe3cf5d19d1bac69382e2c2a7295373b2aa08f7` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-cohort-analysis/RUNBOOK.md | 14 | `2c09eeb67db1055c0e5684e6924ad151def19753eaf5ee4c4cb163282307e508` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-credit-management/RUNBOOK.md | 14 | `7384fd519ba967dc9fdbc57eb4745a12c5ff959327d357b827935fa866632942` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-executive-finance-reporting/RUNBOOK.md | 14 | `7932edfbdbfd19fcf00aba392cca07d5fbc2e2746408bc687e192fff37fa9c7f` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-expense-close-assistant/RUNBOOK.md | 14 | `9b5593e8dba13018462fe5a2b4ee7095e629e0051a05cee7682f9f75c9328c27` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-finance-controls-review/RUNBOOK.md | 14 | `8f7cb5ae7d1f15472daa472f39c226c069f0541232b70ef66775dc1ddac9afd2` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-financial-statement-review/RUNBOOK.md | 14 | `bc106f5f2250c284a58a8cc78035b5f3cafd3f7df8d0e2c2d6f661213f49fe4d` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-intercompany-balance-explorer/RUNBOOK.md | 14 | `681c0fb60cea6149e17ea62a43e2509370365ae4abb6d561b8a8401affea2f69` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-invoice-collections/RUNBOOK.md | 14 | `ccbe013ac3e62d454a3d7d8f86fb92a0343a7808f59936becb42fd2a0554e2fd` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-journal-entry-review/RUNBOOK.md | 14 | `19843de6fcebbad5bc79cc7588980fb29923841ecbc4df05e6093a230f736e68` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-labor-cost-advisor/RUNBOOK.md | 14 | `29c5304b16c9f2d0530ef4fe15ee42d386ec77f76bc394b183ac61bc4347942f` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-match-vendor-credits-to-bills/RUNBOOK.md | 14 | `034b4be7bc9112d0990a84e9326decd390f043ae8a0f15eab875502ee23c77c5` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-overdue-invoice-change-review/RUNBOOK.md | 14 | `e7c7fe901668d710446cd59f1cc38e8269ca14b3a317b5e8cc1a24d709b3c7fc` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-payment-prioritization/RUNBOOK.md | 14 | `67b2614ddc8c42795e3874db12ef564fc4fd2aed64d12c4996cba1384945a3cd` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-period-close-status/RUNBOOK.md | 14 | `de37223aa3a04070e11c1f47ddc73d2e0b7a2a8384ac70171dde40f67fb5976d` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-project-financial-assistant/RUNBOOK.md | 14 | `be0c5449b65282fe11673dd84997b52af841ba7f87c2cd9b7e8c05871f0ca7ff` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-revenue-leakage/RUNBOOK.md | 14 | `af3023c3958def264226798b0faab220b614867ed54479c2814024467318075b` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-suitetax-nexus-explainer/RUNBOOK.md | 14 | `84e6518d0d315b560006ada990da9980f89229362db782067eb40c742e0a22e9` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-variance-analysis/RUNBOOK.md | 14 | `54db947277637724c00f3c914eec9c440b9986f1231792a646ccd215833cd429` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-bill-processing-time/RUNBOOK.md | 14 | `ccb0e450d43b340280bca11f243b68de4a7a10ffba954343054e67adbfb525a1` |
| skills/netsuite-suiteskills-finance/runbooks/netsuite-vendor-spend-analysis/RUNBOOK.md | 14 | `f966677a5febddb0bc4309a0e4acbd7cf9b0c5a24e810a14379b78334ad1b1ec` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-data-visualization/RUNBOOK.md | 13 | `5966ce1880ff8bfbf6efaf6ae08ee7a03563cb8c6cbbf8c8f61e7ffca14cb334` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-field-service-management/RUNBOOK.md | 14 | `9e27faa50539861d9290d0186d16074e869138d63375a2cb0ff7570000dec7f2` |
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
| skills/netsuite-suiteskills-operations/runbooks/netsuite-fulfillment-performance-insights/RUNBOOK.md | 17 | `9f2931646f861193a409555f6d146e4dd33347b97d08ad05e10f4fbc36025f3c` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-availability-lookup/RUNBOOK.md | 17 | `55a57b76bd982d3533fce4120c44100c7ef52a9a20930786905a4c6d78b5b3b7` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-balance-viewer/RUNBOOK.md | 17 | `6dc537dbc40a8db89a2c2f291add1d313076fc39b4fc8a40f0430bc99d9a2f6c` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-exceptions-review/RUNBOOK.md | 17 | `85414b9d09b5241f557bf6959fad67af7e46d2af160f398edba5e25c4df138f4` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-impact-review/RUNBOOK.md | 14 | `157226232b17766eab12aeed8e40065e7086fdc70af6600d4756db190dc623fb` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-inventory-movement-insights/RUNBOOK.md | 17 | `254221d2f2c10c0ec6a27871cf5003e76e790023d3935e1a44141ad9eb4c0eae` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-item-purchasing-history/RUNBOOK.md | 14 | `3e30acf1110b22dafc047e4debb8c5e495d951c4412041044e3be35ff2d66334` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-project-risk-assistant/RUNBOOK.md | 14 | `d0b16bcfff66c983ac1c6403b33017711ae4e55f7cbf9403928ebd1d4c55b498` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-return-authorization-assistant/RUNBOOK.md | 14 | `ed50e9ca47b535ab334aeccb3868002f409fefd54c9d1dd1d5dfb86d72268c9a` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-supply-chain-persona-based-responses/RUNBOOK.md | 14 | `556b4b9af7a58b3067ca7bda45fb3a90c3687f2a4511fde3448c91f74694e1c9` |
| skills/netsuite-suiteskills-operations/runbooks/netsuite-vendor-optimization/RUNBOOK.md | 14 | `b78b1a826596f8fcc3de3d54decf00aaa3d90bbee2fd46b2cfc526123ceaac58` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/RUNBOOK.md | 14 | `cadf78ed33e13891ae3560b8587383bd1663178a4b451e294b629a501b19314c` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/balance-explanation/WORKFLOW.md | 1 | `9abd203c23cddb8cd7cc2bd30a0dc9fbc7ea7d42b3aaa5da5395aecc5d6c4280` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/low-time-off-usage/WORKFLOW.md | 1 | `e394c2d13ee1b9d4bf3ab5c80935a2de0944c4ed00f5d18d0e39030ad4e51f14` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/time-off-balance/WORKFLOW.md | 1 | `f1a8e42df8d0570f0e168ee9231f30925d27121237f2e6ef49ad68e6e38749b2` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-absence-management-advisor/workflows/time-off-request/WORKFLOW.md | 1 | `1f0a45157c96073ffd504607d5b6e4639d85335e0a702841d24c39335e6a8b7b` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-benefits-portfolio-monitor/RUNBOOK.md | 14 | `8fcc669eb39ff6a61680d46ed9a025b7ced0c5994abec0edcaed6e007c6bf35b` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-payroll-clarity-readiness/RUNBOOK.md | 14 | `a3131bcd290ab2774ef0cbb256f6ecd74cb16d42b5474aaa5b2d408c6cd4c83b` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-time-approval-review/RUNBOOK.md | 14 | `189d12013c41205496819df26f92088297bb6a9639daf5fc869eaa7490504312` |
| skills/netsuite-suiteskills-workforce/runbooks/netsuite-time-entry-creation/RUNBOOK.md | 14 | `e8455658072523ec2ddd5dd1514901e0b9922348862707c7423c857c9a8afa91` |

## Consolidated sections

Sixteen repeated general policy sections were removed; domain exclusions, review gates and recovery requirements remain in their procedures. See SAFEWORDS-COVERAGE.json for the removed-section register.
