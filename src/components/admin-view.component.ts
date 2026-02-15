
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { GameService } from '../services/game.service';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  is_active?: boolean;
}

interface KitAssetSlot {
  id: string; // e.g. 'p_w', 'r_b', 'board'
  label: string;
  icon: string;
  file: File | null;
  uploadedUrl: string | null;
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
          <button (click)="activeTab = 'users'" 
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
                  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Totale Account: {{ users.length }}</p>
                </div>
                <button (click)="fetchUsers()" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2">
                  <span>🔄</span> Aggiorna Lista
                </button>
              </div>

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
                            <span class="font-bold text-white group-hover:text-indigo-400 transition-colors">{{ user.username }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-slate-400 text-sm">{{ user.email }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-slate-500 text-[10px] uppercase font-bold">{{ user.created_at | date:'dd/MM/yyyy' }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider"
                                  [class.bg-emerald-500/10]="user.is_active" [class.text-emerald-400]="user.is_active"
                                  [class.bg-rose-500/10]="!user.is_active" [class.text-rose-400]="!user.is_active">
                              {{ user.is_active ? 'Attivo' : 'Non Attivo' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <button (click)="deleteUser(user.id)" class="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Elimina</button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- KITS TAB (New Design) -->
          @if (activeTab === 'kits') {
            <div class="space-y-10 animate-fade-in max-w-5xl mx-auto pb-20">
              
              <!-- Header -->
              <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                  <h2 class="text-3xl md:text-4xl font-black uppercase tracking-tighter">Gestione Kit 3D</h2>
                  <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Carica e Configura set completi per lo Shop</p>
                </div>
              </div>

              <!-- Configuration Form -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
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

                      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                         @for (slot of assetSlots; track slot.id) {
                            <label class="relative group cursor-pointer">
                               <input type="file" class="hidden" accept=".glb,.gltf,.stl" (change)="onFileSelected($event, slot)">
                               
                               <div class="h-32 bg-slate-950 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 transition-all group-hover:border-indigo-500/50 group-hover:bg-slate-900/80"
                                    [class.border-emerald-500-50]="slot.status === 'ready'"
                                    [class.bg-emerald-900-10]="slot.status === 'ready'"
                                    [class.opacity-100]="slot.status === 'ready'">
                                  
                                  @if (slot.status === 'ready') {
                                     <div class="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-3 h-3"><path d="M20 6L9 17l-5-5"/></svg>
                                     </div>
                                  }

                                  <span class="text-3xl mb-2 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{{ slot.icon }}</span>
                                  <span class="text-[10px] font-black uppercase tracking-widest text-center"
                                        [class.text-emerald-400]="slot.status === 'ready'"
                                        [class.text-slate-500]="slot.status !== 'ready'"
                                        [class.group-hover-text-indigo-300]="slot.status !== 'ready'">
                                     {{ slot.label }}
                                  </span>
                                  @if (slot.file) {
                                     <span class="text-[8px] text-slate-600 mt-1 truncate max-w-full px-2">{{ slot.file.name }}</span>
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
            </div>
          }

          <!-- APPROVAL TAB -->
          @if (activeTab === 'approval') {
            <div class="flex flex-col items-center justify-center py-24 text-center min-h-[50vh]">
              <div class="w-24 h-24 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                <span class="text-4xl grayscale opacity-50">⚖️</span>
              </div>
              <h2 class="text-2xl font-black uppercase tracking-tighter text-slate-700">Area Approvazioni</h2>
              <p class="text-slate-600 text-xs font-bold uppercase tracking-[0.2em] mt-2 max-w-sm">Nessun kit in attesa di revisione.</p>
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
  uploading = false;

  // Kit Management State
  newKit = {
    name: '',
    price: 0,
    type: 'chess', // 'chess' | 'checkers'
    isPublic: false
  };

  assetSlots: KitAssetSlot[] = [];

  ngOnInit() {
    this.fetchUsers();
    this.updateSlots();
  }

  // --- USERS MANAGEMENT ---

  async fetchUsers() {
    this.loading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.users = data.map(p => ({
          ...p,
          is_active: true // For now assumed active
        }));
      }
    } catch (e) {
      console.error('Error fetching users', e);
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
    this.assetSlots.push({ id: 'board', label: 'Scacchiera', icon: '🔲', file: null, uploadedUrl: null, status: 'pending' });

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
        this.assetSlots.push({ id: `${p.id}_w`, label: `${p.label} Bianco`, icon: p.icon, file: null, uploadedUrl: null, status: 'pending' });
        this.assetSlots.push({ id: `${p.id}_b`, label: `${p.label} Nero`, icon: p.icon, file: null, uploadedUrl: null, status: 'pending' });
      });
    } else {
      // Checkers
      const pieces = [
        { id: 'cm', label: 'Pedina', icon: '⚪' },
        { id: 'ck', label: 'Dama', icon: '👑' }
      ];
      pieces.forEach(p => {
        this.assetSlots.push({ id: `${p.id}_w`, label: `${p.label} Bianca`, icon: p.icon, file: null, uploadedUrl: null, status: 'pending' });
        this.assetSlots.push({ id: `${p.id}_b`, label: `${p.label} Nera`, icon: p.icon, file: null, uploadedUrl: null, status: 'pending' });
      });
    }
  }

  onFileSelected(event: Event, slot: KitAssetSlot) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      slot.file = input.files[0];
      slot.status = 'ready';
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
      // Ensure table 'asset_collections' exists or create migration if not
      const kitEntry = {
        id: kitId,
        name: this.newKit.name,
        type: this.newKit.type,
        price_eur: this.newKit.price,
        assets: assetMap, // JSONB column
        is_public: this.newKit.isPublic,
        created_at: new Date().toISOString()
      };

      const { error: dbError } = await this.supabase.client
        .from('asset_collections')
        .insert(kitEntry);

      if (dbError) throw dbError;

      alert('✅ Kit Pubblicato con Successo!');
      this.resetForm();

    } catch (e: any) {
      console.error('Publish Error', e);
      alert('Errore durante la pubblicazione: ' + e.message);
    } finally {
      this.uploading = false;
    }
  }

  resetForm() {
    this.newKit = { name: '', price: 0, type: 'chess', isPublic: false };
    this.updateSlots();
  }
}
