# Testing Setup Guide

This project now includes comprehensive unit tests for the Navbar component, but testing dependencies need to be installed.

## Required Dependencies

Add these to your package.json's devDependencies:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

## Installation Command

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

## Running Tests

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Files Created

- `src/components/Navbar.test.tsx` - Comprehensive unit tests for Navbar component
- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Jest setup file for testing-library/jest-dom

The tests cover:

- Basic rendering and DOM structure
- CSS classes and styling
- Link URLs and navigation
- Accessibility standards
- Next.js Link integration
- PWAInstall component integration
- Error handling and edge cases
- Performance considerations
- Content validation

## Test Coverage

The test suite includes 50+ test cases covering:

- Happy path scenarios
- Edge cases and error conditions
- Accessibility compliance
- Framework integration
- Performance and memory management
- Content accuracy validation