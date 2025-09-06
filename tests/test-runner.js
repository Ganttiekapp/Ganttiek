#!/usr/bin/env node

/**
 * Simple test runner for headless testing
 * This script provides a convenient way to run tests without opening browsers
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const testTypes = {
  'auth': 'Authentication tests',
  'projects': 'Project management tests', 
  'responsive': 'Responsive design tests',
  'all': 'All tests'
};

function runTests(testType = 'all') {
  console.log(`🚀 Running ${testTypes[testType]} in headless mode...\n`);
  
  try {
    // Check if Playwright is installed
    if (!existsSync('node_modules/@playwright/test')) {
      console.log('📦 Installing Playwright...');
      execSync('npm install', { stdio: 'inherit' });
      execSync('npx playwright install', { stdio: 'inherit' });
    }

    // Run tests based on type
    let command = 'npx playwright test --config=tests/headless.config.js';
    
    if (testType !== 'all') {
      command += ` tests/${testType}.spec.js`;
    }
    
    console.log(`Running: ${command}\n`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n✅ Tests completed successfully!');
    console.log('📊 Check test-results/html/index.html for detailed results');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

if (!testTypes[testType]) {
  console.log('Available test types:');
  Object.entries(testTypes).forEach(([key, description]) => {
    console.log(`  ${key}: ${description}`);
  });
  process.exit(1);
}

runTests(testType);
