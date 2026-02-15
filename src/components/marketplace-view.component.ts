
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';

interface AssetCollection {
  id: string;
  name: string;
  author_name?: string;
  price_eur: number;
  preview_image_url?: string;
  is_public: boolean;
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
                [class.bg-slate-900_50]="activeTab !== 'free'"
                [class.text-slate-500]="activeTab !== 'free'"
                class="px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/5 min-w-[160px] whitespace-nowrap">
          Libreria Gratis
        </button>
        <button (click)="activeTab = 'paid'"
                class="px-8 py-3 bg-slate-900/30 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/5 opacity-60 min-w-[160px] flex items-center justify-between gap-3 cursor-not-allowed">
          Premium Pack 
          <span class="px-2 py-0.5 bg-black/40 rounded text-[8px]">Soon</span>
        </button>
        <button (click)="activeTab = 'community'"
                class="px-8 py-3 bg-slate-900/30 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/5 opacity-60 min-w-[160px] flex items-center justify-between gap-3 cursor-not-allowed">
          Community
          <span class="px-2 py-0.5 bg-black/40 rounded text-[8px]">Soon</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        
        @if (activeTab === 'free') {
          <div class="max-w-[1600px] mx-auto space-y-12 animate-fade-in">
            
            <!-- Section Header -->
            <div class="flex items-end justify-between border-b border-white/5 pb-4">
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tight">Collezione Standard</h2>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Set pronti all'uso per personalizzare la tua scacchiera</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              
              <!-- Default Kit Card -->
              <div class="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] shadow-2xl flex flex-col">
                <div class="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <span class="text-6xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">♟️</span>
                  <div class="absolute top-4 left-4 px-3 py-1 bg-slate-800/80 backdrop-blur-md text-white/80 text-[9px] font-black uppercase rounded-lg tracking-widest border border-white/10">Default</div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                  <div class="mb-4">
                    <h3 class="text-lg font-black text-white uppercase tracking-tighter mb-1">Classic Kit v1</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Il set originale di The King</p>
                  </div>
                  
                  <div class="mt-auto">
                    <button (click)="useKit('default')" 
                      class="w-full py-3 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white border border-white/5 hover:border-indigo-400/50 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 group/btn">
                      <span>Installa</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity translate-x-[-10px] group-hover/btn:translate-x-0">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Dynamic Kits -->
              @for (kit of assets; track kit.id) {
                 <div class="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] shadow-2xl flex flex-col">
                    <div class="aspect-[4/3] bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      @if (kit.preview_image_url) {
                        <img [src]="kit.preview_image_url" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105">
                      } @else {
                        <span class="text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">📦</span>
                      }
                      
                      @if (kit.price_eur > 0) {
                        <div class="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                          € {{ kit.price_eur }}
                        </div>
                      } @else {
                        <div class="absolute top-4 right-4 bg-emerald-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                          Gratis
                        </div>
                      }
                    </div>

                    <div class="p-6 flex flex-col flex-1">
                      <div class="mb-4">
                        <h3 class="text-lg font-black text-white uppercase tracking-tighter mb-1 truncate">{{ kit.name }}</h3>
                        <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest truncate">
                          {{ kit.author_name || 'The King Official' }}
                        </p>
                      </div>
                      
                      <div class="mt-auto">
                        <button (click)="useKit(kit)" 
                          class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform active:scale-95">
                          {{ kit.price_eur > 0 ? 'Acquista' : 'Installa' }}
                        </button>
                      </div>
                    </div>
                 </div>
              }

              <!-- Coming Soon Placeholder -->
              @for (i of [1,2]; track i) {
                <div class="border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 opacity-30 select-none min-h-[300px]">
                  <span class="text-4xl mb-4 grayscale">✨</span>
                  <p class="text-[9px] font-black uppercase tracking-[0.3em] text-center">Nuovi Kit in Arrivo</p>
                </div>
              }

            </div>
          </div>
        }

        @if (activeTab === 'paid') {
           <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in opacity-50">
              <div class="w-24 h-24 rounded-[2rem] bg-amber-600/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <span class="text-5xl">💎</span>
              </div>
              <h2 class="text-3xl font-black text-white uppercase tracking-tighter mb-2">Premium Shop</h2>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-md">Funzionalità in fase di sviluppo.</p>
           </div>
        }

        @if (activeTab === 'community') {
           <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in opacity-50">
              <div class="w-24 h-24 rounded-[2rem] bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <span class="text-5xl">🌍</span>
              </div>
              <h2 class="text-3xl font-black text-white uppercase tracking-tighter mb-2">Community</h2>
              <p class="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-md">Funzionalità in fase di sviluppo.</p>
           </div>
        }

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
      const { data, error } = await this.supabase.client
        .from('asset_collections')
        .select('*')
        .eq('is_public', true);

      if (!error && data) {
        this.assets = data;
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
    } finally {
      this.loading = false;
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
