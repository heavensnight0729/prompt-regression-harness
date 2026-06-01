# GitHub Actions Examples

These examples assume fixture files are committed under `examples/` or another repository-local directory.

## Strict Mode

Use strict mode when prompt regressions should block a pull request.

```yaml
name: Prompt Regression

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  prompt-regression:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run prompt regression checks
        run: node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json
```

Default behavior is `--fail-on failed-cases`, so the job fails when any case fails.

## Report-Only Mode

Use report-only mode while introducing fixtures or when failures should be reviewed without blocking a PR.

```yaml
name: Prompt Regression Report

on:
  pull_request:

permissions:
  contents: read

jobs:
  prompt-regression-report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Generate prompt regression report
        run: node src/prompt-regression-harness/cli.js --fixtures examples/failing-fixtures.json --fail-on never
```

The job exits with `0`, but the Markdown report still shows failures.

## Score Threshold Mode

Use score threshold mode when partial failures should be tolerated until they cross a configured threshold.

```yaml
name: Prompt Regression Score

on:
  pull_request:

permissions:
  contents: read

jobs:
  prompt-regression-score:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run prompt regression score check
        run: node src/prompt-regression-harness/cli.js --fixtures examples --fail-on score --min-score 0.9
```

This mode is useful for larger fixture suites where one weak assertion should not always block the entire job.

## JSON Output

Use JSON output when another CI step will parse the report.

```yaml
- name: Generate JSON prompt regression report
  run: node src/prompt-regression-harness/cli.js --fixtures examples --format json --fail-on never > prompt-regression-report.json
```
