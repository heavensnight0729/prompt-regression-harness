export function loadPromptFixturesFromJson(jsonText) {
  if (typeof jsonText !== 'string') {
    throw new TypeError('jsonText must be a string');
  }

  const parsed = JSON.parse(jsonText);
  const cases = Array.isArray(parsed) ? parsed : parsed?.cases;

  if (!Array.isArray(cases)) {
    throw new TypeError('fixture JSON must be an array or an object with a cases array');
  }

  return cases.map(normalizeFixture);
}

function normalizeFixture(fixture) {
  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
    throw new TypeError('fixture case must be an object');
  }

  return {
    id: fixture.id,
    prompt: fixture.prompt,
    actualOutput: fixture.actualOutput,
    assertions: fixture.assertions,
  };
}
