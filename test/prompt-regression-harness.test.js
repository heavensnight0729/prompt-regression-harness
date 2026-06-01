import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluatePromptFixtures,
} from '../src/prompt-regression-harness/evaluate-fixtures.js';
import {
  renderPromptRegressionReport,
} from '../src/prompt-regression-harness/render-report.js';
import {
  loadPromptFixturesFromJson,
} from '../src/prompt-regression-harness/load-fixtures.js';
import {
  runPromptRegressionHarnessCli,
} from '../src/prompt-regression-harness/cli.js';

test('evaluates exact contains and not-contains assertions', () => {
  const result = evaluatePromptFixtures([
    {
      id: 'summary-format',
      prompt: 'Summarize the release notes.',
      actualOutput: 'Summary:\n- Added CI\n- Fixed docs',
      assertions: [
        { type: 'contains', value: 'Summary:' },
        { type: 'contains', value: 'Added CI' },
        { type: 'not_contains', value: 'password' },
      ],
    },
    {
      id: 'strict-answer',
      prompt: 'Return the deployment status.',
      actualOutput: 'ready',
      assertions: [
        { type: 'exact', value: 'ready' },
      ],
    },
  ]);

  assert.equal(result.summary.totalCases, 2);
  assert.equal(result.summary.passedCases, 2);
  assert.equal(result.summary.failedCases, 0);
  assert.equal(result.summary.totalAssertions, 4);
  assert.equal(result.summary.failedAssertions, 0);
  assert.deepEqual(result.cases.map((caseResult) => caseResult.status), ['passed', 'passed']);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.cases), true);
});

test('reports failed assertions without echoing full prompt output', () => {
  const result = evaluatePromptFixtures([
    {
      id: 'unsafe-output',
      prompt: 'Write deployment instructions.',
      actualOutput: 'Deploy with password in plaintext.',
      assertions: [
        { type: 'not_contains', value: 'password' },
        { type: 'contains', value: 'rollback' },
      ],
    },
  ]);

  assert.equal(result.summary.failedCases, 1);
  assert.equal(result.summary.failedAssertions, 2);
  assert.equal(result.cases[0].status, 'failed');
  assert.deepEqual(
    result.cases[0].failures.map((failure) => failure.message),
    [
      'Expected output not to contain "password"',
      'Expected output to contain "rollback"',
    ],
  );
  assert.equal(JSON.stringify(result).includes('Deploy with password in plaintext.'), false);
});

test('renders deterministic markdown summary and case table', () => {
  const result = evaluatePromptFixtures([
    {
      id: 'safe-summary',
      prompt: 'Summarize safely.',
      actualOutput: 'Summary: safe',
      assertions: [
        { type: 'contains', value: 'Summary:' },
      ],
    },
    {
      id: 'missing-rollback',
      prompt: 'Write release notes.',
      actualOutput: 'Release shipped.',
      assertions: [
        { type: 'contains', value: 'rollback' },
      ],
    },
  ]);

  const markdown = renderPromptRegressionReport(result);

  assert.match(markdown, /^# Prompt Regression Report/);
  assert.match(markdown, /\| Cases \| Passed \| Failed \| Assertions \| Failed Assertions \|/);
  assert.match(markdown, /\| 2 \| 1 \| 1 \| 2 \| 1 \|/);
  assert.match(markdown, /\| `safe-summary` \| passed \| 1 \| 0 \|/);
  assert.match(markdown, /\| `missing-rollback` \| failed \| 1 \| 1 \|/);
  assert.match(markdown, /Expected output to contain "rollback"/);
  assert.doesNotMatch(markdown, /Release shipped\./);
});

test('loads prompt fixtures from json payload', () => {
  const fixtures = loadPromptFixturesFromJson(JSON.stringify({
    cases: [
      {
        id: 'summary-format',
        prompt: 'Summarize.',
        actualOutput: 'Summary: done',
        assertions: [
          { type: 'contains', value: 'Summary:' },
        ],
      },
    ],
  }));

  assert.deepEqual(fixtures, [
    {
      id: 'summary-format',
      prompt: 'Summarize.',
      actualOutput: 'Summary: done',
      assertions: [
        { type: 'contains', value: 'Summary:' },
      ],
    },
  ]);
});

test('cli reads fixtures file writes markdown and returns failing status', async () => {
  const writes = [];
  const readPaths = [];

  const exitCode = await runPromptRegressionHarnessCli({
    argv: ['--fixtures', 'prompt-fixtures.json'],
    readFile: async (filePath) => {
      readPaths.push(filePath);
      return JSON.stringify({
        cases: [
          {
            id: 'missing-summary',
            prompt: 'Summarize.',
            actualOutput: 'Done.',
            assertions: [
              { type: 'contains', value: 'Summary:' },
            ],
          },
        ],
      });
    },
    writeOutput: (value) => writes.push(value),
  });

  assert.equal(exitCode, 1);
  assert.deepEqual(readPaths, ['prompt-fixtures.json']);
  assert.match(writes[0], /^# Prompt Regression Report/);
  assert.match(writes[0], /missing-summary/);
});

test('cli renders help without reading fixture files', async () => {
  const writes = [];

  const exitCode = await runPromptRegressionHarnessCli({
    argv: ['--help'],
    readFile: async () => {
      throw new Error('readFile should not be called');
    },
    writeOutput: (value) => writes.push(value),
  });

  assert.equal(exitCode, 0);
  assert.match(writes[0], /Usage: prompt-regression-harness/);
});
