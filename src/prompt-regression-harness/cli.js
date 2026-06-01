#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

import {
  evaluatePromptFixtures,
} from './evaluate-fixtures.js';
import {
  loadPromptFixturesFromJson,
} from './load-fixtures.js';
import {
  renderPromptRegressionReport,
} from './render-report.js';

const HELP_TEXT = `Usage: prompt-regression-harness --fixtures <path>

Runs local prompt regression fixtures and renders a Markdown report.

Options:
  --fixtures <path>   JSON fixture file to evaluate.
  --help              Show this help message.
`;

export async function runPromptRegressionHarnessCli({
  argv = process.argv.slice(2),
  readFile: readFileDependency = readFile,
  writeOutput = (value) => process.stdout.write(value),
} = {}) {
  const parsedArgs = parseArgs(argv);

  if (parsedArgs.help) {
    writeOutput(HELP_TEXT);
    return 0;
  }

  const jsonText = await readFileDependency(parsedArgs.fixturesPath, 'utf8');
  const fixtures = loadPromptFixturesFromJson(jsonText);
  const result = evaluatePromptFixtures(fixtures);
  const markdown = renderPromptRegressionReport(result);

  writeOutput(markdown);

  return result.summary.failedCases > 0 ? 1 : 0;
}

function parseArgs(argv) {
  const parsedArgs = {
    fixturesPath: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      parsedArgs.help = true;
      continue;
    }

    if (arg === '--fixtures') {
      parsedArgs.fixturesPath = requireValue(argv, index, '--fixtures');
      index += 1;
      continue;
    }

    throw new RangeError(`Unsupported argument: ${arg}`);
  }

  if (!parsedArgs.help && !parsedArgs.fixturesPath) {
    throw new RangeError('--fixtures is required');
  }

  return parsedArgs;
}

function requireValue(argv, index, flagName) {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    throw new RangeError(`${flagName} requires a value`);
  }

  return value;
}

if (isDirectExecution()) {
  runPromptRegressionHarnessCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 2;
    });
}

function isDirectExecution() {
  return process.argv[1]
    && import.meta.url === pathToFileURL(process.argv[1]).href;
}
