#!/usr/bin/env node

/**
 * Silent test runner
 * Runs tests completely in the background and provides clean output
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

function runSilentTests() {
  console.log('🧪 Running tests silently...\n');
  
  try {
    // Run tests with silent configuration
    const result = execSync('npx playwright test --config=playwright.silent.config.js', {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ All tests passed!');
    console.log(result);
    
    // Check if results file exists and show summary
    if (existsSync('test-results/silent-results.json')) {
      const results = JSON.parse(readFileSync('test-results/silent-results.json', 'utf8'));
      console.log(`\n📊 Test Summary:`);
      console.log(`   Total: ${results.stats?.total || 0}`);
      console.log(`   Passed: ${results.stats?.passed || 0}`);
      console.log(`   Failed: ${results.stats?.failed || 0}`);
      console.log(`   Duration: ${results.stats?.duration || 0}ms`);
    }
    
  } catch (error) {
    console.log('❌ Some tests failed:');
    
    // Try to parse the error output
    const errorOutput = error.stdout || error.message;
    console.log(errorOutput);
    
    // Check for specific test failures
    if (errorOutput.includes('Error: expect')) {
      console.log('\n🔍 Common issues:');
      console.log('   - Elements not found: Check if selectors are correct');
      console.log('   - Timeout errors: Elements may be loading slowly');
      console.log('   - Navigation errors: Check if the dev server is running');
    }
    
    process.exit(1);
  }
}

// Check if dev server is running
function checkDevServer() {
  try {
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Main execution
if (!checkDevServer()) {
  console.log('⚠️  Dev server not running. Starting dev server...');
  try {
    execSync('npm run dev &', { stdio: 'pipe' });
    // Wait a bit for server to start
    setTimeout(() => {
      runSilentTests();
    }, 5000);
  } catch (error) {
    console.log('❌ Failed to start dev server:', error.message);
    process.exit(1);
  }
} else {
  runSilentTests();
}
