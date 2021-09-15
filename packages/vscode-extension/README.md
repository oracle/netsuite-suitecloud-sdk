<p align="center"><a href="#"><img width="250" src="resources/oracle_netsuite_logo.png"></a></p>

# <font size="7"> <span style="color:gray"> **SuiteCloud Extension for Visual </br> Studio Code** </font> </span>
SuiteCloud Extension for Visual Studio Code is part of the SuiteCloud Software Development Kit (SuiteCloud SDK), a set of tools to customize your NetSuite accounts. The SuiteCloud Extension for Visual Studio Code allows you to customize your SuiteCloud Development Framework (SDF) projects for NetSuite. The available SDF projects include **SuiteApp projects** — self-contained, standalone projects that you can publish in the SuiteApp Marketplace for other users to download and install, and **Account Customization Projects** — intended for customizations on accounts you own, such as your production, development, and sandbox accounts.

Read more about SuiteCloud SDK and SDF in <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=chapter_156026236161.html" rel="noopener noreferrer" target=blank>Getting Started with SuiteCloud SDK</a> and <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_4702656040.html" rel="noopener noreferrer" target=blank>SuiteCloud Development Framework Architecture</a>.

## <font size="6"> <span style="color:gray"> Installation Prerequisites </font> </span>
The following software is required to work with SuiteCloud Extension for Visual Studio Code:
- Node.js version 14.16.0 LTS
- Oracle JDK version 11
- VS Code version 1.57 or higher

Read the detailed list of prerequisites in <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_159223197655.html" rel="noopener noreferrer" target=blank>Installation Requirements for SuiteCloud Extension for Visual Studio Code</a>.

## <font size="6"> <span style="color:gray"> Installing SuiteCloud Extension for Visual <br/> Studio Code </font> </span>
To install SuiteCloud Extension for Visual Studio Code, follow these steps:

1. Launch Visual Studio Code and select the **Extensions** icon in the Activity Bar.
2. In the search field, enter **SuiteCloud Extension for Visual Studio Code**.
3. Click **Install**.
4. Restart Visual Studio Code after installation.

See more details about installation in <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_159223197655.html" rel="noopener noreferrer" target=blank>Installing and Setting Up SuiteCloud Extension for Visual Studio Code</a>.

## <font size="6"> <span style="color:gray"> Getting Started </font> </span>

### <font size="5"> <span style="color:gray"> Active File in the Editor </font>
In order for the extension to detect the working SDF project and run the commands against it, you first need to select a file from the current workspace and make it active in the editor.

### <font size="5"> <span style="color:gray"> How to Trigger the Command Palette </font>
Interact through the Command Palette to use the SuiteCloud Extension for Visual Studio Code. To trigger it, click **View** > **Command Palette** or use the relevant shortcut:
* Ctrl+Shift+P if you are using Windows or Linux.
* Cmd+Shift+P if you are using MacOS. 

<p align="center"><a href="#"><img src="resources/CommandPalette.png" alt="Command Palette" width="500" height="600"></a></p>

### <font size="5"> <span style="color:gray"> Setting Up an Account </font> </span>
To start using your NetSuite accounts with the SuiteCloud Extension for Visual Studio Code, you first need to set them up. The account set up includes adding an account to the extension and setting it as default. 

To add an account, follow these steps:
1. Open the Command Palette.
2. Enter **SuiteCloud** and from the dropdown list, select **SuiteCloud: Set Up Account**.
3. Once the dropdown list is shown, select **New authentication ID**.
4. Once the dropdown list is shown, select one of the following options:
    * Browser-based authentication
    * Save a TBA token issued in NetSuite
5. In the text field, enter an authentication ID.
6. If you selected the browser-based authentication, press Enter to confirm your NetSuite domain and follow the instructions in the browser prompt. If you selected to save an issued TBA token, do the following:
    * Enter your account ID.
    * Enter the token ID of the TBA token you previously issued in NetSuite.
    * Enter the token secret of the TBA token you previously issued in NetSuite.
Your account is successfully set up. </br>

To set an account as default for a project, follow these steps:
1. Open the Command Palette.
2. Enter **SuiteCloud** and from the dropdown list, select **SuiteCloud: Set Up Account**.
3. From the dropdown list, select the authentication ID (authID) of the account you want to set as default.
The selected account is set as default for the project.

<p align="center">
  <img src="resources/SetUpAccount.gif" alt="animated" />
</p>

### <font size="5"> <span style="color:gray"> SuiteCloud Commands </font> </span>  

The following SuiteCloud commands are available through the Command Palette:

| Command | Description | Shortcut |
| --- | --- | --- |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_160147339580.html" rel="noopener noreferrer" target=blank>Add Dependency References to the Manifest</a>|Adds the defined dependencies to the Manifest file.| Ctrl+Shift+Alt+A |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_160147328227.html" rel="noopener noreferrer" target=blank>Create SuiteScript Files</a>|Creates a SuiteScript file based on a script type template that also includes any modules you select to extend NetSuite and customize, search for, and process your data. 
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_162938506015.html" rel="noopener noreferrer" target=blank>Create Project</a>|Creates SDF file-based projects to develop ACPs or SuiteApp projects for internal use or for commercial distribution.|
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_160147342366.html" rel="noopener noreferrer" target=blank>Deploy Project</a>|Deploys the folder containing the project. The project folder is zipped before deployment including only the files and folders referenced in the deploy.xml file. | Ctrl+Alt+D |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_162930381001.html" rel="noopener noreferrer" target=blank>Import Files</a>|Imports files from a NetSuite account to your project. Note that you cannot import files from a SuiteApp.| Ctrl+Alt+F |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_162971830372.html" rel="noopener noreferrer" target=blank>Import Objects</a>|Imports objects from a NetSuite account to your project.| Ctrl+Alt+O |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_.html" rel="noopener noreferrer" target=blank>List Files</a>|Lists the files in the File Cabinet of your account.|
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=subsect_163067396066.html" rel="noopener noreferrer" target=blank>List Objects</a>|Lists the SDF custom objects in your account.|
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=section_160147609118.html" rel="noopener noreferrer" target=blank>Set Up Account</a>|Adds the NetSuite accounts you want to customize. It also allows setting an account as default for a project.|
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=163067510539.html" rel="noopener noreferrer" target=blank>Update File from Account</a>|Overwrites the selected file in the project with the matching file in an account.|
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=subsect_160147414469.html" rel="noopener noreferrer" target=blank>Upload File</a>|Uploads files to the FileCabinet folder without requiring the deployment of the entire project. Files must be in an SDF supported FileCabinet folder.| Ctrl+Alt+U |
|<a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=subsect_160147382361.html" rel="noopener noreferrer" target=blank>Update Object from Account</a>|Overwrites the selected object in the project with the matching object in an account.| Ctrl+Shift+U |

To read more about what you can do with SuiteCloud Extension for Visual Studio Code, visit <a href="https://system.netsuite.com/app/help/helpcenter.nl?fid=article_159223173518.html" rel="noopener noreferrer" target=blank>SuiteCloud Extension for Visual Studio Code Usage</a>.

## <font size="6"> <span style="color:gray"> Using SuiteCloud Extension for Visual Studio </br> Code with SuiteCloud CLI for Node.js </font> </span>
SuiteCloud CLI for Node.js is compatible with your Visual Studio Code integrated terminal, so you can run SuiteCloud CLI for Node.js commands directly there, independently from VS Code. To read more about it, visit <a href="https://nlcorp.app.netsuite.com/app/help/helpcenter.nl?fid=book_1558706016.html" rel="noopener noreferrer" target=blank>SuiteCloud CLI for Node.js</a>. 

## <font size="6"> <span style="color:gray"> Contributing </font> </span>
SuiteCloud Extension for Visual Studio Code is an open source project. Pull Requests are currently not being accepted. See [Contributing](/CONTRIBUTING.md) for details.

## <font size="6"> <span style="color:gray"> License </font> </span>
Copyright (c) 2021 Oracle and/or its affiliates The Universal Permissive License (UPL), version 1.0. See [License](/LICENSE.txt) for details.
