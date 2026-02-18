

import { Component, inject, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { SupabaseService } from '../services/supabase.service';
import { PieceType } from '../logic/chess-types';
import { ImageUtils } from '../utils/image-utils';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      
      <!-- BACKGROUND ORBS (Premium Aesthetics) -->
      <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        @for (orb of orbs; track $index) {
          <div class="absolute rounded-full blur-[120px] animate-float-slow"
               [style.width.px]="orb.size"
               [style.height.px]="orb.size"
               [style.left.%]="orb.x"
               [style.top.%]="orb.y"
               [style.animation-duration]="orb.duration + 's'"
               [style.animation-delay]="orb.delay + 's'"
               [style.background]="orb.color">
          </div>
        }
      </div>

      <!-- Top Bar -->
      <div class="relative z-50 flex items-center justify-between mb-8 md:mb-12 px-2 md:px-6">
        <!-- TITLE (To the Left) -->
        <div class="flex flex-col items-start">
          <h1 class="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-pulse-subtle">
            THE KING
          </h1>
          <div class="flex items-center gap-2 mt-1">
            <span class="px-2 py-0.5 bg-yellow-500 text-black text-[8px] md:text-[9px] font-black uppercase rounded-sm tracking-widest animate-fade-in-up">
              {{ currentRankTitle }}
            </span>
          </div>
        </div>

        <!-- PROFILE BUTTON (To the Right) -->
        <button (click)="openAccountManager()" 
          class="group flex items-center gap-2 md:gap-3 p-1 rounded-full bg-gradient-to-br from-yellow-600/20 to-amber-900/40 backdrop-blur-xl border-2 border-yellow-500/40 hover:border-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)] relative overflow-hidden">
          
          <!-- Inner Glow -->
          <div class="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-50"></div>

          <!-- Avatar -->
          <div class="relative w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-yellow-400/50 group-hover:border-yellow-300 transition-all bg-slate-800 flex items-center justify-center shadow-lg">
            @if (supabase.avatarUrl()) {
              <img [src]="supabase.avatarUrl()" class="w-full h-full object-cover">
            } @else {
              <svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 md:w-8 md:h-8 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                <defs>
                  <linearGradient id="crownGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path d="M5 15l-2 5h18l-2-5 3-7-6 2-4-7-4 7-6-2 3 7z" fill="url(#crownGradHeader)" stroke="#fbbf24" stroke-width="0.5" stroke-linejoin="round"/>
              </svg>
            }
          </div>

          <!-- Info -->
          <div class="flex flex-col items-start leading-tight pr-3">
            <span class="text-[11px] md:text-sm font-bold text-white uppercase tracking-tight truncate max-w-[80px] md:max-w-[120px] mb-0.5">
              {{ supabase.username() || 'Accedi' }}
            </span>
            @if (supabase.user()) {
              <span class="text-[8px] md:text-[9px] font-black text-yellow-500 uppercase tracking-tighter">
                {{ userStats.totalPoints }} Punti
              </span>
            }
          </div>
        </button>
      </div>

      <!-- Main Navigation Grid - Always Visible, in 2 columns -->
      <div class="flex-1 flex items-center justify-center">
        <div class="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-5xl z-10 px-2 md:px-0 mb-20 auto-rows-fr">
          
          <!-- Career Mode Card (Featured - Full Width) -->
          <button (click)="openCareer()"
            class="col-span-2 group relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-slate-900/60 to-slate-950/80 backdrop-blur-2xl border-2 border-yellow-500/30 hover:border-yellow-400 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.01] shadow-[0_0_50px_rgba(234,179,8,0.1)] active:scale-95">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex items-center justify-between gap-6 px-4 md:px-8">
              <div class="flex items-center gap-4 md:gap-8">
                <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-all shadow-xl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-10 h-10 md:w-12 md:h-12 text-yellow-400">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div class="text-left">
                  <h2 class="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Modalità Carriera</h2>
                  <p class="text-yellow-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-1">Conquista il Trono • 100 Livelli</p>
                </div>
              </div>
              <div class="hidden md:block">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-8 h-8 text-yellow-500/50 group-hover:text-yellow-400 group-hover:translate-x-2 transition-all">
                    <path d="M9 18l6-6-6-6"></path>
                 </svg>
              </div>
            </div>
          </button>

          <!-- Local Game Card -->
          <button (click)="showLocalGameModeSelector = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-orange-500/30 rounded-[2rem] p-4 md:p-8 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-orange-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Sfida Locale</h2>
                <p class="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Multiplayer Offline</p>
              </div>
            </div>
          </button>

          <!-- AI Challenge Card -->
          <button (click)="showAIGameModeSelector = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-indigo-500/30 rounded-[2rem] p-4 md:p-8 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-indigo-400">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Sfida AI</h2>
                <p class="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">vs Gemini AI</p>
              </div>
            </div>
          </button>

          <!-- Adventure Mode Card (Soon) -->
          <button class="relative group overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-4 md:p-8 transition-all opacity-60 cursor-not-allowed">
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 opacity-40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-slate-500">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-500 uppercase tracking-tighter">Avventura</h2>
                <p class="text-emerald-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Prossimamente</p>
              </div>
            </div>
          </button>

          <!-- Online Challenge Card (Soon) -->
          <button class="relative group overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-4 md:p-8 transition-all opacity-60 cursor-not-allowed">
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 opacity-40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-slate-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-500 uppercase tracking-tighter">Sfida Online</h2>
                <p class="text-slate-600 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Multiplayer PvP</p>
              </div>
            </div>
          </button>

          <!-- Setup Card -->
          <button (click)="showSetup = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-cyan-500/30 rounded-[2rem] p-4 md:p-8 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-cyan-400">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Setup</h2>
                <p class="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Modelli 3D</p>
              </div>
            </div>
          </button>

          <!-- Shop/Marketplace Card -->
          <button (click)="gameService.setView('marketplace')"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-yellow-500/30 rounded-[2rem] p-4 md:p-8 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-3 md:gap-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 md:w-8 md:h-8 text-yellow-400">
                  <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"></path>
                  <path d="M3 8h18M10 12h4"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Shop</h2>
                <p class="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Skin & Assets</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="relative z-10 mt-auto pt-8 pb-4 flex flex-col items-center gap-4">
        <button (click)="openAdminLogin()" class="text-[10px] font-bold text-slate-600 hover:text-orange-500 uppercase tracking-[0.3em] transition-colors">
          Area Amministrazione
        </button>
        <p class="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
           The King Chess &copy; 2026
        </p>
      </div>

      <!-- AUTH MODAL (Modelled after Dama 3D) -->
      @if (showAuth) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in" (click)="showAuth = false">
          <div class="relative w-full max-w-md bg-[#0f172a] border-[3px] border-yellow-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-[0_0_80px_rgba(234,179,8,0.15)] overflow-hidden" (click)="$event.stopPropagation()">
            
            <!-- Bg Glow -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
            
            <button (click)="showAuth = false" class="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>

            <div class="flex flex-col items-center text-center mb-8">
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 flex items-center justify-center mb-4 shadow-xl">
                 @if (authMode === 'admin') {
                   <span class="text-4xl">🛡️</span>
                 } @else if (authMode === 'login') {
                   <svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]">
                     <defs>
                       <linearGradient id="crownGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
                         <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:1" />
                         <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
                       </linearGradient>
                     </defs>
                     <path d="M5 15l-2 5h18l-2-5 3-7-6 2-4-7-4 7-6-2 3 7z" fill="url(#crownGradAuth)" stroke="#fbbf24" stroke-width="0.5" stroke-linejoin="round"/>
                   </svg>
                 } @else {
                   <span class="text-4xl">✨</span>
                 }
              </div>
              <h2 class="text-3xl font-black text-white uppercase tracking-tighter mb-1">
                {{ authMode === 'admin' ? 'Arsenale Admin' : (authMode === 'login' ? 'Bentornato' : 'Nuovo Erede') }}
              </h2>
              <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                {{ authMode === 'admin' ? 'Accesso Area Riservata' : (authMode === 'login' ? 'Il tuo trono ti attende' : 'Unisciti alla battaglia') }}
              </p>
            </div>

            <form (submit)="handleAuth($event)" class="space-y-4">
              <!-- Nickname field for Login/Register -->
              <div class="space-y-1">
                <label class="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-4">Nome in Codice</label>
                <input [(ngModel)]="authNickname" name="nickname" type="text" required
                  class="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-600 focus:border-yellow-500 focus:outline-none transition-all font-bold"
                  placeholder="Inserisci il tuo Nickname">
              </div>

              <!-- Email field only for Register -->
              @if (authMode === 'register') {
                <div class="space-y-1 animate-fade-in-up">
                  <label class="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-4">Email Personale</label>
                  <input [(ngModel)]="authEmail" name="email" type="email" required
                    class="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-600 focus:border-yellow-500 focus:outline-none transition-all font-bold"
                    placeholder="email@esempio.com">
                </div>
              }

              <div class="space-y-1">
                <label class="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-4">Codice d'Accesso</label>
                <input [(ngModel)]="authPassword" name="password" type="password" required
                  class="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-white placeholder-slate-600 focus:border-yellow-500 focus:outline-none transition-all font-bold"
                  placeholder="••••••••">
              </div>

              @if (authError) {
                <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                  ❌ {{ authError }}
                </div>
              }

              @if (authSuccess) {
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
                  ✅ {{ authSuccess }}
                </div>
              }

              <button type="submit" [disabled]="loadingAuth"
                class="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4 h-16 flex items-center justify-center">
                @if (loadingAuth) {
                  <div class="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                } @else {
                  {{ authMode === 'admin' ? 'Accedi' : (authMode === 'login' ? 'Entra nel Regno' : 'Crea Account') }}
                }
              </button>
            </form>

            <div class="mt-8 flex flex-col items-center gap-3">
              <button (click)="toggleAuthMode()" class="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                {{ authMode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ACCOUNT MANAGER MODAL -->
      @if (showAccountManager) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in" (click)="showAccountManager = false">
          <div class="relative w-full max-w-2xl bg-[#0f172a] border-[3px] border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
            
            <!-- Bg Orbs -->
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <button (click)="showAccountManager = false" class="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>

            <div class="flex flex-col md:flex-row items-center gap-8 mb-10">
              <!-- Profile Avatar with Camera Icon -->
              <div class="relative group">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-500 p-1 bg-slate-800 shadow-2xl relative overflow-hidden">
                  @if (supabase.avatarUrl()) {
                    <img [src]="supabase.avatarUrl()" class="w-full h-full object-cover rounded-full">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" class="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                         <defs>
                           <linearGradient id="crownGradProfile" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
                             <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:1" />
                             <stop offset="100%" style="stop-color:#b45309;stop-opacity:1" />
                           </linearGradient>
                         </defs>
                         <path d="M5 15l-2 5h18l-2-5 3-7-6 2-4-7-4 7-6-2 3 7z" fill="url(#crownGradProfile)" stroke="#fbbf24" stroke-width="0.5" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  }

                  <!-- Upload Overlay (Always visible on mobile, hover on desktop) -->
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer overflow-hidden">
                    <label class="cursor-pointer w-full h-full flex items-center justify-center">
                      <input type="file" class="hidden" (change)="onProfilePhotoSelected($event)" accept="image/*">
                      <div class="flex flex-col items-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-white">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span class="text-[8px] font-black text-white uppercase tracking-widest mt-1">Carica</span>
                      </div>
                    </label>
                  </div>
                </div>
                
              </div>

              <div class="flex-1 text-center md:text-left">
                <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
                  @if (!isEditingName) {
                    <h2 class="text-3xl font-black text-white uppercase tracking-tighter">{{ supabase.username() }}</h2>
                    <button (click)="startEditingName()" class="p-2 hover:text-yellow-500 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  } @else {
                    <input [(ngModel)]="tempNickname" (blur)="saveNickname()" (keyup.enter)="saveNickname()" autoFocus
                           class="bg-slate-800 border-2 border-yellow-500 rounded-xl py-2 px-4 text-white font-bold text-xl uppercase tracking-tighter outline-none w-48 focus:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                  }
                </div>
                <p class="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Membro Reale dal 2026</p>
                <div class="inline-block px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg mb-4">
                  <span class="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{{ currentRankTitle }}</span>
                </div>
                <div class="flex gap-4 mt-2 justify-center md:justify-start">
                  <div class="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col items-center min-w-[80px]">
                    <span class="text-lg font-black text-white leading-none mb-1">{{ userStats.totalPoints }}</span>
                    <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Punti</span>
                  </div>
                  <div class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center min-w-[80px]">
                    <span class="text-lg font-black text-white leading-none mb-1">{{ userStats.gamesWon }}</span>
                    <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Vinte</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8">
               <button (click)="logout()" class="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest transition-all">
                Esci dal Profilo
               </button>
            </div>
          </div>
        </div>
      }

      <div class="h-10"></div>



      <!-- Selection Modals for Local/AI -->
      @if (showLocalGameModeSelector) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in" (click)="showLocalGameModeSelector = false">
          <div class="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full" (click)="$event.stopPropagation()">
            <h3 class="text-2xl font-black text-white uppercase tracking-tighter text-center mb-6">Scegli Gioco (Locale)</h3>
            <div class="grid grid-cols-2 gap-4">
              <button (click)="selectLocalGameMode('chess')" class="p-6 bg-slate-800 hover:bg-orange-500/20 border border-white/10 rounded-2xl group transition-all">
                <span class="text-4xl block mb-2">♔</span>
                <span class="text-xs font-black text-white uppercase tracking-widest">Scacchi</span>
              </button>
              <button (click)="selectLocalGameMode('checkers')" class="p-6 bg-slate-800 hover:bg-orange-500/20 border border-white/10 rounded-2xl group transition-all">
                <span class="text-4xl block mb-2">◎</span>
                <span class="text-xs font-black text-white uppercase tracking-widest">Dama</span>
              </button>
            </div>
          </div>
        </div>
      }

      @if (showAIGameModeSelector) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-fade-in" (click)="showAIGameModeSelector = false">
          <div class="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full" (click)="$event.stopPropagation()">
            <h3 class="text-2xl font-black text-white uppercase tracking-tighter text-center mb-6">Scegli Gioco (AI)</h3>
            <div class="grid grid-cols-2 gap-4">
              <button (click)="selectAIGameMode('chess')" class="p-6 bg-slate-800 hover:bg-indigo-500/20 border border-white/10 rounded-2xl group transition-all">
                <span class="text-4xl block mb-2">♔</span>
                <span class="text-xs font-black text-white uppercase tracking-widest">Scacchi</span>
              </button>
              <button (click)="selectAIGameMode('checkers')" class="p-6 bg-slate-800 hover:bg-indigo-500/20 border border-white/10 rounded-2xl group transition-all">
                <span class="text-4xl block mb-2">◎</span>
                <span class="text-xs font-black text-white uppercase tracking-widest">Dama</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- SETUP / ASSETS MODAL -->
      @if (showSetup) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" (click)="showSetup = false">
          <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-yellow-500/20 shadow-[0_0_80px_rgba(234,179,8,0.08)] rounded-[2.5rem] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="relative p-6 border-b border-yellow-500/10 bg-gradient-to-r from-yellow-900/20 via-slate-900/40 to-amber-900/20 flex justify-between items-center overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(234,179,8,0.07),transparent_60%)] pointer-events-none"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-700/20 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                  <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                    <defs><linearGradient id="crownSetup" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fef3c7"/><stop offset="50%" style="stop-color:#fbbf24"/><stop offset="100%" style="stop-color:#b45309"/></linearGradient></defs>
                    <path d="M5 15l-2 5h18l-2-5 3-7-6 2-4-7-4 7-6-2 3 7z" fill="url(#crownSetup)" stroke="#fbbf24" stroke-width="0.5" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 text-transparent bg-clip-text">Arsenale 3D</h3>
                  <p class="text-[10px] text-yellow-600/70 mt-0.5 uppercase font-bold tracking-[0.3em]">Forgia il tuo esercito &bull; Personalizza il campo di battaglia</p>
                </div>
              </div>
              <button (click)="showSetup = false" class="relative w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-red-900/40 border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all flex items-center justify-center text-lg">✕</button>
            </div>


            <!-- Navigation Tabs -->
            <div class="flex border-b border-yellow-500/10 px-6 bg-slate-950/30">
              <button (click)="setupTab = 'upload'"
                [class.border-yellow-500]="setupTab === 'upload'"
                [class.text-yellow-400]="setupTab === 'upload'"
                [class.border-transparent]="setupTab !== 'upload'"
                [class.text-slate-500]="setupTab !== 'upload'"
                class="flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all">
                <span class="text-base">&#9876;</span> Forgia Pezzi
              </button>
              <button (click)="setupTab = 'library'"
                [class.border-yellow-500]="setupTab === 'library'"
                [class.text-yellow-400]="setupTab === 'library'"
                [class.border-transparent]="setupTab !== 'library'"
                [class.text-slate-500]="setupTab !== 'library'"
                class="flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all">
                <span class="text-base">&#9812;</span> Libreria Reale
              </button>
            </div>

            <!-- Content -->
            <div class="p-8 overflow-y-auto custom-scrollbar bg-transparent flex-1">
              
              <!-- UPLOAD TAB -->
              @if (setupTab === 'upload') {
                  <div class="space-y-10 animate-fade-in">
                    
                    <!-- Original Textures Toggle -->
                    <div class="relative bg-gradient-to-r from-indigo-900/30 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden group hover:border-indigo-400/50 transition-all">
                      <div class="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(99,102,241,0.07),transparent_60%)]"></div>
                      <div class="relative flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-indigo-400"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                        </div>
                        <div>
                          <h4 class="text-sm font-black text-white uppercase tracking-tight">Texture Originali</h4>
                          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Usa le texture native dei modelli 3D importati</p>
                        </div>
                      </div>
                      <div class="relative flex items-center gap-3">
                        <span class="text-[10px] font-black uppercase tracking-widest" [class.text-indigo-400]="gameService.useOriginalTexture()" [class.text-slate-600]="!gameService.useOriginalTexture()">
                          {{ gameService.useOriginalTexture() ? 'ATTIVE' : 'OFF' }}
                        </span>
                        <button (click)="gameService.toggleOriginalTexture(!gameService.useOriginalTexture())"
                          [class.bg-indigo-500]="gameService.useOriginalTexture()"
                          [class.bg-slate-800]="!gameService.useOriginalTexture()"
                          class="relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 border border-white/10 shadow-lg">
                          <span [class.translate-x-8]="gameService.useOriginalTexture()" [class.translate-x-1]="!gameService.useOriginalTexture()"
                            class="inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md"></span>
                        </button>
                      </div>
                    </div>

                    <!-- Board Setup -->
                    <div class="relative bg-gradient-to-br from-amber-900/20 to-slate-900/60 border border-amber-500/20 rounded-2xl p-6 overflow-hidden group hover:border-amber-500/40 transition-all">
                      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none"></div>
                      <div class="relative flex items-center gap-5 mb-5">
                        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                          <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-amber-400">
                            <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <rect x="2" y="2" width="5" height="5" opacity="0.8"/><rect x="12" y="2" width="5" height="5" opacity="0.8"/>
                            <rect x="7" y="7" width="5" height="5" opacity="0.8"/><rect x="17" y="7" width="5" height="5" opacity="0.8"/>
                            <rect x="2" y="12" width="5" height="5" opacity="0.8"/><rect x="12" y="12" width="5" height="5" opacity="0.8"/>
                            <rect x="7" y="17" width="5" height="5" opacity="0.8"/><rect x="17" y="17" width="5" height="5" opacity="0.8"/>
                          </svg>
                        </div>
                        <div class="flex-1">
                          <h4 class="text-lg font-black text-white uppercase tracking-tight">Campo di Battaglia</h4>
                          <p class="text-[10px] font-bold uppercase tracking-widest mt-1" [class.text-emerald-400]="loadedStatus['board']" [class.text-amber-500/60]="!loadedStatus['board']">
                            {{ loadedStatus['board'] ? '&#10003; Modello Custom Caricato' : '&#9670; Scacchiera Standard Attiva' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <label class="relative flex-1 cursor-pointer group">
                          <div class="w-full h-full flex items-center justify-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-black uppercase py-4 rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-lg">
                            &#8679; Carica Scacchiera &middot; STL / GLB / GLTF
                          </div>
                          <input type="file" accept=".stl,.glb,.gltf" 
                                 class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                 (change)="onFileSelected($event, 'board')">
                        </label>
                        
                        <button (click)="rotateAsset('board')" title="Ruota 45°"
                          class="relative z-20 w-14 flex items-center justify-center bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-white/10 hover:border-amber-400/50 transition-all shadow-lg active:scale-95">
                          <span class="text-xl">↻</span>
                        </button>
                      </div>
                    </div>

                    <!-- Chess Pieces -->
                    <div>
                      <div class="flex items-center gap-3 mb-5">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30"></div>
                        <h4 class="text-xs font-black text-yellow-400 uppercase tracking-[0.3em]">&#9812; Set Scacchi Custom &#9823;</h4>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30"></div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        @for (type of pieceTypes; track type.id) {
                          <div class="relative bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 group hover:border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.06)] transition-all overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/0 group-hover:from-yellow-500/4 to-transparent transition-all duration-500 pointer-events-none"></div>
                            <div class="relative flex items-center gap-3">
                              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/20 flex items-center justify-center text-2xl shadow-inner group-hover:border-yellow-400/40 transition-all">
                                {{ getIconForType(type.id) }}
                              </div>
                              <div>
                                <h4 class="text-sm font-black text-white uppercase tracking-tight">{{ type.label }}</h4>
                                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Modello 3D Custom</p>
                              </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mt-auto">
                              <!-- White Piece -->
                              <div class="flex items-stretch gap-2">
                                <label class="relative flex-1 cursor-pointer group">
                                  <div class="w-full h-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all overflow-hidden shadow-lg"
                                    [class.bg-emerald-500/10]="loadedStatus[type.id + '_w']" 
                                    [class.border-emerald-500/30]="loadedStatus[type.id + '_w']" 
                                    [class.text-emerald-400]="loadedStatus[type.id + '_w']"
                                    [class.bg-slate-800/80]="!loadedStatus[type.id + '_w']" 
                                    [class.border-white/10]="!loadedStatus[type.id + '_w']" 
                                    [class.text-slate-400]="!loadedStatus[type.id + '_w']"
                                    [class.group-hover:border-white/30]="!loadedStatus[type.id + '_w']">
                                    <span class="text-[10px] font-black uppercase tracking-wider">Bianco</span>
                                    @if(loadedStatus[type.id + '_w']) { <span class="text-sm font-bold">✓</span> }
                                  </div>
                                  <input type="file" accept=".stl,.glb,.gltf" 
                                         class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                         (change)="onFileSelected($event, type.id, 'w')">
                                </label>
                                
                                <button (click)="rotateAsset(type.id, 'w')" 
                                  class="relative z-20 w-10 flex flex-col items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/40 transition-all shadow-lg active:scale-95"
                                  title="Ruota Modello">
                                  <span class="text-lg leading-none">↻</span>
                                </button>
                              </div>

                              <!-- Black Piece -->
                              <div class="flex items-stretch gap-2">
                                <label class="relative flex-1 cursor-pointer group">
                                  <div class="w-full h-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all overflow-hidden shadow-lg"
                                    [class.bg-emerald-500/10]="loadedStatus[type.id + '_b']" 
                                    [class.border-emerald-500/30]="loadedStatus[type.id + '_b']" 
                                    [class.text-emerald-400]="loadedStatus[type.id + '_b']"
                                    [class.bg-slate-800/80]="!loadedStatus[type.id + '_b']" 
                                    [class.border-white/10]="!loadedStatus[type.id + '_b']" 
                                    [class.text-slate-400]="!loadedStatus[type.id + '_b']"
                                    [class.group-hover:border-white/30]="!loadedStatus[type.id + '_b']">
                                    <span class="text-[10px] font-black uppercase tracking-wider">Nero</span>
                                    @if(loadedStatus[type.id + '_b']) { <span class="text-sm font-bold">✓</span> }
                                  </div>
                                  <input type="file" accept=".stl,.glb,.gltf" 
                                         class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                         (change)="onFileSelected($event, type.id, 'b')">
                                </label>

                                <button (click)="rotateAsset(type.id, 'b')" 
                                  class="relative z-20 w-10 flex flex-col items-center justify-center bg-yellow-500/20 text-yellow-500 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/40 transition-all shadow-lg active:scale-95"
                                  title="Ruota Modello">
                                  <span class="text-lg leading-none">↻</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Checkers Pieces -->
                    <div>
                      <div class="flex items-center gap-3 mb-5">
                        <div class="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/30"></div>
                        <h4 class="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">&#9678; Set Dama Custom &#9678;</h4>
                        <div class="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30"></div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        @for (type of checkerTypes; track type.id) {
                          <div class="relative bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 group hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.06)] transition-all overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/0 group-hover:from-emerald-500/4 to-transparent transition-all duration-500 pointer-events-none"></div>
                            <div class="relative flex items-center gap-3">
                              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/20 flex items-center justify-center text-2xl text-emerald-400 shadow-inner group-hover:border-emerald-400/40 transition-all">&#9678;</div>
                              <div>
                                <h4 class="text-sm font-black text-white uppercase tracking-tight">{{ type.label }}</h4>
                                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Modello 3D Custom</p>
                              </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mt-auto">
                              <!-- White Checkers -->
                              <div class="flex items-stretch gap-2">
                                <label class="relative flex-1 cursor-pointer group">
                                  <div class="w-full h-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all overflow-hidden shadow-lg"
                                    [class.bg-emerald-500/10]="loadedStatus[type.id + '_w']" 
                                    [class.border-emerald-500/30]="loadedStatus[type.id + '_w']" 
                                    [class.text-emerald-400]="loadedStatus[type.id + '_w']"
                                    [class.bg-slate-800/80]="!loadedStatus[type.id + '_w']" 
                                    [class.border-white/10]="!loadedStatus[type.id + '_w']" 
                                    [class.text-slate-400]="!loadedStatus[type.id + '_w']"
                                    [class.group-hover:border-white/30]="!loadedStatus[type.id + '_w']">
                                    <span class="text-[10px] font-black uppercase tracking-wider">Bianco</span>
                                    @if(loadedStatus[type.id + '_w']) { <span class="text-sm font-bold">✓</span> }
                                  </div>
                                  <input type="file" accept=".stl,.glb,.gltf" 
                                         class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                         (change)="onFileSelected($event, type.id, 'w')">
                                </label>
                                
                                <button (click)="rotateAsset(type.id, 'w')" 
                                  class="relative z-20 w-10 flex flex-col items-center justify-center bg-emerald-500/20 text-emerald-500 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/40 transition-all shadow-lg active:scale-95"
                                  title="Ruota Modello">
                                  <span class="text-lg leading-none">↻</span>
                                </button>
                              </div>

                              <!-- Black Checkers -->
                              <div class="flex items-stretch gap-2">
                                <label class="relative flex-1 cursor-pointer group">
                                  <div class="w-full h-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all overflow-hidden shadow-lg"
                                    [class.bg-emerald-500/10]="loadedStatus[type.id + '_b']" 
                                    [class.border-emerald-500/30]="loadedStatus[type.id + '_b']" 
                                    [class.text-emerald-400]="loadedStatus[type.id + '_b']"
                                    [class.bg-slate-800/80]="!loadedStatus[type.id + '_b']" 
                                    [class.border-white/10]="!loadedStatus[type.id + '_b']" 
                                    [class.text-slate-400]="!loadedStatus[type.id + '_b']"
                                    [class.group-hover:border-white/30]="!loadedStatus[type.id + '_b']">
                                    <span class="text-[10px] font-black uppercase tracking-wider">Nero</span>
                                    @if(loadedStatus[type.id + '_b']) { <span class="text-sm font-bold">✓</span> }
                                  </div>
                                  <input type="file" accept=".stl,.glb,.gltf" 
                                         class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                         (change)="onFileSelected($event, type.id, 'b')">
                                </label>

                                <button (click)="rotateAsset(type.id, 'b')" 
                                  class="relative z-20 w-10 flex flex-col items-center justify-center bg-emerald-500/20 text-emerald-500 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/40 transition-all shadow-lg active:scale-95"
                                  title="Ruota Modello">
                                  <span class="text-lg leading-none">↻</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Community Submission -->
                    <div class="relative bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 rounded-2xl p-6 overflow-hidden">
                      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.07),transparent_70%)]"></div>
                      <div class="relative flex flex-col items-center text-center">
                        <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-3xl">&#127757;</div>
                        <h4 class="text-base font-black text-white uppercase tracking-tight mb-1">Condividi con la Community</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-5 max-w-xs">Invia il tuo set per l'approvazione. Se accettato, sarà visibile nello Shop Reale!</p>
                        <button (click)="submitKitForApproval()"
                          [disabled]="!canSubmitKit()"
                          class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-[.2em] text-[10px] transition-all shadow-xl active:scale-95 border border-indigo-400/20">
                          {{ !supabase.user() ? '&#128274; Accedi per Pubblicare' : '&#127757; Invia per Revisione' }}
                        </button>
                      </div>
                    </div>
                  </div>
              }

              <!-- LIBRARY TAB -->
              @if (setupTab === 'library') {
                <div class="space-y-8 animate-fade-in">

                  <!-- Featured Chess Sets -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/30"></div>
                      <h4 class="text-xs font-black text-purple-400 uppercase tracking-[0.3em]">&#9819; Set Scacchi Completi</h4>
                      <div class="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/30"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Classic Ivory -->
                      <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.08)] transition-all">
                        <div class="relative h-36 bg-gradient-to-br from-amber-900/30 to-slate-950 flex items-center justify-center overflow-hidden">
                          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_60%)]"></div>
                          <div class="flex gap-2 text-4xl relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]"><span class="text-amber-100">&#9812;</span><span class="text-amber-200">&#9813;</span><span class="text-amber-100">&#9814;</span></div>
                          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button (click)="selectLibrarySet('classic_ivory')" class="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black uppercase text-xs rounded-full tracking-wider transform translate-y-3 group-hover:translate-y-0 transition-all shadow-xl">Usa Questo Set</button>
                          </div>
                        </div>
                        <div class="p-4 flex items-center justify-between">
                          <div><h5 class="text-white font-black uppercase text-sm tracking-tight">Classic Ivory</h5><p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Stile classico pregiato</p></div>
                          <span class="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[9px] font-black text-yellow-500 uppercase tracking-wider">Free</span>
                        </div>
                      </div>
                      <!-- Neon Cyber -->
                      <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden group hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all">
                        <div class="relative h-36 bg-gradient-to-br from-purple-900/40 to-slate-950 flex items-center justify-center overflow-hidden">
                          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_60%)]"></div>
                          <div class="flex gap-2 text-4xl relative z-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"><span class="text-purple-300">&#9812;</span><span class="text-purple-400">&#9813;</span><span class="text-purple-300">&#9814;</span></div>
                          <div class="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Premium</div>
                          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button (click)="selectLibrarySet('neon_cyber')" class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase text-xs rounded-full tracking-wider transform translate-y-3 group-hover:translate-y-0 transition-all shadow-xl">Sblocca Set</button>
                          </div>
                        </div>
                        <div class="p-4 flex items-center justify-between">
                          <div><h5 class="text-white font-black uppercase text-sm tracking-tight">Neon Cyber</h5><p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Stile futuristico luminoso</p></div>
                          <span class="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[9px] font-black text-purple-400 uppercase tracking-wider">Premium</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Boards -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/30"></div>
                      <h4 class="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">&#9670; Campi di Battaglia</h4>
                      <div class="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/30"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                      <div class="group cursor-pointer bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all" (click)="selectLibrarySet('board_wood')">
                        <div class="w-full h-14 rounded-xl grid grid-cols-4 grid-rows-2 overflow-hidden">
                          <div class="bg-amber-800"></div><div class="bg-amber-600"></div><div class="bg-amber-800"></div><div class="bg-amber-600"></div>
                          <div class="bg-amber-600"></div><div class="bg-amber-800"></div><div class="bg-amber-600"></div><div class="bg-amber-800"></div>
                        </div>
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Legno</span>
                        <span class="text-[8px] font-bold text-amber-500/60 uppercase tracking-wider">Classico</span>
                      </div>
                      <div class="group cursor-pointer bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-slate-400/40 hover:shadow-[0_0_20px_rgba(148,163,184,0.08)] transition-all" (click)="selectLibrarySet('board_marble')">
                        <div class="w-full h-14 rounded-xl grid grid-cols-4 grid-rows-2 overflow-hidden">
                          <div class="bg-slate-200"></div><div class="bg-slate-600"></div><div class="bg-slate-200"></div><div class="bg-slate-600"></div>
                          <div class="bg-slate-600"></div><div class="bg-slate-200"></div><div class="bg-slate-600"></div><div class="bg-slate-200"></div>
                        </div>
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Marmo</span>
                        <span class="text-[8px] font-bold text-slate-400/60 uppercase tracking-wider">Elegante</span>
                      </div>
                      <div class="group cursor-pointer bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] transition-all" (click)="selectLibrarySet('board_glass')">
                        <div class="w-full h-14 rounded-xl border border-cyan-500/20 grid grid-cols-4 grid-rows-2 overflow-hidden">
                          <div class="bg-cyan-900/60"></div><div class="bg-cyan-500/20"></div><div class="bg-cyan-900/60"></div><div class="bg-cyan-500/20"></div>
                          <div class="bg-cyan-500/20"></div><div class="bg-cyan-900/60"></div><div class="bg-cyan-500/20"></div><div class="bg-cyan-900/60"></div>
                        </div>
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Vetro</span>
                        <span class="text-[8px] font-bold text-cyan-400/60 uppercase tracking-wider">Futuristico</span>
                      </div>
                    </div>
                  </div>

                  <!-- Coming Soon Banner -->
                  <div class="relative bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-white/5 rounded-2xl p-5 overflow-hidden">
                    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(234,179,8,0.04),transparent_60%)]"></div>
                    <div class="relative flex items-center gap-4">
                      <div class="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl">&#9876;</div>
                      <div class="flex-1">
                        <h4 class="text-sm font-black text-white uppercase tracking-tight">Nuovi Set in Arrivo</h4>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Set medievali, futuristici e fantasy &middot; Prossimamente nello Shop</p>
                      </div>
                      <span class="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[9px] font-black text-yellow-500 uppercase tracking-wider">Soon</span>
                    </div>
                  </div>

                </div>
              }
            </div>

            <!-- Footer removed: changes are automatic -->
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
    
    @keyframes float { 
      0%, 100% { transform: translate(0, 0); } 
      33% { transform: translate(30px, -50px); } 
      66% { transform: translate(-20px, 20px); } 
    }
    .animate-float-slow { animation: float infinite ease-in-out; }
    
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.5s ease-out; }
    
    @keyframes gradient-shift { 
      0% { background-position: 0% 50%; } 
      50% { background-position: 100% 50%; } 
      100% { background-position: 0% 50%; } 
    }
    .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 15s ease infinite; }
    
    @keyframes pulse-subtle {
      0%, 100% { filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.5)); }
      50% { filter: drop-shadow(0 0 50px rgba(251, 191, 36, 0.8)); }
    }
    .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .animate-shake { animation: shake 0.2s ease-in-out infinite; }

    .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
    
    .glow-gold { box-shadow: 0 0 20px rgba(234, 179, 8, 0.15); }
    .premium-card { background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(234, 179, 8, 0.3); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234, 179, 8, 0.5); }
  `]
})
export class HomeViewComponent implements OnInit {
  Math = Math;
  gameService = inject(GameService);
  supabase = inject(SupabaseService);

  @Input() showSetup = false;
  @Output() fileSelected = new EventEmitter<{ event: Event, type: string, colorSuffix?: string }>();

  loadingAssets: Record<string, boolean> = {};

  showLocalGameModeSelector = false;
  showAIGameModeSelector = false;
  uploadingPhoto = false;

  // Setup / Assets Properties
  pieceTypes: any[] = [
    { id: 'p', label: 'Pedone' },
    { id: 'r', label: 'Torre' },
    { id: 'n', label: 'Cavallo' },
    { id: 'b', label: 'Alfiere' },
    { id: 'q', label: 'Regina' },
    { id: 'k', label: 'Re' },
  ];
  checkerTypes: any[] = [
    { id: 'cm', label: 'Pedina (Man)' },
    { id: 'ck', label: 'Dama (King)' }
  ];
  loadedStatus: Record<string, boolean> = {};

  // Modal States
  showAuth = false;
  showAccountManager = false;
  authMode: 'login' | 'register' | 'admin' = 'login';

  // Auth Form Fields
  authNickname = '';
  authEmail = '';
  authPassword = '';
  authError = '';
  authSuccess = '';
  loadingAuth = false;

  userStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    totalPoints: 0,
    achievements: [],
    purchases: [],
    downloads: []
  };

  ranks = [
    "Recluta", "Soldato", "Sentinella", "Guardia", "Sergente",
    "Tenente", "Capitano", "Maggiore", "Colonnello", "Generale",
    "Cavaliere", "Paladino", "Protettore", "Difensore", "Veterano",
    "Maestro d'Armi", "Scudiere", "Araldo", "Messaggero", "Diplomatico",
    "Barone", "Visconte", "Conte", "Marchese", "Duca",
    "Gran Duca", "Principe", "Erede al Trono", "Reggente", "Governatore",
    "Saggio", "Erudito", "Filosofo", "Maestro di Logica", "Stratega",
    "Tattico Supremo", "Gran Maestro", "Architetto di Guerra", "Veggente", "Oracolo",
    "Guardiano del Sacro", "Campione del Re", "Eroe del Regno", "Leggenda Vivente", "Mito Eterno",
    "Semidio del Gioco", "Avatar della Vittoria", "Sovrano Universale", "Imperatore del Tempo", "Re dei Re"
  ];

  get currentRankTitle(): string {
    if (!this.supabase.user()) return 'Ospite';
    const index = Math.floor(this.userStats.totalPoints / 100);
    return this.ranks[Math.min(index, this.ranks.length - 1)];
  }

  isEditingName = false;
  tempNickname = '';

  getIconForType(type: string): string {
    const icons: Record<string, string> = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
    };
    return icons[type] || '?';
  }

  orbs = Array.from({ length: 12 }, (_, i) => {
    const colors = [
      'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 100%)',
      'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 100%)',
      'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 100%)',
      'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 50%, transparent 100%)',
      'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)',
    ];
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 250 + Math.random() * 400,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      color: colors[i % colors.length]
    };
  });

  toggleAuth() {
    this.showAuth = !this.showAuth;
    this.authError = '';
    this.authSuccess = '';
  }

  toggleAuthMode() {
    if (this.authMode === 'admin') {
      this.authMode = 'login';
    } else {
      this.authMode = this.authMode === 'login' ? 'register' : 'login';
    }
    this.authError = '';
    this.authSuccess = '';
  }

  openAdminLogin() {
    this.authMode = 'admin';
    this.authNickname = '';
    this.authPassword = '';
    this.authError = '';
    this.authSuccess = '';
    this.showAuth = true;
  }

  async handleAuth(e: Event) {
    if (e) e.preventDefault();
    this.loadingAuth = true;
    this.authError = '';
    this.authSuccess = '';

    try {
      if (this.authMode === 'admin') {
        if (this.authNickname === 'admin' && this.authPassword === 'accessometti') {
          this.authSuccess = 'Benvenuto Admin! Accesso in corso...';
          setTimeout(() => {
            this.showAuth = false;
            this.gameService.setView('admin');
          }, 1500);
          return;
        } else {
          this.authError = 'Credenziali Admin non valide.';
          return;
        }
      }

      let res: any;
      if (this.authMode === 'login') {
        res = await this.supabase.authService.signIn(this.authNickname, this.authPassword);
      } else {
        res = await this.supabase.authService.signUp(this.authEmail, this.authPassword, this.authNickname);
      }

      const { data, error } = res;
      if (error) {
        this.authError = error.message;
      } else {
        if (this.authMode === 'register' && !data?.session) {
          // Email confirmation required — keep modal open with message
          this.authSuccess = 'Account creato! Controlla la tua email per confermare.';
        } else {
          // ✅ CLOSE MODAL IMMEDIATELY — don't wait for async calls
          this.showAuth = false;
          this.authSuccess = '';
          this.authError = '';
          this.authNickname = '';
          this.authPassword = '';
          this.authEmail = '';

          // Load data in background (non-blocking)
          this.supabase.loadUserProfile()
            .then(() => this.gameService.loadUserAssets())
            .then(() => this.loadUserStats())
            .catch(e => console.error('Post-login data load error:', e));
        }
      }
    } catch (err: any) {
      this.authError = 'Errore di connessione.';
    } finally {
      this.loadingAuth = false;
    }
  }

  async logout() {
    await this.supabase.signOut();
    this.showAccountManager = false;
    this.userStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      totalPoints: 0,
      achievements: [],
      purchases: [],
      downloads: []
    };
  }

  async openAccountManager() {
    if (!this.supabase.user()) {
      this.toggleAuth();
      return;
    }
    this.showAccountManager = true;
    await this.loadUserStats();
  }

  async onProfilePhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const userId = this.supabase.user()?.id;
    if (!userId) return;

    this.uploadingPhoto = true;
    try {
      const base64Image = await ImageUtils.processAvatarImage(file);
      const response = await fetch(base64Image);
      const blob = await response.blob();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error } = await this.supabase.client.storage
        .from('avatars')
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) throw error;

      const { data: urlData } = this.supabase.client.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.supabase.client.from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      await this.supabase.loadUserProfile();
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(`Errore caricamento: ${error.message}`);
    } finally {
      this.uploadingPhoto = false;
    }
  }

  async deleteProfilePhoto() {
    const userId = this.supabase.user()?.id;
    if (!userId) return;
    await this.supabase.client.from('profiles').update({ avatar_url: null }).eq('id', userId);
    await this.supabase.loadUserProfile();
  }

  startEditingName() {
    this.tempNickname = this.supabase.username() || '';
    this.isEditingName = true;
  }

  async saveNickname() {
    if (!this.tempNickname.trim()) {
      this.isEditingName = false;
      return;
    }
    const userId = this.supabase.user()?.id;
    if (userId) {
      await this.supabase.client.from('profiles').update({ nickname: this.tempNickname }).eq('id', userId);
      this.supabase.username.set(this.tempNickname);
    }
    this.isEditingName = false;
  }

  openCareer() {
    if (this.supabase.user()) {
      this.gameService.setView('career');
    } else {
      this.toggleAuth();
      this.authError = 'Registrazione obbligatoria per la Carriera';
    }
  }

  openAdventure() {
    if (this.supabase.user()) {
      alert('Modalità Avventura in arrivo! 🏰');
    } else {
      this.toggleAuth();
      this.authError = 'Registrazione obbligatoria per l\'Avventura';
    }
  }

  async loadUserStats() {
    const userId = this.supabase.user()?.id;
    if (!userId) return;
    try {
      const { data } = await this.supabase.profileService.getCareerProgress(userId);
      if (data) {
        this.userStats.totalPoints = data.total_points || 0;
        this.userStats.gamesPlayed = data.games_played || 0;
        this.userStats.gamesWon = data.games_won || 0;
        if (this.userStats.gamesPlayed > 0) {
          this.userStats.winRate = Number(((this.userStats.gamesWon / this.userStats.gamesPlayed) * 100).toFixed(1));
        }
      }
    } catch (e) {
      console.error('Error loading stats', e);
    }
  }

  selectAIGameMode(mode: 'chess' | 'checkers') {
    this.showAIGameModeSelector = false;
    this.gameService.startGame(mode, 'ai');
  }

  selectLocalGameMode(mode: 'chess' | 'checkers') {
    this.showLocalGameModeSelector = false;
    this.gameService.startGame(mode, 'local');
  }


  async ngOnInit() {
    // Always load assets (Official Kit for guests, custom for users)
    await this.gameService.loadUserAssets();

    // Sync local UI status signals with current loaded assets (ensures icons show for everyone)
    const currentAssets = this.gameService.customMeshUrls();
    Object.keys(currentAssets).forEach(k => {
      this.loadedStatus[k] = true;
    });

    if (this.supabase.user()) {
      await this.supabase.loadUserProfile();
    }
    await this.loadUserStats();
  }


  // Setup Tab State
  setupTab: 'upload' | 'library' = 'upload';

  rotateAsset(type: string, color?: string) {
    console.log(`Rotating asset: ${type} ${color || ''}`);
    let key = type;
    if (color) key = `${type}_${color}`;
    this.gameService.updateRotation(key);
    this.gameService.setPieceStyle('custom'); // Ensure visual update on board
  }

  async selectLibrarySet(setId: string) {
    if (!this.supabase.user()) {
      this.toggleAuth();
      this.authError = 'Effettua il login per salvare le preferenze.';
      return;
    }

    // Mock Library URLs - In production these would come from the DB/Storage
    const libraryAssets: Record<string, any> = {
      'board_wood': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_wood.glb',
      'board_marble': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_marble.glb',
      'board_glass': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_glass.glb',
      'classic_ivory': {
        'board': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_wood.glb',
        'p_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_pawn_w.glb',
        'r_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_rook_w.glb',
        'n_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_knight_w.glb',
        'b_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_bishop_w.glb',
        'q_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_queen_w.glb',
        'k_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_king_w.glb',
        'p_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_pawn_b.glb',
        'r_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_rook_b.glb',
        'n_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_knight_b.glb',
        'b_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_bishop_b.glb',
        'q_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_queen_b.glb',
        'k_b': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_king_b.glb'
      },
      'neon_cyber': 'LOCKED'
    };

    if (setId === 'neon_cyber') {
      alert('Questo set è bloccato (Premium). Acquistalo nello Shop!');
      return;
    }

    try {
      const asset = libraryAssets[setId];

      if (typeof asset === 'string') {
        // Single Asset (Board)
        await this.supabase.saveUserAssetPreference('board', asset);
        this.gameService.customMeshUrls.update(current => ({ ...current, 'board': asset }));
        this.loadedStatus['board'] = true;
      } else if (typeof asset === 'object') {
        // Custom Assets (Signal for reactivity)
        // The following line was part of the instruction but is a class property declaration, not a statement within a method.
        // It has been moved to GameService as per the overall instruction.
        // customMeshUrls = signal<Record<string, string>>({});
        const updates: Record<string, string> = {};
        for (const [key, url] of Object.entries(asset)) {
          await this.supabase.saveUserAssetPreference(key, url as string);
          updates[key] = url as string;
          this.loadedStatus[key] = true;
        }
        this.gameService.customMeshUrls.update(current => ({ ...current, ...updates }));
      }
    } catch (e: any) {
      console.error('Library Error', e);
      alert('Errore applicazione asset: ' + e.message);
    }
  }

  async onFileSelected(event: Event, type: string, colorSuffix?: string) {
    console.log(`File selected for ${type} ${colorSuffix || ''}`);
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Construct key (e.g., 'board', 'p_w', 'k_b')
    let key = type;
    if (type !== 'board' && colorSuffix) {
      key = `${type}_${colorSuffix}`;
    }

    try {
      this.loadingAssets[key] = true;
      const userId = this.supabase.user()?.id;
      if (userId) {
        const publicUrl = await this.supabase.uploadCustomAssetFile(file, key);
        await this.supabase.saveUserAssetPreference(key, publicUrl);

        // Update Game Service Signal
        this.gameService.customMeshUrls.update(current => ({ ...current, [key]: publicUrl }));
        this.loadedStatus = { ...this.loadedStatus, [key]: true };

        if (type !== 'board') {
          this.gameService.setPieceStyle('custom');
        }

        this.gameService.showToast('Modello caricato con successo! 🎉', 'success');
        this.fileSelected.emit({ event, type, colorSuffix });
      } else {
        // Fallback for Guest (Local only, not persistent)
        const objectUrl = URL.createObjectURL(file);
        this.gameService.customMeshUrls.update(current => ({ ...current, ...{ [key]: objectUrl } }));
        this.loadedStatus = { ...this.loadedStatus, [key]: true };

        if (type !== 'board') {
          this.gameService.setPieceStyle('custom');
        }

        this.gameService.showToast('Anteprima caricata (ospite)', 'info');
        this.fileSelected.emit({ event, type, colorSuffix });
      }

    } catch (error: any) {
      console.error('Asset Upload Error:', error);
      this.gameService.showToast(`Errore caricamento: ${error.message}`, 'error');
    } finally {
      this.loadingAssets[key] = false;
    }
  }

  canSubmitKit(): boolean {
    if (!this.supabase.user()) return false;
    // Check if at least one custom asset is loaded
    return Object.values(this.loadedStatus).some(val => val === true);
  }

  async submitKitForApproval() {
    if (!this.supabase.user()) {
      this.toggleAuth();
      return;
    }

    const kitName = prompt('Dai un nome al tuo Kit:');
    if (!kitName) return;

    try {
      const user = this.supabase.user();
      if (!user) return;

      const assets = this.gameService.customMeshUrls();
      const type = Object.keys(assets).some(k => k.startsWith('c')) ? 'checkers' : 'chess';

      const kitId = (kitName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()).substring(0, 50);

      const { error } = await this.supabase.client.from('asset_collections').insert({
        id: kitId,
        name: kitName,
        type: type,
        price_eur: 0,
        assets: assets,
        is_public: false, // Wait for admin
        is_official: false,
        status: 'pending',
        author_id: user.id
      });

      if (error) throw error;

      this.gameService.showToast('✅ Richiesta inviata! In attesa di approvazione admin.', 'success');
      this.showSetup = false;
    } catch (e: any) {
      console.error('Submit Error:', e);
      this.gameService.showToast('Errore durante l\'invio: ' + e.message, 'error');
    }
  }
}
