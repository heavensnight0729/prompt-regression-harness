# Prompt Regression Harness

[![CI](https://github.com/heavensnight0729/prompt-regression-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/heavensnight0729/prompt-regression-harness/actions/workflows/ci.yml)

Dependency-free CLI for regression testing prompt and agent outputs with local fixtures.

I built this because prompt changes often get reviewed like normal text, but they can still break behavior. This harness gives maintainers a small CI-friendly way to keep expected output checks next to the prompt work.

## Why This Exists

AI-assisted projects often evolve through small prompt edits, agent instruction changes, and output formatting tweaks. Without regression checks, a change can quietly remove required sections, expose sensitive wording, or drift away from a format that downstream tooling expects.

This project keeps the workflow intentionally simple:

1. Save captured prompt outputs as local JSON fixtures.
2. Define assertions for what must or must not appear.
3. Run the harness locally or in CI.
4. Review a Markdown or JSON report.

No model API call is required to run the checks.

## Supported Assertions

| Assertion | Behavior |
| --- | --- |
| `exact` | Output must exactly match the expected value. |
| `contains` | Output must include the expected value. |
| `matches_regex` | Output must match a JavaScript regular expression. |
| `not_contains` | Output must not include the expected value. |

## Fixture Format

```json
{
  "cases": [
    {
      "id": "summary-format",
      "prompt": "Summarize the release notes.",
      "actualOutput": "Summary:\n- Added CI",
      "assertions": [
        { "type": "contains", "value": "Summary:" },
        { "type": "matches_regex", "value": "^Summary:\\n- .+" },
        { "type": "not_contains", "value": "credential" }
      ]
    }
  ]
}
```

A JSON schema is available at [`schema/prompt-fixtures.schema.json`](schema/prompt-fixtures.schema.json).

## Usage

Run the example fixture:

```bash
node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json
```

Return JSON for automation:

```bash
node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json --format json
```

Load every `.json` fixture in a directory:

```bash
node src/prompt-regression-harness/cli.js --fixtures examples
```

Fail only when score is below a threshold:

```bash
node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json --fail-on score --min-score 0.9
```

Never fail, but still emit a report:

```bash
node src/prompt-regression-harness/cli.js --fixtures examples/failing-fixtures.json --fail-on never
```

When installed as a package:

```bash
prompt-regression-harness --fixtures examples/prompt-fixtures.json
```

## Failure Policies

| Policy | Exit code `1` when |
| --- | --- |
| `failed-cases` | One or more cases fail. This is the default. |
| `failed-assertions` | One or more assertions fail. |
| `score` | Summary score is below `--min-score`. |
| `never` | Never, useful for report-only CI jobs. |

## Exit Codes

- `0`: selected failure policy passed
- `1`: selected failure policy failed
- `2`: CLI/runtime error

## Security Notes

The Markdown report intentionally does not include full prompt outputs. It reports case IDs, assertion counts, and failure messages so sensitive model output is less likely to leak into CI logs.

No prompt data is sent to external services.

## CI Integration

```yaml
- name: Run prompt regression checks
  run: node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json
```

For report-only checks:

```yaml
- name: Generate prompt regression report
  run: node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json --fail-on never
```

See [GitHub Actions examples](docs/github-actions.md) for complete strict, report-only, score-threshold, and JSON-report workflows.

## Development

```bash
npm test
```

Run the passing fixture:

```bash
npm run check:example
```

Run the failing fixture in report-only mode:

```bash
npm run check:failing-example
```

## Design Choices

- **Local-first:** no prompt data leaves the machine.
- **Dependency-free:** no runtime packages are required.
- **CI-friendly:** Markdown for humans, JSON for automation.
- **Output-conscious:** reports avoid echoing full prompt output.
- **Small surface area:** assertion types are intentionally simple and easy to review.

## Limitations

- This does not call a model provider.
- This does not judge semantic quality.
- This does not replace human prompt review.
- Fixtures must be refreshed intentionally when behavior changes.

## License

MIT
