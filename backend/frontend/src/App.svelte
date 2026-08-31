<script>
  import Router, { push } from 'svelte-spa-router';
  import UserDashboard from './UserDashboard.svelte';
  import AdminDashboard from './AdminDashboard.svelte';

  const routes = {
    '/': UserDashboard,
    '/admin': AdminDashboard
  };
</script>

<nav>
  <button on:click={() => push('/')}>User Portal</button>
  <button on:click={() => push('/admin')}>Compliance Dashboard</button>
</nav>

<main>
  <Router {routes} />
</main>

<style>
  :global(body) {
    background: #394c46; 
    color: #FFD3AC;
    min-height: 100vh;
    margin: 0;
  }

  nav { 
    padding: 1rem; 
    background: rgba(0, 0, 0, 0.25); 
    display: flex; 
    gap: 1rem; 
  }
  
  button { 
    padding: 0.5rem 1rem; 
    cursor: pointer; 
    font-weight: bold; 
    background: #E6AB81; 
    color: #004B87; 
    border: none;
    border-radius: 4px;
  }
  
  button:hover {
    background: #FFD3AC;
  }

  main { 
    padding: 2rem; 
    font-family: sans-serif; 
    
    /* Solid Background Image for the Inner Portal */
    background-image: url('/logo.png');
    background-size: cover; 
    background-position: center;
    background-repeat: no-repeat;
    
    /* Box Styling for the outer window */
    margin: 2rem auto;
    max-width: 1000px;
    min-height: 70vh;
    border: 2px solid #E6AB81; 
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  /* Completely removed the dark background block, keeping only alignment and the new text color */
  :global(main > div) {
    padding: 2rem 3rem;
    margin-top: 2rem; 
    text-align: center;
    width: 100%;
    max-width: 650px;
    
    /* Pure white text with a strong shadow makes it readable on both light and dark parts of the logo */
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9), 0px 0px 8px rgba(0, 0, 0, 0.8);
  }

  :global(input) {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #E6AB81;
    color: #FFFFFF;
    padding: 0.5rem;
    border-radius: 4px;
  }
</style>