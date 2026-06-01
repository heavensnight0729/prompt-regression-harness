import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  loadPromptFixturesFromJson,
} from '../src/prompt-regression-harness/load-fixtures.js';

const SCHEMA_PATH = 'schema/prompt-fixtures.schema.json';
const EXAMPLE_FIXTURE_PATHS = Object.freeze([
  'examples/failing-fixtures.json',
  'examples/prompt-fixtures.json',
]);

test('schema documents every supported assertion type', async () => {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
  const assertionTypeEnum = schema.$defs.assertion.properties.type.enum;

  assert.deepEqual(assertionTypeEnum, [
    'contains',
    'exact',
    'matches_regex',
    'not_contains',
  ]);
});

test('checked-in example fixtures follow the documented fixture shape', async () => {
  for (const fixturePath of EXAMPLE_FIXTURE_PATHS) {
    const jsonText = await readFile(fixturePath, 'utf8');
    const fixtures = loadPromptFixturesFromJson(jsonText);

    assert.ok(fixtures.length > 0, `${fixturePath} should contain fixtures`);

    for (const fixture of fixtures) {
      assert.equal(typeof fixture.id, 'string', fixturePath);
      assert.equal(typeof fixture.prompt, 'string', fixturePath);
      assert.equal(typeof fixture.actualOutput, 'string', fixturePath);
      assert.ok(Array.isArray(fixture.assertions), fixturePath);
      assert.ok(fixture.assertions.length > 0, fixturePath);

      for (const assertion of fixture.assertions) {
        assert.ok(
          ['contains', 'exact', 'matches_regex', 'not_contains'].includes(assertion.type),
          `${fixturePath} unsupported assertion type ${assertion.type}`,
        );
        assert.equal(typeof assertion.value, 'string', fixturePath);
      }
    }
  }
});
