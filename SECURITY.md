# Security Policy

## Scope

Prompt Regression Harness evaluates local JSON fixtures and renders local reports. It does not send prompts, outputs, assertions, file paths, or metadata to external services.

## Supported Version

The current `main` branch is the supported version while the project is pre-1.0.

## Reporting a Vulnerability

Please open a GitHub issue with:

- a minimal fixture that reproduces the issue
- whether the problem is a false result, report leak, CLI parsing issue, or documentation problem
- the command used to reproduce it

Do not include real secrets, private customer prompts, or sensitive model outputs.

## Security Goals

- Avoid printing full prompt outputs in Markdown reports.
- Keep all checks local and deterministic.
- Keep dependencies minimal.
- Make CI output useful without leaking sensitive data.

## Known Non-Goals

- This does not call model APIs.
- This does not evaluate semantic quality.
- This does not guarantee that fixture text is safe to publish.
