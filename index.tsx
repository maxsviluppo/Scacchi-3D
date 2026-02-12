
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { HomeViewComponent } from './src/components/home-view.component';
import { provideZonelessChangeDetection } from '@angular/core';

console.log('index.tsx: Inizio Bootstrap Application');

try {
  bootstrapApplication(AppComponent, {
    providers: [
      provideZonelessChangeDetection()
    ]
  }).then(() => {
    console.log('index.tsx: Bootstrap completato con successo');
  }).catch((err) => {
    console.error('index.tsx: Errore durante il bootstrap (Promise):', err);
  });
} catch (fatal) {
  console.error('index.tsx: ERRORE FATALE durante il bootstrap:', fatal);
}

// AI Studio always uses an `index.tsx` file for all project types.
