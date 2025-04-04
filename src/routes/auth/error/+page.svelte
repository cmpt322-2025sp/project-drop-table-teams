<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <h1>Authentication Error</h1>
  
  {#if $page.url.searchParams.get('error')}
    <p class="error-message">{$page.url.searchParams.get('error')}</p>
  {:else}
    <p class="error-message">You must confirm your email before logging in. Please check your inbox for a verification link.</p>
  {/if}
  
  <a href="/auth" class="back-button">Back to Login</a>
</div>

<style>
  .error-container {
    max-width: 500px;
    margin: 4rem auto;
    padding: 2rem;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #ff5252;
  }
  
  .error-message {
    font-size: 1.1rem;
    line-height: 1.5;
    margin-bottom: 2rem;
  }
  
  .back-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary-color, #5e35b1);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .back-button:hover {
    background-color: var(--primary-color-dark, #4527a0);
  }
</style>