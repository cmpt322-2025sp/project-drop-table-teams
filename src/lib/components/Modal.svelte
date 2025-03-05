<script lang="ts">
  /**
   * Reusable modal component
   */
  export let show: boolean = false;
  export let theme: string = 'default';
  export let onClose: (() => void) | null = null;
  export let disableBackdropClick: boolean = false;
  
  function handleBackdropClick() {
    if (!disableBackdropClick && onClose) {
      onClose();
    }
  }
  
  function handleContentClick(e: MouseEvent) {
    // Prevent clicks inside the modal content from closing the modal
    e.stopPropagation();
  }
</script>

{#if show}
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick} 
    on:keydown={(e) => e.key === 'Escape' && onClose && onClose()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div 
      class="modal-content {theme}-theme" 
      on:click={handleContentClick}
      on:keydown={(e) => e.stopPropagation()}
      role="document"
    >
      {#if onClose}
        <button class="close-button" on:click={onClose} aria-label="Close">×</button>
      {/if}
      <slot />
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.3s ease;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>