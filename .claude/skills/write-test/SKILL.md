---
name: write-test
description: Writes test code for the project. Use when users request test writing, unit tests, adding test cases, or mention code that needs testing. Uses Jest and React Testing Library.
---

# Test Code Writing Skill

## Purpose
This skill writes test code for the project's codebase.

## Project Setup
- **Test Framework**: Jest (v30.0.5)
- **Testing Library**: React Testing Library (v16.3.0)
- **Environment**: jsdom
- **TypeScript**: Supported

## Test Writing Guidelines

### 1. Test File Location
- Test files are created in the `__tests__` directory or in the same location as the file being tested
- File naming patterns: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`

### 2. Test Structure
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Component/Function Name', () => {
  it('test description', () => {
    // Arrange (setup)
    // Act (execute)
    // Assert (verify)
  });
});
```

### 3. React Component Tests
```typescript
describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const { user } = render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('text after click')).toBeInTheDocument();
  });
});
```

### 4. Utility Function Tests
```typescript
describe('utilFunction', () => {
  it('returns correct result for input', () => {
    const result = utilFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('handles edge cases', () => {
    expect(() => utilFunction(null)).toThrow();
  });
});
```

### 5. Async Function Tests
```typescript
describe('asyncFunction', () => {
  it('completes async operation', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  });
});
```

### 6. Mocking
```typescript
// Module mocking
jest.mock('@/lib/module', () => ({
  functionName: jest.fn()
}));

// Function mocking
const mockFn = jest.fn().mockReturnValue('mocked value');
```

## Test Writing Process

1. **Read target file**: First read and understand the code to be tested
2. **Identify test cases**:
   - Happy path (normal behavior)
   - Edge cases
   - Error cases
3. **Write tests**: Write test code for each case
4. **Check coverage**: Verify that all major logic is tested

## Best Practices

- **Clear test descriptions**: Use `it('should...')` format
- **Independent tests**: Each test should not affect other tests
- **AAA pattern**: Follow Arrange, Act, Assert order
- **Meaningful assertions**: Verify actually important behavior
- **Test readability**: Write test code that is easy to read

## Next Steps After Writing

Once test code is written, **use the run-test skill** to execute tests and verify they pass.
