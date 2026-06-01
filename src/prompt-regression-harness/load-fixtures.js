import {
  readFile,
  readdir,
  stat,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';

const FIXTURE_FILE_EXTENSION = '.json';

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

export async function loadPromptFixturesFromPath(fixturesPath, dependencies = {}) {
  assertFixturePath(fixturesPath);

  const statDependency = dependencies.stat ?? stat;
  const readdirDependency = dependencies.readdir ?? readdir;
  const readFileDependency = dependencies.readFile ?? readFile;
  const pathStat = await statDependency(fixturesPath);

  if (pathStat.isFile()) {
    return loadPromptFixturesFromJson(await readFileDependency(fixturesPath, 'utf8'));
  }

  if (!pathStat.isDirectory()) {
    throw new TypeError('fixturesPath must be a JSON file or directory');
  }

  const entries = await readdirDependency(fixturesPath, {
    withFileTypes: true,
  });
  const fixtureFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => fileName.endsWith(FIXTURE_FILE_EXTENSION))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => join(fixturesPath, fileName));
  const fixtureGroups = await Promise.all(fixtureFiles.map(async (filePath) => (
    loadPromptFixturesFromJson(await readFileDependency(filePath, 'utf8'))
  )));

  return fixtureGroups.flat();
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

function assertFixturePath(fixturesPath) {
  if (typeof fixturesPath !== 'string' || fixturesPath.trim() === '') {
    throw new TypeError('fixturesPath must be a non-empty string');
  }
}
