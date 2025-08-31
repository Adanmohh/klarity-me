import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient, Session, User } from '@supabase/supabase-js'
import { DataMigrationService } from '../utils/dataMigration'

// Disable direct Supabase connection - all DB calls should go through backend
const supabaseUrl = 'https://disabled.supabase.co'
const supabaseAnonKey = 'disabled-key'

// Create the main Supabase client (disabled - using backend API)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Enhanced Supabase service with auth integration
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private authCallbacks: Array<(session: Session | null) => void> = [];

  private constructor() {
    this.client = supabase;
    this.setupAuthListener();
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private setupAuthListener() {
    this.client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session?.user?.email);
      
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      // Notify all callbacks
      this.authCallbacks.forEach(callback => callback(session));
      
      // Handle migration on sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleUserSignIn();
      }
      
      // Clean up on sign out
      if (event === 'SIGNED_OUT') {
        this.handleUserSignOut();
      }
    });
  }

  private async handleUserSignIn() {
    try {
      // Check if migration is needed
      const migrationStatus = DataMigrationService.getMigrationStatus();
      if (!migrationStatus.completed) {
        // Check if there's localStorage data to migrate
        const backup = DataMigrationService.exportLocalStorageData();
        if (backup && this.hasDataToMigrate(backup)) {
          console.log('Found localStorage data, starting migration...');
          const result = await DataMigrationService.migrateToSupabase();
          console.log('Migration result:', result);
        }
      }
    } catch (error) {
      console.error('Error during sign-in migration:', error);
    }
  }

  private handleUserSignOut() {
    // Clear any cached data
    this.currentUser = null;
    this.currentSession = null;
  }

  private hasDataToMigrate(backup: any): boolean {
    return Object.values(backup.data).some((data: any) => 
      Array.isArray(data) && data.length > 0
    );
  }

  // Auth methods
  async signUp(email: string, password: string, options?: { data?: any }) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(email);
    return { data, error };
  }

  async updateUser(updates: { email?: string; password?: string; data?: any }) {
    const { data, error } = await this.client.auth.updateUser(updates);
    return { data, error };
  }

  // Auth state management
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && !!this.currentUser;
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    this.authCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authCallbacks.indexOf(callback);
      if (index > -1) {
        this.authCallbacks.splice(index, 1);
      }
    };
  }

  // Database methods with automatic auth context
  getClient(): SupabaseClient {
    return this.client;
  }

  // Helper method to ensure user is authenticated for operations
  private ensureAuthenticated(): User {
    if (!this.currentUser) {
      throw new Error('User must be authenticated to perform this operation');
    }
    return this.currentUser;
  }

  // Backup and restore methods
  async exportUserData() {
    this.ensureAuthenticated();
    return await DataMigrationService.exportSupabaseData();
  }

  async migrateFromLocalStorage() {
    this.ensureAuthenticated();
    return await DataMigrationService.migrateToSupabase();
  }

  // Realtime subscription helpers
  subscribeToTable(tableName: string, callback: (payload: any) => void, filter?: any) {
    let subscription = this.client
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...filter
        },
        callback
      );
      
    subscription.subscribe();
    
    return subscription;
  }

  // Storage helpers (for future file uploads)
  async uploadFile(bucket: string, path: string, file: File) {
    this.ensureAuthenticated();
    
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file);
      
    return { data, error };
  }

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);
      
    return { data, error };
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();

// Legacy auth state change listener for backward compatibility
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Legacy auth event:', event);
  console.log('Legacy session:', session);
})