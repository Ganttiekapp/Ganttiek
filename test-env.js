#!/usr/bin/env node

/**
 * Test script to verify environment variable handling
 * This script can be run in CI to test environment configuration
 */

console.log('Testing environment variable handling...');

// Test 1: Check if environment variables are set
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Not set');

// Test 2: Check for placeholder values
const hasPlaceholderUrl = supabaseUrl && supabaseUrl.includes('your-supabase-project-url');
const hasPlaceholderKey = supabaseKey && supabaseKey.includes('your-supabase-anon-key');

console.log('Has placeholder URL:', hasPlaceholderUrl);
console.log('Has placeholder key:', hasPlaceholderKey);

// Test 3: Validate URL format
if (supabaseUrl && !hasPlaceholderUrl) {
  try {
    new URL(supabaseUrl);
    console.log('✅ Supabase URL is valid');
  } catch (error) {
    console.log('❌ Supabase URL is invalid:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠️  Using fallback Supabase URL for testing');
}

// Test 4: Check key format
if (supabaseKey && !hasPlaceholderKey) {
  if (supabaseKey.length > 20) {
    console.log('✅ Supabase key appears valid');
  } else {
    console.log('❌ Supabase key appears too short');
    process.exit(1);
  }
} else {
  console.log('⚠️  Using fallback Supabase key for testing');
}

console.log('✅ Environment variable handling test passed');
