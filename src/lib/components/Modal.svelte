<script lang="ts">
	/**
	 * Reusable modal component
	 */
	import { Button } from '$lib/components';
	import { onMount, onDestroy, tick } from 'svelte';

	export let show: boolean = false;
	export let theme: string = 'default';
	export let onClose: (() => void) | null = null;
	export let disableBackdropClick: boolean = false;
	export let titleId: string = 'dialog-title';

	let dialogElement: HTMLDialogElement;
	let previouslyFocusedElement: Element | null = null;

	function handleBackdropClick(e: MouseEvent) {
		// Close when clicking outside content
		if (e.target === dialogElement && !disableBackdropClick && onClose) {
			onClose();
		}
	}

	function handleEscapeAndTab(e: KeyboardEvent) {
		if (e.key === 'Escape' && onClose) {
			onClose();
			return;
		}

		// Trap focus inside dialog
		if (e.key === 'Tab' && dialogElement) {
			const focusableElements = dialogElement.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			if (focusableElements.length > 0) {
				const firstElement = focusableElements[0] as HTMLElement;
				const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

				if (e.shiftKey && document.activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				} else if (!e.shiftKey && document.activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}
		}
	}

	onMount(() => {
		if (show) {
			// Store currently focused element to restore later
			previouslyFocusedElement = document.activeElement;
		}

		// Add global event listeners for keyboard and click
		document.addEventListener('keydown', handleEscapeAndTab);
	});

	onDestroy(() => {
		// Remove all event listeners
		document.removeEventListener('keydown', handleEscapeAndTab);

		// Restore focus when component is destroyed
		if (previouslyFocusedElement && previouslyFocusedElement instanceof HTMLElement) {
			previouslyFocusedElement.focus();
		}
	});

	// When dialog element is ready or visibility changes
	$: if (dialogElement) {
		if (show) {
			// Setup event listeners and focus
			if (!dialogElement.open) {
				dialogElement.showModal();

				// Set up click listener for backdrop
				dialogElement.addEventListener('click', handleBackdropClick);

				// Set focus after dialog is visible
				tick().then(() => {
					const focusableElements = dialogElement.querySelectorAll(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					);
					if (focusableElements.length > 0) {
						(focusableElements[0] as HTMLElement).focus();
					} else {
						dialogElement.focus();
					}
				});
			}
		} else {
			// Clean up when hiding
			if (dialogElement.open) {
				dialogElement.removeEventListener('click', handleBackdropClick);
				dialogElement.close();
			}
		}
	}
</script>

{#if show}
	<!-- Using native dialog element with showModal() method -->
	<dialog bind:this={dialogElement} class="modal-backdrop" aria-labelledby={titleId}>
		<div class="modal-content {theme}-theme">
			{#if onClose}
				<Button
					variant="default"
					size="sm"
					icon={true}
					onClick={onClose}
					style="position: absolute; top: 1rem; right: 1rem; background: rgba(0, 0, 0, 0.1); width: 2rem; height: 2rem; padding: 0;"
					aria-label="Close dialog"
				>
					×
				</Button>
			{/if}
			<slot />
		</div>
	</dialog>
{/if}

<style>
	dialog.modal-backdrop {
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
		border: none;
		padding: 0;
		margin: 0;
		max-width: 100%;
		max-height: 100%;
	}

	dialog.modal-backdrop::backdrop {
		background-color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
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

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
