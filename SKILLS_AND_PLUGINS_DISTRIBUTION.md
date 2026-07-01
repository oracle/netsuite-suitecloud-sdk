packages/
    agent-skills/           - SuiteCloud Agent Skills
        skill 1
        skill 2
        skill N...


packages/
    dev-skills/                      - SuiteCloud Agent Skills for Platform Development
        skill 1
        skill 2
        skill N...
    
    ai-connector-skills/             - SuiteCloud Agent Skills for NetSuite AI Connector
        skill 1
        skill 2
        skill N...
    
    ai-connector-anthropic/          - NetSuite AI Connector Companion Plugin for Claude Cowork
        .claude-plugin/plugin.json
        skills/                      - reference to ai-connector-skills
    
    ai-connector-openai/             - NetSuite AI Connector Plugin for ChatGPT
        .claude-plugin/plugin.json
        skills/                      - reference to ai-connector-skills
    
    dev-anthropic/                   - SuiteCloud Plugin for Claude Code
        .claude-plugin/plugin.json
        skills/                      - reference to dev-skills
        commands/
    
    dev-openai/                      - SuiteCloud Plugin for Codex
        .claude-plugin/plugin.json
        skills/                      - reference to dev-skills
        commands/


I want to publish and distribute Agent Skills and Plugins compatible with different AI platforms: skills under agentskills.io spec - platform agnostic, Claude Cowork plugin, Claude code plugin, Codex plugin and plugin for ChatGPT.
Skills will be shared amoung several plugins as well as some other plugin content.
Evaluate the following Git repository structure and explain if it is feasible for releasing targeted packages while avoiding code duplication.
I want to publish all plugins in the Anthropic and OpenAI official marketplaces.





package.json
resources/                           - static files
packages/
    agent-skills/                      - SuiteCloud Agent Skills
        skill 1
        skill 2
        skill N...
    ai-plugins/
        common/                          - All content that can be shared by AI plugins must go to this folder to avoid duplication
            /commands
            /hooks
            /agents

        claude-ai-connector/             - NetSuite AI Connector Companion
            .claude-plugin/plugin.json
            skills/                      - reference to ai-connector-skills
        
        chatgpt-ai-connector/            - NetSuite AI Connector Plugin for ChatGPT ????
            skills/                      - reference to ai-connector-skills
        
        claude-code/                      - SuiteCloud Plugin for Claude Code
            .claude-plugin/plugin.json
            skills/                      - reference to dev-skills
            /commands                    - reference to ai-plugins-common
            /hooks                       - reference to ai-plugins-common
            /agents                      - reference to ai-plugins-common
            /other                       - Claude Code specific folder
        
        codex/                       - SuiteCloud Plugin for Codex
            .codex-plugin/plugin.json
            /commands                    - reference to ai-plugins-common
            /hooks                       - reference to ai-plugins-common
            /agents                      - reference to ai-plugins-common
            /other                       - Codex specific folder

    node-cli/                        - this package is not related to AI Skills and Plugins
    uif-types/                       - this package is not related to AI Skills and Plugins
    unit-testing/                    - this package is not related to AI Skills and Plugins
    vscode-extension/                - this package is not related to AI Skills and Plugins

build scripts create packages for plugin distribution that consist from skills and other common/shared content




Hi Bryan,

I am Viktor, an engineering manager from NetSuite, leading the team that maintains SuiteCloud SDK repository in GitHub.
Thank you for opening a Pull Request to package SuiteCloud Agent Skills as Claude plugin. I would like to expalin to you the repo strtucture we would like to maintain, this should also clarify the reason for delaying the merge of you PR.

Our GitHub project is a monorepo with a set of development tools for SuiteCloud platform we distributed over the years, we are now introducing agent skills and plugins and have a proposal inplace which I want to confirm with you. This structure should be feasible for us to maintain long term while making the process of publishing and updating the artifacts in Antoropic official marketplace steamlined.

Below is the draft of the directory structure for the soruce files we would like to maintain. I am ommiting the packages that are not related to this conversation, also the names for the plugins and packages are not confirmed yet - they will likely change.

packages/
    agent-skills/                        - SuiteCloud Agent Skills, all skills will be maintained in this folder to avoid duplication and support indepenent installation
        skill 1
        skill 2
        skill N...
    ai-plugins/
        common/                          - All content that can be shared by AI plugins goes to this folder to avoid duplication
            /commands
            /hooks
            /agents

        claude-ai-connector/             - NetSuite AI Connector Companion (Claude Cowork Plugin)
            .claude-plugin/plugin.json
            skills/                      - reference to two AI connector related skills
            hooks/                       - reference to ai-plugins/common
        
        claude-code/                     - SuiteCloud Plugin for Claude Code
            .claude-plugin/plugin.json
            skills/                      - reference to development related skills
            commands/                    - reference to ai-plugins/common
            hooks/                       - reference to ai-plugins/common
            agents/                      - reference to ai-plugins/common


We are considering introducing build scripts for plugins to assemble the packages using the files from plugin root (plugin.json), agent-skills and ai-plugins/common (shared commands, hooks etc.) directories.
We want to publish distributable packages via GitHub release (or similar mechanism) and refrain from commiting release artifacts to the source control.

The result of running build scripts will be something like this:
- Agent Skills (installable via npx skills and as standalone zip files via GitHub release)
- NetSuite AI Connector Companion (Cowork plugin)
- SuiteCloud Plugin for Claude Code

Can you recommend an approach for publishing based on the proposed repository structure for these artifacts that will be compliant with Anthropic official marketplace publishing and update process?

P.S. We are exploring the option of using postInstall hook the plugin.json file to pull necessary shared resources from GitHub releases into the plugin. We will appreciate your advice on this approach.