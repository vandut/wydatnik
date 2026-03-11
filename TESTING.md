# Testing Guidelines

This project uses [Vitest](https://vitest.dev/) for unit testing.

## 🤖 SYSTEM INSTRUCTIONS FOR AI AGENTS (MANDATORY)

As an AI agent working on this codebase, you **MUST** adhere to the following strict rules regarding testing:

1. **Verification Step**: You are **REQUIRED** to run the unit test suite (`npx vitest run`) during the verification step of *every* task or code modification.
2. **Fixing Failures**: If any tests fail, you **MUST** analyze the output and fix the failing tests immediately.
3. **Completion Condition**: You are **ONLY ALLOWED** to complete a task and finish your turn once:
   - The code has been fixed to pass all existing tests, OR
   - The tests themselves have been updated/fixed if the requirements have intentionally changed.
4. **No Ignored Tests**: Do not ignore failing tests, and do not remove tests simply because they are failing (unless the feature was explicitly removed).
5. **Mandatory Task Output**: At the end of *every* task execution, you **MUST** output the test status to the user. This serves as verification that you actually ran the tests.
   - If the test output provides numbers, output: `"Run X tests, Y passed, Z failed"`
   - If numbers are not easily extracted but all tests passed, output: `"all tests passed"`
   - If any tests failed and you were unable to fix them, you **MUST** output exactly which tests failed.

---

## How to Run Tests

As an AI agent, you can verify your work by running the test suite using the `npx` command:

```bash
npx vitest run
```

### Important Notes for AI Agents:
1. **Use `npx vitest run`**: The `run` flag is crucial because it runs the tests once and exits. Without it, Vitest runs in watch mode, which will hang the execution environment.
2. **Read the Output**: Vitest will output the results of the test suite. A non-zero exit code indicates that tests have failed.
3. **Fixing Failures**: If tests fail, analyze the output to determine which assertions failed, then fix the underlying code or update the tests if the requirements have changed.
4. **Writing Tests**: Place test files next to the files they test, using the `.test.ts` or `.test.tsx` extension.

## Example

To run tests for a specific file, you can pass the filename:

```bash
npx vitest run utils.test.ts
```
