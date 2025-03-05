<script lang="ts">
  /**
   * Reusable button component with various styles and variants
   */
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'default' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let rounded: boolean = false;
  export let icon: boolean = false;
  export let disabled: boolean = false;
  export let onClick: (() => void) | null = null;
  
  // Generate classes based on props
  $: classes = [
    'btn',
    variant !== 'default' ? `btn-${variant}` : '',
    `btn-${size}`,
    rounded ? 'btn-round' : '',
    icon ? 'btn-icon' : '',
  ].filter(Boolean).join(' ');
</script>

<button 
  class={classes} 
  type={type} 
  disabled={disabled} 
  on:click={onClick || undefined}
>
  <slot />
</button>