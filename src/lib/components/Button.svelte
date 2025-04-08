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
	export let width: string | undefined = undefined;
	export let height: string | undefined = undefined;
	export let fontSize: string | undefined = undefined;
	export let style: string = '';
	// Accessibility props passed as attributes directly

	// Generate classes based on props
	$: classes = [
		'btn',
		variant !== 'default' ? `btn-${variant}` : '',
		`btn-${size}`,
		rounded ? 'btn-round' : '',
		icon ? 'btn-icon' : ''
	]
		.filter(Boolean)
		.join(' ');

	// Generate inline style string
	$: inlineStyle = [
		width ? `width: ${width};` : '',
		height ? `height: ${height};` : '',
		fontSize ? `font-size: ${fontSize};` : '',
		style
	]
		.filter(Boolean)
		.join(' ');
</script>

<button 
	class={classes} 
	{type} 
	{disabled} 
	style={inlineStyle} 
	on:click={onClick || undefined}
	{...$$restProps}
>
	<slot />
</button>
