
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { PieceType } from '../logic/chess-types';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex flex-col p-4 md:p-6 overflow-hidden">
      
      <!-- Top Bar: Title and Login -->
      <div class="relative z-50 flex items-center justify-between mb-6 md:mb-8">
        <!-- THE KING Logo with Crown -->
        <div class="flex items-center gap-2 md:gap-3">
          <!-- Crown Icon -->
          <div class="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 animate-float">
            <svg viewBox="0 0 100 100" fill="currentColor" class="text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
              <path d="M10 70 L20 30 L35 45 L50 20 L65 45 L80 30 L90 70 Z M15 75 L85 75 L85 85 L15 85 Z"/>
              <circle cx="20" cy="30" r="5" class="text-amber-300"/>
              <circle cx="50" cy="20" r="5" class="text-amber-300"/>
              <circle cx="80" cy="30" r="5" class="text-amber-300"/>
            </svg>
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none">
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 
                         drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-shimmer">
              THE KING
            </span>
          </h1>
        </div>
        
        <!-- Login Button (top right) -->
        <button (click)="gameService.setView('admin')" 
          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800/60 backdrop-blur-md border border-white/10 hover:border-purple-400/50 transition-all flex items-center justify-center group">
          <svg viewBox="0 0 100 100" fill="currentColor" class="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-purple-400 transition-colors">
            <circle cx="50" cy="30" r="18"/>
            <path d="M20 80 Q50 60 80 80 L80 90 L20 90 Z"/>
          </svg>
        </button>
      </div>

      <!-- Animated Background with Floating Orbs -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden -z-10">
        <!-- King Shadow Watermark -->
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
          <svg class="w-[150%] h-[150%] transform rotate-[30deg] translate-x-[10%]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 L45 20 L40 15 L40 25 L35 25 L35 30 L30 30 L30 70 L25 70 L25 80 L75 80 L75 70 L70 70 L70 30 L65 30 L65 25 L60 25 L60 15 L55 20 L50 10 Z" class="text-white"/>
          </svg>
        </div>
        
        <!-- Depth Layer 1 -->
        <div class="depth-layer-1"></div>
        
        <!-- Depth Layer 2 -->
        <div class="depth-layer-2"></div>
        
        <!-- Volumetric Light Rays -->
        <div class="light-ray" style="left: 15%; animation-delay: 0s;"></div>
        <div class="light-ray" style="left: 45%; animation-delay: 5s;"></div>
        <div class="light-ray" style="left: 75%; animation-delay: 10s;"></div>
        
        <!-- Floating Orbs -->
        @for (orb of orbs; track $index) {
          <div class="orb" [style.left.%]="orb.x" [style.top.%]="orb.y" 
               [style.width.px]="orb.size" [style.height.px]="orb.size"
               [style.animation-duration.s]="orb.duration"
               [style.animation-delay.s]="orb.delay"></div>
        }
      </div>

      <!-- Main Content -->
      <div class="relative z-10 flex-1 flex items-center justify-center px-2">
        <div class="w-full max-w-6xl">
          <!-- First Row: 4 buttons -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
            
            <!-- AI Challenge Icon -->
            <button (click)="showAIGameModeSelector = true" 
              class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-yellow-600/20 
                     border border-yellow-500/30 hover:border-yellow-400/60 backdrop-blur-xl
                     shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] 
                     transition-all duration-300 flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10 flex flex-col items-center gap-2">
                <!-- AI Robot Icon -->
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:scale-90 transition-transform duration-200">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                    <rect x="25" y="35" width="50" height="45" rx="8"/>
                    <circle cx="40" cy="50" r="6" class="text-slate-950"/>
                    <circle cx="60" cy="50" r="6" class="text-slate-950"/>
                    <rect x="35" y="65" width="30" height="4" rx="2" class="text-slate-950"/>
                    <circle cx="50" cy="25" r="8" class="text-amber-300"/>
                    <rect x="48" y="15" width="4" height="10" class="text-amber-300"/>
                  </svg>
                </div>
                <span class="text-yellow-400 text-xs md:text-sm font-bold uppercase tracking-wider">AI</span>
              </div>
            </button>

            <!-- Local Match Icon -->
            <button (click)="showLocalGameModeSelector = true"
              class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-600/20 
                     border border-indigo-500/30 hover:border-indigo-400/60 backdrop-blur-xl
                     shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] 
                     transition-all duration-300 flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-400/0 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10 flex flex-col items-center gap-2">
                <!-- Two Players Icon -->
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:scale-90 transition-transform duration-200">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                    <circle cx="35" cy="25" r="12"/>
                    <path d="M20 50 Q35 40 50 50 L50 70 L20 70 Z"/>
                    <circle cx="65" cy="25" r="12" class="text-indigo-300"/>
                    <path d="M50 50 Q65 40 80 50 L80 70 L50 70 Z" class="text-indigo-300"/>
                  </svg>
                </div>
                <span class="text-indigo-400 text-xs md:text-sm font-bold uppercase tracking-wider">Local</span>
              </div>
            </button>

            <!-- Settings Icon -->
            <button (click)="gameService.setView('settings')" 
              class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-600/20 
                     border border-blue-500/30 hover:border-blue-400/60 backdrop-blur-xl
                     shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] 
                     transition-all duration-300 flex items-center justify-center">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10 flex flex-col items-center gap-2">
                <!-- Settings Gear Icon -->
                <div class="w-16 h-16 md:w-20 md:h-20 group-hover:rotate-90 group-active:scale-90 transition-all duration-500">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                    <path d="M50 30 A20 20 0 1 1 50 70 A20 20 0 1 1 50 30 M50 40 A10 10 0 1 0 50 60 A10 10 0 1 0 50 40"/>
                    <rect x="45" y="10" width="10" height="15" rx="2"/>
                    <rect x="45" y="75" width="10" height="15" rx="2"/>
                    <rect x="10" y="45" width="15" height="10" rx="2"/>
                    <rect x="75" y="45" width="15" height="10" rx="2"/>
                  </svg>
                </div>
                <span class="text-blue-400 text-xs md:text-sm font-bold uppercase tracking-wider">Setup</span>
              </div>
            </button>

            <!-- Marketplace Icon (Blocked) -->
            <button disabled
              class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-600/20 
                     border border-purple-500/30 backdrop-blur-xl
                     shadow-[0_0_30px_rgba(168,85,247,0.1)] opacity-60 cursor-not-allowed
                     transition-all duration-300 flex items-center justify-center">
              <div class="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wider z-20">
                Soon
              </div>
              <div class="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/20 opacity-0 transition-opacity duration-500"></div>
              <div class="relative z-10 flex flex-col items-center gap-2">
                <!-- Diamond Icon -->
                <div class="w-16 h-16 md:w-20 md:h-20 grayscale opacity-50 transition-all duration-500">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-purple-400">
                    <path d="M50 10 L70 30 L90 30 L70 70 L50 90 L30 70 L10 30 L30 30 Z"/>
                    <path d="M50 10 L70 30 L50 50 L30 30 Z" class="text-pink-300 opacity-60"/>
                  </svg>
                </div>
                <span class="text-purple-400/50 text-xs md:text-sm font-bold uppercase tracking-wider">Shop</span>
              </div>
            </button>
          </div>

          <!-- Second Row: Career, Adventure, Online -->
          <div class="grid grid-cols-3 gap-3 md:gap-6 items-center">
            <!-- Career Mode (Blocked) -->
            <button disabled
              class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 via-red-500/10 to-orange-600/20 
                     border border-orange-500/30 backdrop-blur-xl
                     shadow-[0_0_20px_rgba(249,115,22,0.1)] opacity-60 cursor-not-allowed
                     transition-all duration-300 flex flex-col items-center justify-center py-4 px-2 md:h-28">
              <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-orange-500 text-white text-[7px] md:text-[8px] font-bold rounded-full uppercase tracking-wider z-20">
                Soon
              </div>
              <div class="w-8 h-8 md:w-12 md:h-12 mb-2 grayscale opacity-50">
                <svg viewBox="0 0 100 100" fill="currentColor" class="text-orange-400">
                  <path d="M20 80 L30 80 L30 50 L20 50 Z M40 80 L50 80 L50 30 L40 30 Z M60 80 L70 80 L70 10 L60 10 Z"/>
                  <path d="M10 90 L90 90 L90 95 L10 95 Z" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
              <div class="text-center">
                <div class="text-orange-400/50 font-bold text-[10px] md:text-sm uppercase tracking-wider">Carriera</div>
              </div>
            </button>

            <!-- Adventure Mode (Blocked) -->
            <button disabled
              class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-blue-600/20 
                     border border-blue-500/30 backdrop-blur-xl
                     shadow-[0_0_20px_rgba(59,130,246,0.1)] opacity-60 cursor-not-allowed
                     transition-all duration-300 flex flex-col items-center justify-center py-4 px-2 md:h-28">
              <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-500 text-white text-[7px] md:text-[8px] font-bold rounded-full uppercase tracking-wider z-20">
                Soon
              </div>
              <div class="w-8 h-8 md:w-12 md:h-12 mb-2 grayscale opacity-50">
                <svg viewBox="0 0 100 100" fill="currentColor" class="text-blue-400">
                  <path d="M20 70 L50 20 L80 70 Z" fill="none" stroke="currentColor" stroke-width="5"/>
                  <circle cx="50" cy="45" r="5"/>
                  <path d="M10 80 Q50 60 90 80 L90 90 L10 90 Z" opacity="0.6"/>
                </svg>
              </div>
              <div class="text-center">
                <div class="text-blue-400/50 font-bold text-[10px] md:text-sm uppercase tracking-wider">Avventura</div>
              </div>
            </button>

            <!-- Online Challenge -->
            <button disabled 
              class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-emerald-600/20 
                     border border-emerald-500/30 backdrop-blur-xl
                     shadow-[0_0_20px_rgba(16,185,129,0.15)] opacity-60 cursor-not-allowed
                     transition-all duration-300 flex flex-col items-center justify-center py-4 px-2 md:h-28">
              <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] md:text-[8px] font-bold rounded-full uppercase tracking-wider z-20">
                Soon
              </div>
              <div class="w-8 h-8 md:w-12 md:h-12 mb-2">
                <svg viewBox="0 0 100 100" fill="currentColor" class="text-emerald-400">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4"/>
                  <ellipse cx="50" cy="50" rx="15" ry="40" fill="none" stroke="currentColor" stroke-width="4"/>
                  <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="4"/>
                  <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4"/>
                </svg>
              </div>
              <div class="text-center">
                <div class="text-emerald-400 font-bold text-[10px] md:text-sm uppercase tracking-wider">Online</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom: Admin Icon -->
      <div class="relative z-50 flex justify-center mt-4">
        <button (click)="gameService.setView('admin')" 
          class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-purple-400/30 transition-all flex items-center justify-center group">
          <svg viewBox="0 0 100 100" fill="currentColor" class="w-5 h-5 md:w-6 md:h-6 text-slate-500 group-hover:text-purple-400 transition-colors">
            <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 60 L30 75 L35 55 L20 40 L40 40 Z"/>
          </svg>
        </button>
      </div>

      <!-- Setup Modal -->
      @if (showSetup) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-4"
             (click)="gameService.setView('home')">
          <div class="relative bg-gradient-to-br from-slate-900/98 to-slate-800/98 border-2 border-blue-500/30 rounded-3xl p-6 md:p-10 max-w-4xl w-full shadow-[0_0_80px_rgba(59,130,246,0.3)] overflow-y-auto max-h-[90vh]"
               (click)="$event.stopPropagation()">
            
            <!-- Close Button -->
            <button (click)="gameService.setView('home')" 
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 hover:border-red-400/50 transition-all flex items-center justify-center group">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" class="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors">
                <line x1="25" y1="25" x2="75" y2="75"/>
                <line x1="75" y1="25" x2="25" y2="75"/>
              </svg>
            </button>

            <h2 class="text-3xl md:text-4xl font-black text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400">
              CONFIGURAZIONE GIOCO
            </h2>

            <!-- Configuration Sections -->
            <div class="space-y-10">
              
              <!-- SCACCHI ASSETS -->
              <section>
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                    <span class="font-bold">S</span>
                  </div>
                  <h3 class="text-xl font-bold text-white tracking-widest uppercase">Modelli Scacchi</h3>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  @for (type of pieceTypes; track type.id) {
                    <div class="space-y-2">
                       <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">{{type.label}}</label>
                       <div class="flex flex-col gap-2">
                          <button (click)="fileInputW.click()" 
                                  class="w-full py-2 px-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                             Bianco
                          </button>
                          <button (click)="fileInputB.click()" 
                                  class="w-full py-2 px-1 text-[10px] bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-lg text-white transition-all">
                             Nero
                          </button>
                          <input #fileInputW type="file" class="hidden" (change)="onFileSelected($event, type.id, 'w')" accept=".stl,.glb,.gltf">
                          <input #fileInputB type="file" class="hidden" (change)="onFileSelected($event, type.id, 'b')" accept=".stl,.glb,.gltf">
                       </div>
                    </div>
                  }
                </div>
              </section>

              <!-- DAMA ASSETS -->
              <section>
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                    <span class="font-bold">D</span>
                  </div>
                  <h3 class="text-xl font-bold text-white tracking-widest uppercase">Modelli Dama</h3>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  @for (type of checkerTypes; track type.id) {
                    <div class="space-y-2">
                       <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">{{type.label}}</label>
                       <div class="grid grid-cols-2 gap-2">
                          <button (click)="cInputW.click()" 
                                  class="w-full py-2 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                            Bianco
                          </button>
                          <button (click)="cInputB.click()" 
                                  class="w-full py-2 text-[10px] bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-lg text-white transition-all">
                            Nero
                          </button>
                          <input #cInputW type="file" class="hidden" (change)="onFileSelected($event, type.id, 'w')" accept=".stl,.glb,.gltf">
                          <input #cInputB type="file" class="hidden" (change)="onFileSelected($event, type.id, 'b')" accept=".stl,.glb,.gltf">
                       </div>
                    </div>
                  }
                  
                  <!-- Board Asset -->
                  <div class="space-y-2">
                     <label class="block text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">Tavoliere 3D</label>
                     <button (click)="boardInput.click()" 
                             class="w-full py-2 flex items-center justify-center gap-2 text-[10px] bg-gradient-to-r from-blue-600/40 to-indigo-600/40 hover:from-blue-500/50 hover:to-indigo-500/50 border border-blue-400/30 rounded-lg text-white transition-all">
                        📦 Carica Scacchiera
                     </button>
                     <input #boardInput type="file" class="hidden" (change)="onFileSelected($event, 'board')" accept=".stl,.glb,.gltf">
                  </div>
                </div>
              </section>

              <!-- Reset Action -->
              <div class="pt-6 border-t border-white/5 flex justify-center">
                 <button (click)="gameService.setView('home')" 
                   class="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 active:scale-95 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all">
                    SALVA CONFIGURAZIONE
                 </button>
              </div>

            </div>
          </div>
        </div>
      }

      <!-- AI Game Mode Selector Modal -->
      @if (showAIGameModeSelector) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
             (click)="showAIGameModeSelector = false">
          <div class="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-yellow-500/30 rounded-3xl p-6 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(251,191,36,0.4)] backdrop-blur-xl"
               (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <button (click)="showAIGameModeSelector = false" 
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 hover:border-red-400/50 transition-all flex items-center justify-center group">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" class="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors">
                <line x1="25" y1="25" x2="75" y2="75"/>
                <line x1="75" y1="25" x2="25" y2="75"/>
              </svg>
            </button>

            <h2 class="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
              SFIDA CONTRO AI
            </h2>
            
            <div class="grid grid-cols-2 gap-4">
              <button (click)="selectAIGameMode('chess')"
                class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-blue-600/40 to-indigo-600/40 hover:from-blue-500/60 hover:to-indigo-500/60 border border-blue-500/30 hover:border-blue-400/60 transition-all hover:scale-105 active:scale-95 shadow-lg flex flex-col items-center justify-center gap-3">
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:rotate-12 transition-transform duration-300">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-blue-200 drop-shadow-[0_0_15px_rgba(191,219,254,0.6)]">
                    <path d="M50 10 L45 20 L40 15 L40 25 L35 25 L35 30 L30 30 L30 70 L25 70 L25 80 L75 80 L75 70 L70 70 L70 30 L65 30 L65 25 L60 25 L60 15 L55 20 L50 10 Z"/>
                  </svg>
                </div>
                <span class="text-blue-100 font-bold text-sm md:text-base uppercase tracking-wider">Scacchi</span>
              </button>

              <button (click)="selectAIGameMode('checkers')"
                class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 hover:from-purple-500/60 hover:to-pink-500/60 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:scale-105 active:scale-95 shadow-lg flex flex-col items-center justify-center gap-3">
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:rotate-12 transition-transform duration-300">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-purple-200 drop-shadow-[0_0_15px_rgba(233,213,255,0.6)]">
                    <circle cx="50" cy="50" r="35"/>
                    <circle cx="50" cy="50" r="25" class="text-pink-300"/>
                  </svg>
                </div>
                <span class="text-purple-100 font-bold text-sm md:text-base uppercase tracking-wider">Dama</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Local Game Mode Selector Modal -->
      @if (showLocalGameModeSelector) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
             (click)="showLocalGameModeSelector = false">
          <div class="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-10 max-w-md w-full shadow-[0_0_60px_rgba(99,102,241,0.4)] backdrop-blur-xl"
               (click)="$event.stopPropagation()">
            <!-- Close Button -->
            <button (click)="showLocalGameModeSelector = false" 
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-white/10 hover:border-red-400/50 transition-all flex items-center justify-center group">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" class="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors">
                <line x1="25" y1="25" x2="75" y2="75"/>
                <line x1="75" y1="25" x2="25" y2="75"/>
              </svg>
            </button>

            <h2 class="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Partita Locale
            </h2>
            
            <div class="grid grid-cols-2 gap-4">
              <button (click)="selectLocalGameMode('chess')"
                class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-blue-600/40 to-indigo-600/40 hover:from-blue-500/60 hover:to-indigo-500/60 border border-blue-500/30 hover:border-blue-400/60 transition-all hover:scale-105 active:scale-95 shadow-lg flex flex-col items-center justify-center gap-3">
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:rotate-12 transition-transform duration-300">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-blue-200 drop-shadow-[0_0_15px_rgba(191,219,254,0.6)]">
                    <path d="M50 10 L45 20 L40 15 L40 25 L35 25 L35 30 L30 30 L30 70 L25 70 L25 80 L75 80 L75 70 L70 70 L70 30 L65 30 L65 25 L60 25 L60 15 L55 20 L50 10 Z"/>
                  </svg>
                </div>
                <span class="text-blue-100 font-bold text-sm md:text-base uppercase tracking-wider">Scacchi</span>
              </button>

              <button (click)="selectLocalGameMode('checkers')"
                class="group relative overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 hover:from-purple-500/60 hover:to-pink-500/60 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:scale-105 active:scale-95 shadow-lg flex flex-col items-center justify-center gap-3">
                <div class="w-16 h-16 md:w-20 md:h-20 group-active:rotate-12 transition-transform duration-300">
                  <svg viewBox="0 0 100 100" fill="currentColor" class="text-purple-200 drop-shadow-[0_0_15px_rgba(233,213,255,0.6)]">
                    <circle cx="50" cy="50" r="35"/>
                    <circle cx="50" cy="50" r="25" class="text-pink-300"/>
                  </svg>
                </div>
                <span class="text-purple-100 font-bold text-sm md:text-base uppercase tracking-wider">Dama</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes shimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes shimmer-delayed {
      0%, 100% { background-position: 100% 50%; }
      50% { background-position: 0% 50%; }
    }
    
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes bounce-subtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    
    @keyframes float-orb {
      0%, 100% { 
        transform: translate(0, 0) scale(1);
        opacity: 0.4;
      }
      25% { 
        transform: translate(30px, -40px) scale(1.1);
        opacity: 0.6;
      }
      50% { 
        transform: translate(-20px, -80px) scale(0.9);
        opacity: 0.3;
      }
      75% { 
        transform: translate(-40px, -40px) scale(1.05);
        opacity: 0.5;
      }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-shimmer {
      background-size: 200% 200%;
      animation: shimmer 3s ease-in-out infinite;
    }
    
    .animate-shimmer-delayed {
      background-size: 200% 200%;
      animation: shimmer-delayed 3s ease-in-out infinite;
    }
    
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
    
    .animate-bounce-subtle {
      animation: bounce-subtle 2s ease-in-out infinite;
    }
    
    .orb {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, 
        rgba(99, 102, 241, 0.8) 0%,
        rgba(139, 92, 246, 0.6) 30%,
        rgba(59, 130, 246, 0.4) 60%,
        rgba(37, 99, 235, 0.2) 100%
      );
      box-shadow: 
        0 0 40px rgba(99, 102, 241, 0.4),
        0 0 80px rgba(139, 92, 246, 0.3),
        inset -10px -10px 30px rgba(0, 0, 0, 0.3),
        inset 10px 10px 30px rgba(255, 255, 255, 0.1);
      filter: blur(1px);
      animation: float-orb linear infinite;
      pointer-events: none;
    }
    
    .orb::before {
      content: '';
      position: absolute;
      top: 10%;
      left: 15%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, 
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      border-radius: 50%;
      filter: blur(8px);
    }
    
    .orb::after {
      content: '';
      position: absolute;
      bottom: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 30%;
      background: radial-gradient(ellipse, 
        rgba(0, 0, 0, 0.4) 0%,
        transparent 70%
      );
      border-radius: 50%;
      filter: blur(15px);
    }
    
    /* Depth layers */
    .depth-layer-1 {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 30% 20%, 
        rgba(99, 102, 241, 0.15) 0%,
        transparent 50%
      );
      animation: pulse-light 8s ease-in-out infinite;
    }
    
    .depth-layer-2 {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 70% 80%, 
        rgba(139, 92, 246, 0.1) 0%,
        transparent 50%
      );
      animation: pulse-light 10s ease-in-out infinite reverse;
    }
    
    @keyframes pulse-light {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }
    
    /* Volumetric light rays */
    .light-ray {
      position: absolute;
      width: 2px;
      height: 100%;
      background: linear-gradient(to bottom,
        transparent 0%,
        rgba(139, 92, 246, 0.3) 20%,
        rgba(99, 102, 241, 0.2) 50%,
        rgba(59, 130, 246, 0.1) 80%,
        transparent 100%
      );
      filter: blur(2px);
      animation: ray-move 15s linear infinite;
    }
    
    @keyframes ray-move {
      0% { transform: translateX(-100%) rotate(-5deg); opacity: 0; }
      10% { opacity: 0.5; }
      90% { opacity: 0.5; }
      100% { transform: translateX(100vw) rotate(5deg); opacity: 0; }
    }
  `]
})
export class HomeViewComponent {
  gameService = inject(GameService);

  @Input() showSetup = false;
  @Output() fileSelected = new EventEmitter<{ event: Event, type: string, colorSuffix?: string }>();

  showAIGameModeSelector = false;
  showLocalGameModeSelector = false;

  // Chess Pieces
  pieceTypes: { id: PieceType, label: string }[] = [
    { id: 'p', label: 'Pedone' },
    { id: 'r', label: 'Torre' },
    { id: 'n', label: 'Cavallo' },
    { id: 'b', label: 'Alfiere' },
    { id: 'q', label: 'Regina' },
    { id: 'k', label: 'Re' },
  ];

  // Checker Pieces
  checkerTypes: { id: PieceType, label: string }[] = [
    { id: 'cm', label: 'Pedina' },
    { id: 'ck', label: 'Dama' }
  ];

  orbs = Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 40 + Math.random() * 60,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * 10
  }));

  selectAIGameMode(mode: 'chess' | 'checkers') {
    this.showAIGameModeSelector = false;
    this.gameService.startGame(mode, 'ai');
  }

  selectLocalGameMode(mode: 'chess' | 'checkers') {
    this.showLocalGameModeSelector = false;
    this.gameService.startGame(mode, 'local');
  }

  onFileSelected(event: Event, type: string, colorSuffix?: string) {
    this.fileSelected.emit({ event, type, colorSuffix });
  }
}
