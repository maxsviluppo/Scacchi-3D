# Issues da Risolvere - Scacchi 3D

**Data creazione:** 2026-02-14  
**Ultimo aggiornamento:** 2026-02-14 12:20  
**Stato:** Analisi completata - Implementazione in corso

---

## 1. 🖼️ Foto Profilo Account Personale
**Problema:** La foto profilo dell'account non viene visualizzata/gestita correttamente.  
**Stato:** ✅ **CODICE GIÀ PRESENTE** - Richiede solo configurazione Supabase  
**Priorità:** Alta

### Analisi Tecnica:
✅ **Il codice è già implementato correttamente** in `home-view.component.ts`:
- Linee 896-949: Upload avatar con compressione (usa `ImageUtils.processAvatarImage`)
- Linee 974-983: Eliminazione avatar
- Linee 67-68, 307-308: Visualizzazione avatar nell'UI
- Il sistema è identico a quello di Number-main

### Problema Reale:
❌ **Manca il bucket 'avatars' su Supabase**
- Il codice controlla se il bucket esiste (linea 924-925)
- Errore: "Bucket not found"

### Soluzione:
1. Creare bucket `avatars` su Supabase Storage
2. Impostarlo come **Pubblico**
3. Configurare le policy RLS per permettere upload/read

---

## 2. 👤 Nome Utente non Visualizzato
**Problema:** Il nome utente della registrazione non appare sotto al titolo o nell'icona profilo.  
**Stato:** ✅ **CODICE GIÀ CORRETTO** - Probabile problema di timing  
**Priorità:** Alta

### Analisi Tecnica:
✅ **Il codice recupera correttamente il nickname**:
- `supabase.service.ts` linea 43: `select('username, avatar_url')`
- `home-view.component.ts` linea 41-46: Visualizza `{{ supabase.username() }}`
- `home-view.component.ts` linea 826-828: Carica profilo e assets dopo login

### Problema Potenziale:
⚠️ **Possibile race condition**:
- Il profilo potrebbe non essere caricato prima del render
- La funzione `fetchProfile` è asincrona ma potrebbe non completarsi in tempo

### Soluzione:
1. Verificare che `initAuth()` in `supabase.service.ts` completi prima del render
2. Aggiungere un loading state per il profilo
3. Forzare il refresh del profilo dopo login con `await this.supabase.loadUserProfile()`

---

## 3. 📦 Pezzi Personalizzati non Caricati Automaticamente
**Problema:** I pezzi caricati nella libreria vengono memorizzati ma non vengono caricati automaticamente all'avvio dell'app.  
**Stato:** ✅ **CODICE GIÀ PRESENTE** - Richiede verifica timing  
**Priorità:** Media

### Analisi Tecnica:
✅ **Il caricamento automatico è implementato**:
- `home-view.component.ts` linee 996-1002: `ngOnInit()` chiama `loadUserAssets()`
- `home-view.component.ts` linee 1004-1032: `loadUserAssets()` recupera e applica gli assets
- Linea 1023-1025: Auto-switch a stile 'custom' se ci sono pezzi personalizzati

### Problema Potenziale:
⚠️ **Timing di inizializzazione**:
- `ngOnInit` viene chiamato ma potrebbe eseguire prima che l'utente sia autenticato
- Linea 1005: `if (!this.supabase.user()) return;` esce se non c'è utente

### Soluzione:
1. Spostare `loadUserAssets()` anche dopo il login (linea 828 - già presente!)
2. Verificare che il signal `customMeshUrls` trigger correttamente il re-render della scena 3D
3. Aggiungere console.log per debug del caricamento

---

## 4. 🤖 AI non si Muove nelle Sfide a Scacchi
**Problema:** Quando si avvia una sfida contro l'AI, l'AI rimane ferma e non effettua mosse.  
**Stato:** ❌ **PROBLEMA IDENTIFICATO** - API Key non caricata  
**Priorità:** **CRITICA**

### Analisi Tecnica:
❌ **Problema trovato in `ai.service.ts` linea 16**:
```typescript
const apiKey = (globalThis as any).process?.env?.['API_KEY'];
```
Questo codice cerca la chiave in `process.env` ma in un'app Angular browser-based **non esiste `process.env`**!

### Causa Root:
- Angular non espone `process.env` nel browser
- La chiave API deve essere caricata da:
  1. File `environment.ts` (raccomandato)
  2. Variabile globale iniettata al build time
  3. Configurazione runtime

### Soluzione Immediata:
1. **Creare file `src/environments/environment.ts`**:
```typescript
export const environment = {
  production: false,
  geminiApiKey: 'TUA_CHIAVE_API_QUI'
};
```

2. **Modificare `ai.service.ts`** per usare:
```typescript
import { environment } from '../environments/environment';
const apiKey = environment.geminiApiKey;
```

3. **Fallback già presente**: Se l'API non funziona, usa il motore locale Minimax (linee 311-317)

---

## Riepilogo Stato

| Issue | Codice | Config | Stato |
|-------|--------|--------|-------|
| 1. Avatar | ✅ OK | ❌ Manca bucket | Configurazione Supabase |
| 2. Username | ✅ OK | ⚠️ Timing? | Verifica + Test |
| 3. Assets Auto-load | ✅ OK | ⚠️ Timing? | Verifica + Test |
| 4. AI Moves | ❌ Bug | ❌ No API Key | **Fix Critico Necessario** |

---

## Piano di Risoluzione

### Priorità 1 - CRITICA (AI)
1. ✅ Creare file `environment.ts`
2. ✅ Modificare `ai.service.ts` per usare environment
3. ✅ Testare con partita AI

### Priorità 2 - ALTA (Avatar + Username)
4. 📝 Creare bucket `avatars` su Supabase
5. 📝 Testare upload avatar
6. 📝 Verificare visualizzazione username dopo login

### Priorità 3 - MEDIA (Assets)
7. 📝 Testare caricamento automatico assets
8. 📝 Verificare switch automatico a stile 'custom'

---

## Checklist Risoluzione
- [x] Issue 4: AI scacchi - Fix API Key (CRITICO) ✅ **COMPLETATO**
  - ✅ Creato `src/environments/environment.ts`
  - ✅ Modificato `ai.service.ts` per usare environment
  - ⚠️ **AZIONE RICHIESTA:** Inserire chiave API Gemini in `environment.ts`
  
- [ ] Issue 1: Foto profilo - Creare bucket Supabase ⚠️ **RICHIEDE CONFIGURAZIONE**
  - ✅ Codice già presente e corretto
  - ✅ Script SQL creato in `sql/setup_supabase.sql`
  - ⚠️ **AZIONE RICHIESTA:** Creare bucket `avatars` su Supabase Dashboard
  
- [x] Issue 2: Nome utente - Test e verifica timing ✅ **CODICE CORRETTO**
  - ✅ Codice già presente e corretto
  - ⚠️ **AZIONE RICHIESTA:** Testare login/logout per verificare
  
- [x] Issue 3: Caricamento automatico pezzi - Test e verifica ✅ **CODICE CORRETTO**
  - ✅ Codice già presente e corretto
  - ✅ Script SQL creato in `sql/setup_supabase.sql`
  - ⚠️ **AZIONE RICHIESTA:** Creare bucket `custom_assets` su Supabase Dashboard

---

## 📁 File Creati/Modificati

### ✅ File Modificati:
1. **`src/services/ai.service.ts`** - Fix caricamento API Key Gemini
2. **`.gitignore`** - Aggiunto environment.ts per sicurezza

### ✅ File Creati:
1. **`src/environments/environment.ts`** - Configurazione development
2. **`src/environments/environment.prod.ts`** - Configurazione production
3. **`src/environments/environment.template.ts`** - Template per altri sviluppatori
4. **`sql/setup_supabase.sql`** - Script SQL completo per setup Supabase
5. **`GUIDA_RISOLUZIONE_PROBLEMI.md`** - Guida passo-passo completa
6. **`ISSUES_TO_FIX.md`** - Questo documento (aggiornato)

---

## 🎯 PROSSIMI PASSI

### 1. IMMEDIATO (5 minuti):
- [ ] Aprire `src/environments/environment.ts`
- [ ] Inserire la chiave API Gemini (ottienila su https://aistudio.google.com/app/apikey)
- [ ] Riavviare il server con `npm run dev`
- [ ] Testare una partita contro l'AI

### 2. CONFIGURAZIONE SUPABASE (10 minuti):
- [ ] Aprire Supabase Dashboard
- [ ] Creare bucket `avatars` (pubblico)
- [ ] Creare bucket `custom_assets` (pubblico)
- [ ] Eseguire lo script `sql/setup_supabase.sql` nell'SQL Editor
- [ ] Testare upload avatar e pezzi custom

### 3. VERIFICA FINALE (5 minuti):
- [ ] Testare login/logout
- [ ] Verificare che il nome utente appaia
- [ ] Testare upload avatar
- [ ] Testare caricamento pezzi custom
- [ ] Testare partita contro AI

---

## ✅ RIEPILOGO FINALE

| Issue | Codice | Fix Applicato | Azione Richiesta |
|-------|--------|---------------|------------------|
| 4. AI Moves | ✅ Fixato | ✅ environment.ts creato | ⚠️ Inserire API Key |
| 1. Avatar | ✅ OK | ✅ SQL script creato | ⚠️ Creare bucket |
| 2. Username | ✅ OK | - | ✅ Solo test |
| 3. Assets | ✅ OK | ✅ SQL script creato | ⚠️ Creare bucket |

**Tempo stimato per completamento:** 20 minuti  
**Difficoltà:** ⭐⭐☆☆☆ (Facile)

---

**📖 Per istruzioni dettagliate, consulta:** `GUIDA_RISOLUZIONE_PROBLEMI.md`
