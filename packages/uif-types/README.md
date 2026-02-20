<p align="left"><a href="#"><img width="250" src="Netsuite-logo-ocean-150-bg.png"></a></p>

# NetSuite UI Framework TypeScript Type Declarations
This package provides TypeScript type declarations for the NetSuite UI Framework (UIF). Type declarations describe the
classes, methods, properties, and other APIs included in the framework. Type declarations allow the TypeScript compiler to validate the usage of these APIs and provide you with a rich IntelliSense experience in various IDEs.

## Prerequisites
You will need a SuiteApp project in TypeScript using the NetSuite UI Framework.

## Versioning
The NetSuite UI Framework and its TypeScript type declarations follow a versioning scheme where a new major version is released every 6 months. These major versions correspond to NetSuite versions as shown in the following table.

| Version in NPM | NetSuite Version |
|:--------------:|:----------------:|
|     5.0.X      |      2024.1      |
|     6.0.X      |      2024.2      |
|     7.0.X      |      2025.1      |
|     8.0.X      |      2025.2      |

## Installation
To use the NetSuite UI Framework TypeScript type declarations, follow these steps:
1. Add the `@oracle/netsuite-uif-types` dependency to `devDependencies` in your `package.json` and specify an appropriate version based on the NetSuite version you will be developing against. Make sure that a `typescript` dependency is included as well.
```json
"devDependencies": {
    "@oracle/netsuite-uif-types": "^8.0.0",
    "typescript": "^5.2.0"
}
```
2. Open your `tsconfig.json` and include `@oracle/netsuite-uif-types` as an additional type root.
```json
"compilerOptions": {
    "typeRoots": {
        "node_modules/@types",
        "node_modules/@oracle/netsuite-uif-types"
    }
}
```
3. Install the new dependencies.
```shell
npm i
```

## Contributing
This project is not currently accepting external contributions. For bugs or enhancement requests, please file a GitHub issue. If you think you’ve found a security vulnerability, do not raise a GitHub issue and follow the instructions in our [security policy](https://github.com/oracle/netsuite-suitecloud-sdk/blob/master/SECURITY.md).

## License
Copyright (c) 2024 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.
