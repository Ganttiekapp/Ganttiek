<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { goto } from '$app/navigation';

  let user = null;

  onMount(() => {
    AuthService.getCurrentUser().then((currentUser) => {
      user = currentUser;
      if (user) {
        goto('/dashboard');
      }
    });
  });
</script>

<svelte:head>
  <title>Ganttiek - Project Management</title>
</svelte:head>

<div class="hero">
  <h1>Welcome to Ganttiek</h1>
  <p>Your project management solution</p>
  
  {#if !user}
    <div class="auth-buttons">
      <a href="/login" class="btn btn-primary">Login</a>
      <a href="/signup" class="btn btn-secondary">Sign Up</a>
    </div>
  {/if}
</div>

<style>
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .auth-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0056b3;
  }

  .btn-secondary {
    background-color: transparent;
    color: #007bff;
    border: 2px solid #007bff;
  }

  .btn-secondary:hover {
    background-color: #007bff;
    color: white;
  }
</style>
