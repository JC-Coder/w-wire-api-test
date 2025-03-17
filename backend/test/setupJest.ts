// This file can be used for global Jest setup
// It will run once before all test files

// Increase timeout for all tests
jest.setTimeout(30000);

// Uncomment if you continue to have issues with hanging tests
global.afterAll(() => {
  console.log('Global teardown after running all tests');
  // Force exit if there are hanging connections
  setTimeout(() => process.exit(0), 500);
});
