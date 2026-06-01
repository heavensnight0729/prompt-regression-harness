# Prompt Regression Harness

Dependency-free CLI for regression testing prompt outputs with local fixtures.

This is useful when prompt or agent changes should be checked in CI without calling a model provider. The harness evaluates captured outputs against simple assertions and renders a Markdown report.

## Supported Assertions

- `exact`: output must exactly match the expected value
- `contains`: output must include the expected value
- `not_contains`: output must not include the expected value

## Fixture Format

```json
{
  "cases": [
    {
      "id": "summary-format",
      "prompt": "Summarize the release notes.",
      "actualOutput": "Summary:\\n- Added CI",
      "assertions": [
        { "type": "contains", "value": "Summary:" },
        { "type": "not_contains", "value": "password" }
      ]
    }
  ]
}
```

## Usage

```bash
node src/prompt-regression-harness/cli.js --fixtures examples/prompt-fixtures.json
```

When installed as a package:

```bash
prompt-regression-harness --fixtures examples/prompt-fixtures.json
```

## Exit Codes

- `0`: all prompt cases passed
- `1`: one or more prompt cases failed
- `2`: CLI/runtime error

## Security Notes

The Markdown report intentionally does not include full prompt outputs. It reports case IDs, assertion counts, and failure messages so sensitive model output is less likely to leak into CI logs.

No prompt data is sent to external services.

## Development

```bash
npm test
```

## License

MIT
