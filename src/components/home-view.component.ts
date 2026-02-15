

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
      <div class="relative z-50 flex items-center justify-between mb-6 md:mb-8">
        <!-- THE KING Title -->
        <div class="flex items-center gap-4">
          <div class="relative flex flex-col items-center">
            <h1 class="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse-subtle">
              THE KING
            </h1>
            @if (supabase.user() && supabase.username()) {
              <div class="mt-2 animate-fade-in">
                <p class="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                  {{ supabase.username() }}
                </p>
              </div>
            }
          </div>
        </div>
        
        <!-- Switch Profile Button -->
        <!-- Profile Icon (Yellow Gradient) -->
        <button (click)="supabase.user() ? openAccountManager() : toggleAuth()" 
          class="relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all group overflow-hidden bg-slate-900/40">
          
          <!-- Gradient Background (Subtle) -->
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-600/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          @if (supabase.user() && supabase.avatarUrl()) {
             <!-- User Avatar with Gold Border -->
            <div class="w-full h-full p-[2px] rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 animate-pulse-subtle">
               <img [src]="supabase.avatarUrl()" class="w-full h-full object-cover rounded-full border border-black/50">
            </div>
          } @else {
            <!-- Default Icon with Gold Gradient -->
            <div class="w-full h-full flex items-center justify-center rounded-full group-hover:bg-white/5 transition-colors">
              <svg viewBox="0 0 24 24" class="w-6 h-6 drop-shadow-md">
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#facc15;stop-opacity:1" /> <!-- yellow-400 -->
                    <stop offset="50%" style="stop-color:#eab308;stop-opacity:1" /> <!-- yellow-500 -->
                    <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" /> <!-- amber-600 -->
                  </linearGradient>
                </defs>
                <path fill="url(#goldGradient)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          }
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

          <!-- setup was here -->

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

          <!-- Adventure Mode Card (Soon) -->
          <div class="relative group">
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              <div class="px-6 py-2 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <span class="text-white font-black uppercase text-sm tracking-[0.2em]">Soon</span>
              </div>
            </div>
            <button class="w-full relative overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-8 transition-all opacity-40 cursor-not-allowed">
              <div class="relative flex flex-col items-center text-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-emerald-400">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-slate-400 uppercase tracking-tighter">Avventura</h2>
                  <p class="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Missioni Epiche</p>
                </div>
              </div>
            </button>
          </div>

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

          <!-- Shop/Marketplace Card -->
          <button (click)="gameService.setView('marketplace')"
            class="group relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/5 hover:border-yellow-500/30 rounded-[2rem] p-6 md:p-8 transition-all hover:scale-[1.02] shadow-2xl">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-yellow-400">
                  <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z"></path>
                  <path d="M3 8h18M10 12h4"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-black text-white uppercase tracking-tighter">Shop</h2>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Skin & Assets</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer with Admin Link -->
      <div class="relative z-10 mt-auto pt-8 pb-4 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
        <button (click)="openAdminLogin()" class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors">
          Area Amministrazione
        </button>
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
                  {{ authMode === 'admin' ? 'Pannello Admin' : (authMode === 'login' ? 'Bentornato' : 'Inizia Ora') }}
                </h2>
                <p class="text-indigo-300/80 text-sm font-bold uppercase tracking-[0.2em]">
                  {{ authMode === 'admin' ? 'Accesso Riservato' : (authMode === 'login' ? 'Accedi al Regno' : 'Unisciti alla Leggenda') }}
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
                  <p class="text-rose-400 text-sm font-bold text-center uppercase tracking-wide bg-rose-500/10 py-3 rounded-xl border border-rose-500/20 shadow-lg animate-fade-in px-4">{{ authError }}</p>
                }

                @if (authSuccess) {
                  <p class="text-emerald-400 text-sm font-bold text-center uppercase tracking-wide bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20 shadow-lg animate-fade-in px-4">{{ authSuccess }}</p>
                }

                <button type="submit" [disabled]="loadingAuth"
                  class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest mt-6">
                  {{ loadingAuth ? 'Caricamento...' : (authMode === 'admin' ? 'Accedi Amministratore' : (authMode === 'login' ? 'Accedi' : 'Registrati')) }}
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
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in"
             (click)="showAccountManager = false">
          
          <div class="relative bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
               (click)="$event.stopPropagation()">
            
            <!-- Close Button -->
            <button (click)="showAccountManager = false" 
              class="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white border border-white/10 transition-all active:scale-95">
              ✕
            </button>
            
            <div class="p-8 md:p-10 overflow-y-auto custom-scrollbar relative z-10">
              
              <!-- HEADER: Icon Left + Name Right -->
              <div class="flex flex-row items-center gap-6 mb-10 pb-8 border-b border-white/5">
                
                <!-- 1. Profile Icon (Left) -->
                <div class="relative group shrink-0">
                  <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-black/40 flex items-center justify-center relative">
                    <!-- Gradient Background -->
                    <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 opacity-60"></div>

                    @if (supabase.avatarUrl()) {
                        <div class="w-full h-full p-[2px] rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 animate-pulse-subtle">
                           <img [src]="supabase.avatarUrl()" class="w-full h-full object-cover rounded-full border border-black/80">
                        </div>
                    } @else {
                        <div class="w-full h-full flex items-center justify-center rounded-full">
                          <svg viewBox="0 0 24 24" class="w-10 h-10 drop-shadow-md">
                            <defs>
                              <linearGradient id="goldGradientUser" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#fcd34d;stop-opacity:1" /> <!-- amber-300 -->
                                <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:1" /> <!-- amber-500 -->
                                <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" /> <!-- amber-600 -->
                              </linearGradient>
                            </defs>
                            <path fill="url(#goldGradientUser)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                          </svg>
                        </div>
                    }
                  </div>
                  
                  <!-- Edit Photo Prompt (Hover) -->
                  <label class="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-700 transition-colors">
                     <span class="text-xs">📷</span>
                     <input type="file" class="hidden" accept="image/*" (change)="onProfilePhotoSelected($event)">
                  </label>
                </div>
                
                <!-- 2. Name & Status (Right) -->
                <div class="flex-1 flex flex-col justify-center">
                  <!-- Name -->
                  <div class="relative group/name w-full">
                     @if (isEditingName) {
                      <input type="text" [(ngModel)]="tempNickname" (blur)="saveNickname()" (keydown.enter)="saveNickname()"
                        class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter bg-transparent border-b border-amber-500/50 focus:outline-none w-full mb-1"
                        autoFocus>
                      <p class="text-[9px] text-amber-500/80 mt-1 uppercase font-bold tracking-widest">Premi Invio per salvare</p>
                    } @else {
                      <h2 (dblclick)="startEditingName()" 
                        class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase tracking-tighter drop-shadow-md cursor-pointer hover:via-amber-200 transition-all truncate"
                        title="Doppio click per modificare">
                        {{ supabase.username() || 'GIOCATORE 1' }}
                      </h2>
                    }
                  </div>
                  
                  <!-- Status / Email -->
                  <div class="flex items-center gap-2 mt-1">
                    <div class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        Online
                    </div>
                    @if (supabase.user()?.email) {
                        <span class="text-[10px] font-bold text-slate-500 tracking-wider truncate max-w-[200px]">{{ supabase.user()?.email }}</span>
                    }
                  </div>
                </div>

              </div>

              <!-- STATS GRID -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <!-- Games -->
                <div class="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-2xl relative overflow-hidden group hover:bg-indigo-900/20 transition-all">
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p class="text-[9px] text-indigo-300 font-black uppercase tracking-widest mb-1 relative z-10">Partite</p>
                  <p class="text-3xl font-black text-white relative z-10">{{ userStats.gamesPlayed }}</p>
                  <span class="absolute -bottom-4 -right-2 text-6xl text-indigo-500/10 group-hover:text-indigo-500/20 transition-all select-none">♟</span>
                </div>
                
                <!-- Wins -->
                <div class="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden group hover:bg-emerald-900/20 transition-all">
                   <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <p class="text-[9px] text-emerald-300 font-black uppercase tracking-widest mb-1 relative z-10">Vittorie</p>
                   <p class="text-3xl font-black text-white relative z-10">{{ userStats.gamesWon }}</p>
                   <span class="absolute -bottom-4 -right-2 text-6xl text-emerald-500/10 group-hover:text-emerald-500/20 transition-all select-none">♛</span>
                </div>
                
                <!-- Rate -->
                <div class="bg-violet-900/10 border border-violet-500/20 p-4 rounded-2xl relative overflow-hidden group hover:bg-violet-900/20 transition-all">
                   <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <p class="text-[9px] text-violet-300 font-black uppercase tracking-widest mb-1 relative z-10">Win Rate</p>
                   <p class="text-3xl font-black text-white relative z-10">{{ userStats.winRate }}%</p>
                   <span class="absolute -bottom-4 -right-2 text-6xl text-violet-500/10 group-hover:text-violet-500/20 transition-all select-none">📈</span>
                </div>
                
                <!-- Points -->
                <div class="bg-amber-900/10 border border-amber-500/20 p-4 rounded-2xl relative overflow-hidden group hover:bg-amber-900/20 transition-all">
                   <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <p class="text-[9px] text-amber-300 font-black uppercase tracking-widest mb-1 relative z-10">Punti</p>
                   <p class="text-3xl font-black text-white relative z-10">{{ userStats.totalPoints }}</p>
                   <span class="absolute -bottom-4 -right-2 text-6xl text-amber-500/10 group-hover:text-amber-500/20 transition-all select-none">★</span>
                </div>
              </div>

              <!-- LIST SECTIONS -->
              <div class="space-y-8">
                
                <!-- Achievements -->
                <div>
                  <h3 class="flex items-center gap-2 mb-3 px-1">
                    <span class="text-lg">🏆</span>
                    <span class="text-xs font-black text-slate-300 uppercase tracking-widest">Premi & Medaglie</span>
                  </h3>
                  
                  <div class="bg-black/20 border border-white/5 rounded-2xl p-2 max-h-40 overflow-y-auto custom-scrollbar">
                    @if (userStats.achievements.length > 0) {
                        @for (achievement of userStats.achievements; track achievement.id) {
                        <div class="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl mb-1 last:mb-0 hover:bg-slate-800 transition-colors">
                            <span class="text-2xl">{{ achievement.icon }}</span>
                            <div class="flex-1">
                            <p class="text-xs font-bold text-white uppercase">{{ achievement.name }}</p>
                            <p class="text-[9px] text-slate-500">{{ achievement.date }}</p>
                            </div>
                        </div>
                        }
                    } @else {
                        <div class="flex flex-col items-center justify-center py-6 gap-2 opacity-50">
                            <span class="text-3xl grayscale opacity-50">🏆</span>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nessun premio ancora conquistato</p>
                        </div>
                    }
                  </div>
                </div>

                <!-- Purchases -->
                <div>
                  <h3 class="flex items-center gap-2 mb-3 px-1">
                    <span class="text-lg">💳</span>
                    <span class="text-xs font-black text-slate-300 uppercase tracking-widest">Storico Acquisti</span>
                  </h3>
                  
                  <div class="bg-black/20 border border-white/5 rounded-2xl p-2 max-h-40 overflow-y-auto custom-scrollbar">
                    @if (userStats.purchases.length > 0) {
                        @for (purchase of userStats.purchases; track purchase.id) {
                        <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-1 last:mb-0 hover:bg-slate-800 transition-colors">
                            <div>
                            <p class="text-xs font-bold text-white uppercase">{{ purchase.name }}</p>
                            <p class="text-[9px] text-slate-500">{{ purchase.date }}</p>
                            </div>
                            <p class="text-xs font-black text-emerald-400">€{{ purchase.price }}</p>
                        </div>
                        }
                    } @else {
                        <div class="flex flex-col items-center justify-center py-6 gap-2 opacity-50">
                            <span class="text-3xl grayscale opacity-50">💳</span>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nessun acquisto effettuato</p>
                        </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="mt-10 pt-6 border-t border-white/5 flex flex-col items-center">
                 <button (click)="logout()" 
                    class="w-full py-4 relative group overflow-hidden rounded-xl bg-slate-800/50 border border-rose-500/30 hover:border-rose-500/60 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span class="relative z-10 text-xs font-black text-rose-400 uppercase tracking-[0.25em] group-hover:text-rose-300 transition-colors">
                        Disconnetti Account
                    </span>
                 </button>
                 <p class="text-[9px] text-slate-600 mt-4 font-mono">ID: {{supabase.user()?.id}}</p>
              </div>

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


            <!-- Navigation Tabs -->
            <div class="flex border-b border-white/10 px-8">
              <button class="px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all border-blue-500 text-white">
                Configurazione Pezzi
              </button>
              <button (click)="gameService.setView('marketplace'); showSetup = false" class="px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all border-transparent text-slate-500 hover:text-indigo-400">
                Visita lo Shop ✨
              </button>
            </div>

            <!-- Content -->
            <div class="p-8 overflow-y-auto custom-scrollbar bg-transparent flex-1">
              
              <!-- UPLOAD TAB -->
              @if (setupTab === 'upload') {
                  <div class="space-y-10 animate-fade-in">
                    <!-- Board Setup -->
                    <div class="bg-indigo-900/10 border border-white/5 rounded-[2rem] p-8 space-y-6">
                        <div class="flex items-center gap-6">
                        <div class="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/10">
                            <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-slate-400">
                            <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                            <rect x="2" y="2" width="5" height="5"/>
                            <rect x="12" y="2" width="5" height="5"/>
                            <rect x="7" y="7" width="5" height="5"/>
                            <rect x="17" y="7" width="5" height="5"/>
                            <rect x="2" y="12" width="5" height="5"/>
                            <rect x="12" y="12" width="5" height="5"/>
                            <rect x="7" y="17" width="5" height="5"/>
                            <rect x="17" y="17" width="5" height="5"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-xl font-black text-white uppercase tracking-tight">Scacchiera 3D</h4>
                            <p class="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
                            {{ loadedStatus['board'] ? 'Stato: Caricato OK' : 'Stato: Modello Standard' }}
                            </p>
                        </div>
                        </div>

                        <label class="cursor-pointer block">
                        <span class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase text-center py-4 rounded-xl border border-white/10 transition-all block shadow-lg">
                            Carica file STL / GLB / GLTF
                        </span>
                        <input type="file" accept=".stl,.glb,.gltf" class="hidden" (change)="onFileSelected($event, 'board')">
                        </label>
                    </div>

                    <!-- Chess Pieces -->
                    <div>
                        <h4 class="text-sm font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-blue-500/30 pb-3">Set Scacchi Custom</h4>
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
                        <h4 class="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 border-b border-emerald-500/30 pb-3">Set Dama Custom</h4>
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
              }

              <!-- LIBRARY TAB -->
              @if (setupTab === 'library') {
                <div class="space-y-8 animate-fade-in">
                    
                    <!-- Featured Sets -->
                    <div>
                        <h4 class="text-sm font-black text-purple-400 uppercase tracking-widest mb-4">Set Completi (Scacchi)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Example Item 1 -->
                            <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-1 overflow-hidden group">
                                <div class="relative h-32 bg-slate-950/50 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                                    <span class="text-4xl">🏰</span> <!-- Placeholder for preview image -->
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button (click)="selectLibrarySet('classic_ivory')" class="px-4 py-2 bg-white text-black font-black uppercase text-xs rounded-full tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-all">Usa Questo</button>
                                    </div>
                                </div>
                                <div class="px-3 pb-3">
                                    <h5 class="text-white font-bold uppercase text-sm">Classic Ivory</h5>
                                    <p class="text-xs text-slate-500 mt-1">Stile classico pregiato</p>
                                </div>
                            </div>

                            <!-- Example Item 2 -->
                            <div class="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-1 overflow-hidden group shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                                <div class="relative h-32 bg-slate-950/50 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                                    <span class="text-4xl">🔮</span>
                                    <div class="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Premium</div>
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button (click)="selectLibrarySet('neon_cyber')" class="px-4 py-2 bg-purple-500 text-white font-black uppercase text-xs rounded-full tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-all">Sblocca</button>
                                    </div>
                                </div>
                                <div class="px-3 pb-3">
                                    <h5 class="text-white font-bold uppercase text-sm">Neon Cyber</h5>
                                    <p class="text-xs text-slate-500 mt-1">Stile futuristico luminoso</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boards -->
                     <div>
                        <h4 class="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4">Scacchiere</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                             <div class="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-700/50 transition-all" (click)="selectLibrarySet('board_wood')">
                                <div class="w-12 h-12 rounded bg-[#5c4033]"></div>
                                <span class="text-[10px] font-bold text-white uppercase">Legno</span>
                             </div>
                             <div class="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-700/50 transition-all" (click)="selectLibrarySet('board_marble')">
                                <div class="w-12 h-12 rounded bg-slate-300"></div>
                                <span class="text-[10px] font-bold text-white uppercase">Marmo</span>
                             </div>
                             <div class="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-700/50 transition-all" (click)="selectLibrarySet('board_glass')">
                                <div class="w-12 h-12 rounded bg-cyan-900/40 border border-cyan-500/30"></div>
                                <span class="text-[10px] font-bold text-white uppercase">Vetro</span>
                             </div>
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
  `]
})
export class HomeViewComponent implements OnInit {
  gameService = inject(GameService);
  supabase = inject(SupabaseService);

  @Input() showSetup = false;
  @Output() fileSelected = new EventEmitter<{ event: Event, type: string, colorSuffix?: string }>();

  showAIGameModeSelector = false;
  showLocalGameModeSelector = false;
  showAccountManager = false; // Added this property

  // Auth State
  showAuth = false;
  authMode: 'login' | 'register' | 'admin' = 'login';
  authNickname = '';
  authEmail = '';
  authPassword = '';
  authError = '';
  authSuccess = '';
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
  isEditingName = false;
  tempNickname = '';

  userStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    totalPoints: 0,
    achievements: [],
    purchases: [],
    downloads: []
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
    e.preventDefault();
    this.loadingAuth = true;
    this.authError = '';
    this.authSuccess = ''; // Assicurati di avere questa proprietà nel componente
    console.log('HomeView: Inizio procedura auth', this.authMode);

    try {
      if (this.authMode === 'admin') {
        if (this.authNickname === 'admin' && this.authPassword === 'accessometti') {
          this.authSuccess = 'Benvenuto Admin! Redirect in corso...';
          setTimeout(() => {
            this.showAuth = false;
            this.gameService.setView('admin');
          }, 1500);
          return;
        } else {
          this.authError = 'Credenziali Admin Errante!';
          this.loadingAuth = false;
          return;
        }
      }

      let res: any = null;

      if (this.authMode === 'login') {
        res = await this.supabase.authService.signIn(this.authNickname, this.authPassword);
      } else {
        // Registrazione
        res = await this.supabase.authService.signUp(this.authEmail, this.authPassword, this.authNickname);
      }

      const { data, error } = res;

      if (error) {
        console.error('HomeView: Errore durante auth:', error);
        let msg = error.message || 'Si è verificato un errore.';

        // Traduzioni errori stile Number-main
        if (msg.includes('Invalid login credentials')) {
          msg = 'Credenziali non valide. Verifica nickname e password.';
        } else if (msg.includes('User already registered')) {
          msg = 'Email già registrata. Prova ad accedere!';
        } else if (msg.includes('Password should be at least')) {
          msg = 'La password deve avere almeno 6 caratteri.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email non confermata. Controlla la tua posta elettronica.';
        } else if (msg.includes('Nickname già in uso')) {
          msg = 'Questo nickname è già stato preso. Scegline un altro!';
        }

        this.authError = msg;
      } else {
        // Successo
        if (this.authMode === 'register' && !data?.session) {
          this.authSuccess = 'Account creato! Ti abbiamo inviato un\'email di conferma. Clicca sul link per attivare l\'account.';
          this.authError = '';
        } else {
          // Login o registrazione con auto-conferma
          this.authSuccess = 'Accesso in corso...';
          this.authError = '';

          // FORCED CLOSURE after 2 seconds
          setTimeout(() => {
            this.showAuth = false;
            this.authSuccess = '';
          }, 2000);

          // Caricamento profilo e dati
          await this.supabase.loadUserProfile();
          await this.loadUserStats();

          // Reset Form
          this.authNickname = '';
          this.authEmail = '';
          this.authPassword = '';
          console.log('HomeView: Login completato con successo');
        }
      }
    } catch (err: any) {
      this.authError = 'Errore di connessione al database.';
      console.error('HomeView: Critical Auth Error:', err);
    } finally {
      this.loadingAuth = false;
    }
  }

  async logout() {
    await this.supabase.signOut();
    this.showAccountManager = false;
    // Reset local stats
    this.userStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      totalPoints: 0,
      achievements: [],
      purchases: [],
      downloads: []
    };
    console.log('HomeView: Logout effettuato');
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
        // Map real results from the database if they exist
        // Note: these fields might need to be added to your career_progress table
        this.userStats.gamesPlayed = progress.games_played || 0;
        this.userStats.gamesWon = progress.games_won || 0;

        if (this.userStats.gamesPlayed > 0) {
          this.userStats.winRate = Number(((this.userStats.gamesWon / this.userStats.gamesPlayed) * 100).toFixed(1));
        } else {
          this.userStats.winRate = 0;
        }
      } else {
        // Defaults for new users
        this.userStats.gamesPlayed = 0;
        this.userStats.gamesWon = 0;
        this.userStats.winRate = 0;
        this.userStats.totalPoints = 0;
      }
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
      // 1. Client-side compression/resize (Matches Number-main logic)
      const base64Image = await ImageUtils.processAvatarImage(file);

      // 2. Upload to Storage (Bucket 'avatars')
      // convert base64 to blob for upload
      const response = await fetch(base64Image);
      const blob = await response.blob();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await this.supabase.client.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error("Manca il bucket 'avatars' su Supabase. Crealo come Pubblico.");
        }
        throw error;
      }

      // 3. Get Public URL
      const { data: urlData } = this.supabase.client.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 4. Update Profile
      await this.supabase.client.from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      await this.supabase.loadUserProfile();

      // Removed alert as per request
      // alert('Foto aggiornata con successo! ✨');

    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(`Impossibile caricare la foto: ${error.message}`);
    } finally {
      this.uploadingPhoto = false;
    }
  }

  startEditingName() {
    this.tempNickname = this.supabase.username() || '';
    this.isEditingName = true;
  }

  async debugFetchProfile() {
    const uid = this.supabase.user()?.id;
    if (!uid) {
      alert('ID Utente non trovato (L\'utente sembra non essere loggato).');
      return;
    }

    console.log('DEBUG: Tentativo fetch profilo per UID:', uid);

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.error('DEBUG: Errore query profiles:', error);
      alert('ERRORE QUERY: ' + error.message);
    } else if (data) {
      console.log('DEBUG: Profilo trovato:', data);
      alert(`PROFILO TROVATO!\nUsername: ${data.username}\nNickname: ${data.nickname}\nID: ${data.id}`);
      // Force update local signal
      if (data.username) this.supabase.username.set(data.username);
    } else {
      console.warn('DEBUG: Profilo non trovato nella tabella.');
      alert('NESSUN PROFILO TROVATO NEL DATABASE per questo ID.');
    }
  }

  async saveNickname() {
    if (!this.tempNickname.trim()) {
      this.isEditingName = false;
      return;
    }
    try {
      const userId = this.supabase.user()?.id;
      if (userId) {
        await this.supabase.client.from('profiles').update({ username: this.tempNickname }).eq('id', userId);
        // Manually update local signal to reflect change immediately
        this.supabase.username.set(this.tempNickname);
      }
    } catch (e) {
      console.error('Error saving name', e);
    }
    this.isEditingName = false;
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


  async ngOnInit() {
    if (this.supabase.user()) {
      await this.supabase.loadUserProfile();
    }
    await this.loadUserStats();
  }


  // Setup Tab State
  setupTab: 'upload' | 'library' = 'upload';

  async selectLibrarySet(setId: string) {
    if (!this.supabase.user()) {
      alert('Devi accedere per salvare le preferenze!');
      return;
    }

    // Mock Library URLs - In production these would come from the DB/Storage
    const libraryAssets: Record<string, any> = {
      'board_wood': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_wood.glb',
      'board_marble': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_marble.glb',
      'board_glass': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/board_glass.glb',
      'classic_ivory': {
        'p_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_pawn_w.glb',
        'n_w': 'https://xxvlfbozkveeydritfeo.supabase.co/storage/v1/object/public/library/ivory_knight_w.glb',
        // Add other pieces as needed
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
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Construct key (e.g., 'board', 'p_w', 'k_b')
    let key = type;
    if (type !== 'board' && colorSuffix) {
      key = `${type}_${colorSuffix}`;
    }

    try {
      const userId = this.supabase.user()?.id;

      // If user is logged in, upload and save to profile
      if (userId) {
        const publicUrl = await this.supabase.uploadCustomAssetFile(file, key);
        await this.supabase.saveUserAssetPreference(key, publicUrl);

        // Update Game Service Signal
        this.gameService.customMeshUrls.update(current => ({ ...current, [key]: publicUrl }));
        this.loadedStatus[key] = true;

        if (type !== 'board') {
          this.gameService.setPieceStyle('custom');
        }

        this.fileSelected.emit({ event, type, colorSuffix });
      } else {
        // Fallback for Guest (Local only, not persistent)
        const objectUrl = URL.createObjectURL(file);
        this.gameService.customMeshUrls.update(current => ({ ...current, [key]: objectUrl }));
        this.loadedStatus[key] = true;

        if (type !== 'board') {
          this.gameService.setPieceStyle('custom');
        }

        this.fileSelected.emit({ event, type, colorSuffix });
      }

    } catch (error: any) {
      console.error('Asset Upload Error:', error);
      alert(`Errore caricamento: ${error.message}`);
    }
  }
}
