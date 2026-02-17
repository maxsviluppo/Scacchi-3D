
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: string;
  username: string;
  nickname?: string;
  email: string;
  created_at: string;
  is_active?: boolean;
}

interface AssetCollection {
  id: string;
  name: string;
  author_id?: string;
  author_name?: string;
  type: 'chess' | 'checkers';
  price_eur: number;
  assets: Record<string, string>;
  is_public: boolean;
  is_official: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface KitAssetSlot {
  id: string; // e.g. 'p_w', 'r_b', 'board'
  label: string;
  icon: string;
  file: File | null;
  uploadedUrl: string | null;
  previewUrl: string | null; // URL per anteprima 3D
  status: 'pending' | 'ready' | 'uploading' | 'done' | 'error';
}

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      
      <!-- Admin Header (Responsive) -->
      <div class="px-6 py-4 md:px-8 md:py-6 bg-slate-900 border-b border-white/10 flex items-center justify-between shadow-2xl z-20">
        <div class="flex items-center gap-4 md:gap-6">
          <button (click)="gameService.setView('home')" 
            class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center transition-all group shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-xl md:text-2xl font-black uppercase tracking-tighter">Pannello Admin</h1>
            <p class="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">Accesso Autoritizzato</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden md:block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span class="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Sistema: Online</span>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        <!-- Sidebar Navigation (Responsive) -->
        <div class="w-full md:w-64 bg-slate-900/50 border-b md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <button (click)="activeTab = 'users'; fetchUsers()" 
            [class.bg-indigo-600]="activeTab === 'users'"
            [class.text-white]="activeTab === 'users'"
            [class.text-slate-500]="activeTab !== 'users'"
            class="whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3">
            <span class="text-lg">👥</span> <span class="hidden md:inline">Utenti</span>
          </button>
          <button (click)="activeTab = 'kits'" 
            [class.bg-indigo-600]="activeTab === 'kits'"
            [class.text-white]="activeTab === 'kits'"
            [class.text-slate-500]="activeTab !== 'kits'"
            class="whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3">
             <span class="text-lg">📦</span> <span class="hidden md:inline">Gestione Kit</span>
          </button>
          <button (click)="activeTab = 'approval'" 
            [class.bg-indigo-600]="activeTab === 'approval'"
            [class.text-white]="activeTab === 'approval'"
            [class.text-slate-500]="activeTab !== 'approval'"
            class="whitespace-nowrap md:w-full text-left px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-3">
             <span class="text-lg">⚖️</span> <span class="hidden md:inline">Approvazioni</span>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-950">
          
          <!-- USERS TAB -->
          @if (activeTab === 'users') {
            <div class="space-y-8 animate-fade-in max-w-6xl mx-auto">
              <!-- Header -->
              <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Utenti Iscritti</h2>
                  <div class="flex items-center gap-3 mt-1">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">Totale Account: {{ users.length }}</p>
                    @if (loading) {
                      <span class="text-[10px] text-indigo-400 font-bold uppercase animate-pulse">Caricamento in corso...</span>
                    }
                  </div>
                </div>
                <button (click)="fetchUsers()" [disabled]="loading" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                  <span>{{ loading ? '⏳' : '🔄' }}</span> Aggiorna Lista
                </button>
              </div>

              @if (fetchError) {
                <div class="p-6 bg-rose-500/10 border-2 border-rose-500/20 rounded-[2rem] text-rose-500 animate-shake">
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">⚠️</span>
                    <div>
                      <h3 class="font-black uppercase tracking-tighter">Errore di Sincronizzazione</h3>
                      <p class="text-xs font-bold opacity-80 mt-1">{{ fetchError }}</p>
                      <p class="text-[10px] mt-2 italic">Verifica le policy RLS della tabella 'profiles' su Supabase.</p>
                    </div>
                  </div>
                </div>
              }

              <!-- Table -->
              <div class="bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <div class="overflow-x-auto">
                  <table class="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr class="bg-black/20 border-b border-white/5 text-left">
                        <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Registrato</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (user of users; track user.id) {
                        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <td class="px-6 py-4">
                            <div class="flex flex-col">
                              <span class="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{{ user.nickname || user.username }}</span>
                              @if (user.nickname && user.username !== user.nickname) {
                                <span class="text-[9px] text-slate-600 font-bold uppercase tracking-widest">@{{ user.username }}</span>
                              }
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-slate-400 text-sm font-medium">{{ user.email }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-slate-500 text-[10px] uppercase font-bold">{{ user.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm"
                                  [class.bg-emerald-500/10]="user.is_active" [class.text-emerald-400]="user.is_active"
                                  [class.border]="user.is_active" [class.border-emerald-500/20]="user.is_active"
                                  [class.bg-rose-500/10]="!user.is_active" [class.text-rose-400]="!user.is_active"
                                  [class.border]="!user.is_active" [class.border-rose-500/20]="!user.is_active">
                              {{ user.is_active ? 'Attivo' : 'Sospeso' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <button (click)="deleteUser(user.id)" class="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Elimina</button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="px-6 py-20 text-center">
                            <div class="flex flex-col items-center opacity-40">
                              <span class="text-5xl mb-4">👻</span>
                              <p class="text-sm font-black uppercase tracking-widest text-slate-500">Nessun utente trovato</p>
                              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2">La tabella 'profiles' sembra essere vuota</p>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- KITS TAB (Refactored) -->
          @if (activeTab === 'kits') {
            <div class="space-y-10 animate-fade-in max-w-6xl mx-auto pb-20">
              
              <!-- Header with Sub-Tabs -->
              <div class="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Gestione Kit 3D</h2>
                  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Gestisci la vetrina dello Shop e pubblica nuovi set</p>
                </div>
                
                <div class="flex bg-slate-900/80 p-1 rounded-2xl border border-white/5 shadow-2xl">
                  <button (click)="kitSubTab = 'list'; fetchPublishedKits()" 
                    [class.bg-indigo-600]="kitSubTab === 'list'"
                    [class.text-white]="kitSubTab === 'list'"
                    [class.text-slate-400]="kitSubTab !== 'list'"
                    class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Lista Kit
                  </button>
                  <button (click)="kitSubTab = 'create'" 
                    [class.bg-indigo-600]="kitSubTab === 'create'"
                    [class.text-white]="kitSubTab === 'create'"
                    [class.text-slate-400]="kitSubTab !== 'create'"
                    class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Crea Nuovo
                  </button>
                </div>
              </div>

              <!-- LIST VIEW -->
              @if (kitSubTab === 'list') {
                <div class="animate-fade-in space-y-6">
                  @if (loading) {
                    <div class="text-center py-20 animate-pulse text-slate-500 font-black uppercase tracking-widest">Sincronizzazione archivio...</div>
                  } @else {
                    <div class="grid grid-cols-1 gap-4">
                       @for (kit of publishedKits; track kit.id) {
                         <div class="bg-slate-900/40 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500/30 transition-all group">
                            <div class="flex items-center gap-6 flex-1">
                               <div class="w-20 h-20 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center text-3xl shadow-2xl group-hover:scale-105 transition-transform">
                                  {{ kit.type === 'chess' ? '♟️' : '⚪' }}
                               </div>
                               <div>
                                  <div class="flex items-center gap-3">
                                    <h3 class="text-xl font-black uppercase tracking-tight text-white">{{ kit.name }}</h3>
                                    <span class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                                      {{ kit.type === 'chess' ? 'Scacchi' : 'Dama' }}
                                    </span>
                                  </div>
                                  <div class="flex items-center gap-4 mt-2">
                                     <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prezzo: <span class="text-emerald-400">{{ kit.price_eur === 0 ? 'GRATIS' : '€' + kit.price_eur }}</span></p>
                                     <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asset: <span class="text-indigo-400">{{ getObjectKeys(kit.assets).length }} caricati</span></p>
                                  </div>
                               </div>
                            </div>

                            <div class="flex items-center gap-4">
                               <button (click)="toggleKitVisibility(kit)" 
                                 class="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all"
                                 [class.bg-emerald-500/10]="kit.is_public" [class.text-emerald-400]="kit.is_public" [class.border-emerald-500/30]="kit.is_public"
                                 [class.bg-orange-500/10]="!kit.is_public" [class.text-orange-400]="!kit.is_public" [class.border-orange-500/30]="!kit.is_public">
                                 {{ kit.is_public ? 'Visibile' : 'Nascosto' }}
                               </button>
                               <button (click)="deleteKit(kit.id)" class="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                                 🗑️
                               </button>
                            </div>
                         </div>
                       } @empty {
                         <div class="bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem] py-32 text-center">
                            <span class="text-5xl opacity-40">🏪</span>
                            <h3 class="text-xl font-black uppercase tracking-tighter text-slate-500 mt-6">Nessun Kit Pubblicato</h3>
                            <button (click)="kitSubTab = 'create'" class="mt-6 text-indigo-400 font-bold uppercase text-[10px] tracking-widest hover:text-indigo-300">Crea il tuo primo kit dello shop</button>
                         </div>
                       }
                    </div>
                  }
                </div>
              }

              <!-- CREATE VIEW -->
              @if (kitSubTab === 'create') {
                <div class="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <!-- Setup Panel -->
                  <div class="lg:col-span-1 space-y-6">
                    <div class="bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] p-6 md:p-8 space-y-6 sticky top-6">
                      <h3 class="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <span class="p-2 bg-indigo-500/20 rounded-lg text-lg">⚙️</span> Configurazione
                      </h3>
                      
                      <div class="space-y-4">
                        <div>
                          <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome del Kit</label>
                          <input type="text" [(ngModel)]="newKit.name" placeholder="es. Classic Ivory" 
                            class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors text-white placeholder-slate-600 font-bold">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                           <div>
                              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tipo Gioco</label>
                              <select [(ngModel)]="newKit.type" (change)="updateSlots()"
                                class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors text-white font-bold appearance-none">
                                <option value="chess">Scacchi</option>
                                <option value="checkers">Dama</option>
                              </select>
                           </div>
                           <div>
                              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Prezzo (€)</label>
                              <input type="number" [(ngModel)]="newKit.price" min="0" step="0.5"
                                class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors text-white font-bold">
                           </div>
                        </div>

                        <div class="pt-4 border-t border-white/5">
                          <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" [(ngModel)]="newKit.isPublic" class="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-offset-0 focus:ring-0">
                            <span class="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">Visibile nello Shop</span>
                          </label>
                        </div>

                        <button (click)="publishKit()" [disabled]="uploading"
                          class="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2">
                          @if (uploading) {
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Pubblicazione...</span>
                          } @else {
                            <span>🚀 Pubblica Kit</span>
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Assets Upload Grid -->
                  <div class="lg:col-span-2">
                     <div class="bg-slate-900/30 border border-white/5 rounded-[2rem] p-6 md:p-8">
                        <h3 class="text-lg font-black uppercase tracking-tight text-white mb-6 flex items-center justify-between">
                           <span class="flex items-center gap-3"><span class="p-2 bg-slate-800 rounded-lg text-lg">📦</span> Asset Richiesti</span>
                           <span class="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">{{ countReadySlots() }} / {{ assetSlots.length }} Pronti</span>
                        </h3>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                           @for (slot of assetSlots; track slot.id) {
                              <label class="relative group cursor-pointer block">
                                 <input type="file" class="hidden" accept=".glb,.gltf,.stl" (change)="onFileSelected($event, slot)">
                                 
                                 <div class="relative h-48 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:scale-[1.02]"
                                      [class.border-emerald-500/70]="slot.status === 'ready'"
                                      [class.shadow-[0_0_30px_rgba(16,185,129,0.4)]]="slot.status === 'ready'">
                                    
                                    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;"></div>
                                    
                                    @if (slot.status === 'ready') {
                                       <div class="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full shadow-lg animate-pulse-slow">
                                          <div class="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                          <span class="text-[9px] font-black uppercase tracking-wider text-emerald-300">Pronto</span>
                                       </div>
                                    }
                                    
                                    <div class="relative h-full flex flex-col items-center justify-center p-4">
                                       @if (slot.previewUrl) {
                                          <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                                             <div class="text-center">
                                                <div class="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-sm">
                                                   <span class="text-4xl filter drop-shadow-lg">🎨</span>
                                                </div>
                                                <div class="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                                                   <p class="text-[8px] font-bold text-emerald-300 uppercase tracking-widest">Preview Disponibile</p>
                                                </div>
                                             </div>
                                          </div>
                                       } @else {
                                          <div class="text-center space-y-3">
                                             <div class="w-16 h-16 mx-auto bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-900/20 transition-all duration-300">
                                                <span class="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{{ slot.icon }}</span>
                                             </div>
                                             <div class="space-y-1">
                                                <p class="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-300 transition-colors">
                                                   {{ slot.label }}
                                                </p>
                                                <p class="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Clicca per caricare</p>
                                             </div>
                                          </div>
                                       }
                                    </div>
                                    
                                    @if (slot.file) {
                                       <div class="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/60 backdrop-blur-md border-t border-white/10">
                                          <div class="flex items-center gap-2">
                                             <svg class="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                                             </svg>
                                             <span class="text-[8px] text-slate-300 font-bold truncate flex-1">{{ slot.file.name }}</span>
                                          </div>
                                       </div>
                                    }
                                 </div>
                              </label>
                           }
                        </div>

                        <div class="mt-6 flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <span class="text-xl">💡</span>
                          <p class="text-[10px] text-orange-200/80 font-bold leading-relaxed">
                             Assicurati che i modelli 3D siano centrati e scalati correttamente prima dell'upload. 
                             I file verranno rinominati automaticamente e salvati nella cloud di THE KING.
                          </p>
                        </div>
                     </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- APPROVAL TAB -->
          @if (activeTab === 'approval') {
            <div class="space-y-10 animate-fade-in max-w-6xl mx-auto pb-20">
              <div class="border-b border-white/5 pb-8">
                <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tighter text-indigo-400">Revisione Community</h2>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Valuta i kit creati dagli utenti per la pubblicazione nello shop</p>
              </div>

              <div class="grid grid-cols-1 gap-6">
                @for (kit of pendingKits; track kit.id) {
                  <div class="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-10 group hover:border-indigo-500/30 transition-all shadow-2xl relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-50"></div>
                    
                    <div class="flex items-center gap-8 flex-1">
                      <div class="w-24 h-24 bg-slate-950 rounded-3xl border border-white/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform">
                        {{ kit.type === 'chess' ? '♟️' : '⚪' }}
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center gap-3">
                          <h3 class="text-2xl font-black uppercase tracking-tight text-white">{{ kit.name }}</h3>
                          <span class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {{ kit.type === 'chess' ? 'Scacchi' : 'Dama' }}
                          </span>
                        </div>
                        <div class="flex flex-wrap items-center gap-6">
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span class="p-1 bg-slate-800 rounded">👤</span> Autore: <span class="text-white">{{ kit.author_name || 'Utente' }}</span>
                          </p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span class="p-1 bg-slate-800 rounded">📦</span> Asset: <span class="text-indigo-400 font-black">{{ getObjectKeys(kit.assets).length }} caricati</span>
                          </p>
                          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span class="p-1 bg-slate-800 rounded">📅</span> Data: <span class="text-slate-300">{{ kit.created_at | date:'dd/MM/yy HH:mm' }}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col sm:flex-row items-center gap-4 min-w-[300px]">
                      <div class="relative flex-1 group/input">
                        <label class="absolute -top-6 left-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Imposta Prezzo (€)</label>
                        <input type="number" [(ngModel)]="kit.price_eur" step="0.5" min="0" 
                               class="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-indigo-500 outline-none transition-all">
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <button (click)="approveKit(kit)" 
                          class="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
                          <span>Approva</span>
                        </button>
                        <button (click)="rejectKit(kit.id)" 
                          class="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="bg-slate-900/30 border-2 border-dashed border-white/5 rounded-[3rem] py-40 text-center animate-pulse">
                    <div class="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl">
                      <span class="text-5xl opacity-30">✨</span>
                    </div>
                    <h3 class="text-2xl font-black uppercase tracking-tighter text-slate-600">Archivio Revisioni Pulito</h3>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-700 mt-4">Nessun nuovo kit in attesa di approvazione dalla community</p>
                  </div>
                }
              </div>
            </div>
          }

        </div>
      </div>
    </div>
    `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.4s ease-out; }
    @keyframes pulse-slow { 
      0%, 100% { opacity: 1; transform: scale(1); } 
      50% { opacity: 0.8; transform: scale(0.98); } 
    }
    .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AdminViewComponent implements OnInit {
  supabase = inject(SupabaseService);
  gameService = inject(GameService);

  activeTab: 'users' | 'kits' | 'approval' = 'users';
  users: AdminUser[] = [];
  loading = false;
  fetchError = '';
  uploading = false;
  getObjectKeys = Object.keys;

  // Kit Management State
  kitSubTab: 'create' | 'list' = 'list';
  publishedKits: AssetCollection[] = [];
  pendingKits: AssetCollection[] = [];
  newKit = {
    name: '',
    price: 0,
    type: 'chess', // 'chess' | 'checkers'
    isPublic: false
  };

  assetSlots: KitAssetSlot[] = [];

  ngOnInit() {
    this.fetchUsers();
    this.fetchPublishedKits();
    this.fetchPendingKits();
    this.updateSlots();
  }

  // --- USERS MANAGEMENT ---

  async fetchUsers() {
    this.loading = true;
    this.fetchError = '';
    try {
      // Try with service_role first (admin access)
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('id, username, nickname, email, created_at, is_active')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase RLS Error:', error);
        // Fallback: Try to get at least current user's data
        const currentUser = this.supabase.user();
        if (currentUser) {
          const { data: userData } = await this.supabase.client
            .from('profiles')
            .select('id, username, nickname, email, created_at, is_active')
            .eq('id', currentUser.id)
            .single();

          if (userData) {
            this.users = [{ ...userData, is_active: userData.is_active ?? true }];
            this.fetchError = 'Visualizzazione limitata: solo il tuo profilo (configura RLS per accesso completo)';
          } else {
            this.fetchError = 'Impossibile caricare gli utenti. Verifica le policy RLS su Supabase.';
          }
        } else {
          this.fetchError = error.message;
        }
      } else if (data) {
        this.users = data.map(p => ({
          ...p,
          is_active: p.is_active ?? true
        }));
        console.log(`✅ Caricati ${this.users.length} utenti`);
      }
    } catch (e: any) {
      this.fetchError = e.message || 'Errore di connessione sconosciuto.';
      console.error('System Exception:', e);
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(userId: string) {
    if (!confirm("Sei sicuro di voler eliminare questo utente? L'azione è irreversibile.")) return;
    try {
      await this.supabase.client.from('career_progress').delete().eq('user_id', userId);
      const { error } = await this.supabase.client.from('profiles').delete().eq('id', userId);
      if (!error) {
        this.users = this.users.filter(u => u.id !== userId);
        alert('Utente eliminato.');
      } else {
        alert('Errore eliminazione utente.');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // --- KIT MANAGEMENT ---

  updateSlots() {
    this.assetSlots = [];

    // Board (Common)
    this.assetSlots.push({ id: 'board', label: 'Scacchiera', icon: '🔲', file: null, uploadedUrl: null, previewUrl: null, status: 'pending' });

    if (this.newKit.type === 'chess') {
      const pieces = [
        { id: 'p', label: 'Pedone', icon: '♟️' },
        { id: 'r', label: 'Torre', icon: '♜' },
        { id: 'n', label: 'Cavallo', icon: '♞' },
        { id: 'b', label: 'Alfiere', icon: '♝' },
        { id: 'q', label: 'Regina', icon: '♛' },
        { id: 'k', label: 'Re', icon: '♚' }
      ];
      // White & Black
      pieces.forEach(p => {
        this.assetSlots.push({ id: `${p.id}_w`, label: `${p.label} Bianco`, icon: p.icon, file: null, uploadedUrl: null, previewUrl: null, status: 'pending' });
        this.assetSlots.push({ id: `${p.id}_b`, label: `${p.label} Nero`, icon: p.icon, file: null, uploadedUrl: null, previewUrl: null, status: 'pending' });
      });
    } else {
      // Checkers
      const pieces = [
        { id: 'cm', label: 'Pedina', icon: '⚪' },
        { id: 'ck', label: 'Dama', icon: '👑' }
      ];
      pieces.forEach(p => {
        this.assetSlots.push({ id: `${p.id}_w`, label: `${p.label} Bianca`, icon: p.icon, file: null, uploadedUrl: null, previewUrl: null, status: 'pending' });
        this.assetSlots.push({ id: `${p.id}_b`, label: `${p.label} Nera`, icon: p.icon, file: null, uploadedUrl: null, previewUrl: null, status: 'pending' });
      });
    }
  }

  onFileSelected(event: Event, slot: KitAssetSlot) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      slot.file = file;
      slot.status = 'ready';

      // Generate preview URL for 3D model
      if (slot.previewUrl) {
        URL.revokeObjectURL(slot.previewUrl); // Clean up old preview
      }
      slot.previewUrl = URL.createObjectURL(file);
      console.log(`✅ Preview generata per ${slot.label}:`, slot.previewUrl);
    }
  }

  countReadySlots() {
    return this.assetSlots.filter(s => s.status === 'ready').length;
  }

  async publishKit() {
    if (!this.newKit.name.trim()) {
      alert('Inserisci un nome per il Kit.');
      return;
    }

    const readySlots = this.assetSlots.filter(s => s.status === 'ready');
    if (readySlots.length === 0) {
      alert('Carica almeno un asset per procedere.');
      return;
    }

    // Check validation: Ideally all slots should be filled, but we allow partials with warning
    if (readySlots.length < this.assetSlots.length) {
      if (!confirm(`Hai caricato solo ${readySlots.length} su ${this.assetSlots.length} asset. Vuoi procedere comunque? (Gli asset mancanti useranno il default)`)) return;
    }

    this.uploading = true;
    try {
      const kitId = this.newKit.name.toLowerCase().replace(/\\s+/g, '_') + '_' + Date.now();
      const assetMap: Record<string, string> = {};

      // 1. Upload Loop
      for (const slot of readySlots) {
        if (!slot.file) continue;

        slot.status = 'uploading';

        // Path: public/kits/{kitId}/{slotId}.glb
        const fileExt = slot.file.name.split('.').pop() || 'glb';
        const filePath = `kits/${kitId}/${slot.id}.${fileExt}`;

        const { error: uploadError } = await this.supabase.client.storage
          .from('custom_assets') // We use the same bucket
          .upload(filePath, slot.file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = this.supabase.client.storage
          .from('custom_assets')
          .getPublicUrl(filePath);

        assetMap[slot.id] = data.publicUrl;
        slot.status = 'done';
      }

      // 2. Save Kit Definition to DB
      const kitEntry = {
        id: kitId,
        name: this.newKit.name,
        type: this.newKit.type,
        price_eur: this.newKit.price,
        assets: assetMap, // JSONB column
        is_public: this.newKit.isPublic,
        is_official: true, // Admin kits are official
        status: 'approved', // Admin kits are auto-approved
        created_at: new Date().toISOString()
      };

      const { error: dbError } = await this.supabase.client
        .from('asset_collections')
        .insert(kitEntry);

      if (dbError) throw dbError;

      alert('✅ Kit Pubblicato con Successo!');
      this.resetForm();
      this.kitSubTab = 'list';
      this.fetchPublishedKits();

    } catch (e: any) {
      console.error('Publish Error', e);
      alert('Errore durante la pubblicazione: ' + e.message);
    } finally {
      this.uploading = false;
    }
  }

  async fetchPublishedKits() {
    this.loading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('asset_collections')
        .select('*')
        .eq('is_official', true) // In List view we only show official kits by default, or maybe all admin-managed
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.publishedKits = data || [];
    } catch (e) {
      console.error('Error fetching kits', e);
    } finally {
      this.loading = false;
    }
  }

  async fetchPendingKits() {
    try {
      const { data, error } = await this.supabase.client
        .from('asset_collections')
        .select('*, author:profiles(username, nickname)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.pendingKits = (data || []).map(k => ({
        ...k,
        author_name: k.author?.nickname || k.author?.username || 'Utente Anonimo'
      }));
    } catch (e) {
      console.error('Error fetching pending kits', e);
    }
  }

  async approveKit(kit: AssetCollection) {
    if (!confirm(`Approvare il kit "${kit.name}"? Sarà visibile nello shop al prezzo di €${kit.price_eur}.`)) return;

    try {
      const { error } = await this.supabase.client
        .from('asset_collections')
        .update({
          status: 'approved',
          is_public: true,
          price_eur: kit.price_eur
        })
        .eq('id', kit.id);

      if (error) throw error;
      alert('✅ Kit approvato con successo!');
      this.fetchPendingKits();
    } catch (e: any) {
      alert('Errore approvazione: ' + e.message);
    }
  }

  async rejectKit(kitId: string) {
    if (!confirm('Sei sicuro di voler rifiutare ed eliminare questo kit?')) return;

    try {
      const { error } = await this.supabase.client
        .from('asset_collections')
        .delete()
        .eq('id', kitId);

      if (error) throw error;
      alert('Kit rifiutato ed eliminato.');
      this.fetchPendingKits();
    } catch (e: any) {
      alert('Errore rifiuto: ' + e.message);
    }
  }

  async deleteKit(kitId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo kit ufficial?')) return;

    try {
      // 1. Delete from DB
      const { error } = await this.supabase.client
        .from('asset_collections')
        .delete()
        .eq('id', kitId);

      if (error) throw error;

      // 2. Local update
      this.publishedKits = this.publishedKits.filter(k => k.id !== kitId);
      alert('Kit eliminato con successo!');
    } catch (e: any) {
      alert('Errore eliminazione: ' + e.message);
    }
  }

  async toggleKitVisibility(kit: AssetCollection) {
    const newStatus = !kit.is_public;
    try {
      const { error } = await this.supabase.client
        .from('asset_collections')
        .update({ is_public: newStatus })
        .eq('id', kit.id);

      if (error) throw error;
      kit.is_public = newStatus;
    } catch (e: any) {
      alert('Errore aggiornamento visibilità: ' + e.message);
    }
  }

  resetForm() {
    this.newKit = { name: '', price: 0, type: 'chess', isPublic: false };
    this.updateSlots();
  }
}
