
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

    // Inserimento URL fornito dall'utente. 
    // La Anon Key verrà chiesta o cercata nelle variabili d'ambiente.
    private supabaseUrl = 'https://xxvlfbozkveeydritfeo.supabase.co';
    private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dmxmYm96a3ZlZXlkcml0ZmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDAyOTYsImV4cCI6MjA4NjQ3NjI5Nn0.P43jKtqWYzvBoBcW69BUWssCb68nU5m6zw03PdRf1vs';

    constructor() {
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.initAuth();
    }

    private async initAuth() {
        const { data: { session } } = await this.supabase.auth.getSession();
        this.user.set(session?.user ?? null);
        await this.fetchProfile(session?.user?.id);
        this.loading.set(false);

        this.supabase.auth.onAuthStateChange(async (event, session) => {
            this.user.set(session?.user ?? null);
            await this.fetchProfile(session?.user?.id);
        });
    }

    private async fetchProfile(uid?: string) {
        if (!uid) {
            this.username.set(null);
            this.avatarUrl.set(null);
            return;
        }
        const { data } = await this.supabase.from('profiles').select('username, avatar_url').eq('id', uid).single();
        this.username.set(data?.username ?? null);
        this.avatarUrl.set(data?.avatar_url ?? null);
    }

    async loadUserProfile() {
        const uid = this.user()?.id;
        if (uid) {
            await this.fetchProfile(uid);
        }
    }

    get client() {
        return this.supabase;
    }

    async signUp(email: string, pass: string, nickname: string) {
        const res = await this.supabase.auth.signUp({ email, password: pass });
        if (res.data.user) {
            await this.supabase.from('profiles').upsert({
                id: res.data.user.id,
                username: nickname,
                email: email
            });
        }
        return res;
    }

    async signIn(email: string, pass: string) {
        return await this.supabase.auth.signInWithPassword({ email, password: pass });
    }

    async signInWithNickname(nickname: string, pass: string) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('email')
            .eq('username', nickname)
            .single();

        if (error || !data) {
            return { data: null, error: { message: 'Nickname non trovato' } as any };
        }
        return await this.signIn(data.email, pass);
    }

    async signOut() {
        await this.supabase.auth.signOut();
    }

    // --- CAREER LOGIC ---

    async getCareerProgress() {
        const userId = this.user()?.id;
        if (!userId) return null;

        const { data, error } = await this.supabase
            .from('career_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // No record found, create default
            const defaultProgress = {
                user_id: userId,
                chess_level: 1,
                checkers_level: 1,
                total_points: 0
            };
            await this.supabase.from('career_progress').insert(defaultProgress);
            return defaultProgress;
        }

        return data;
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
}
