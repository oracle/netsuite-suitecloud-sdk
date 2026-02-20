<p align="left"><a href="#"><img width="250" src="resources/Netsuite-logo-ocean-150-bg.png"></a></p>

# SuiteCloud Extension for Visual Studio Code

<a href="https://marketplace.visualstudio.com/items?itemName=Oracle.suitecloud-vscode-extension">
  <img src="https://img.shields.io/visual-studio-marketplace/i/oracle.suitecloud-vscode-extension.svg" alt="suitecloud-extension"/>
  <img src="https://img.shields.io/visual-studio-marketplace/v/oracle.suitecloud-vscode-extension.svg" alt="suitecloud-extension"/>
</a>

SuiteCloud Extension for Visual Studio Code is part of the SuiteCloud Software Development Kit (SuiteCloud SDK), a set of tools to customize your NetSuite accounts. SuiteCloud Extension for Visual Studio Code allows you to customize your SuiteCloud projects for NetSuite. The available SuiteCloud projects include **SuiteApp projects**—self-contained, standalone projects that you can publish in the SuiteApp Marketplace for other users to download and install, and **Account Customization Projects**—intended for customizations on accounts you own, such as your production, development, and sandbox accounts.

Read more about SuiteCloud SDK and SDF in <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_156026236161.html" rel="noopener noreferrer" target=blank>SuiteCloud SDK Overview</a> and <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4702656040.html" rel="noopener noreferrer" target=blank>SuiteCloud Development Framework Architecture</a>.

## Installation Prerequisites
The following software is required to work with SuiteCloud Extension for Visual Studio Code:
- Oracle JDK version 17 or 21
- VS Code version 1.106.0 or higher

Read the detailed list of prerequisites in <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_159223197655.html" rel="noopener noreferrer" target=blank>Installation Prerequisites for SuiteCloud Extension for Visual Studio Code</a>.

## Supported Versions
To ensure that you get the latest features and bug fixes, you should use the latest version of the SuiteCloud Extension for Visual Studio Code available in the Marketplace. 

The following table shows the extension versions currently available in the Marketplace.

| Extension Versions Available in the Marketplace |
|:-----------------------------------------------:|
| 3.1.2 |
| 3.1.1 |

## Installing SuiteCloud Extension for Visual Studio Code
To install SuiteCloud Extension for Visual Studio Code, follow these steps:

1. Launch Visual Studio Code and select the **Extensions** icon in the Activity Bar.
2. In the search field, enter **SuiteCloud Extension for Visual Studio Code**.
3. Click **Install**.
4. Restart Visual Studio Code after installation.

See more details about installation in <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159223155621.html" rel="noopener noreferrer" target=blank>Installing and Setting Up SuiteCloud Extension for Visual Studio Code</a>.

## Getting Started

### How to Trigger the Command Palette
Interact through the Command Palette to use SuiteCloud Extension for Visual Studio Code. To trigger it, click **View** > **Command Palette** or use the relevant shortcut:
* Ctrl+Shift+P if you are using Windows or Linux.
* Cmd+Shift+P if you are using macOS. 

<p align="center"><a href="#"><img src="resources/CommandPalette.png" alt="Command Palette" width="500" height="600"></a></p>

### How to Work with a SuiteCloud Project
To start working with a SuiteCloud project, you can do any of the following actions:
1. Create a SuiteCloud project. To do this, open the Command Palette, enter **SuiteCloud** and, from the dropdown list, select **SuiteCloud: Create Project**.
2. Open a SuiteCloud project. To do this, go to **File** > **Open Folder...** and select the root folder of your SuiteCloud project.

### How to Work with Multiple SuiteCloud Projects
To add a SuiteCloud project to an already opened Visual Studio Code window, go to **File** > **Add Folder To Workspace ...** and select the root folder of your SuiteCloud project. This lets you work with multiple SuiteCloud projects at the same time.

### Making a File Active in the Editor
For the extension to detect the working SuiteCloud project and run any command against it, you first need to select a file from the current workspace to make it active in the editor.

### Setting Up an Account
To start using your NetSuite accounts with SuiteCloud Extension for Visual Studio Code, you first need to set them up. The account set up includes adding an account to the extension and setting it as default. As a prerequisite to adding an account, a SuiteCloud project must be open in Visual Studio Code.  

To add an account, follow these steps:
1. Open the Command Palette.
2. Enter **SuiteCloud** and from the dropdown list, select **SuiteCloud: Set Up Account**.
3. Once the dropdown list is shown, select **New authentication ID**.
4. Once the dropdown list is shown, select one of the following options:
    * Browser-based authentication
    * Machine-to-machine authentication
5. In the text field, enter an authentication ID.
6. If you selected the browser-based authentication, press Enter to confirm your NetSuite domain and follow the instructions in the browser prompt. If you selected machine-to-machine authentication, do the following:
    * Enter the account ID.
    * Enter the certificate ID.
    * Select the private key file in the prompted file explorer. 
    
    Your account is successfully set up.

  
To set an account as default for a project, follow these steps:
1. Open the Command Palette.
2. Enter **SuiteCloud** and from the dropdown list, select **SuiteCloud: Set Up Account**.
3. From the dropdown list, select the authentication ID of the account you want to set as default.
The selected account is set as default for the project.

<p align="center">
  <img src="resources/SetUpAccount.gif" alt="animated" />
</p>

## SuiteCloud Commands

The following SuiteCloud commands are available through the Command Palette:

| Command | Description |
| --- | --- |
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147339580.html" rel="noopener noreferrer" target=blank>Add Dependency References to the Manifest</a>|Adds the defined dependencies to the Manifest file.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_0608124000.html" rel="noopener noreferrer" target=blank>Compare with Account File</a>|Compares a local file with its account version.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147328227.html" rel="noopener noreferrer" target=blank>Create SuiteScript Files</a>|Creates a SuiteScript file based on a script type template that also includes any modules you select to extend NetSuite and customize, search for, and process your data. |
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162938506015.html" rel="noopener noreferrer" target=blank>Create Project</a>|Creates SuiteCloud file-based projects to develop ACPs or SuiteApp projects for internal use or for commercial distribution.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147342366.html" rel="noopener noreferrer" target=blank>Deploy Project</a>|Deploys the folder containing the project. The project folder is zipped before deployment including only the files and folders referenced in the deploy.xml file. |
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_162930381001.html" rel="noopener noreferrer" target=blank>Import Files</a>|Imports files from a NetSuite account to your project. Note that you cannot import files from a SuiteApp.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147311996.html" rel="noopener noreferrer" target=blank>Import Objects</a>|Imports SDF custom objects from a NetSuite account to your project.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_163067396066.html" rel="noopener noreferrer" target=blank>List Files</a>|Lists the files in the File Cabinet of your account.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147311996.html" rel="noopener noreferrer" target=blank>List Objects</a>|Lists the SDF custom objects existing in your account.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_164630701111.html" rel="noopener noreferrer" target=blank>Manage Accounts</a>|Lets you manage the authentication IDs associated to your accounts by renaming or removing them. It also shows the details of any specific authentication ID.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147609118.html" rel="noopener noreferrer" target=blank>Set Up Account</a>|Adds the NetSuite accounts you want to customize. It also lets you set an account as default for a project.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_163067510539.html" rel="noopener noreferrer" target=blank>Update File from Account</a>|Overwrites the selected file in the project with the matching file in an account.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_161643514921.html" rel="noopener noreferrer" target=blank>Upload File</a>|Uploads files to the FileCabinet folder without requiring the deployment of the entire project. Files must be in an SDF supported FileCabinet folder.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_160147311996.html" rel="noopener noreferrer" target=blank>Update Object from Account</a>|Overwrites the selected SDF custom objects in the project with their matching objects imported from your account. In the case of custom records, custom instances can be included.|
|<a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_164563201243.html" rel="noopener noreferrer" target=blank>Validate Project</a>|Validates a project against your NetSuite account. Only the files and folders referenced in the deploy.xml file are validated.|

To read more about what you can do with SuiteCloud Extension for Visual Studio Code, visit <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_159223173518.html" rel="noopener noreferrer" target=blank>SuiteCloud Extension for Visual Studio Code Usage</a>.

## SuiteCloud Developer Assistant Using Cline in SuiteCloud Extension for VS Code

You can now configure the SuiteCloud Developer Assistant using Cline in SuiteCloud Extension for Visual Studio Code (VS Code). SuiteCloud Developer Assistant is an AI-powered coding assistant designed for SuiteCloud developers. Integrated with Visual Studio Code through the Cline extension, it uses advanced language models specialized for SuiteCloud and SuiteScript to support NetSuite customization tasks. With SuiteCloud Developer Assistant, you can:
  * Get real-time, context-aware coding assistance within your SuiteCloud projects
  * Generate SuiteScript 2.1 code based on your input
  * Create and manage XML custom objects to speed up development
  * Work within your existing VS Code and Cline setup for a consistent workflow
  * Approve all the suggested tasks before they are implemented

To set up SuiteCloud Developer Assistant:
1.  Open Visual Studio Code with the SuiteCloud Extension installed and click the SuiteCloud Developer Assistant welcome message to go to the extension settings.

    This will take you to Settings > Workspace tab > Extensions > SuiteCloud.

2.  Next, configure the fields as follows:
    * **Developer Assistant: Auth ID:** Enter the auth ID you want to use for the SuiteCloud Developer Assistant service.
    * **Developer Assistant: Local Port:** Autopopulated by default. Change it if you prefer a different port or if the default port is already in use.
    * **Developer Assistant: Enable:** Check the **Enable** box.

    During the initial setup, when you enable the SuiteCloud Developer Assistant service, a popup window appears displaying an API key. Copy it and follow the instructions provided.

3. In the activity bar, go to the Cline extension. Click the provider/model selector and configure the fields as follows:
      * **API Provider:** Select **OpenAI Compatible**.
      * **OpenAI Compatible API Key:** Paste the generated API key.
      * **Base URL:** Enter the URL provided by SuiteCloud Extension for VS Code during SuiteCloud Developer Assistant configuration. To see it again, refer to the SuiteCloud output panel.
      * **Model ID:** If this isn't autopopulated, enter **NetSuite**.
      * In **Model Configuration:**
        * Clear the **Supports Images** checkbox.
        * Set the **Context Window Size** to `1000000`.

You can start vibe-coding with SuiteCloud Developer Assistant.

Want more information? See <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_1121114206.html" rel="noopener noreferrer" target=blank>Setting up SuiteCloud Developer Assistant using Cline in SuiteCloud Extension for Visual Studio Code</a> and <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_1171315103" rel="noopener noreferrer" target=blank>SuiteCloud Developer Assistant Guide</a>. 

🎞 You can also watch the following video:

<a href="https://videohub.oracle.com/media/Setting+Up+SuiteCloud+Developer+Assistant+in+Visual+Studio+Code/1_0wbrln2u"><img src="resources/video_setting_up_suitecloud_developer_assistant.png" alt="Setting up SuiteCloud Developer Assistant in Visual Studio Code" width="400"></a>

## Using SuiteCloud Extension for Visual Studio Code with SuiteCloud CLI for Node.js
SuiteCloud CLI for Node.js is compatible with your Visual Studio Code integrated terminal, so you can run SuiteCloud CLI for Node.js commands directly there, independently from VS Code. To read more about it, visit <a href="https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/book_1558706016.html" rel="noopener noreferrer" target=blank>SuiteCloud CLI for Node.js</a>. 

## Release Notes & Documentation
To read the 2025.2 NetSuite's release notes and documentation, check the following sections of NetSuite's Help Center:
- Read the release notes for NetSuite 2025.2 in [SuiteCloud SDK Release Notes](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1558730192.html).
- Read the latest updates under SuiteCloud SDK in the [Help Center Weekly Updates](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_3798389663.html).
- Read the SuiteCloud Extension for Visual Studio Code documentation in [NetSuite's Help Center](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/book_159223417590.html).

## Contributing
SuiteCloud Extension for Visual Studio Code is an open source project. Pull Requests are currently not being accepted. See [Contributing](/CONTRIBUTING.md) for details.

## License
Copyright (c) 2021, 2023 Oracle and/or its affiliates The Universal Permissive License (UPL), version 1.0. See [License](./LICENSE) for details.

By installing SuiteCloud Extension for Visual Studio Code, you are accepting the installation of the SuiteCloud SDK dependency under the [Oracle Free Use Terms and Conditions](https://www.oracle.com/downloads/licenses/oracle-free-license.html) license.