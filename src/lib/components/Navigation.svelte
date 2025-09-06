<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let user = null;

  function isActive(path) {
    return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
  }
</script>

<nav class="navigation">
  <div class="nav-container">
    <div class="nav-brand">
      <a href="/dashboard" class="brand-link">
        <h1>Ganttiek</h1>
      </a>
    </div>
    
    <div class="nav-links">
      <a href="/dashboard" class="nav-link {isActive('/dashboard') ? 'active' : ''}">
        Dashboard
      </a>
      <a href="/projects" class="nav-link {isActive('/projects') ? 'active' : ''}">
        Projects
      </a>
    </div>
    
    <div class="nav-user">
      <span class="user-email">{user?.email}</span>
      <button on:click={() => goto('/login')} class="btn btn-secondary btn-sm">
        Logout
      </button>
    </div>
  </div>
</nav>

<style>
  .navigation {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .nav-brand .brand-link {
    text-decoration: none;
    color: #333;
  }

  .nav-brand h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #007bff;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .nav-link:hover {
    color: #007bff;
    background-color: #f8f9fa;
  }

  .nav-link.active {
    color: #007bff;
    background-color: #e3f2fd;
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-email {
    color: #666;
    font-size: 0.9rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #545b62;
  }

  @media (max-width: 768px) {
    .nav-container {
      flex-direction: column;
      height: auto;
      padding: 1rem;
      gap: 1rem;
    }

    .nav-links {
      gap: 1rem;
    }

    .nav-user {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
