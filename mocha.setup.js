/**
 * Mocha Setup File
 * 
 * This file runs before all tests and sets up the test environment.
 */

// Set test environment variable to avoid database connection errors
process.env.MONGODB_URI = 'mongodb://test-database';

// Optional: Set Node environment to test
process.env.NODE_ENV = 'test';