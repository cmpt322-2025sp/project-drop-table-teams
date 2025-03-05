<script lang="ts">
  /**
   * A celebration component to show when a user completes a level
   */
  export let show: boolean = false;
  export let title: string = 'You Did It!';
  export let message: string = 'Great job!';
  export let buttonText: string = 'Play Again';
  export let onButtonClick: (() => void) | null = null;
</script>

{#if show}
  <div class="celebration">
    <div class="celebration-content">
      <h2>{title}</h2>
      <div class="stars">
        <div class="star">⭐</div>
        <div class="star">⭐</div>
        <div class="star">⭐</div>
      </div>
      <p>{message}</p>
      <button class="btn btn-primary btn-round btn-lg" on:click={onButtonClick}>
        {buttonText}
      </button>
    </div>
  </div>
{/if}

<style>
  .celebration {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.5s;
    backdrop-filter: blur(5px);
  }
  
  .celebration-content {
    background: linear-gradient(135deg, #FF9800, #F44336);
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: white;
    border: 6px solid #FFC107;
    max-width: 400px;
    width: 90%;
  }
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    animation: celebrate 1s infinite alternate;
  }
  
  @keyframes celebrate {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }
  
  .stars {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }
  
  .star {
    font-size: 3rem;
    margin: 0 0.5rem;
    animation: spin 2s infinite linear;
  }
  
  .star:nth-child(2) {
    animation-delay: 0.3s;
  }
  
  .star:nth-child(3) {
    animation-delay: 0.6s;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1); }
  }
  
  p {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>