const SUPPORTED_ASSERTION_TYPES = Object.freeze([
  'contains',
  'exact',
  'not_contains',
]);

export function evaluatePromptFixtures(fixtures) {
  assertFixtures(fixtures);

  const cases = fixtures.map(evaluateFixture);
  const totalAssertions = cases.reduce((sum, caseResult) => sum + caseResult.assertions.length, 0);
  const failedAssertions = cases.reduce((sum, caseResult) => sum + caseResult.failures.length, 0);
  const failedCases = cases.filter((caseResult) => caseResult.status === 'failed').length;

  return deepFreeze({
    schemaVersion: 'prompt_regression_harness.result/v1',
    summary: {
      totalCases: cases.length,
      passedCases: cases.length - failedCases,
      failedCases,
      totalAssertions,
      failedAssertions,
    },
    cases,
  });
}

function evaluateFixture(fixture) {
  assertFixture(fixture);

  const assertionResults = fixture.assertions.map((assertion, index) => {
    assertAssertion(assertion, fixture.id, index);
    return evaluateAssertion(assertion, fixture.actualOutput, index);
  });
  const failures = assertionResults.filter((assertionResult) => assertionResult.status === 'failed');

  return {
    id: fixture.id,
    status: failures.length === 0 ? 'passed' : 'failed',
    assertions: assertionResults,
    failures,
  };
}

function evaluateAssertion(assertion, actualOutput, index) {
  if (assertion.type === 'exact') {
    return createAssertionResult({
      assertion,
      index,
      passed: actualOutput === assertion.value,
      failureMessage: `Expected output to exactly equal "${assertion.value}"`,
    });
  }

  if (assertion.type === 'contains') {
    return createAssertionResult({
      assertion,
      index,
      passed: actualOutput.includes(assertion.value),
      failureMessage: `Expected output to contain "${assertion.value}"`,
    });
  }

  return createAssertionResult({
    assertion,
    index,
    passed: !actualOutput.includes(assertion.value),
    failureMessage: `Expected output not to contain "${assertion.value}"`,
  });
}

function createAssertionResult({
  assertion,
  index,
  passed,
  failureMessage,
}) {
  const result = {
    index,
    type: assertion.type,
    expected: assertion.value,
    status: passed ? 'passed' : 'failed',
  };

  if (!passed) {
    result.message = failureMessage;
  }

  return result;
}

function assertFixtures(fixtures) {
  if (!Array.isArray(fixtures)) {
    throw new TypeError('fixtures must be an array');
  }
}

function assertFixture(fixture) {
  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
    throw new TypeError('fixture must be an object');
  }

  if (typeof fixture.id !== 'string' || fixture.id.trim() === '') {
    throw new TypeError('fixture.id must be a non-empty string');
  }

  if (typeof fixture.prompt !== 'string') {
    throw new TypeError(`fixture ${fixture.id} prompt must be a string`);
  }

  if (typeof fixture.actualOutput !== 'string') {
    throw new TypeError(`fixture ${fixture.id} actualOutput must be a string`);
  }

  if (!Array.isArray(fixture.assertions) || fixture.assertions.length === 0) {
    throw new TypeError(`fixture ${fixture.id} assertions must be a non-empty array`);
  }
}

function assertAssertion(assertion, fixtureId, index) {
  if (!assertion || typeof assertion !== 'object' || Array.isArray(assertion)) {
    throw new TypeError(`fixture ${fixtureId} assertion ${index} must be an object`);
  }

  if (!SUPPORTED_ASSERTION_TYPES.includes(assertion.type)) {
    throw new RangeError(`fixture ${fixtureId} assertion ${index} has unsupported type`);
  }

  if (typeof assertion.value !== 'string') {
    throw new TypeError(`fixture ${fixtureId} assertion ${index} value must be a string`);
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  for (const childValue of Object.values(value)) {
    deepFreeze(childValue);
  }

  return Object.freeze(value);
}
