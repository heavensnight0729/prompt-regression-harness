# Contributing

Thanks for considering a contribution.

## Good First Changes

- Add a focused assertion type with tests.
- Improve fixture validation errors.
- Improve Markdown or JSON report output.
- Add examples for real prompt-maintenance workflows.
- Improve documentation around CI usage.

## Development Workflow

```bash
npm test
```

The project uses native Node.js tests and has no runtime dependencies.

## Assertion Design

Assertions should be:

- deterministic
- easy to understand in CI logs
- covered by tests
- careful not to leak full prompt outputs
- useful for prompt regression, not broad semantic grading

## Pull Request Checklist

- [ ] Tests added or updated
- [ ] `npm test` passes
- [ ] README or examples updated when behavior changes
- [ ] Reports do not print full prompt outputs unnecessarily
