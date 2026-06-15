# What Can I Build? — NetSuite Automation Examples Catalog

> Author: Oracle NetSuite
> Used by: `/idea` command and the NetSuite Specialist agent (Assisted mode)

## About This Catalog

This file is a curated library of real-world NetSuite automations, described in plain business language. It is used by the `/idea` command to match your description against known patterns, and by the specialist agent in Assisted mode to help you understand what's possible in NetSuite.

Each entry includes a plain-language description of the problem it solves, a short explanation of what the automation does, and a sample prompt you could type to request it. Technical details (script type, complexity, modules) are included at the bottom of each entry for the agent's reference.

Complexity ratings are honest:
- **Simple** — Typically a single script that responds to one event or runs on a schedule. A good starting point.
- **Medium** — Involves searching for records, conditional logic, or coordinating two scripts.
- **Advanced** — Involves multiple scripts or script types working together, or complex data processing.

---

## Category 1: Notifications & Alerts

These automations watch for conditions in your data and send alerts to the right people at the right time.

---

### PO Over-Budget Alert

**Business need:** Notify the purchasing manager whenever a Purchase Order is saved with a total that exceeds a set threshold.

**What it does:** When a Purchase Order is saved, the script checks the total amount. If it exceeds the configured threshold (for example, $10,000), it sends an email to the purchasing manager with a link to the record. The message includes the vendor name, PO number, and total amount so the manager can take action immediately.

**Example prompt:** "Send an email to the purchasing manager whenever a PO is saved for more than $10,000."

**Technical details:**
- Script type: User Event Script (afterSubmit)
- Complexity: Simple
- Key modules: N/record, N/email, N/runtime

---

### Credit Limit Exceeded Alert

**Business need:** Warn the sales team when a customer's outstanding balance goes over their approved credit limit.

**What it does:** After a new invoice or payment is posted against a customer account, the script compares the customer's current balance to their credit limit. If the balance exceeds the limit, an email is automatically sent to the customer's assigned sales rep with the balance and credit limit figures highlighted.

**Example prompt:** "Alert the sales rep when a customer's balance exceeds their credit limit."

**Technical details:**
- Script type: User Event Script (afterSubmit) on Invoice/Payment records
- Complexity: Simple
- Key modules: N/search, N/email, N/record

---

### Quote Approved or Rejected Notification

**Business need:** Let the sales rep know right away when their quote has been approved or rejected by a manager.

**What it does:** When the status of an Estimate (quote) changes to Approved or Rejected, the script sends an email to the sales rep who owns the quote. The email includes the customer name, quote amount, and the new status, so the rep can follow up without having to check NetSuite manually.

**Example prompt:** "Email the sales rep when their quote gets approved or rejected."

**Technical details:**
- Script type: User Event Script (afterSubmit) on Estimate record
- Complexity: Simple
- Key modules: N/record, N/email, N/search

---

### Daily New Orders Digest

**Business need:** Give the sales manager a morning summary of all orders received the previous day.

**What it does:** A scheduled job runs each morning and searches for all Sales Orders created the previous day. It compiles a formatted email listing each order with the customer name, order number, total, and sales rep, then sends it to the sales manager. This replaces the need to run a manual report each morning.

**Example prompt:** "Send the sales manager a daily email summary of all orders from the previous day."

**Technical details:**
- Script type: Scheduled Script
- Complexity: Medium
- Key modules: N/search, N/email, N/runtime

---

### Low Inventory Warning

**Business need:** Notify the purchasing team when an item's stock falls below its reorder point so they can place a new order before running out.

**What it does:** A scheduled job runs nightly and checks inventory levels across all active items. For any item where the quantity on hand drops below its defined reorder point, the script sends a notification email to the purchasing team listing the item name, current quantity, and reorder point. The email groups all affected items into one message rather than sending one per item.

**Example prompt:** "Send an email to purchasing when any item's inventory falls below its reorder point."

**Technical details:**
- Script type: Scheduled Script
- Complexity: Medium
- Key modules: N/search, N/email
- Note: Filters inactive items (`isinactive = F`) to avoid alerting on deactivated inventory

---

### Sales Rep Activity Reminder

**Business need:** Remind sales reps to follow up on open opportunities that haven't been updated in more than 14 days.

**What it does:** A weekly scheduled job searches for open Opportunities where the last modified date is more than 14 days ago. For each stale opportunity, the script sends the assigned sales rep a reminder email listing the opportunity name, customer, expected close date, and amount. Sales reps can update their notes directly from the reminder link.

**Example prompt:** "Remind sales reps every week about open opportunities they haven't touched in two weeks."

**Technical details:**
- Script type: Scheduled Script
- Complexity: Medium
- Key modules: N/search, N/email

---

## Category 2: Automations & Workflows

These automations take action on your behalf: creating records, assigning values, or updating data automatically based on rules you define.

---

### Auto-Create Purchase Order When Inventory Is Low

**Business need:** When an item drops below its reorder point, automatically create a draft Purchase Order for the preferred vendor so the purchasing team just needs to review and approve it.

**What it does:** A scheduled job checks inventory levels each night. For active items below their reorder point that have a preferred vendor set up, the script automatically creates a Purchase Order for the reorder quantity and leaves it in a Pending Approval status. The purchasing manager receives a notification and can open the PO directly to review and approve it.

**Example prompt:** "Automatically create a PO when an item's stock drops below its reorder point."

**Technical details:**
- Script type: Scheduled Script
- Complexity: Medium
- Key modules: N/search, N/record, N/email
- Note: Filters inactive items (`isinactive = F`) to avoid creating POs for deactivated products

---

### Auto-Assign Sales Rep by Customer Territory

**Business need:** When a new customer is created, automatically assign the correct sales rep based on the customer's state or region, so nothing falls through the cracks.

**What it does:** When a new Customer record is saved, the script reads the customer's billing state. It then looks up the correct sales rep for that state from a custom mapping (stored in a custom record or configuration list) and automatically sets the Sales Rep field on the customer. No manual assignment is needed.

**Example prompt:** "Automatically assign a sales rep to new customers based on their state."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Customer record
- Complexity: Medium
- Key modules: N/record, N/search

---

### Auto-Calculate Gross Margin on a Sales Order

**Business need:** Show the gross margin percentage directly on each Sales Order so sales reps and managers can see profitability at a glance without building a separate report.

**What it does:** Whenever a Sales Order line is added or changed, the script automatically calculates the gross margin percentage for each line ((price − cost) ÷ price) and writes it to a custom field on the line. It also calculates a weighted overall margin for the entire order and writes it to a header-level custom field. Both values update in real time as the sales rep builds the order.

**Example prompt:** "Calculate and show the margin percentage on each line of a Sales Order."

**Technical details:**
- Script type: Client Script (fieldChanged, validateLine) + User Event Script (beforeSubmit) for server-side save
- Complexity: Medium
- Key modules: N/currentRecord (client), N/record (server)

---

### Auto-Close Old Open Estimates

**Business need:** Clean up the pipeline by automatically closing Estimates that haven't been converted to orders after 90 days, so the sales pipeline report reflects reality.

**What it does:** A scheduled job runs weekly and searches for Estimates in an open status (not yet converted to a Sales Order) with a creation date older than 90 days. The script changes their status to Closed — Not Won, adds a note explaining it was auto-closed, and optionally sends the sales rep a notification. This keeps the pipeline report accurate without managers having to manually clean it up.

**Example prompt:** "Automatically close quotes that are more than 90 days old and haven't converted."

**Technical details:**
- Script type: Map/Reduce Script
- Complexity: Medium
- Key modules: N/search, N/record, N/email

---

### Auto-Create a Follow-Up Task When an Opportunity is Created

**Business need:** Ensure every new sales opportunity has a follow-up activity assigned to it from day one, so no opportunity sits without a next step.

**What it does:** When a new Opportunity record is saved, the script automatically creates a Task record linked to the opportunity. The task is assigned to the opportunity's sales rep, due 3 business days from the opportunity creation date, and has a default subject of "Initial follow-up — [Opportunity Name]." The sales rep sees the task on their activities list immediately.

**Example prompt:** "When a new opportunity is created, automatically create a follow-up task for the sales rep."

**Technical details:**
- Script type: User Event Script (afterSubmit) on Opportunity record
- Complexity: Simple
- Key modules: N/record, N/task

---

### Auto-Populate Ship Date Based on Lead Time

**Business need:** When a Sales Order is created, automatically calculate and fill in the expected ship date based on the item's configured lead time, so customers and warehouse staff see a realistic date without manual entry.

**What it does:** When a Sales Order is saved, the script checks the lead time field on each item in the order. It adds the maximum lead time across all lines to today's date and sets the Ship Date field on the order header. If multiple items have different lead times, the script uses the longest one so the date represents the full order readiness.

**Example prompt:** "Automatically set the ship date on orders based on the longest item lead time."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Sales Order record
- Complexity: Simple
- Key modules: N/record, N/search

---

### Auto-Convert Lead to Customer After First Order

**Business need:** When a Lead places their first order, automatically promote them to a Customer record so they appear in customer-facing reports and processes.

**What it does:** When a Sales Order is created for an entity whose type is Lead or Prospect, the script automatically updates the entity's status to Customer — Closed Won and removes the Lead flag. This keeps the CRM pipeline accurate and ensures the new customer is immediately included in customer-level reporting and communication flows.

**Example prompt:** "Automatically convert a lead to a customer when they place their first order."

**Technical details:**
- Script type: User Event Script (afterSubmit) on Sales Order record
- Complexity: Simple
- Key modules: N/record

---

## Category 3: Validations & Controls

These automations enforce business rules at the point of data entry, preventing errors before they happen rather than cleaning them up after.

---

### Block Saving If Customer Is on Credit Hold

**Business need:** Prevent sales reps from creating new orders for customers who are on credit hold until the finance team resolves the balance.

**What it does:** When a user tries to save a Sales Order, the script checks whether the selected customer has a credit hold status. If the customer is on hold, the save is blocked and an error message is shown to the sales rep explaining that the customer's account is on hold and they should contact the finance team. The message includes the customer's current balance so the rep has context.

**Example prompt:** "Stop sales reps from saving orders for customers who are on credit hold."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Sales Order record
- Complexity: Simple
- Key modules: N/record, N/search, N/error

---

### Require Manager Approval for Large Discounts

**Business need:** Make sure any discount greater than 20% on a Sales Order needs a manager to approve it before the order can be confirmed.

**What it does:** When a Sales Order is submitted, the script checks the discount percentage on each line. If any line exceeds the maximum allowed discount (configurable, default 20%), the order status is changed to Pending Approval and the sales manager receives an email with a link to review and approve the order. The order cannot advance until the manager approves.

**Example prompt:** "Require a manager to approve any sales order with a line discount over 20%."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Sales Order record
- Complexity: Medium
- Key modules: N/record, N/email, N/error

---

### Prevent Duplicate Vendor Bills

**Business need:** Stop the same vendor invoice from being entered twice, which causes overpayments that are difficult to recover.

**What it does:** When a Vendor Bill is about to be saved, the script searches for existing bills from the same vendor with the same external reference number (vendor's invoice number). If a match is found, the save is blocked and the user sees an error message identifying the duplicate bill — including a link to the existing record — so they can review it rather than entering a second one.

**Example prompt:** "Block duplicate vendor bills from being saved if the same invoice number already exists."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Vendor Bill record
- Complexity: Medium
- Key modules: N/search, N/error

---

### Require a Custom Field Before Submission

**Business need:** Make a custom field mandatory only under certain conditions — for example, require a "Project Code" field when an expense category is set to "Billable."

**What it does:** When a record is saved, the script checks whether the condition is met (for example, Expense Category = Billable). If it is, and the required field is blank, the save is blocked and the user sees a clear error message explaining exactly which field is missing and why it's required. This is more flexible than making the field unconditionally mandatory in the field definition.

**Example prompt:** "Require the Project Code field only when the expense category is set to Billable."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Expense Report or custom record
- Complexity: Simple
- Key modules: N/record, N/error

---

### Block Negative Quantities on Item Fulfillments

**Business need:** Prevent warehouse staff from accidentally entering a negative quantity on an item fulfillment, which can corrupt inventory counts.

**What it does:** When an Item Fulfillment is saved, the script loops through each line and checks that the quantity is greater than zero. If any line has a zero or negative quantity, the save is blocked and the user sees a specific error pointing to the problem line. This catches data entry mistakes before they affect inventory balances.

**Example prompt:** "Block item fulfillments from being saved if any line has a zero or negative quantity."

**Technical details:**
- Script type: User Event Script (beforeSubmit) on Item Fulfillment record
- Complexity: Simple
- Key modules: N/record, N/error

---

## Category 4: Reports & Dashboards

These automations surface the right data to the right people — on-screen, in a portlet, or delivered automatically by email.

---

### Overdue Invoices by Aging Bucket

**Business need:** Give the collections team a clear view of all outstanding invoices grouped by how overdue they are (0–30 days, 31–60, 61–90, 90+) without building complex reports manually.

**What it does:** A saved search on the Invoice record type filters for open invoices and groups them by aging bucket using a formula. The result shows each invoice with the customer name, invoice number, original amount, amount due, and days overdue. The search can be pinned to a dashboard or used as the basis for a collections workflow.

**Example prompt:** "Create a saved search showing overdue invoices sorted by how many days they're past due."

**Technical details:**
- Script type: Suitelet (Saved Search Creator pattern — SDF cannot create saved searches from hand-written XML; a one-time Suitelet uses N/search to create the search programmatically, then the search is imported into the SDF project for ongoing management)
- Complexity: Simple
- Key modules: N/search, N/ui/serverWidget

---

### Team Pipeline Summary Portlet

**Business need:** Give sales managers a live dashboard view showing each rep's open pipeline — number of opportunities, total estimated value, and weighted value — all in one place.

**What it does:** A Portlet Script runs whenever the manager loads their dashboard and queries the Opportunity record type, grouping results by sales rep. It builds a formatted table showing each rep's name, number of open opportunities, total pipeline value, and probability-weighted value. The portlet refreshes automatically each time the dashboard is loaded.

**Example prompt:** "Add a portlet to the sales manager's dashboard showing each rep's pipeline summary."

**Technical details:**
- Script type: Portlet Script
- Complexity: Medium
- Key modules: N/search, N/ui/serverWidget (portlet)

---

### Weekly Sales Performance Email Report

**Business need:** Send the sales manager a weekly summary of each rep's sales performance — orders taken, revenue, and comparison to the same period last week — without requiring anyone to run a manual report.

**What it does:** A scheduled script runs every Monday morning and queries Sales Order data for the prior week. It groups results by sales rep and calculates total orders, total revenue, and the change versus the prior week. The results are formatted into an HTML email table and sent to the sales manager. Historical data is retrieved from saved searches so no custom reporting tables are needed.

**Example prompt:** "Email the sales manager a weekly report of each rep's sales for the prior week."

**Technical details:**
- Script type: Scheduled Script
- Complexity: Medium
- Key modules: N/search, N/email

---

### Open Work Orders by Status

**Business need:** Show the production team a live list of all open Work Orders grouped by their current status so they can see at a glance what's in progress, what's delayed, and what's waiting on materials.

**What it does:** A saved search on the Work Order record type filters for orders that are not yet complete and groups them by status. The results show the work order number, item being produced, quantity, expected completion date, and responsible employee. The search can be added to a manufacturing dashboard for always-current visibility.

**Example prompt:** "Create a saved search showing open work orders grouped by status for the production team."

**Technical details:**
- Script type: Suitelet (Saved Search Creator pattern — SDF cannot create saved searches from hand-written XML; a one-time Suitelet uses N/search to create the search programmatically, then the search is imported into the SDF project for ongoing management)
- Complexity: Simple
- Key modules: N/search, N/ui/serverWidget

---

## Category 5: UI Enhancements

These automations change how NetSuite looks or behaves for users — adding buttons, showing additional information, or making forms smarter and easier to use.

---

### PDF Quote Generator Button on Sales Order

**Business need:** Give sales reps a one-click button on the Sales Order form that generates a branded PDF quote they can immediately email to the customer.

**What it does:** A custom button labeled "Generate Quote PDF" is added to the Sales Order form. When the rep clicks it, the button calls a server-side script that merges the Sales Order data into a custom PDF template (using advanced PDF/HTML), then opens the resulting PDF in a new browser tab. The rep can save the PDF or attach it to an email directly from their browser. The PDF uses the company's branded template rather than the default NetSuite printout.

**Example prompt:** "Add a button to Sales Orders that generates a branded PDF quote the sales rep can email to the customer."

**Technical details:**
- Script type: Client Script (button) + Suitelet (server-side PDF generation)
- Complexity: Advanced
- Key modules: N/currentRecord, N/url (client); N/record, N/render, N/file (server)

---

### Custom Tab on Customer Record Showing Related Cases

**Business need:** Show customer support staff all open support cases for a customer directly on the Customer record so they can see the full picture without switching to a separate screen.

**What it does:** A custom tab labeled "Support Cases" is added to the Customer record form using a custom sublist. When the Customer record is opened, the script runs a search for all Cases linked to that customer and displays them in the sublist showing case number, subject, status, priority, and assigned agent. Staff can click any case to navigate directly to it.

**Example prompt:** "Add a tab to the Customer record that shows all open support cases for that customer."

**Technical details:**
- Script type: User Event Script (beforeLoad). Adds sublist with search results.
- Complexity: Medium
- Key modules: N/record, N/search, N/ui/serverWidget

---

### Show or Hide Fields Based on Another Field's Value

**Business need:** Keep forms clean by showing additional fields only when they're relevant — for example, only show "Return Reason" when the order type is set to "Return."

**What it does:** A Client Script watches a specified field (for example, Order Type) for changes. When the value matches a defined condition (for example, equals "Return"), the script makes one or more other fields visible on the form. When the condition is not met, those fields are hidden. This prevents clutter and reduces data entry errors without removing the fields from the record type entirely.

**Example prompt:** "Show the Return Reason field only when the order type is set to Return."

**Technical details:**
- Script type: Client Script (fieldChanged, pageInit)
- Complexity: Simple
- Key modules: N/currentRecord, N/ui/message (optional, for guidance text)

---

### Auto-Populate Address from Customer on Related Records

**Business need:** When creating a new Sales Order or Estimate for a customer, automatically fill in the shipping address from the customer's default address so the rep doesn't have to type it every time.

**What it does:** A Client Script responds to the customer field being set on the Sales Order or Estimate form. It looks up the customer's default shipping address and populates the shipping address fields on the form automatically. If the customer has multiple addresses, the script selects the one marked as the default shipping address. The rep can still override the address manually if needed.

**Example prompt:** "Automatically fill in the shipping address on a Sales Order when the customer is selected."

**Technical details:**
- Script type: Client Script (fieldChanged)
- Complexity: Simple
- Key modules: N/currentRecord, N/search

---

### Inline Approval Button on a Custom Record

**Business need:** Let approvers approve or reject a custom workflow request (such as a capital expenditure request) directly from the record with a single button click, instead of navigating through a workflow task screen.

**What it does:** Two buttons — "Approve" and "Reject" — are added to the custom record form. Clicking Approve sets the Status field to Approved and records the approver's name and timestamp in an audit field. Clicking Reject opens a small popup asking for a rejection reason, then sets the status to Rejected and stores the reason. In both cases, the submitter receives an email notification with the outcome.

**Example prompt:** "Add Approve and Reject buttons to my capital expenditure request form so approvers can act directly from the record."

**Technical details:**
- Script type: Client Script (button handlers) + User Event Script (afterSubmit for notifications)
- Complexity: Medium
- Key modules: N/currentRecord, N/url (client); N/record, N/email (server)

---

## Category 6: SDF Deployment Utilities

These automations solve limitations of the SuiteCloud Development Framework (SDF) by providing runtime support for objects that cannot be fully authored in XML.

---

### Saved Search Creator Suitelet

**Business need:** Deploy saved searches as part of an SDF project when SDF cannot create them from hand-written XML — the `<savedsearch>` definition requires a system-generated binary blob that only NetSuite can produce.

**What it does:** A one-time Suitelet that creates saved searches programmatically using the N/search module. It requires login, uses Current Role or a least-privilege custom execution role by default, and is limited to an explicit admin/developer audience when elevated execution is required. When an authorized user navigates to the Suitelet URL and clicks "Create Saved Search," the script creates the search with the specified filters, columns, title, and script ID without making it public by default. After the search exists in the account, it can be imported into the SDF project using `suitecloud object:import` for ongoing lifecycle management. The Suitelet is then deactivated.

**Example prompt:** "Create a saved search for open Sales Orders with Pending Fulfillment status, deployed via SDF."

**Technical details:**
- Script type: Suitelet (onRequest)
- Complexity: Simple
- Key modules: N/search, N/ui/serverWidget
- Deployment: omit `<runasrole>` for Current Role execution, or use a least-privilege custom role with explicit `<audslctrole>` audience entries; never pair elevated execution with `<allroles>T</allroles>`
- Post-creation: Import with `suitecloud object:import --type savedsearch --scriptid customsearch_xxx --destinationfolder /Objects`
- See SKILL.md Pitfall #125 and #134 for full details

---

*End of Examples Catalog — 28 examples across 6 categories.*
