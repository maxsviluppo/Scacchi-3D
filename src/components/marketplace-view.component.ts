
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';

interface AssetCollection {
    id: string;
    name: string;
    author_name?: string;
    price_eur: number;
    preview_image_url: string;
    is_public: boolean;
}

@Component({
    selector: 'app-marketplace-view',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
      
      <!-- Premium Header -->
      <div class="relative z-10 px-6 py-8 md:px-12 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
        <div class="flex items-center gap-6">
          <button (click)="gameService.setView('home')" 
            class="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-indigo-400/50 transition-all flex items-center justify-center group shadow-xl">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" class="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <path d="M70 20 L30 50 L70 80" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 class="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Marketplace</h1>
            <p class="text-indigo-400/80 text-xs md:text-sm font-bold uppercase tracking-widest">Asset Collection & Skins</p>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-4 bg-slate-950/50 px-6 py-3 rounded-2xl border border-white/5">
          <div class="text-right">
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Il tuo saldo</p>
            <p class="text-xl font-black text-white">€ 0.00</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="white" class="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M11.8 8h-2c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm0 6h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Content / Grid -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div class="max-w-7xl mx-auto">
          
          <!-- Categories / Filter -->
          <div class="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            @for (cat of categories; track cat) {
               <button [class.bg-indigo-600]="activeCategory === cat"
                 [class.text-white]="activeCategory === cat"
                 [class.bg-slate-900]="activeCategory !== cat"
                 [class.text-slate-400]="activeCategory !== cat"
                 (click)="activeCategory = cat"
                 class="px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 border border-white/5 white-space-nowrap">
                 {{ cat }}
               </button>
            }
          </div>

          <!-- Assets Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (asset of loading ? [1,2,3,4] : assets; track asset.id) {
               <div class="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-8px] shadow-2xl">
                 
                 <!-- Image Container -->
                 <div class="aspect-[4/3] bg-slate-950 relative overflow-hidden">
                    @if (loading) {
                      <div class="absolute inset-0 animate-pulse bg-slate-800"></div>
                    } @else {
                      <img [src]="asset.preview_image_url || 'https://images.unsplash.com/photo-1529699211952-734e80c4d32b?auto=format&fit=crop&q=80&w=800'" 
                           class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100">
                      
                      <!-- Overlay info -->
                      <div class="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                        <span class="text-[10px] font-black text-yellow-400">€ {{ asset.price_eur }}</span>
                      </div>
                    }
                 </div>

                 <!-- Footer -->
                 <div class="p-6">
                   <div class="flex justify-between items-start mb-4">
                     <div>
                       <h3 class="text-white font-black uppercase text-lg leading-tight tracking-tighter">{{ loading ? 'Caricamento...' : asset.name }}</h3>
                       <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Collezione Premium</p>
                     </div>
                   </div>

                   <button [disabled]="loading"
                     class="w-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-white/5 hover:border-indigo-400/50">
                     Visualizza Dettagli
                   </button>
                 </div>
               </div>
            }
          </div>
          
          @if (!loading && assets.length === 0) {
            <div class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center mb-6 border border-white/5 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 text-slate-500" stroke="currentColor" stroke-width="2">
                  <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"></path>
                  <path d="M3 8h18M10 12h4"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Nessun asset trovato</h3>
              <p class="text-slate-500 max-w-sm mt-2 font-bold uppercase text-xs tracking-widest">Torna più tardi per scoprire le ultime collezioni create dalla nostra community.</p>
            </div>
          }

        </div>
      </div>
    </div>
  `,
    styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 0.4s ease-out; }
  `]
})
export class MarketplaceViewComponent implements OnInit {
    supabase = inject(SupabaseService);
    gameService = inject(GameService);

    assets: AssetCollection[] = [];
    loading = true;
    categories = ['Tutti', 'Classici', 'Neon', 'Medievali', 'Futuristici'];
    activeCategory = 'Tutti';

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
}
