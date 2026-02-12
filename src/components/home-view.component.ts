
import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { SupabaseService } from '../services/supabase.service';
import { PieceType } from '../logic/chess-types';

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
      <div class="relative z-50 flex items-center justify-between mb-6 md:mb-8">
        <!-- THE KING Title -->
        <div class="flex items-center gap-4">
          <div class="relative flex flex-col items-center">
            <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse-subtle">
              THE KING
            </h1>
            
            @if (supabase.user() && supabase.username()) {
              <div class="mt-4 animate-fade-in flex flex-col items-center">
                <p class="text-[12px] md:text-[14px] font-black text-orange-400 uppercase tracking-[0.3em] bg-slate-950/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                  {{ supabase.username() }}
                </p>
              </div>
            }
          </div>
        </div>
        
        <!-- Account/Login Button -->
        <button (click)="supabase.user() ? openAccountManager() : toggleAuth()" 
          class="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/40 backdrop-blur-md border border-white/10 hover:border-indigo-400/40 transition-all group shadow-2xl">
          <div [class.shadow-[0_0_25px_rgba(99,102,241,0.6)]]="supabase.user()"
               [class.border-indigo-400/50]="supabase.user()"
               class="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-2 transition-all duration-500 group-hover:scale-105 border border-transparent overflow-hidden">
            @if (supabase.user() && supabase.avatarUrl()) {
              <img [src]="supabase.avatarUrl()" alt="Avatar" class="w-full h-full object-cover rounded-full">
            } @else {
              <svg viewBox="0 0 100 100" fill="white" class="w-full h-full drop-shadow-md">
                <circle cx="50" cy="35" r="20"/>
                <path d="M20 80 Q50 60 80 80 L80 90 L20 90 Z"/>
              </svg>
            }
          </div>
        </button>
      </div>

      <!-- Main Navigation Grid -->
      <div class="flex-1 flex items-center justify-center">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full max-w-[1600px] z-10 px-4">
          
          <!-- Local Game Card -->
          <button (click)="showLocalGameModeSelector = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-orange-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-orange-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Sfida Locale</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Multiplayer Offline</p>
              </div>
            </div>
          </button>

          <!-- AI Challenge Card -->
          <button (click)="showAIGameModeSelector = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-indigo-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-indigo-400">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Sfida AI</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">vs Gemini AI</p>
              </div>
            </div>
          </button>

          <!-- Setup Card -->
          <button (click)="showSetup = true"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-cyan-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-cyan-400">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Setup</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Modelli 3D</p>
              </div>
            </div>
          </button>

          <!-- Career Mode Card -->
          <button (click)="openCareer()"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-yellow-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-yellow-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Carriera</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">100 Livelli</p>
              </div>
            </div>
          </button>

          <!-- Adventure Mode Card -->
          <button (click)="openAdventure()"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-emerald-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-emerald-400">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Avventura</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Missioni Epiche</p>
              </div>
            </div>
          </button>

          <!-- Online Challenge Card (Soon) -->
          <div class="relative group">
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div class="px-6 py-2 bg-rose-500 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                <span class="text-white font-black uppercase text-sm tracking-[0.2em]">Soon</span>
              </div>
            </div>
            <button class="w-full relative overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 transition-all opacity-40 cursor-not-allowed">
              <div class="relative flex flex-col items-center text-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-slate-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-slate-400 uppercase tracking-tighter">Sfida Online</h2>
                  <p class="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Multiplayer PvP</p>
                </div>
              </div>
            </button>
          </div>

          <!-- Shop/Marketplace Card (Soon) -->
          <div class="relative group">
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div class="px-6 py-2 bg-yellow-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <span class="text-black font-black uppercase text-sm tracking-[0.2em]">Soon</span>
              </div>
            </div>
            <button class="w-full relative overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 transition-all opacity-40 cursor-not-allowed">
              <div class="relative flex flex-col items-center text-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-slate-500">
                    <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"></path>
                    <path d="M3 8h18M10 12h4"></path>
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-slate-400 uppercase tracking-tighter">Shop</h2>
                  <p class="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Skin & Assets</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Auth Modal -->
      @if (showAuth) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-slate-950/98 via-indigo-950/95 to-slate-900/98 backdrop-blur-2xl animate-fade-in p-4"
             (click)="showAuth = false">
          <div class="relative bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] max-w-lg w-full shadow-[0_0_120px_rgba(99,102,241,0.25)] overflow-hidden"
               (click)="$event.stopPropagation()">
            
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-pink-600/10 animate-gradient-shift"></div>
            
            <div class="relative z-10 p-8 md:p-12">
              <div class="flex flex-col items-center text-center mb-10">
                <h2 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white tracking-tight uppercase mb-2">
                  {{ authMode === 'login' ? 'Bentornato' : 'Inizia Ora' }}
                </h2>
                <p class="text-indigo-300/80 text-sm font-bold uppercase tracking-[0.2em]">
                  {{ authMode === 'login' ? 'Accedi al Regno' : 'Unisciti alla Leggenda' }}
                </p>
              </div>

              <form (submit)="handleAuth($event)" class="space-y-5">
                <div class="space-y-2">
                  <label class="text-xs font-black text-indigo-300 uppercase tracking-[0.15em] ml-2">Nickname</label>
                  <input type="text" name="nickname" [(ngModel)]="authNickname" required
                    class="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-indigo-400/60 transition-all">
                </div>

                @if (authMode === 'register') {
                  <div class="space-y-2">
                    <label class="text-xs font-black text-indigo-300 uppercase tracking-[0.15em] ml-2">Email</label>
                    <input type="email" name="email" [(ngModel)]="authEmail" required
                      class="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-indigo-400/60 transition-all">
                  </div>
                }

                <div class="space-y-2">
                  <label class="text-xs font-black text-indigo-300 uppercase tracking-[0.15em] ml-2">Password</label>
                  <input type="password" name="password" [(ngModel)]="authPassword" required
                    class="w-full bg-slate-950/70 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:border-indigo-400/60 transition-all">
                </div>

                @if (authError) {
                  <p class="text-rose-400 text-sm font-bold text-center uppercase tracking-wide bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">{{ authError }}</p>
                }

                <button type="submit" [disabled]="loadingAuth"
                  class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest mt-6">
                  {{ loadingAuth ? 'Caricamento...' : (authMode === 'login' ? 'Accedi' : 'Registrati') }}
                </button>
              </form>

              <div class="mt-8 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                <button (click)="toggleAuthMode()" class="hover:text-white transition-colors">
                  {{ authMode === 'login' ? 'Nuovo qui? Registrati' : 'Hai già un account? Accedi' }}
                </button>
              </div>

              <button (click)="showAuth = false" class="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
          </div>
        </div>
      }

      <!-- Account Manager Modal -->
      @if (showAccountManager) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-4 animate-fade-in"
             (click)="showAccountManager = false">
          <div class="relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] max-w-2xl w-full max-h-[90vh] shadow-[0_0_120px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col"
               (click)="$event.stopPropagation()">
            
            <button (click)="showAccountManager = false" 
              class="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white border border-white/10 hover:border-red-500/50 transition-all">✕</button>
            
            <div class="p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-10">
              <div class="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/5">
                <div class="relative group">
                  <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl bg-slate-800">
                    @if (supabase.avatarUrl()) {
                      <img [src]="supabase.avatarUrl()" class="w-full h-full object-cover">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                        <svg viewBox="0 0 100 100" fill="white" class="w-20 h-20">
                          <circle cx="50" cy="35" r="20"/>
                          <path d="M20 80 Q50 60 80 80 L80 90 L20 90 Z"/>
                        </svg>
                      </div>
                    }
                  </div>
                  <label class="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-500 transition-all">
                    📷<input type="file" class="hidden" accept="image/*" (change)="onProfilePhotoSelected($event)">
                  </label>
                </div>
                
                <div class="text-center md:text-left">
                  <h2 class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">{{ supabase.username() }}</h2>
                  <p class="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-1">{{ supabase.user()?.email }}</p>
                  
                  <div class="flex gap-3 mt-6 justify-center md:justify-start">
                    @if (supabase.avatarUrl()) {
                      <button (click)="deleteProfilePhoto()" class="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all">Elimina Foto</button>
                    }
                  </div>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div class="bg-white/5 border border-white/5 p-6 rounded-2xl text-center">
                  <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Partite</p>
                  <p class="text-3xl font-black text-white">{{ userStats.gamesPlayed }}</p>
                </div>
                <div class="bg-white/5 border border-white/5 p-6 rounded-2xl text-center">
                  <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Vinte</p>
                  <p class="text-3xl font-black text-green-400">{{ userStats.gamesWon }}</p>
                </div>
                <div class="bg-white/5 border border-white/5 p-6 rounded-2xl text-center">
                  <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Win Rate</p>
                  <p class="text-3xl font-black text-indigo-400">{{ userStats.winRate }}%</p>
                </div>
                <div class="bg-white/5 border border-white/5 p-6 rounded-2xl text-center">
                  <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Punti</p>
                  <p class="text-3xl font-black text-yellow-500">{{ userStats.totalPoints }}</p>
                </div>
              </div>

              <!-- Achievements Section -->
              <div class="mb-8">
                <h3 class="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <span class="text-2xl">🏆</span> Premi Conquistati
                </h3>
                <div class="bg-white/5 border border-white/5 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  @if (userStats.achievements.length > 0) {
                    @for (achievement of userStats.achievements; track achievement.id) {
                      <div class="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl mb-2 last:mb-0">
                        <span class="text-3xl">{{ achievement.icon }}</span>
                        <div class="flex-1">
                          <p class="text-sm font-bold text-white">{{ achievement.name }}</p>
                          <p class="text-[10px] text-slate-400">{{ achievement.date }}</p>
                        </div>
                      </div>
                    }
                  } @else {
                    <p class="text-slate-500 text-sm text-center py-4">Nessun premio ancora conquistato</p>
                  }
                </div>
              </div>

              <!-- Purchases Section -->
              <div class="mb-8">
                <h3 class="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <span class="text-2xl">💳</span> Acquisti Effettuati
                </h3>
                <div class="bg-white/5 border border-white/5 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  @if (userStats.purchases.length > 0) {
                    @for (purchase of userStats.purchases; track purchase.id) {
                      <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-2 last:mb-0">
                        <div>
                          <p class="text-sm font-bold text-white">{{ purchase.name }}</p>
                          <p class="text-[10px] text-slate-400">{{ purchase.date }}</p>
                        </div>
                        <p class="text-sm font-black text-green-400">€{{ purchase.price }}</p>
                      </div>
                    }
                  } @else {
                    <p class="text-slate-500 text-sm text-center py-4">Nessun acquisto effettuato</p>
                  }
                </div>
              </div>

              <!-- Free Downloads Section -->
              <div class="mb-8">
                <h3 class="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                  <span class="text-2xl">📦</span> Download Gratuiti
                </h3>
                <div class="bg-white/5 border border-white/5 rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
                  @if (userStats.downloads.length > 0) {
                    @for (download of userStats.downloads; track download.id) {
                      <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-2 last:mb-0">
                        <div>
                          <p class="text-sm font-bold text-white">{{ download.name }}</p>
                          <p class="text-[10px] text-slate-400">{{ download.date }}</p>
                        </div>
                        <span class="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">GRATIS</span>
                      </div>
                    }
                  } @else {
                    <p class="text-slate-500 text-sm text-center py-4">Nessun download gratuito</p>
                  }
                </div>
              </div>

              <button (click)="supabase.signOut(); showAccountManager = false" 
                class="w-full py-5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-rose-500/20 transition-all shadow-xl">
                Esci dall'Account
              </button>
            </div>
          </div>
        </div>
      }

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
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" (click)="showSetup = false">
          <div class="bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <div class="flex flex-col">
                <h3 class="text-2xl font-black text-white uppercase tracking-wider">Libreria Modelli 3D</h3>
                <p class="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Personalizza i tuoi pezzi e la scacchiera</p>
              </div>
              <button (click)="showSetup = false" class="text-slate-400 hover:text-white p-2 text-xl transition-colors">✕</button>
            </div>

            <!-- Content -->
            <div class="p-8 overflow-y-auto custom-scrollbar bg-transparent space-y-10">
              <!-- Board -->
              <div class="bg-indigo-900/20 border border-indigo-500/20 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-indigo-900/30 transition-colors">
                <div class="flex items-center gap-6">
                  <div class="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl shadow-inner text-indigo-200 border border-indigo-500/20">🗺️</div>
                  <div>
                    <h4 class="text-lg font-black text-white uppercase">Scacchiera (Tavolo)</h4>
                    <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block mt-1">
                      {{ loadedStatus['board'] ? 'Stato: Caricato' : 'Stato: Default' }}
                    </span>
                  </div>
                </div>
                <label class="cursor-pointer relative overflow-hidden group/btn">
                  <span class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-lg transition-all block">Carica STL/GLB</span>
                  <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, 'board')">
                </label>
              </div>

              <!-- Chess Pieces -->
              <div>
                <h4 class="text-sm font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-blue-500/30 pb-3">Set Scacchi Premium</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (type of pieceTypes; track type.id) {
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 group hover:border-blue-500/30 transition-all">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xl text-slate-400 border border-white/5">
                          {{ getIconForType(type.id) }}
                        </div>
                        <h4 class="text-base font-black text-white uppercase">{{ type.label }}</h4>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase text-center py-3 rounded-xl border border-white/10 transition-all">
                          {{ loadedStatus[type.id + '_w'] ? 'BIANCO OK' : 'CARICA BIANCO' }}
                          <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, type.id, 'w')">
                        </label>
                        <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase text-center py-3 rounded-xl border border-white/10 transition-all">
                          {{ loadedStatus[type.id + '_b'] ? 'NERO OK' : 'CARICA NERO' }}
                          <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, type.id, 'b')">
                        </label>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Checkers Pieces -->
              <div>
                <h4 class="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 border-b border-emerald-500/30 pb-3">Set Dama Premium</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (type of checkerTypes; track type.id) {
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xl text-emerald-500 border border-white/5">◎</div>
                        <h4 class="text-base font-black text-white uppercase">{{ type.label }}</h4>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase text-center py-3 rounded-xl border border-white/10 transition-all">
                          {{ loadedStatus[type.id + '_w'] ? 'BIANCO OK' : 'CARICA BIANCO' }}
                          <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, type.id, 'w')">
                        </label>
                        <label class="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase text-center py-3 rounded-xl border border-white/10 transition-all">
                          {{ loadedStatus[type.id + '_b'] ? 'NERO OK' : 'CARICA NERO' }}
                          <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, type.id, 'b')">
                        </label>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-white/10 bg-black/20 flex justify-end">
              <button (click)="showSetup = false" class="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95">Salva & Chiudi</button>
            </div>
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
  `]
})
export class HomeViewComponent {
  gameService = inject(GameService);
  supabase = inject(SupabaseService);

  @Input() showSetup = false;
  @Output() fileSelected = new EventEmitter<{ event: Event, type: string, colorSuffix?: string }>();

  showAIGameModeSelector = false;
  showLocalGameModeSelector = false;
  showAccountManager = false; // Added this property

  // Auth State
  showAuth = false;
  authMode: 'login' | 'register' = 'login';
  authNickname = '';
  authEmail = '';
  authPassword = '';
  authError = '';
  loadingAuth = false;
  uploadingPhoto = false; // Already present, but ensuring it's here

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

  // User Stats (mock data for now)
  userStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    totalPoints: 0,
    achievements: [
      { id: 1, icon: '👑', name: 'Primo Re', date: '2023-01-15' },
      { id: 2, icon: '🌟', name: 'Veterano', date: '2023-03-20' },
    ],
    purchases: [
      { id: 1, name: 'Set Scacchi "Galassia"', date: '2023-02-10', price: '9.99' },
      { id: 2, name: 'Scacchiera "Antica"', date: '2023-04-01', price: '4.99' },
    ],
    downloads: [
      { id: 1, name: 'Set Scacchi "Classico"', date: '2023-01-05' },
      { id: 2, name: 'Scacchiera "Legno"', date: '2023-02-28' },
    ]
  };

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
  }

  toggleAuthMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    this.authError = '';
  }

  async handleAuth(e: Event) {
    e.preventDefault();
    this.loadingAuth = true;
    this.authError = '';

    try {
      const response = this.authMode === 'login'
        ? await this.supabase.signInWithNickname(this.authNickname, this.authPassword)
        : await this.supabase.signUp(this.authEmail, this.authPassword, this.authNickname);

      if (response.error) {
        this.authError = response.error.message;
      } else {
        this.showAuth = false;
        this.authNickname = '';
        this.authEmail = '';
        this.authPassword = '';
        this.authError = '';
        await this.supabase.loadUserProfile();
      }
    } catch (err: any) {
      this.authError = 'Errore imprevisto';
    } finally {
      this.loadingAuth = false;
    }
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
      // TODO: Implement adventure mode view
      alert('Modalità Avventura in arrivo! 🏰');
    } else {
      this.toggleAuth();
      this.authError = 'Registrazione obbligatoria per l\'Avventura';
    }
  }

  async openAccountManager() {
    if (!this.supabase.user()) {
      this.toggleAuth();
      return;
    }
    this.showAccountManager = true;
    await this.loadUserStats();
  }

  async loadUserStats() {
    try {
      const userId = this.supabase.user()?.id;
      if (!userId) return;
      const progress = await this.supabase.getCareerProgress();
      if (progress) {
        this.userStats.totalPoints = progress.total_points || 0;
      }
      this.userStats.gamesPlayed = 42;
      this.userStats.gamesWon = 28;
      this.userStats.winRate = 66.7;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async onProfilePhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const userId = this.supabase.user()?.id;
    if (!userId) return;

    this.uploadingPhoto = true;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await this.supabase.client.storage.from('user-assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = this.supabase.client.storage.from('user-assets').getPublicUrl(filePath);
      await this.supabase.client.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
      await this.supabase.loadUserProfile();
    } catch (error: any) {
      alert('Errore caricamento foto');
    } finally {
      this.uploadingPhoto = false;
    }
  }

  async deleteProfilePhoto() {
    const userId = this.supabase.user()?.id;
    if (!userId) return;
    try {
      await this.supabase.client.from('profiles').update({ avatar_url: null }).eq('id', userId);
      await this.supabase.loadUserProfile();
    } catch (error: any) {
      alert('Errore cancellazione foto');
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

  onFileSelected(event: Event, type: string, colorSuffix?: string) {
    let key = type;
    if (type !== 'board' && colorSuffix) {
      key = `${type}_${colorSuffix}`;
    }
    this.loadedStatus[key] = true;
    this.fileSelected.emit({ event, type, colorSuffix });
  }
}
