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
  --format <format>   Output format: markdown or json. Defaults to markdown.
  --fail-on <policy>  Failure policy: failed-cases, failed-assertions, score, or never.
  --min-score <n>     Minimum score for --fail-on score. Defaults to 1.
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
  const output = parsedArgs.format === 'json'
    ? `${JSON.stringify(result, null, 2)}\n`
    : renderPromptRegressionReport(result);

  writeOutput(output);

  return shouldFail(result, parsedArgs) ? 1 : 0;
}

function parseArgs(argv) {
  const parsedArgs = {
    failOn: 'failed-cases',
    fixturesPath: null,
    format: 'markdown',
    help: false,
    minScore: 1,
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

    if (arg === '--format') {
      parsedArgs.format = requireOutputFormat(requireValue(argv, index, '--format'));
      index += 1;
      continue;
    }

    if (arg === '--fail-on') {
      parsedArgs.failOn = requireFailurePolicy(requireValue(argv, index, '--fail-on'));
      index += 1;
      continue;
    }

    if (arg === '--min-score') {
      parsedArgs.minScore = requireScore(requireValue(argv, index, '--min-score'));
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

function shouldFail(result, parsedArgs) {
  if (parsedArgs.failOn === 'never') {
    return false;
  }

  if (parsedArgs.failOn === 'failed-assertions') {
    return result.summary.failedAssertions > 0;
  }

  if (parsedArgs.failOn === 'score') {
    return result.summary.score < parsedArgs.minScore;
  }

  return result.summary.failedCases > 0;
}

function requireOutputFormat(value) {
  if (value !== 'markdown' && value !== 'json') {
    throw new RangeError('--format must be markdown or json');
  }

  return value;
}

function requireFailurePolicy(value) {
  if (![
    'failed-cases',
    'failed-assertions',
    'never',
    'score',
  ].includes(value)) {
    throw new RangeError('--fail-on must be failed-cases, failed-assertions, score, or never');
  }

  return value;
}

function requireScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new RangeError('--min-score must be a number between 0 and 1');
  }

  return score;
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
