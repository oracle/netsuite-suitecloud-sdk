# SuiteApp Control Center REST API Documentation

This repository contains the OpenAPI specification and Postman collection for
**SuiteApp Control Center REST API v1**. Use this API to create, publish, and
deprecate SuiteApp versions, list installations, and request installation upgrades.

## Available API resources

| API | OpenAPI specification | Postman collection |
| --- | --- | --- |
| SuiteApp Control Center v1 | [OpenAPI YAML](openapi/suiteapp-control-center-rest-v1.yaml) | [Postman JSON](postman/suiteapp-control-center-rest-v1.json) |

The OpenAPI specification describes the endpoints, request parameters, schemas,
and successful responses. The Postman collection provides configurable requests
for each operation.

## View the API reference

Download the OpenAPI YAML file and open it in an OpenAPI-compatible viewer or
[Swagger Editor](https://editor.swagger.io/) to explore the API.

## Prerequisites

- A NetSuite account with access to SuiteApp Control Center.
- REST Web Services and OAuth 2.0 enabled in the account.
- A user with an OAuth 2.0 role and the SuiteApp Management permission at the
  **Full** level.
- A NetSuite integration record configured for **Authorization Code Grant** and
  the **REST Web Services** scope.
- Postman to use the supplied collection.

For account and role setup, see
[Getting Started with OAuth 2.0](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771281570.html).

For integration setup, see
[Create Integration Records for Applications to Use OAuth 2.0](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157771733782.html).

## Use the Postman collection

### 1. Import the collection and store the client secret

Import `postman/suiteapp-control-center-rest-v1.json`
into Postman.

In Postman Local Vault, add a secret named `netsuiteClientSecret` with the
Consumer Secret / Client Secret from your integration record. The collection
already references it as `{{vault:netsuiteClientSecret}}`.

Keep client secrets and access tokens out of shared collection and environment
variables. See [Postman Vault](https://learning.postman.com/docs/use/postman-vault/use-vault-secrets)
for help using secrets.

### 2. Set collection variables

Select the collection and open **Variables**.

| Variable | Value |
| --- | --- |
| `accountId` | Your NetSuite account ID, for example `1234567`. Used to construct the default `companyUrl`. |
| `companyUrl` | Your NetSuite account's application URL, including `https://` and without a trailing slash. Defaults to `https://{{accountId}}.app.netsuite.com`; set it explicitly if your account uses a different URL. |
| `callbackUrl` | The OAuth 2.0 callback URL used by Postman. Must exactly match a Redirect URI on the integration record. |
| `clientId` | The Consumer Key / Client ID from the integration record. |
| `scope` | Leave set to `rest_webservices`. |
| `oauthState` | A unique random value of 22–1,024 printable ASCII characters. Generate a new value for each authorization flow. |
| `applicationId` | The SuiteApp application ID, for example `com.netsuite.example`. |
| `version` | The SuiteApp version to update or use as an upgrade target, for example `1.2.3`. |
| `companyIds` | A JSON array of target account IDs for upgrades, for example `["1234567", "7654321"]`. The default `[]` must be replaced with at least one account ID before requesting an upgrade. |

### 3. Authorize requests

1. Open the collection's **Authorization** tab.
2. Verify that the OAuth 2.0 settings resolve to your account and integration.
3. Select **Get New Access Token**.
4. Sign in with the role described in the prerequisites and approve access.
5. Select **Use Token** after authorization completes.

For callback configuration and browser authorization options, see
[OAuth 2.0 in Postman](https://learning.postman.com/docs/use/send-requests/authorization/oauth-20).

Copyright © 2026, Oracle and/or its affiliates. All rights reserved.
