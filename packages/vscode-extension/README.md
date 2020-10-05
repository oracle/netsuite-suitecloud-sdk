<p align="center"><a href="#"><img width="250" src="resources/oracle_netsuite_logo.png"></a></p>

# SuiteCloud Extension for Visual Studio Code
The SuiteCloud extension allows you to customize your SuiteCloud Development Framework (SDF) projects for NetSuite.

<img src="./resources/acpMain.png" alt="Account customization project">
<br><br>

SuiteCloud extension for Visual Studio Code is part of SuiteCloud SDK, a set of tools to customize NetSuite accounts.

💡 To read more about SuiteCloud SDK, visit [NetSuite's Help Center.](https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_156026236161.html)

## Installation prerequisites
The following software is required to work with SuiteCloud extension for Visual Studio Code:
- Node.js version 12.14.0 LTS or greater
- Oracle JDK version 11

Read the detailed list of prerequisites in [NetSuite's Help Center.](https://system.netsuite.com/app/help/helpcenter.nl?fid=section_159223197655.html)


## SuiteCloud Extension commands
The following commands are available through the Command Palette:

<img src="./resources/suitecloudCommandList.png" alt="List of SuiteCloud commands"> 
<br><br>

💡 To read more about what you can do with SuiteCloud extension for Visual Studio Code, visit <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=article_159223173518.html" target="_blank">NetSuite's Help Center</a>.

## SuiteCloud Extension combined with SuiteCloud CLI for Node.js
SuiteCloud CLI for Node.js is another open-source SuiteCloud SDK tool. This tool has more available commands that you can use in combination with the ones available in SuiteCloud extension for Visual Studio Code.

To work with both tools at the same time, do the following:
1. Install SuiteCloud CLI for Node.js by following the instructions <a href="../node-cli/README.md" target="_blank">here</a>.
2. Open a terminal inside of your SDF project, and enter:
   ```javascript
   suitecloud -h
   ```
3. You can now use SuiteCloud CLI for Node.js in your SDF projects while working in SuiteCloud extension for Visual Studio Code.

<img src="./resources/cliForNodejsDemo.gif" alt="SuiteCloud CLI for Node.js combined with SuiteCloud extension for Visual Studio Code">

## [Contributing](/CONTRIBUTING.md)
SuiteCloud Extension for Visual Studio Code is an open source project. Pull Requests are currently not being accepted. See [CONTRIBUTING](/CONTRIBUTING.md) for details.

## [License](/LICENSE.txt)
Copyright (c) 2020 Oracle and/or its affiliates The Universal Permissive License (UPL), Version 1.0.