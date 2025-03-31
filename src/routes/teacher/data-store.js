import { writable } from 'svelte/store';
	
export let studentsArray = writable([
	{
		"Name" : "Maria",
		"Problems" : "Edit",
		"Game" : "Play"
	},
	{
		"Name" : "Jose",
		"Problems" : <a href="/dashboard">Edit</a>,
		"Game" : "Play"
	},
]);