/*
 ** Copyright (c) 2026 Oracle and/or its affiliates. All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
'use strict';

jest.mock('../../../sdk-core/build/services/http/SuiteCloudRequestService', () => ({
	sendSuiteCloudRequest: jest.fn(),
}));

const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const AdmZip = require('adm-zip');
const { sendSuiteCloudRequest } = require('../../../sdk-core/build/services/http/SuiteCloudRequestService');
const { executeProjectCommand } = require('@oracle/suitecloud-sdk-core').commands;
const { formatAnalyzerReport } = require('../../../sdk-core/build/commands/project/result/AnalyzerReportFormatter');

function report(results = [{ ruleId: 'public-record', message: { id: 'default', arguments: ['customer'] }, locations: [{
	physicalLocation: { artifactLocation: { uri: 'Objects/customrecord_customer.xml' }, region: { startLine: 8, startColumn: 2 } },
}] }]) {
	return { version: '2.1.0', runs: [{
		tool: { driver: { name: 'SuiteApp Analyzer', rules: [{ id: 'public-record',
			defaultConfiguration: { level: 'error' }, messageStrings: { default: { text: 'Restrict access to {0}.' } },
		}] } },
		invocations: [{ executionSuccessful: true }], results,
	}] };
}

function execute(payload, options = {}) {
	return executeProjectCommand({ command: 'validate', projectFolder: '/project', hostName: 'test.invalid',
		accessToken: 'test-token', params: { analyze: true }, ...options }, {
		createProjectArchive: async () => '/project.zip', deleteFile: async () => {},
		sendProjectRequest: async () => ({ statusCode: 200, body: JSON.stringify(payload) }),
	});
}

describe('SuiteApp Analyzer validation contract', () => {
	it('renders rule-derived severity, message arguments and locations without failing validation', async () => {
		const result = await execute({ steps: [], validationResults: [], analyzerReport: report() });
		expect(result.status).toBe('SUCCESS');
		expect(result.data).toEqual(expect.arrayContaining(['Objects/customrecord_customer.xml', '  ERROR: Security finding (8:2)', '    Restrict access to customer.', '    Rule: public-record']));
		expect(result.data).toContain('1 error · 0 warnings');
	});

	it('retains the full SARIF report in JSON mode', async () => {
		const analyzerReport = report();
		const result = await execute({ steps: [], analyzerReport }, { rawOutput: true });
		expect(result.status).toBe('SUCCESS');
		expect(result.data.analyzerReport).toEqual(analyzerReport);
		expect(result.data.summary).toEqual({ action: 'validate', status: 'SUCCESS' });
		expect(JSON.stringify(result.data)).not.toContain('To run SDF validation only,');
	});

	it.each([false, true])('fails clearly on an older server, rawOutput=%s', async (rawOutput) => {
		const result = await execute({ steps: [], validationResults: [] }, { rawOutput });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages.join('\n')).toContain('server returned no analyzerReport');
		if (rawOutput) expect(JSON.parse(result.errorMessages[0]).summary.status).toBe('FAILED');
	});

	it('also rejects a legacy SDK-style success that omitted requested analysis', async () => {
		const result = await execute({ status: 'SUCCESS', data: [] });
		expect(result.status).toBe('ERROR');
	});

	it.each([null, {}, { version: '2.1.0', runs: [] }, { version: '2.1.0', runs: [null] }])(
		'rejects a missing or malformed report: %j', async (analyzerReport) => {
			expect((await execute({ steps: [], analyzerReport })).status).toBe('ERROR');
		});

	it.each([false, true])('rejects incomplete scans, rawOutput=%s', async (rawOutput) => {
		const analyzerReport = report();
		analyzerReport.runs[0].invocations[0].executionSuccessful = false;
		const result = await execute({ steps: [], analyzerReport }, { rawOutput });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages.join('\n')).toContain('did not complete successfully');
	});

	it('preserves validation errors while reporting missing analysis', async () => {
		const result = await execute({ steps: [], errorMessage: 'Invalid manifest' });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages.join('\n')).toContain('Invalid manifest');
		expect(result.errorMessages.join('\n')).toContain('no analyzerReport');
	});

	it('leaves explicit validation-only execution compatible with older servers', async () => {
		expect((await execute({ steps: [] }, { params: { skipAnalysis: true } })).status).toBe('SUCCESS');
	});

	it('handles multiple runs and findings with no locations', () => {
		const analyzerReport = report([{ level: 'note', message: { text: 'Review configuration' } }]);
		analyzerReport.runs.push(...report([{ level: 'warning', ruleId: 'unlocked', message: { text: 'Lock object' } }]).runs);
		expect(formatAnalyzerReport(analyzerReport)).toEqual(expect.arrayContaining(['  NOTE: Security finding', '    Review configuration']));
		expect(formatAnalyzerReport(analyzerReport)).toEqual(expect.arrayContaining(['  WARNING: Security finding', '    Lock object', '    Rule: unlocked']));
	});

	it('reports a completed scan with no findings', async () => {
		const result = await execute({ steps: [], analyzerReport: report([]) });
		expect(result.status).toBe('SUCCESS');
		expect(result.data).toContain('No security findings were reported by the enabled Analyzer rules.');
	});
});

describe('Analyzer ZIP transport', () => {
	let projectFolder;
	beforeEach(async () => {
		projectFolder = await mkdtemp(join(tmpdir(), 'suitecloud-analyzer-test-'));
		await mkdir(join(projectFolder, 'Objects'));
		await writeFile(join(projectFolder, 'manifest.xml'), '<manifest projecttype="SUITEAPP"><publisherid>com.example</publisherid><projectid>app</projectid><projectversion>1.0.0</projectversion></manifest>');
		await writeFile(join(projectFolder, 'deploy.xml'), '<deploy><objects><path>~/Objects/*</path></objects></deploy>');
		await writeFile(join(projectFolder, 'Objects', 'customrecord_customer.xml'), '<customrecordtype scriptid="customrecord_customer"/>');
		sendSuiteCloudRequest.mockReset();
		sendSuiteCloudRequest.mockResolvedValue({ statusCode: 200, headers: {}, body: Buffer.from(JSON.stringify({ steps: [], analyzerReport: report() })) });
	});
	afterEach(async () => { await rm(projectFolder, { recursive: true, force: true }); });

	it('archives the local project and sends authenticated multipart validation with analyze=true', async () => {
		const result = await executeProjectCommand({ command: 'validate', projectFolder, hostName: 'test.invalid',
			accessToken: 'test-token', params: { analyze: true }, rawOutput: true });
		expect(result.status).toBe('SUCCESS');
		const request = sendSuiteCloudRequest.mock.calls[0][0];
		expect(request.accessToken).toBe('test-token');
		expect(request.path).toBe('/api/internal/sdf/v1/projects?applyinstallprefs=F&accountspecificvalues=ERROR&analyze=true');
		expect(request.headers['Sdf-Action']).toBe('validate');
		expect(request.timeoutMs).toBe(20 * 60 * 1000);
		const zipStart = request.body.indexOf(Buffer.from('PK\x03\x04', 'binary'));
		const boundary = request.headers['Content-Type'].split('boundary=')[1];
		const zipEnd = request.body.indexOf(Buffer.from(`\r\n--${boundary}`), zipStart);
		const zip = new AdmZip(request.body.subarray(zipStart, zipEnd));
		expect(zip.readAsText('Objects/customrecord_customer.xml')).toContain('customrecord_customer');
		expect(request.body.toString('utf8')).toContain('name="action"\r\n\r\nvalidate');
	});

	it.each(['analyze', 'validate'])('sends correct independent action/skip contract for %s', async command => {
		await executeProjectCommand({ command, projectFolder, hostName: 'test.invalid', accessToken: 'test-token', params: command === 'validate' ? { skipAnalysis: true } : {} });
		const request = sendSuiteCloudRequest.mock.calls[0][0];
		expect(request.headers['Sdf-Action']).toBe(command);
		expect(request.body.toString('utf8')).toContain('name="action"\r\n\r\n' + command);
		if (command === 'analyze') expect(request.path).toBe('/api/internal/sdf/v1/projects');
		else {
			expect(request.path).toContain('skipanalysis=true');
			expect(request.path).not.toContain('&analyze=');
			expect(request.timeoutMs).toBe(5 * 60 * 1000);
		}
	});

	it.each([['deploy', true], ['preview', true]])('does not send analyze for %s / %s', async (command, analyze) => {
		await executeProjectCommand({ command, projectFolder, hostName: 'test.invalid', accessToken: 'test-token', params: { analyze } });
		expect(sendSuiteCloudRequest.mock.calls[0][0].path).not.toContain('analyze=');
		expect(sendSuiteCloudRequest.mock.calls[0][0].timeoutMs).toBe(5 * 60 * 1000);
	});
});

describe('POC independent analysis flows', () => {
	it.each([false, true])('keeps validation failure and completed findings, JSON=%s', async rawOutput => {
		const payload = { validationStatus: 'FAILED', analysisStatus: 'COMPLETED', errorMessage: 'Invalid SDF object',
			steps: [], validationResults: [{ type: 'ERROR', message: 'Missing dependency' }], analyzerReport: report() };
		const result = await execute(payload, { params: {}, rawOutput });
		expect(result.status).toBe('ERROR');
		if (rawOutput) {
			const json = JSON.parse(result.errorMessages[0]);
			expect(json.errorMessage).toBe('Invalid SDF object');
			expect(json.analyzerReport).toEqual(payload.analyzerReport);
			expect(json.analysisStatus).toBe('COMPLETED');
		} else {
			expect(result.errorMessages.join('\n')).toContain('Restrict access to customer.');
			expect(result.errorMessages.join('\n')).toContain('Missing dependency');
		}
	});
	it('runs analysis by default and fails against servers without the POC contract', async () => {
		expect((await execute({ steps: [] }, { params: {} })).status).toBe('ERROR');
		expect((await execute({ steps: [], analyzerReport: report() }, { params: {} })).status).toBe('SUCCESS');
	});
	it('retains successful validation when analysis execution fails', async () => {
		const result = await execute({ steps: [], validationStatus: 'PASSED', analysisStatus: 'FAILED', analysisError: 'Analysis timed out' });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages).toContain('SDF validation: PASSED');
		expect(result.errorMessages).toContain('ERROR: Analysis timed out');
	});
	it('renders standalone analysis without claiming SDF validation ran', async () => {
		const result = await execute({ validationStatus: 'NOT_RUN', analysisStatus: 'COMPLETED', analyzerReport: report() }, { command: 'analyze', params: {} });
		expect(result.status).toBe('SUCCESS');
		expect(result.data[0]).toBe('SuiteApp analysis completed');
		expect(result.data[1]).toBe('1 error · 0 warnings');
		expect(result.data.join('\n')).not.toMatch(/SDF validation:|Validation Results:|Status: SUCCESS|SUMMARY|SuiteApp Analyzer:|SuiteApp analysis findings|--skip-analysis/);
		expect(result.data.at(-1)).toBe('Analyzer findings are advisory. Analysis does not establish deployment readiness.');
	});
	it('reports explicit skip and account-customization applicability', async () => {
		const result = await execute({ steps: [], validationStatus: 'PASSED', analysisStatus: 'SKIPPED', analysisReason: 'Not applicable to account customization projects.' }, { params: {} });
		expect(result.status).toBe('SUCCESS');
		expect(result.data.join('\n')).toContain('Not applicable to account customization projects.');
	});
	it.each(['validate', 'analyze'])('rejects conflicting options before packaging for %s', async command => {
		const createProjectArchive = jest.fn();
		const result = await executeProjectCommand({ command, projectFolder: '/project', hostName: 'test.invalid', accessToken: 'token', params: { analyze: true, skipAnalysis: true } }, { createProjectArchive });
		expect(result.status).toBe('ERROR');
		expect(createProjectArchive).not.toHaveBeenCalled();
	});
	it('does not accept a skipped standalone scan as success', async () => {
		expect((await execute({ analysisStatus: 'SKIPPED' }, { command: 'analyze', params: {} })).status).toBe('ERROR');
	});
	it('does not crash when a rule-index catalog contains missing entries', () => {
		const sarif = report([{ ruleIndex: 1, message: { text: 'hello' } }]);
		sarif.runs[0].tool.driver.rules = [null, { id: 'indexed', shortDescription: { text: 'Indexed rule' }, defaultConfiguration: { level: 'note' } }];
		expect(formatAnalyzerReport(sarif)).toContain('  NOTE: Indexed rule');
	});
	it('groups findings deterministically and wraps long descriptions', () => {
		const a = { ruleId: 'a', message: { text: 'Repeated warning message '.repeat(15) }, locations: [{ physicalLocation: { artifactLocation: { uri: 'Objects/a.xml' } } }] };
		const b = { ...a, ruleId: 'b', locations: [{ physicalLocation: { artifactLocation: { uri: 'Objects/b.xml' } } }] };
		const output = formatAnalyzerReport(report([b, a]));
		expect(output).toEqual(formatAnalyzerReport(report([a, b])));
		expect(output.filter(line => line.startsWith('    ') && !line.startsWith('    Rule:')).every(line => line.length <= 100)).toBe(true);
	});
});

describe('Compact Analyzer presentation', () => {
	it('keeps both statuses for combined validation', async () => {
		const result = await execute({ validationStatus: 'PASSED', analysisStatus: 'COMPLETED', analyzerReport: report() });
		expect(result.data).toEqual(expect.arrayContaining(['SDF validation', 'SDF validation: PASSED', 'SuiteApp analysis', 'SuiteApp Analyzer: COMPLETED']));
		expect(result.data).not.toContain('SuiteApp analysis findings');
	});

	it.each(['PASSED', 'FAILED'])('separates SDF diagnostics from analysis and offers the skip hint when validation %s', async validationStatus => {
		const result = await execute({ validationStatus, analysisStatus: 'COMPLETED', analyzerReport: report(),
			steps: [{ name: 'MANIFEST_VALIDATION', status: validationStatus === 'PASSED' ? 'SUCCESSFUL' : 'FAILED' }],
			validationResults: [{ type: 'WARNING', message: 'SDF-only warning' }] });
		const lines = validationStatus === 'PASSED' ? result.data : result.errorMessages;
		expect(lines.indexOf('SDF validation')).toBeLessThan(lines.indexOf('SDF validation: ' + validationStatus));
		expect(lines.indexOf('SDF validation: ' + validationStatus)).toBeLessThan(lines.findIndex(line => line.includes('Step 1:')));
		const analysisIndex = lines.indexOf('SuiteApp analysis');
		expect(analysisIndex).toBeGreaterThan(lines.findIndex(line => line.includes('SDF-only warning')));
		expect(lines.slice(analysisIndex - 2, analysisIndex + 2)).toEqual(['', '------------------------------------------------------------', 'SuiteApp analysis', 'SuiteApp Analyzer: COMPLETED']);
		expect(lines.at(-1)).toBe('To run SDF validation only, use project:validate --skip-analysis.');
	});

	it('offers the skip hint after an analysis execution failure without hiding it', async () => {
		const result = await execute({ validationStatus: 'PASSED', analysisStatus: 'FAILED', analysisError: 'Service unavailable' });
		expect(result.errorMessages).toContain('ERROR: Service unavailable');
		expect(result.errorMessages.at(-1)).toContain('project:validate --skip-analysis');
	});

	it('does not suggest skipping analysis when already skipped', async () => {
		const result = await execute({ validationStatus: 'PASSED', analysisStatus: 'SKIPPED', analysisReason: 'Analysis was explicitly skipped.' }, { params: { skipAnalysis: true } });
		expect(result.data).toContain('SuiteApp analysis');
		expect(result.data.join('\n')).toContain('Analysis was explicitly skipped.');
		expect(result.data.join('\n')).not.toContain('To run SDF validation only,');
	});

	it('labels standalone execution failure without claiming completion', async () => {
		const result = await execute({ analysisStatus: 'FAILED', analysisError: 'Service unavailable' }, { command: 'analyze', params: {} });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages[0]).toBe('SuiteApp analysis failed');
		expect(result.errorMessages).toContain('ERROR: Service unavailable');
		expect(result.errorMessages.join('\n')).not.toContain('completed');
	});

	it('shows nonzero notes and none-level findings without dropping the advisory on clean reports', () => {
		const output = formatAnalyzerReport(report([
			{ level: 'warning', message: { text: 'Check this' } },
			{ level: 'note', message: { text: 'Review this' } },
			{ level: 'none', message: { text: 'Other finding' } },
		]));
		expect(output).toContain('0 errors · 1 warning · 1 note · 1 unclassified finding');
		const clean = formatAnalyzerReport(report([]));
		expect(clean).toContain('0 errors · 0 warnings');
		expect(clean.at(-1)).toContain('Analysis does not establish deployment readiness.');
	});

	it('leaves standalone JSON free of presentation changes', async () => {
		const analyzerReport = report();
		const result = await execute({ validationStatus: 'NOT_RUN', analysisStatus: 'COMPLETED', analyzerReport }, { command: 'analyze', params: {}, rawOutput: true });
		expect(result.data.analyzerReport).toEqual(analyzerReport);
		expect(result.data.validationStatus).toBe('NOT_RUN');
		expect(result.data.summary).toEqual({ action: 'analyze', status: 'SUCCESS' });
	});
});

describe('Analyzer completion contract hardening', () => {
	it('rejects unknown execution statuses even with a valid report', async () => {
		const result = await execute({ analysisStatus: 'PENDING', analyzerReport: report() });
		expect(result.status).toBe('ERROR');
		expect(result.errorMessages.join(' ')).toContain('unknown execution status');
	});
	it('does not treat an empty successful HTTP body as a completed scan', async () => {
		const result = await executeProjectCommand({ command: 'analyze', projectFolder: '/project', hostName: 'test.invalid', accessToken: 'token' }, {
			createProjectArchive: async () => '/project.zip', deleteFile: async () => {},
			sendProjectRequest: async () => ({ statusCode: 200, body: '' })
		});
		expect(result.status).toBe('ERROR');
	});
});
