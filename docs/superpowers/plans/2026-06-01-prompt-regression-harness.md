# Prompt Regression Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free CLI that validates prompt outputs against fixture expectations so agent and prompt changes can be regression-tested locally and in CI.

**Architecture:** Keep fixture evaluation, Markdown reporting, filesystem loading, and CLI orchestration separate. The MVP evaluates plain text fixtures without calling external model APIs.

**Tech Stack:** Node.js ESM, `node:test`, `node:assert/strict`, `node:fs/promises`, `node:path`, `node:process`.

---

### Task 1: Fixture Evaluator

**Files:**
- Create: `src/prompt-regression-harness/evaluate-fixtures.js`
- Test: `test/prompt-regression-harness.test.js`

- [ ] Write failing tests for exact, contains, and not-contains assertions.
- [ ] Run focused tests and verify RED.
- [ ] Implement pure evaluator returning immutable results.
- [ ] Run focused tests and verify GREEN.

### Task 2: Markdown Reporter

**Files:**
- Create: `src/prompt-regression-harness/render-report.js`
- Modify: `test/prompt-regression-harness.test.js`

- [ ] Write failing tests for deterministic Markdown summary and case table.
- [ ] Run focused tests and verify RED.
- [ ] Implement Markdown renderer.
- [ ] Run focused tests and verify GREEN.

### Task 3: CLI and Fixture Loading

**Files:**
- Create: `src/prompt-regression-harness/load-fixtures.js`
- Create: `src/prompt-regression-harness/cli.js`
- Modify: `test/prompt-regression-harness.test.js`

- [ ] Write failing tests for JSON fixture loading, stdout output, `--fixtures`, and `--help`.
- [ ] Run focused tests and verify RED.
- [ ] Implement loader and CLI runner.
- [ ] Run focused tests and verify GREEN.

### Task 4: Publish Prep

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `.github/workflows/ci.yml`
- Create: `package.json`

- [ ] Add docs, package metadata, license, and CI.
- [ ] Run `npm test`.
- [ ] Run local secret-pattern scan.
- [ ] Commit meaningful checkpoints and publish to GitHub.
