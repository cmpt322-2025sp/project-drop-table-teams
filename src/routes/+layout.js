/*
Sveltekit renders the page in the server which causes errors with browser objects like window, document, etc.
This line disables server-side rendering for the entire app, making it client-side only.
This is necessary for the Phaser integration.
*/
export const ssr = false;