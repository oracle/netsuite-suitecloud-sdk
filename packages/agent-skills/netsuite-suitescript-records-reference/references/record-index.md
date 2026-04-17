# NetSuite Record Type Index
> Author: Oracle NetSuite

Quick reference for all NetSuite record types. Use this index to find record internal IDs, then look up full field details in `records.json`.

## Legend
- **Cat**: Record category (List, Transaction, Entity, Activity, Subrecord, Script, Custom)
- **Level**: Scripting level (Full, Read and Search Only, Search Only, etc.)
- **CS**: Scriptable in client SuiteScript
- **SS**: Scriptable in server SuiteScript
- **Fields**: Number of standard body fields
- **Filters**: Number of search filters available
- **Columns**: Number of search columns available
- **Custom**: Supports custom fields (Yes/No)

## Records by Letter

### <

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `<use script id of your desired custom record type>` | Custom | Full | Yes | Yes | 13 | 16 | 19 | No |
| `<use script id of your desired custom transaction type>` | Custom | Full | Yes | Yes | 24 | 0 | 0 | Yes |

### A

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `account` | List | Full | - | Yes | 28 | 3 | 24 | Yes |
| `accountingbook` | List | No Copy | - | Yes | 7 | 6 | 1 | Yes |
| `accountingcontext` | List | Read, Create, Upda.. | Yes | Yes | 2 | 5 | 3 | Yes |
| `accountingperiod` | List | R+S | Yes | Yes | 17 | 0 | 0 | Yes |
| `accountingtransaction` | Txn | Search | Yes | Yes | 0 | 34 | 39 | No |
| `activity` | Act | Search | Yes | Yes | 0 | 18 | 24 | Yes |
| `address` | Sub | See About the Addr.. | Yes | - | 15 | 17 | 15 | No |
| `advintercompanyjournalentry` | Txn | Full | Yes | Yes | 26 | 0 | 0 | Yes |
| `allocationschedule` | List | Create, Read, Upda.. | Yes | Yes | 21 | 0 | 0 | Yes |
| `amortizationschedule` | List | Copy, Create, and .. | - | Yes | 21 | 10 | 2 | Yes |
| `amortizationtemplate` | List | Full | - | Yes | 15 | 5 | 1 | Yes |
| `analyticalimpact` | Item | Read, Update, Dele.. | Yes | Yes | 23 | 0 | 0 | No |
| `aschargedprojectrevenuerule` | Enti | Full | Yes | Yes | 10 | 2 | 1 | No |
| `assemblybuild` | Txn | Full | - | Yes | 22 | 0 | 0 | Yes |
| `assemblyitem` | Item | Full | - | Yes | 282 | 0 | 0 | Yes |
| `assemblyitembom` | ? | N/A | - | Yes | 0 | 6 | 0 | No |
| `assemblyunbuild` | Txn | Full | - | Yes | 22 | 0 | 0 | Yes |
| `automatedclearinghouse` | List | Copy and Transform.. | Yes | Yes | 19 | 0 | 0 | No |

### B

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `balancetrxbysegments` | Txn | Create, Read, and .. | - | Yes | 12 | 0 | 0 | No |
| `billingaccount` | List | Full | Yes | Yes | 23 | 21 | 19 | Yes |
| `billingclass` | List | Full | Yes | - | 5 | 1 | 8 | Yes |
| `billingratecard` | List | Read, Create, Upda.. | Yes | Yes | 3 | 4 | 3 | Yes |
| `billingschedule` | List | Full | - | Yes | 25 | 7 | 6 | Yes |
| `bin` | List | Full | - | Yes | 8 | 9 | 11 | Yes |
| `bintransfer` | Txn | Full | - | Yes | 8 | 0 | 0 | Yes |
| `binworksheet` | Txn | Copy and Update No.. | - | - | 7 | 0 | 0 | Yes |
| `blanketpurchaseorder` | Txn | Full | Yes | Yes | 42 | 0 | 0 | Yes |
| `bom` | List | Read, Create, Upda.. | Yes | Yes | 13 | 2 | 18 | Yes |
| `bomrevision` | List | Read, Create, Upda.. | - | Yes | 8 | 2 | 2 | Yes |
| `bonus` | Entity | Read, Create, Upda.. | Yes | Yes | 10 | 12 | 10 | No |
| `bonustype` | Entity | Read, Create, Upda.. | Yes | Yes | 7 | 8 | 6 | No |
| `budgetcategory` | List | Read, Create, Upda.. | Yes | Yes | 5 | 0 | 0 | No |
| `budgetexchangerate` | List | Read, Update, and .. | Yes | Yes | 16 | 9 | 12 | No |
| `bulkownershiptransfer` | ? | N/A | - | Yes | 0 | 0 | 0 | Yes |
| `bundleinstallationscript` | Script | R+S | - | Yes | 16 | 1 | 36 | No |

### C

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `campaign` | Mark | Full | Yes | Yes | 32 | 7 | 12 | Yes |
| `campaignresponse` | Mark | Full | Yes | Yes | 8 | 0 | 0 | Yes |
| `campaigntemplate` | Mark | Search Not Supported | - | Yes | 16 | 0 | 0 | Yes |
| `cardholderauthentication` | ? | N/A | - | Yes | 26 | 2 | 2 | No |
| `cashrefund` | Txn | Full | Yes | Yes | 133 | 0 | 0 | Yes |
| `cashsale` | Txn | Full | Yes | Yes | 181 | 0 | 0 | Yes |
| `charge` | Txn | Full | - | Yes | 27 | 5 | 26 | Yes |
| `chargerule` | List | Transform Not Supp.. | Yes | Yes | 28 | 2 | 2 | Yes |
| `check` | Txn | Full | Yes | Yes | 34 | 0 | 0 | Yes |
| `classification` | List | Server SuiteScript.. | - | Yes | 6 | 10 | 12 | Yes |
| `clientscript` | Script | R+S | - | Yes | 23 | 1 | 36 | No |
| `cmscontent` | Web  | Create, Update, an.. | - | Yes | 24 | 0 | 0 | Yes |
| `cmscontenttype` | Web  | Create, Update, an.. | - | Yes | 9 | 11 | 9 | Yes |
| `cmspage` | Web  | Create, Update, an.. | - | Yes | 19 | 1 | 22 | No |
| `commercecategory` | Webs | Attach, Transform,.. | - | Yes | 24 | 36 | 52 | Yes |
| `competitor` | Entity | Full | Yes | Yes | 10 | 17 | 19 | Yes |
| `consolidatedexchangerate` | List | Read, Update, and .. | Yes | Yes | 12 | 10 | 14 | Yes |
| `contact` | Entity | Full | Yes | Yes | 36 | 58 | 72 | Yes |
| `contactcategory` | List | Full | Yes | Yes | 4 | 7 | 5 | Yes |
| `contactrole` | List | Full | Yes | Yes | 4 | 7 | 5 | Yes |
| `costcategory` | List | Full | Yes | Yes | 5 | 8 | 6 | Yes |
| `couponcode` | Mark | Full | Yes | Yes | 6 | 12 | 14 | Yes |
| `creditcardcharge` | Txn | Full | - | Yes | 34 | 0 | 0 | Yes |
| `creditcardrefund` | Txn | Full | - | Yes | 34 | 0 | 0 | Yes |
| `creditmemo` | Txn | Full | Yes | Yes | 97 | 0 | 0 | Yes |
| `currency` | List | Full - with Multip.. | - | Yes | 12 | 11 | 12 | Yes |
| `currencyrate` | List | Create, Read, Copy.. | Yes | Yes | 8 | 2 | 1 | No |
| `customer` | Entity | Full | Yes | Yes | 124 | 168 | 165 | Yes |
| `customercategory` | List | Search Not Supported | Yes | Yes | 3 | 9 | 10 | No |
| `customerdeposit` | Txn | Full | Yes | Yes | 82 | 0 | 0 | Yes |
| `customermessage` | List | Full | Yes | Yes | 5 | 8 | 6 | Yes |
| `customerpayment` | Txn | Copy and Create No.. | - | Yes | 88 | 0 | 0 | Yes |
| `customerpaymentauthorization` | ? | N/A | - | Yes | 55 | 0 | 0 | Yes |
| `customerrefund` | Txn | Full | - | Yes | 74 | 0 | 0 | Yes |
| `customerstatus` | Entity | Full | Yes | Yes | 7 | 9 | 7 | Yes |
| `customersubsidiaryrelationship` | List | Full | Yes | Yes | 10 | 11 | 9 | Yes |
| `custompurchase` | Txn | Full | Yes | Yes | 37 | 0 | 0 | No |
| `customsale` | Txn | Full | Yes | Yes | 90 | 0 | 0 | No |

### D

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `deletedrecord` | ? | N/A | - | Yes | 0 | 5 | 5 | Yes |
| `department` | List | Server SuiteScript.. | - | Yes | 6 | 10 | 12 | Yes |
| `deposit` | Txn | Copy Not Supported.. | Yes | Yes | 24 | 0 | 0 | Yes |
| `depositapplication` | Txn | Create Not Allowed | Yes | Yes | 22 | 0 | 0 | Yes |
| `descriptionitem` | Item | Full | Yes | Yes | 15 | 0 | 0 | Yes |
| `discountitem` | Item | Full | Yes | Yes | 24 | 0 | 0 | Yes |
| `downloaditem` | Item | Full | Yes | Yes | 73 | 0 | 0 | Yes |

### E

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `emailtemplate` | Mark | Search Not Supported | - | Yes | 13 | 0 | 0 | Yes |
| `employee` | Entity | Full | Yes | Yes | 117 | 128 | 141 | Yes |
| `employeechangerequest` | List | Copy and Transform.. | Yes | Yes | 14 | 14 | 12 | No |
| `employeechangerequesttype` | List | Copy and Transform.. | Yes | Yes | 8 | 8 | 6 | No |
| `employeeexpensesourcetype` | Txn | Full | Yes | Yes | 7 | 7 | 5 | No |
| `estimate` | Txn | Full | Yes | Yes | 106 | 0 | 0 | No |

### F

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `fairvalueprice` | List | Create, Delete, an.. | - | Yes | 17 | 18 | 17 | Yes |
| `file` | File | Search | - | Yes | 0 | 18 | 17 | Yes |
| `financialinstitution` | List | Read, Create, Upda.. | - | Yes | 10 | 0 | 0 | No |
| `fixedamountprojectrevenuerule` | ? | N/A | - | Yes | 10 | 17 | 19 | Yes |
| `folder` | File | Full | - | Yes | 13 | 23 | 21 | No |
| `formatprofile` | List | Read, Create, Upda.. | Yes | Yes | 14 | 0 | 0 | No |
| `fulfillmentrequest` | Txn | Create and Copy No.. | Yes | Yes | 16 | 0 | 0 | Yes |

### G

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `generaltoken` | List | Copy and Transform.. | Yes | Yes | 16 | 0 | 0 | No |
| `genericresource` | Entity | No Copy | Yes | Yes | 9 | 14 | 16 | Yes |
| `giftcertificate` | List | Full | Yes | Yes | 11 | 20 | 22 | Yes |
| `giftcertificateitem` | Item | Full | Yes | Yes | 54 | 0 | 0 | Yes |
| `glnumberingsequence` | Txn | Read, Create, Upda.. | Yes | Yes | 18 | 15 | 21 | No |
| `globalaccountmapping` | List | Full | - | Yes | 12 | 17 | 18 | Yes |
| `globalinventoryrelationship` | List | Read, Create, Edit.. | Yes | Yes | 8 | 15 | 19 | Yes |
| `goal` | List | Full | Yes | Yes | 10 | 0 | 0 | No |

### H

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `hcmjob` | Entity | Copy and Transform.. | Yes | Yes | 9 | 0 | 0 | Yes |

### I

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `impactsubcategory` | Item | Read, Create, Upda.. | Yes | Yes | 3 | 0 | 0 | No |
| `importedemployeeexpense` | Txn | Full | Yes | Yes | 22 | 0 | 0 | No |
| `inboundshipment` | List | Copy and Transform.. | Yes | Yes | 17 | 36 | 36 | No |
| `intercompallocationschedule` | List | Create, Read, Upda.. | Yes | Yes | 22 | 0 | 0 | Yes |
| `intercompanyjournalentry` | Txn | Full | Yes | Yes | 29 | 0 | 0 | Yes |
| `intercompanytransferorder` | Txn | Full | Yes | Yes | 50 | 0 | 0 | No |
| `inventoryadjustment` | Txn | Full | Yes | Yes | 17 | 0 | 0 | Yes |
| `inventorycostrevaluation` | Txn | Full | Yes | Yes | 18 | 0 | 0 | Yes |
| `inventorycount` | Txn | Full | Yes | Yes | 13 | 0 | 0 | Yes |
| `inventorydetail` | Sub | See Creating an In.. | Yes | - | 8 | 15 | 15 | No |
| `inventorynumber` | List | Copy, Create, and .. | - | Yes | 6 | 17 | 18 | Yes |
| `inventorynumberbin` | ? | N/A | - | Yes | 0 | 5 | 5 | Yes |
| `inventorystatus` | List | Full | Yes | Yes | 8 | 10 | 8 | Yes |
| `inventorystatuschange` | Txn | Full | Yes | Yes | 5 | 0 | 0 | Yes |
| `inventorytransfer` | Txn | Full | - | Yes | 13 | 0 | 0 | Yes |
| `invoice` | Txn | Full | Yes | Yes | 139 | 0 | 0 | Yes |
| `invoicegroup` | ? | N/A | - | Yes | 30 | 25 | 29 | No |
| `item` | Item | Search | - | - | 0 | 304 | 345 | Yes |
| `itemaccountmapping` | List | Full | - | Yes | 13 | 18 | 19 | Yes |
| `itembinnumber` | ? | N/A | - | Yes | 0 | 4 | 4 | No |
| `itemcollection` | List | Copy and Transform.. | Yes | Yes | 7 | 8 | 6 | No |
| `itemdemandplan` | Txn | Copy Not Supported.. | Yes | Yes | 18 | 21 | 23 | Yes |
| `itemfulfillment` | Txn | Copy and Create No.. | Yes | Yes | 53 | 0 | 0 | Yes |
| `itemgroup` | Item | Full | Yes | Yes | 22 | 0 | 0 | Yes |
| `itemlocationconfiguration` | List | Read, Create, Edit.. | - | Yes | 47 | 44 | 42 | Yes |
| `itemprocessfamily` | List | Full | Yes | Yes | 5 | 9 | 7 | No |
| `itemprocessgroup` | List | Full | Yes | Yes | 5 | 9 | 7 | No |
| `itemreceipt` | Txn | Copy and Create No.. | Yes | Yes | 22 | 0 | 0 | Yes |
| `itemrevision` | List | Full | - | Yes | 7 | 11 | 14 | Yes |
| `itemsupplyplan` | Txn | Full | Yes | Yes | 7 | 18 | 20 | Yes |

### J

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `jobstatus` | Entity | Full | Yes | Yes | 0 | 7 | 5 | Yes |
| `jobtype` | Entity | Full | Yes | Yes | 0 | 7 | 5 | Yes |
| `journalentry` | Txn | Full | Yes | Yes | 35 | 0 | 0 | Yes |

### K

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `kititem` | Item | Full | - | Yes | 207 | 0 | 0 | Yes |

### L

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `laborbasedprojectrevenuerule` | ? | N/A | - | Yes | 4 | 19 | 21 | Yes |
| `landedcost` | Txn | Full | - | Yes | 0 | 0 | 0 | No |
| `lead` | Entity | Full | Yes | Yes | 101 | 164 | 162 | No |
| `location` | List | Server SuiteScript.. | - | Yes | 41 | 44 | 44 | Yes |
| `lotnumberedassemblyitem` | Item | Full | Yes | Yes | 290 | 0 | 0 | Yes |
| `lotnumberedinventoryitem` | Item | Full | Yes | Yes | 288 | 0 | 0 | Yes |

### M

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `manufacturingcosttemplate` | List | Full | - | Yes | 2 | 12 | 13 | Yes |
| `manufacturingoperationtask` | Txn | No Copy | Yes | Yes | 8 | 32 | 35 | Yes |
| `manufacturingrouting` | List | Full | - | Yes | 3 | 25 | 26 | Yes |
| `mapreducescript` | Script | R+S | - | Yes | 0 | 13 | 15 | No |
| `markupitem` | Item | Full | Yes | Yes | 4 | 0 | 0 | Yes |
| `massupdatescript` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `merchandisehierarchylevel` | List | Read, Create, Edit.. | - | Yes | 0 | 7 | 5 | Yes |
| `merchandisehierarchynode` | List | Read, Create, Edit.. | - | Yes | 0 | 9 | 7 | Yes |
| `merchandisehierarchyversion` | List | Read, Create, Edit.. | - | Yes | 0 | 9 | 7 | Yes |
| `message` | Comm | For details, see M.. | - | Yes | 3 | 21 | 24 | Yes |
| `msesubsidiary` | ? | N/A | - | Yes | 0 | 44 | 57 | No |

### N

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `nexus` | List | No Copy | - | Yes | 0 | 14 | 15 | Yes |
| `noninventoryresaleitem` | Item | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `noninventorysaleitem` | Item | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `note` | Comm | Full | - | Yes | 0 | 13 | 14 | Yes |
| `notetype` | List | Full | Yes | Yes | 0 | 7 | 5 | Yes |

### O

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `opportunity` | Txn | Full | Yes | Yes | 77 | 65 | 73 | Yes |
| `orderreservation` | Txn | Created, read, upd.. | Yes | Yes | 0 | 0 | 0 | No |
| `orderschedule` | Txn | See Subrecord Scri.. | Yes | - | 0 | 0 | 0 | No |
| `ordertype` | List | Full | Yes | Yes | 0 | 7 | 5 | No |
| `originatinglead` | ? | N/A | - | Yes | 0 | 174 | 192 | Yes |
| `otherchargeitem` | Item | Full | - | - | 12 | 0 | 0 | Yes |
| `othername` | Entity | Full | - | Yes | 12 | 42 | 59 | Yes |
| `othernamecategory` | List | Full | Yes | Yes | 0 | 6 | 4 | Yes |

### P

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `partner` | Entity | Full | Yes | Yes | 59 | 60 | 77 | Yes |
| `partnercategory` | List | Full | Yes | Yes | 0 | 7 | 5 | Yes |
| `paycheck` | Txn | Read and Update Only | Yes | Yes | 0 | 0 | 0 | Yes |
| `paycheckjournal` | Txn | Full | Yes | Yes | 2 | 0 | 0 | Yes |
| `paymentcard` | List | Copy and Transform.. | Yes | Yes | 0 | 0 | 0 | No |
| `paymentcardtoken` | List | Copy and Transform.. | Yes | Yes | 0 | 0 | 0 | No |
| `paymentevent` | ? | N/A | - | Yes | 0 | 42 | 45 | No |
| `paymentinstrument` | ? | N/A | - | Yes | 0 | 8 | 26 | No |
| `paymentitem` | Item | Full | Yes | Yes | 5 | 0 | 0 | Yes |
| `paymentmethod` | List | Full | Yes | Yes | 0 | 9 | 7 | Yes |
| `payrollbatch` | List | Full | Yes | Yes | 0 | 10 | 9 | Yes |
| `payrollitem` | List | Full | Yes | Yes | 1 | 7 | 7 | Yes |
| `periodendjournal` | Txn | Read, Search, limi.. | Yes | Yes | 0 | 0 | 0 | No |
| `phonecall` | Act | Full | Yes | Yes | 9 | 21 | 27 | Yes |
| `pickdecomposition` | ? | N/A | - | Yes | 0 | 0 | 0 | No |
| `pickstrategy` | Txn | Full | Yes | Yes | 0 | 13 | 12 | No |
| `picktask` | Txn | Update, Delete and.. | Yes | Yes | 0 | 16 | 16 | No |
| `plannedorder` | Item | Copy and Transform.. | Yes | Yes | 0 | 20 | 18 | No |
| `planningitemcategory` | Item | Transform Not Supp.. | Yes | Yes | 0 | 6 | 4 | No |
| `planningitemgroup` | Item | Transform Not Supp.. | Yes | Yes | 0 | 6 | 4 | No |
| `planningrulegroup` | Item | Transform Not Supp.. | Yes | Yes | 0 | 6 | 4 | No |
| `portlet` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `pricebook` | List | Full | Yes | Yes | 0 | 1 | 1 | Yes |
| `pricelevel` | List | Search Not Supported | Yes | Yes | 0 | 2 | 1 | Yes |
| `priceplan` | List | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `pricing` | ? | N/A | - | Yes | 0 | 8 | 10 | Yes |
| `pricinggroup` | List | Full | Yes | Yes | 0 | 6 | 4 | Yes |
| `projecticchargerequest` | ? | N/A | - | Yes | 0 | 11 | 9 | No |
| `purchaseorder` | Txn | Full | Yes | Yes | 64 | 0 | 0 | No |

### R

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `receiveinboundshipment` | ? | N/A | - | Yes | 0 | 0 | 0 | Yes |
| `resourceallocation` | Acti | Full | Yes | Yes | 0 | 20 | 22 | Yes |
| `resourcegroup` | Txn | Full | Yes | Yes | 0 | 0 | 0 | No |
| `restlet` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `returnauthorization` | Txn | Full | Yes | Yes | 84 | 0 | 0 | Yes |
| `revenuearrangement` | Txn | Full | - | Yes | 0 | 0 | 0 | Yes |
| `revenuecommitment` | Txn | Create Not Support.. | Yes | Yes | 8 | 0 | 0 | Yes |
| `revenuecommitmentreversal` | Txn | Create Not Support.. | Yes | Yes | 8 | 0 | 0 | Yes |
| `role` | List | Search | - | Yes | 0 | 31 | 35 | Yes |

### S

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `saasmetric` | Item | Read, Search | Yes | Yes | 0 | 0 | 0 | No |
| `saleschannel` | Txn | Created, read, upd.. | Yes | Yes | 0 | 0 | 0 | No |
| `salesorder` | Txn | Full | Yes | Yes | 173 | 0 | 0 | Yes |
| `salesrole` | List | Full | Yes | Yes | 0 | 7 | 5 | Yes |
| `salestaxitem` | List | Full | - | Yes | 0 | 20 | 22 | Yes |
| `scheduledscript` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `scheduledscriptinstance` | Script | R+S | - | Yes | 0 | 9 | 13 | Yes |
| `scriptdeployment` | Script | R+S | - | Yes | 0 | 14 | 17 | No |
| `serializedassemblyitem` | Item | Full | Yes | Yes | 13 | 0 | 0 | Yes |
| `serializedinventoryitem` | Item | Full | Yes | Yes | 14 | 0 | 0 | Yes |
| `serviceresaleitem` | Item | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `servicesaleitem` | Item | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `shoppingcart` | Webs | Search | - | Yes | 0 | 15 | 13 | Yes |
| `solution` | Supp | Full | Yes | Yes | 8 | 21 | 20 | Yes |
| `statisticaljournalentry` | Txn | Full | Yes | Yes | 5 | 0 | 0 | Yes |
| `storepickupfulfillment` | Txn | Copy and Create No.. | Yes | Yes | 0 | 0 | 0 | Yes |
| `subscription` | Txn | Full | Yes | Yes | 0 | 32 | 29 | Yes |
| `subscriptionchangeorder` | Txn | Full | Yes | Yes | 0 | 25 | 23 | Yes |
| `subscriptionline` | Txn | Create and Delete .. | Yes | Yes | 0 | 29 | 28 | Yes |
| `subscriptionplan` | Item | Full | Yes | Yes | 0 | 0 | 0 | Yes |
| `subscriptionterm` | Item | Copy, Create, Dele.. | Yes | Yes | 0 | 8 | 6 | No |
| `subsidiary` | List | Full | Yes | Yes | 54 | 37 | 49 | Yes |
| `subsidiarysettings` | List | Read, Update, and .. | - | Yes | 0 | 0 | 0 | No |
| `subtotalitem` | Item | Full | Yes | Yes | 5 | 0 | 0 | Yes |
| `suitelet` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `supplychainsnapshot` | List | Read, Create, Edit.. | Yes | Yes | 0 | 16 | 17 | Yes |
| `supplychainsnapshotsimulation` | Item | Read, Create, Upda.. | Yes | Yes | 0 | 0 | 0 | No |
| `supplychangeorder` | Item | Create, Copy, and .. | Yes | Yes | 0 | 18 | 16 | No |
| `supplyplandefinition` | Item | Transform Not Supp.. | Yes | Yes | 0 | 10 | 8 | No |
| `supportcase` | Supp | Full | Yes | Yes | 44 | 16 | 7 | Yes |

### T

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `task` | Act | Full | Yes | Yes | 9 | 29 | 36 | Yes |
| `taxacct` | List | Delete and Search .. | Yes | Yes | 0 | 0 | 0 | Yes |
| `taxdetail` | ? | N/A | - | Yes | 0 | 7 | 9 | No |
| `taxgroup` | List | Full | - | Yes | 0 | 22 | 25 | Yes |
| `taxliabilitypayment` | ? | N/A | - | Yes | 0 | 0 | 0 | No |
| `taxperiod` | List | Full | - | Yes | 1 | 20 | 22 | Yes |
| `taxtype` | List | Full | - | Yes | 1 | 18 | 19 | Yes |
| `term` | List | Search Not Supported | Yes | Yes | 0 | 23 | 24 | Yes |
| `timeentry` | Txn | Full | Yes | Yes | 0 | 32 | 44 | Yes |
| `timeoffrequest` | Entity | Copy and Transform.. | - | Yes | 0 | 0 | 0 | No |
| `timesheet` | Txn | Full | Yes | Yes | 0 | 22 | 25 | Yes |
| `topic` | Supp | Full | - | Yes | 4 | 10 | 11 | Yes |
| `transaction` | Txn | Search | Yes | Yes | 0 | 314 | 331 | Yes |
| `transferorder` | Txn | Full | Yes | Yes | 48 | 0 | 0 | Yes |

### U

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `unitstype` | List | Full | - | Yes | 0 | 15 | 16 | Yes |
| `usage` | Txn | Full | - | - | 0 | 13 | 11 | Yes |
| `usereventscript` | Script | R+S | - | Yes | 6 | 36 | 37 | No |

### V

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `vendor` | Entity | Full | Yes | Yes | 83 | 84 | 102 | Yes |
| `vendorbill` | Txn | Full | Yes | Yes | 50 | 0 | 0 | Yes |
| `vendorcategory` | List | Search Not Supported | Yes | Yes | 0 | 2 | 1 | Yes |
| `vendorcredit` | Txn | Full | Yes | Yes | 38 | 0 | 0 | Yes |
| `vendorpayment` | Txn | Full | Yes | Yes | 41 | 0 | 0 | Yes |
| `vendorprepayment` | Txn | Read, Create, Upda.. | Yes | Yes | 0 | 0 | 0 | No |
| `vendorprepaymentapplication` | Txn | Read, Transform, U.. | Yes | Yes | 0 | 0 | 0 | No |
| `vendorreturnauthorization` | Txn | Full | Yes | Yes | 4 | 0 | 0 | Yes |
| `vendorsubsidiaryrelationship` | List | Full | Yes | Yes | 0 | 15 | 13 | Yes |

### W

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `wave` | Txn | Read, Create, Upda.. | Yes | Yes | 21 | 0 | 0 | No |
| `website` | Webs | Full | - | Yes | 12 | 0 | 0 | Yes |
| `winlossreason` | ? | N/A | - | Yes | 0 | 6 | 4 | Yes |
| `workflowactionscript` | Script | R+S | - | Yes | 6 | 36 | 37 | No |
| `workorder` | Txn | Full | Yes | Yes | 42 | 0 | 0 | Yes |
| `workorderclose` | Txn | Copy and Create No.. | - | Yes | 5 | 0 | 0 | Yes |
| `workordercompletion` | Txn | Copy and Create No.. | - | Yes | 5 | 0 | 0 | Yes |
| `workorderissue` | Txn | Copy and Create No.. | - | Yes | 4 | 0 | 0 | Yes |
| `workplace` | List | Full | Yes | Yes | 0 | 11 | 9 | Yes |

### Z

| Record ID | Cat | Level | CS | SS | Fields | Filters | Columns | Custom |
|-----------|-----|-------|----|----|--------|---------|---------|--------|
| `zone` | List | Full | Yes | Yes | 0 | 8 | 8 | No |
