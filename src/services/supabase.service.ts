
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    user = signal<User | null>(null);
    username = signal<string | null>(null);
    avatarUrl = signal<string | null>(null);
    loading = signal<boolean>(true);

    private supabaseUrl = 'https://xxvlfbozkveeydritfeo.supabase.co';
    private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dmxmYm96a3ZlZXlkcml0ZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDAyOTYsImV4cCI6MjA4NjQ3NjI5Nn0.P43jKtqWYzvBoBcW69BUWssCb68nU5m6zw03PdRf1vs';

    constructor() {
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.initAuth();
    }

    private async initAuth() {
        // 1. Get initial session
        const { data: { session } } = await this.supabase.auth.getSession();
        const initialUser = session?.user ?? null;
        this.user.set(initialUser);

        if (initialUser) {
            await this.fetchProfile(initialUser.id);
        }
        this.loading.set(false);

        // 2. Listen for changes
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('SupabaseService: Auth Event:', event);
            const newUser = session?.user ?? null;

            // Only fetch if user ID changed or explicitly signed in
            if (newUser?.id !== this.user()?.id || event === 'SIGNED_IN') {
                this.user.set(newUser);
                if (newUser) {
                    await this.fetchProfile(newUser.id);
                } else {
                    this.username.set(null);
                    this.avatarUrl.set(null);
                }
            }
        });
    }

    private async fetchProfile(uid?: string) {
        if (!uid) return;

        try {
            const { data, error } = await this.supabase.from('profiles')
                .select('username, nickname, avatar_url')
                .eq('id', uid)
                .maybeSingle();

            if (error) throw error;

            console.log('SupabaseService: Profilo recuperato:', data);
            this.username.set(data?.nickname || data?.username || null);
            this.avatarUrl.set(data?.avatar_url ?? null);
        } catch (e) {
            console.warn('SupabaseService: Error fetching profile:', e);
            // Fallback: use email as username if profile fetch fails
            if (!this.username()) {
                const user = this.user();
                if (user) this.username.set(user.email?.split('@')[0] || 'Utente');
            }
        }
    }

    async loadUserProfile() {
        const uid = this.user()?.id;
        if (uid) {
            return await this.fetchProfile(uid);
        }
    }

    get client() {
        return this.supabase;
    }

    // --- AUTH SERVICE (Modelled after Number-main) ---
    authService = {
        signUp: async (email: string, pass: string, nickname: string) => {
            console.log('AuthService: Tentativo registrazione per', nickname);

            // 1. Verifica disponibilità nickname PRIMA della registrazione
            const { data: existing } = await this.supabase
                .from('profiles')
                .select('username, nickname')
                .or(`username.ilike.${nickname},nickname.ilike.${nickname}`)
                .maybeSingle();

            if (existing) {
                return { data: { user: null, session: null }, error: { message: `Il nome "${nickname}" è già in uso.` } as any };
            }

            // 2. Registrazione Auth
            const res = await this.supabase.auth.signUp({
                email,
                password: pass,
                options: { data: { username: nickname } }
            });

            if (res.error) return res;

            // 3. Sync manuale profilo (Double Safety)
            if (res.data.user) {
                await this.supabase.from('profiles').upsert({
                    id: res.data.user.id,
                    username: nickname,
                    nickname: nickname,
                    email: email
                });
            }

            return res;
        },

        signIn: async (nickname: string, pass: string) => {
            console.log('AuthService: Login per', nickname);

            // A. Risolvi email da nickname (Case Insensitive)
            const { data: profile, error: lookupError } = await this.supabase
                .from('profiles')
                .select('email')
                .or(`username.ilike.${nickname},nickname.ilike.${nickname}`)
                .maybeSingle();

            if (lookupError) return { data: null, error: lookupError };
            if (!profile) return { data: null, error: { message: 'Operatore non trovato.' } as any };

            // B. Login con email
            return await this.supabase.auth.signInWithPassword({
                email: profile.email,
                password: pass
            });
        },

        signOut: async () => {
            await this.supabase.auth.signOut();
            this.user.set(null);
            this.username.set(null);
            this.avatarUrl.set(null);
        }
    };

    // --- PROFILE & CAREER SERVICE (Modelled after Number-main) ---
    profileService = {
        getProfile: async (uid: string) => {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .maybeSingle();
            return { data, error };
        },

        getCareerProgress: async (uid: string) => {
            const { data, error } = await this.supabase
                .from('career_progress')
                .select('*')
                .eq('user_id', uid)
                .maybeSingle();

            if (!data && !error) {
                // Crea record di default se manca
                const def = { user_id: uid, chess_level: 1, checkers_level: 1, total_points: 0 };
                const { data: inserted } = await this.supabase.from('career_progress').insert(def).select().maybeSingle();
                return { data: inserted || def, error: null };
            }
            return { data, error };
        }
    };

    // For backward compatibility while refactoring components
    async signUp(email: string, pass: string, nickname: string) { return this.authService.signUp(email, pass, nickname); }
    async signInWithNickname(nickname: string, pass: string) { return this.authService.signIn(nickname, pass); }
    async signOut() { return this.authService.signOut(); }
    async getCareerProgress() {
        const { data } = await this.profileService.getCareerProgress(this.user()?.id || '');
        return data as any;
    }

    async saveCareerGame(type: 'chess' | 'checkers', level: number, state: any) {
        const userId = this.user()?.id;
        if (!userId) return;

        await this.supabase.from('career_progress').upsert({
            user_id: userId,
            current_game_state: { type, level, state },
            updated_at: new Date().toISOString()
        });
    }

    async updateCareerProgress(type: 'chess' | 'checkers', levelReached: number, pointsEarned: number) {
        const userId = this.user()?.id;
        if (!userId) return;

        const current = await this.getCareerProgress();
        const levelKey = type === 'chess' ? 'chess_level' : 'checkers_level';
        const newLevel = Math.max(current[levelKey], levelReached + 1);

        await this.supabase.from('career_progress').upsert({
            user_id: userId,
            [levelKey]: newLevel,
            total_points: (current.total_points || 0) + pointsEarned,
            games_played: (current.games_played || 0) + 1,
            games_won: (current.games_won || 0) + 1,
            current_game_state: null, // Clear saved game upon level completion
            updated_at: new Date().toISOString()
        });
    }

    async trackGamePlayed() {
        const userId = this.user()?.id;
        if (!userId) return;
        const current = await this.getCareerProgress();
        await this.supabase.from('career_progress').upsert({
            user_id: userId,
            games_played: (current.games_played || 0) + 1,
            updated_at: new Date().toISOString()
        });
    }

    async clearSavedGame() {
        const userId = this.user()?.id;
        if (!userId) return;
        await this.supabase.from('career_progress').update({ current_game_state: null }).eq('user_id', userId);
    }

    async saveUserAssetPreference(assetType: string, url: string) {
        const userId = this.user()?.id;
        if (!userId) return;

        const { data: profile } = await this.supabase
            .from('profiles')
            .select('active_assets')
            .eq('id', userId)
            .maybeSingle();

        const currentAssets = profile?.active_assets || {};
        currentAssets[assetType] = url;

        await this.supabase
            .from('profiles')
            .update({ active_assets: currentAssets })
            .eq('id', userId);
    }

    async getUserAssetPreferences() {
        const userId = this.user()?.id;
        if (!userId) return {};

        const { data } = await this.supabase
            .from('profiles')
            .select('active_assets')
            .eq('id', userId)
            .maybeSingle();

        return data?.active_assets || {};
    }

    async uploadCustomAssetFile(file: File, assetType: string): Promise<string> {
        const userId = this.user()?.id;
        if (!userId) throw new Error('User not logged in');

        const fileExt = file.name.split('.').pop() || 'glb';
        const filePath = `${userId}/${assetType}.${fileExt}`;

        const { error: uploadError } = await this.supabase.storage
            .from('custom_assets')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = this.supabase.storage
            .from('custom_assets')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
}
