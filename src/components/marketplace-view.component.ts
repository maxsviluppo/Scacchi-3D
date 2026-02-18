
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';

interface AssetCollection {
  id: string;
  name: string;
  author_id?: string;
  author_name?: string;
  price_eur: number;
  preview_image_url?: string;
  is_public: boolean;
  is_official: boolean;
  status: 'pending' | 'approved' | 'rejected';
  assets: Record<string, string>; // Maps piece ID to URL
}

@Component({
  selector: 'app-marketplace-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col bg-slate-950/98 backdrop-blur-3xl animate-fade-in font-sans">
      
      <!-- Market Header -->
      <div class="relative z-10 px-6 py-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-slate-900/40 shadow-2xl">
        <div class="flex items-center gap-6">
          <button (click)="gameService.setView('home')" 
            class="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-indigo-400/50 transition-all flex items-center justify-center group shadow-xl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">THE KING SHOP</h1>
            <p class="text-indigo-400/80 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Design & Custom Assets</p>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-6">
          <div class="flex flex-col items-end">
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saldo Disponibile</p>
            <p class="text-xl font-black text-white uppercase tracking-tighter">0.00 €</p>
          </div>
          <button class="px-6 py-3 bg-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105 transition-all text-white">Ricarica</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="px-6 md:px-12 pt-8 flex gap-4 overflow-x-auto scrollbar-hide shrink-0">
        <button (click)="activeTab = 'free'"
                [class.bg-indigo-600]="activeTab === 'free'"
                [class.text-white]="activeTab === 'free'"
                [class.bg-slate-900/50]="activeTab !== 'free'"
                [class.text-slate-500]="activeTab !== 'free'"
                class="px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/5 min-w-[160px] whitespace-nowrap">
          Kit Gratuiti
        </button>
        <button (click)="activeTab = 'paid'"
                [class.bg-amber-600]="activeTab === 'paid'"
                [class.text-white]="activeTab === 'paid'"
                [class.bg-slate-900/50]="activeTab !== 'paid'"
                [class.text-slate-500]="activeTab !== 'paid'"
                class="px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/5 min-w-[160px]">
          Kit Premium
        </button>
        <button (click)="activeTab = 'community'"
                [class.bg-emerald-600]="activeTab === 'community'"
                [class.text-white]="activeTab === 'community'"
                [class.bg-slate-900/50]="activeTab !== 'community'"
                [class.text-slate-500]="activeTab !== 'community'"
                class="px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/5 min-w-[160px]">
          Kit Utenti
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        
        <div class="max-w-[1600px] mx-auto space-y-12 animate-fade-in">
          
          <!-- Section Header -->
          <div class="flex items-end justify-between border-b border-white/5 pb-4">
            <div>
              <h2 class="text-2xl font-black text-white uppercase tracking-tight">
                {{ activeTab === 'free' ? 'Collezione Gratuita' : (activeTab === 'paid' ? 'Contenuti Premium' : 'Creazioni della Community') }}
              </h2>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                {{ activeTab === 'free' ? 'Set ufficiali pronti all\'uso' : (activeTab === 'paid' ? 'Design esclusivi di alta qualità' : 'I migliori kit creati dai giocatori') }}
              </p>
            </div>
          </div>

          @if (loading) {
            <div class="flex flex-col items-center justify-center py-20 opacity-40">
              <div class="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p class="text-[10px] font-black uppercase tracking-widest">Sincronizzazione Shop...</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              
              <!-- Default Kit (Only in Free tab) -->
              @if (activeTab === 'free') {
                <div class="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] shadow-2xl flex flex-col">
                  <div class="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                    <span class="text-6xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">♟️</span>
                    <div class="absolute top-4 left-4 px-3 py-1 bg-slate-800/80 backdrop-blur-md text-white/80 text-[9px] font-black uppercase rounded-lg tracking-widest border border-white/10">Default</div>
                  </div>
                  <div class="p-6 flex flex-col flex-1">
                    <div class="mb-4">
                      <h3 class="text-lg font-black text-white uppercase tracking-tighter mb-1">Classic Kit v1</h3>
                      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Il set originale di THE KING</p>
                    </div>
                    
                    <div class="mt-auto">
                      <button (click)="useKit('default')" 
                        class="w-full py-3 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white border border-white/5 hover:border-indigo-400/50 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 group/btn">
                        <span>Installa</span>
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- Dynamic Kits -->
              @for (kit of filteredKits; track kit.id) {
                 <div class="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] shadow-2xl flex flex-col">
                    <div class="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      @if (kit.preview_image_url) {
                        <img [src]="kit.preview_image_url" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
                      } @else {
                        <span class="text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">📦</span>
                      }
                      
                      <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/10 shadow-lg">
                        <span [class.text-emerald-400]="kit.price_eur === 0" [class.text-amber-400]="kit.price_eur > 0">
                          {{ kit.price_eur === 0 ? 'Gratis' : '€ ' + kit.price_eur }}
                        </span>
                      </div>

                      <div class="absolute top-4 left-4 px-2 py-1 bg-indigo-500/20 backdrop-blur-md text-[8px] font-black uppercase rounded border border-indigo-400/20 tracking-widest">
                        {{ kit.type === 'chess' ? 'Scacchi' : 'Dama' }}
                      </div>
                    </div>

                    <div class="p-6 flex flex-col flex-1">
                      <div class="mb-4">
                        <h3 class="text-lg font-black text-white uppercase tracking-tighter mb-1 truncate">{{ kit.name }}</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                          {{ kit.is_official ? 'The King Official' : (kit.author_name || 'Community Member') }}
                        </p>
                      </div>
                      
                      <div class="mt-auto">
                        <button (click)="useKit(kit)" 
                          [class.bg-indigo-600]="activeTab === 'free'"
                          [class.hover:bg-indigo-500]="activeTab === 'free'"
                          [class.bg-amber-600]="activeTab === 'paid'"
                          [class.hover:bg-amber-500]="activeTab === 'paid'"
                          [class.bg-emerald-600]="activeTab === 'community'"
                          [class.hover:bg-emerald-500]="activeTab === 'community'"
                          class="w-full py-3 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl transform active:scale-95">
                          {{ kit.price_eur > 0 ? 'Acquista' : 'Installa' }}
                        </button>
                      </div>
                    </div>
                 </div>
              } @empty {
                <div class="col-span-full py-20 text-center opacity-30 select-none">
                  <span class="text-6xl mb-6 block">🍃</span>
                  <p class="text-[10px] font-black uppercase tracking-[0.4em]">Nessun kit disponibile in questa sezione</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class MarketplaceViewComponent implements OnInit {
  supabase = inject(SupabaseService);
  gameService = inject(GameService);

  assets: AssetCollection[] = [];
  loading = true;
  activeTab: 'free' | 'paid' | 'community' = 'free';

  ngOnInit() {
    this.fetchAssets();
  }

  async fetchAssets() {
    this.loading = true;
    try {
      // JOIN with profiles to get author details
      const { data, error } = await this.supabase.client
        .from('asset_collections')
        .select(`
          *,
          author:profiles(username, nickname)
        `)
        .eq('is_public', true)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        this.assets = data.map(kit => ({
          ...kit,
          author_name: kit.author?.nickname || kit.author?.username || 'Community Member'
        }));
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
    } finally {
      this.loading = false;
    }
  }

  get filteredKits(): AssetCollection[] {
    if (this.activeTab === 'free') {
      return this.assets.filter(a => a.is_official && a.price_eur === 0);
    } else if (this.activeTab === 'paid') {
      return this.assets.filter(a => a.is_official && a.price_eur > 0);
    } else {
      return this.assets.filter(a => !a.is_official);
    }
  }

  useKit(kit: string | AssetCollection) {
    if (kit === 'default') {
      this.gameService.pieceStyle.set('classic');
      this.gameService.customMeshUrls.set({});
      this.saveUserPreference('default');
      alert('Kit Classic v1 Attivato! 👑');
    } else if (typeof kit !== 'string') {
      if (kit.price_eur > 0) {
        alert('Il sistema di pagamenti sarà disponibile a breve!');
        return;
      }

      console.log('Activating Kit:', kit.name);

      // Update GameService with the map of assets
      // The 'assets' field in DB is JSONB { "p_w": "url", ... }
      this.gameService.customMeshUrls.set(kit.assets);
      this.gameService.pieceStyle.set('custom');

      this.saveUserPreference(kit.id);

      alert(`Kit ${kit.name} installato con successo!`);
    }
  }

  async saveUserPreference(kitId: string) {
    const user = this.supabase.user();
    if (!user) return;

    // Only works if profile has the column, fails gracefully otherwise
    try {
      const { error } = await this.supabase.client.from('profiles').update({
        current_kit_id: kitId
      }).eq('id', user.id);

      if (error) console.error('Error saving kit preference:', error);
    } catch (e) {
      console.warn('Could not persist kit preference', e);
    }
  }
}
