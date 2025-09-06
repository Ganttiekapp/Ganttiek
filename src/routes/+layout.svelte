<script>
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth.js';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Navigation from '$lib/components/Navigation.svelte';
  import '../app.css';

  let user = null;
  let loading = true;

  onMount(() => {
    // Get initial user
    AuthService.getCurrentUser().then((currentUser) => {
      user = currentUser;
      loading = false;
    });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
      loading = false;
    });

    return () => subscription.unsubscribe();
  });

  // Redirect to login if not authenticated and not on login/signup/demo page
  $: if (!loading && !user && $page.url.pathname !== '/login' && $page.url.pathname !== '/signup' && $page.url.pathname !== '/gantt-demo') {
    goto('/login');
  }
</script>

<main>
  {#if loading}
    <div class="loading">
      <p>Loading...</p>
    </div>
  {:else if user}
    <Navigation {user} />
    <slot />
  {:else}
    <slot />
  {/if}
</main>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.2rem;
  }
</style>