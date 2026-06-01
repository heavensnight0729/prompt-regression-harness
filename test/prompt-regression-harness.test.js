import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluatePromptFixtures,
} from '../src/prompt-regression-harness/evaluate-fixtures.js';

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
