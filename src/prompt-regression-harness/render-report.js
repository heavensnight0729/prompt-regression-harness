export function renderPromptRegressionReport(result) {
  assertResultObject(result);

  const lines = [
    '# Prompt Regression Report',
    '',
    '## Summary',
    '',
    '| Cases | Passed | Failed | Assertions | Failed Assertions | Score |',
    '| ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${result.summary.totalCases} | ${result.summary.passedCases} | ${result.summary.failedCases} | ${result.summary.totalAssertions} | ${result.summary.failedAssertions} | ${formatScore(result.summary.score)} |`,
    '',
    '## Cases',
    '',
    ...renderCaseRows(result.cases),
    '',
    '## Failures',
    '',
    ...renderFailures(result.cases),
  ];

  return `${lines.join('\n')}\n`;
}

function renderCaseRows(cases) {
  if (!Array.isArray(cases) || cases.length === 0) {
    return ['No cases evaluated.'];
  }

  return [
    '| Case | Status | Assertions | Failures |',
    '| --- | --- | ---: | ---: |',
    ...cases.map((caseResult) => [
      `| \`${escapeTableCell(caseResult.id)}\``,
      escapeTableCell(caseResult.status),
      String(caseResult.assertions.length),
      `${String(caseResult.failures.length)} |`,
    ].join(' | ')),
  ];
}

function renderFailures(cases) {
  const failures = cases.flatMap((caseResult) => caseResult.failures.map((failure) => ({
    caseId: caseResult.id,
    ...failure,
  })));

  if (failures.length === 0) {
    return ['No failures.'];
  }

  return failures.map((failure) => (
    `- \`${failure.caseId}\` assertion ${failure.index + 1}: ${failure.message}`
  ));
}

function formatScore(score) {
  return Number(score ?? 0).toFixed(2);
}

function escapeTableCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}

function assertResultObject(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new TypeError('result must be an object');
  }

  if (!result.summary || typeof result.summary !== 'object') {
    throw new TypeError('result.summary must be an object');
  }
}
