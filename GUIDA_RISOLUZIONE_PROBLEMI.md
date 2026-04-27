# 🔧 Guida Risoluzione Problemi - Scacchi 3D

Questa guida ti aiuterà a risolvere i 4 problemi principali dell'applicazione.

---

## 🚨 PROBLEMA 1: AI NON SI MUOVE (CRITICO)

### ✅ SOLUZIONE IMMEDIATA

**Causa:** La chiave API Gemini non viene caricata correttamente.

**Fix applicato:**
- ✅ Creato file `src/environments/environment.ts`
- ✅ Modificato `ai.service.ts` per usare il file environment

**AZIONE RICHIESTA:**

1. **Ottieni una chiave API Gemini:**
   - Vai su: https://aistudio.google.com/app/apikey
   - Clicca su "Create API Key"
   - Copia la chiave generata

2. **Configura la chiave nell'app:**
   - Apri il file: `src/environments/environment.ts`
   - Sostituisci `'AIzaSyDCQXCwwlgvxdQIeRXlJgXXXXXXXXXXXXX'` con la tua chiave API
   - Salva il file

3. **Riavvia il server:**
   ```bash
   # Ferma il server (Ctrl+C)
   # Riavvia
   npm run dev
   ```

4. **Verifica:**
   - Apri la console del browser (F12)
   - Dovresti vedere: `✅ AiService: Gemini API inizializzata correttamente.`
   - Avvia una partita contro l'AI
   - L'AI dovrebbe muovere dopo il tuo turno

**Nota:** Se non configuri la chiave API, l'app userà automaticamente il motore locale (Minimax) che è più lento ma funziona offline.

---

## 🖼️ PROBLEMA 2: FOTO PROFILO NON FUNZIONA

### ✅ SOLUZIONE

**Causa:** Manca il bucket `avatars` su Supabase Storage.

**AZIONE RICHIESTA:**

### Opzione A: Interfaccia Web Supabase (Consigliata)

1. **Vai su Supabase Dashboard:**
   - Apri: https://supabase.com/dashboard
   - Seleziona il tuo progetto: `xxvlfbozkveeydritfeo`

2. **Crea il bucket avatars:**
   - Nel menu laterale, clicca su **Storage**
   - Clicca su **"New bucket"**
   - Nome: `avatars`
   - Pubblico: **✅ SÌ** (spunta la checkbox)
   - Clicca su **"Create bucket"**

3. **Configura le policy:**
   - Clicca sul bucket `avatars` appena creato
   - Vai su **"Policies"**
   - Clicca su **"New policy"**
   - Seleziona **"For full customization"**
   - Copia e incolla le policy dal file `sql/setup_supabase.sql` (sezione 1)

### Opzione B: SQL Editor

1. Apri **SQL Editor** su Supabase Dashboard
2. Copia tutto il contenuto della **Sezione 1** del file `sql/setup_supabase.sql`
3. Esegui lo script

### Verifica:

- Vai su Storage > avatars
- Dovresti vedere il bucket vuoto
- Prova a caricare un'immagine profilo dall'app
- L'avatar dovrebbe apparire nell'icona profilo

---

## 👤 PROBLEMA 3: NOME UTENTE NON VISUALIZZATO

### ✅ ANALISI

**Buone notizie:** Il codice è già corretto! Il problema è probabilmente un timing di caricamento.

**AZIONE RICHIESTA:**

1. **Verifica il database:**
   - Apri Supabase Dashboard > Table Editor > profiles
   - Controlla che la colonna `username` esista e contenga i dati

2. **Test:**
   - Effettua logout
   - Effettua login di nuovo
   - Il nome utente dovrebbe apparire sotto "THE KING"

3. **Se il problema persiste:**
   - Apri la console del browser (F12)
   - Cerca eventuali errori relativi a `fetchProfile` o `username`
   - Condividi gli errori per ulteriore debug

**Nota:** Il nome utente viene caricato automaticamente dopo il login (vedi `home-view.component.ts` linea 826).

---

## 📦 PROBLEMA 4: PEZZI CUSTOM NON CARICATI ALL'AVVIO

### ✅ SOLUZIONE

**Causa:** Il bucket `custom_assets` potrebbe non esistere o i pezzi non vengono caricati correttamente.

**AZIONE RICHIESTA:**

1. **Crea il bucket custom_assets:**
   - Vai su Supabase Dashboard > Storage
   - Clicca su **"New bucket"**
   - Nome: `custom_assets`
   - Pubblico: **✅ SÌ**
   - File size limit: **10MB**
   - Allowed MIME types: `model/*, application/octet-stream`
   - Clicca su **"Create bucket"**

2. **Configura le policy:**
   - Usa le policy della **Sezione 2** del file `sql/setup_supabase.sql`

3. **Test:**
   - Carica un pezzo personalizzato dalla sezione Setup
   - Chiudi e riapri l'app
   - Il pezzo dovrebbe essere caricato automaticamente

4. **Debug:**
   - Apri la console del browser (F12)
   - Cerca il messaggio: `✅ Custom Assets Loaded:`
   - Verifica che gli URL dei pezzi siano corretti

---

## 🗄️ SETUP COMPLETO SUPABASE

Per configurare tutto in una volta:

1. **Apri SQL Editor** su Supabase Dashboard
2. **Copia tutto** il contenuto del file `sql/setup_supabase.sql`
3. **Esegui** lo script
4. **Verifica** che tutti i bucket e tabelle siano stati creati

---

## 📋 CHECKLIST FINALE

Dopo aver completato tutti i passaggi, verifica:

- [ ] ✅ Chiave API Gemini configurata in `environment.ts`
- [ ] ✅ L'AI si muove nelle partite
- [ ] ✅ Bucket `avatars` creato e pubblico
- [ ] ✅ Upload foto profilo funziona
- [ ] ✅ Avatar visualizzato nell'icona profilo
- [ ] ✅ Nome utente visualizzato sotto "THE KING"
- [ ] ✅ Bucket `custom_assets` creato e pubblico
- [ ] ✅ Pezzi custom caricati automaticamente all'avvio

---

## 🆘 SUPPORTO

Se riscontri ancora problemi:

1. **Controlla la console del browser** (F12) per errori
2. **Controlla i log di Supabase** (Dashboard > Logs)
3. **Verifica le credenziali** in `supabase.service.ts` (linee 17-18)

---

## 📝 NOTE TECNICHE

### File Modificati:
- ✅ `src/services/ai.service.ts` - Fix caricamento API Key
- ✅ `src/environments/environment.ts` - Nuovo file per configurazione
- ✅ `sql/setup_supabase.sql` - Script SQL completo

### File da Verificare:
- `src/services/supabase.service.ts` - Configurazione Supabase
- `src/components/home-view.component.ts` - Logica UI e caricamento assets

### Codice Già Corretto (Non Modificare):
- Sistema upload avatar (linee 896-949 di home-view.component.ts)
- Sistema caricamento username (supabase.service.ts)
- Sistema caricamento assets (linee 1004-1032 di home-view.component.ts)

---

**Ultima modifica:** 2026-02-14  
**Versione:** 1.0
