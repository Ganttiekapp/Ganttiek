<script>
  import { AuthService } from '$lib/auth.js';

  let email = '';
  let loading = false;
  let error = '';
  let success = '';

  async function handleSignup() {
    if (!email) {
      error = 'Please enter your email address';
      return;
    }

    loading = true;
    error = '';
    success = '';

    try {
      const { data, error: authError } = await AuthService.signUpWithMagicLink(email);
      
      if (authError) {
        error = authError.message;
      } else {
        success = 'Check your email for a magic link to create your account!';
        email = ''; // Clear the form
      }
    } catch (err) {
      error = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSignup();
    }
  }
</script>

<svelte:head>
  <title>Sign Up - Ganttiek</title>
</svelte:head>

<div class="auth-container">
  <div class="auth-card">
    <h1>Sign Up</h1>
    
    {#if error}
      <div class="error">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="success">
        {success}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSignup}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          on:keydown={handleKeydown}
          placeholder="Enter your email address"
          required
        />
      </div>

      <button type="submit" disabled={loading} class="btn btn-primary">
        {loading ? 'Sending magic link...' : 'Create Account'}
      </button>
    </form>

    <div class="info">
      <p>We'll send you a secure link to create your account without a password.</p>
    </div>

    <p class="auth-link">
      Already have an account? <a href="/login">Login</a>
    </p>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .auth-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .btn {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .btn-primary:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }

  .success {
    background-color: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid #c3e6cb;
  }

  .info {
    background-color: #e7f3ff;
    color: #004085;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-top: 1rem;
    border: 1px solid #b8daff;
  }

  .info p {
    margin: 0;
    font-size: 0.9rem;
  }

  .auth-link {
    text-align: center;
    margin-top: 1rem;
    color: #666;
  }

  .auth-link a {
    color: #007bff;
    text-decoration: none;
  }

  .auth-link a:hover {
    text-decoration: underline;
  }
</style>
