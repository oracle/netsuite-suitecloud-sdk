# Vendor Bill Processing Time changelog

## Included in SuiteSkills 1.0.0

Component version: 0.2.5. Source version: 0.2.5.

Analyze NetSuite accounts-payable vendor bill lifecycle performance through the available MCP connector: days-to-pay including prepayment applications, first cash payment versus final settlement, approval duration, entry lag, payment-terms compliance, open-bill aging, trends and outliers. Use for AP processing-time, payment-speed, slow-vendor, or bill lifecycle questions and dashboards, including “invoice” when the context is AP. Read-only analytics; does not create or approve payments. Use payment prioritization when the user wants to decide which bills to pay next.

An explicit payment-link coverage gate applies before calculating first-payment/final-settlement timing. Sparse relationship evidence produces `PAYMENT_LINK_COVERAGE_INCOMPLETE` and linked-subset metrics rather than account-wide conclusions. Missing links are missing evidence, not zero-time or unpaid evidence.
