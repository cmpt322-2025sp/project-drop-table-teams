// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types.ts'; // import generated types

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			supabaseAdmin: SupabaseClient<Database>; // Admin client with service role
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			userRole?: string; // Add userRole to store the role information
		}
		interface PageData {
			session: Session | null;
			supabase?: SupabaseClient<Database>;
			user?: User | null;
			userRole?: string; // Add userRole to the PageData
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
