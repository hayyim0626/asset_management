---
name: run-test
description: Executes written test code and verifies results. Use when test execution, test verification, or checking test pass status is needed. Should automatically run after write-test skill.
---

# Test Execution and Verification Skill

## Purpose
This skill executes written test code, analyzes results, and verifies that all tests pass.

## Test Execution Commands

### Run all tests
```bash
yarn test
```

### Test specific file
```bash
yarn test <file-path>
```

### Watch mode (during development)
```bash
yarn test:watch
```

### With coverage
```bash
yarn test --coverage
```

## Execution Process

### 1. Run Tests
- Execute newly written test file or all tests
- Analyze execution results to check pass/fail status

### 2. Result Analysis

#### Success Case
```
PASS  src/__tests__/example.test.ts
  ✓ test case 1 (10 ms)
  ✓ test case 2 (5 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

**Action**: Report success message to user

#### Failure Case
```
FAIL  src/__tests__/example.test.ts
  ✕ test case 1 (20 ms)

  ● test case 1
    expect(received).toBe(expected)
    Expected: "expected"
    Received: "actual"
```

**Actions**:
1. Analyze failure cause
2. Fix code or test
3. Re-run to verify

### 3. Problem Resolution

When tests fail:

1. **Analyze error message**: Identify which assertion failed
2. **Identify cause**:
   - Is it a test code issue?
   - Is it an actual implementation issue?
   - Is mocking incorrect?
3. **Fix**: Resolve the problem and re-run tests
4. **Verify**: Repeat until all tests pass

## Common Test Failure Causes

### 1. Import/Module Errors
```
Cannot find module '@/components/...'
```
**Solution**: Check path and tsconfig.json paths configuration

### 2. Environment Errors
```
ReferenceError: document is not defined
```
**Solution**: Check testEnvironment: 'jsdom' setting in jest.config.js

### 3. Async Errors
```
Timeout - Async callback was not invoked within the timeout
```
**Solution**: Use async/await or increase timeout

### 4. Mocking Errors
```
TypeError: mockFunction is not a function
```
**Solution**: Check mocking setup and jest.mock() location

## Success Criteria

Tests are successful when all conditions are met:

- ✅ All test cases pass (0 failed)
- ✅ No errors or warnings
- ✅ Expected behavior verified
- ✅ Code coverage adequate (optional)

## Reporting Format

Provide the following information to user after test execution:

### On Success
```
✅ Test execution complete

Test Results:
- Total tests: X
- Passed: X
- Failed: 0
- Execution time: X seconds

All tests passed successfully!
```

### On Failure
```
❌ Test failures detected

Failed tests: X

[Failure details]

Fixing...
```

## Automation Rules

- **Auto-run after write-test skill**: Automatically execute this skill after test code is written
- **Auto-fix on failure**: Automatically fix simple issues and re-run
- **Final verification**: Repeat until all tests pass
