'use strict';

const BaseCommandGenerator = require('./BaseCommandGenerator');
const NodeUtils = require('./../utils/NodeUtils');
const inquirer = require('inquirer');
const cliProgress = require('cli-progress');

const COMMAND_NAME = 'runtest';
const COMMAND_ALIAS = 'rt';
const COMMAND_DESCRIPTION = 'Run tests';
const IS_SETUP_REQUIRED = true;

module.exports = class RunTestCommandGenerator extends BaseCommandGenerator {

    constructor() {
        super(COMMAND_NAME, COMMAND_ALIAS, COMMAND_DESCRIPTION, IS_SETUP_REQUIRED);
    }

    _getCommandQuestions() {
        return [
            {
                type: 'list',
                name: 'folder',
                message: 'Choose the Test to run',
                choices: [
                    {
                        name: 'MyCustomRecordTest Suite',
                        value: ''
                    },
                    {
                        name: 'MyCustomRecordTest - Custom Record exists',
                        value: ''
                    },
                    {
                        name: 'MyCustomRecordTest - Custom Record with mandatory fields is created',
                        value: ''
                    }
                ]
            }
        ]
    }

    _executeAction() {
        inquirer.prompt(this._getCommandQuestions()).then(answers => {
            NodeUtils.println('Running MyCustomRecordTest#setup() step...', NodeUtils.COLORS.CYAN);
            const setupTaskBar = new cliProgress.Bar({ clearOnComplete: true}, cliProgress.Presets.shades_classic);
            setupTaskBar.start(100, 0);
            let timerId = setInterval(() => setupTaskBar.increment(10), 100);
            setTimeout(() => {
                clearInterval(timerId)
                setupTaskBar.stop();

                NodeUtils.println('MyCustomRecordTest#setup() step executed successfully', NodeUtils.COLORS.GREEN);
                NodeUtils.println('');
                NodeUtils.println('TEST EXECUTION:', NodeUtils.COLORS.CYAN);
                
                NodeUtils.println("=== Running MyCustomRecordTest -> 'Custom Record exists'", NodeUtils.COLORS.CYAN);
                const testCaseBar = new cliProgress.Bar({ clearOnComplete: true}, cliProgress.Presets.shades_classic);
                testCaseBar.start(100, 0);
                timerId = setInterval(() => testCaseBar.increment(10), 100);
                
                setTimeout(() => {
                    clearInterval(timerId)
                    testCaseBar.stop();
                    NodeUtils.println("MyCustomRecordTest - 'Custom Record exists' passed successfully!", NodeUtils.COLORS.GREEN);
                    NodeUtils.println('');
                    NodeUtils.println("=== Running MyCustomRecordTest - 'Custom Record with mandatory fields is created'", NodeUtils.COLORS.CYAN);
                    var testCaseBar2 = new cliProgress.Bar({ clearOnComplete: true}, cliProgress.Presets.shades_classic);
                    testCaseBar2.start(100, 0);
                    timerId = setInterval(() => testCaseBar2.increment(10), 100);
                    setTimeout(() => {
                        clearInterval(timerId)
                        testCaseBar2.stop();
                        NodeUtils.println("MyCustomRecordTest - 'Custom Record with mandatory fields is created' failed: Field 'description' is empty", NodeUtils.COLORS.RED);
                    }, 1100);
                    
                }, 1100);
            }, 1100);
        });
    }
};