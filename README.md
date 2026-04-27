# 🎮 Scacchi 3D - The King

Applicazione di scacchi e dama 3D con AI Gemini integrata.

## 🚀 Quick Start

### 1. Installazione Dipendenze
```bash
npm install
```

### 2. Configurazione AI (GRATUITA!) ⚡

L'app supporta **3 opzioni GRATUITE** per l'intelligenza artificiale:

#### 🥇 OPZIONE 1: Gemini Flash (CONSIGLIATO)
- ✅ **1500 richieste/giorno GRATIS**
- ✅ Veloce (1-2 secondi per mossa)
- ✅ Molto intelligente

**Setup rapido (2 minuti):**
1. Vai su: https://aistudio.google.com/app/apikey
2. Clicca "Create API Key"
3. Copia la chiave
4. Apri `src/environments/environment.ts`
5. Incolla la chiave in `geminiApiKey: 'QUI'`
6. Assicurati che `aiProvider: 'gemini'`

#### 🥈 OPZIONE 2: DeepSeek (ALTERNATIVA)
- ✅ **Completamente gratuito** (nessun limite)
- ✅ Buone performance

**Setup rapido (3 minuti):**
1. Vai su: https://platform.deepseek.com/
2. Registrati e crea API Key
3. Apri `src/environments/environment.ts`
4. Incolla la chiave in `deepseekApiKey: 'QUI'`
5. Cambia `aiProvider: 'deepseek'`

#### 🥉 OPZIONE 3: Motore Locale (NESSUNA CONFIGURAZIONE)
- ✅ **Sempre disponibile**
- ✅ Funziona offline
- ⚠️ Più lento (3-5 secondi)

**Nessuna configurazione richiesta!** Se non configuri le API, l'app usa automaticamente il motore locale.

📖 **Guida dettagliata:** Vedi `GUIDA_API_GRATUITE.md`

3. **Avvia l'app:**
```bash
npm run dev
```

### 3. Configurazione Supabase (Opzionale)

Per abilitare avatar, salvataggio pezzi custom e modalità carriera:

1. Apri Supabase Dashboard: https://supabase.com/dashboard
2. Seleziona il progetto: `xxvlfbozkveeydritfeo`
3. Vai su **SQL Editor**
4. Copia e incolla il contenuto di `sql/setup_supabase.sql`
5. Esegui lo script

**Oppure** segui la guida dettagliata in `GUIDA_RISOLUZIONE_PROBLEMI.md`

## 📋 Funzionalità

- ♟️ **Scacchi 3D** - Gioco completo con tutte le regole
- ⚫ **Dama Italiana** - Regole autentiche della dama italiana
- 🤖 **AI Gemini** - Intelligenza artificiale avanzata con 100 livelli di difficoltà
- 🎨 **Personalizzazione** - Carica i tuoi modelli 3D per pezzi e scacchiera
- 🏆 **Modalità Carriera** - 100 livelli progressivi con salvataggio cloud
- 👥 **Multiplayer Locale** - Gioca contro un amico sullo stesso dispositivo
- 💾 **Salvataggio Cloud** - Profilo utente, statistiche e progressi salvati su Supabase

## 🛠️ Problemi Noti e Soluzioni

Se riscontri problemi, consulta:
- **`ISSUES_TO_FIX.md`** - Analisi tecnica dettagliata dei problemi
- **`GUIDA_RISOLUZIONE_PROBLEMI.md`** - Guida passo-passo per risolvere ogni problema

### Problemi Comuni:

#### ❌ L'AI non si muove
**Soluzione:** Configura la chiave API Gemini in `src/environments/environment.ts`

#### ❌ Non posso caricare l'avatar
**Soluzione:** Crea il bucket `avatars` su Supabase (vedi `sql/setup_supabase.sql`)

#### ❌ I pezzi custom non vengono caricati
**Soluzione:** Crea il bucket `custom_assets` su Supabase (vedi `sql/setup_supabase.sql`)

## 📁 Struttura Progetto

```
Scacchi-3D-main/
├── src/
│   ├── components/          # Componenti Angular
│   │   ├── home-view.component.ts
│   │   ├── chess-scene.component.ts
│   │   └── career-view.component.ts
│   ├── services/            # Servizi
│   │   ├── game.service.ts
│   │   ├── ai.service.ts
│   │   └── supabase.service.ts
│   ├── logic/               # Logica di gioco
│   │   ├── chess-utils.ts
│   │   └── chess-types.ts
│   ├── environments/        # Configurazione
│   │   ├── environment.ts   # ⚠️ CONFIGURA QUI LA TUA API KEY
│   │   └── environment.template.ts
│   └── utils/               # Utility
├── sql/
│   └── setup_supabase.sql   # Script SQL per Supabase
├── ISSUES_TO_FIX.md         # Analisi problemi
├── GUIDA_RISOLUZIONE_PROBLEMI.md  # Guida risoluzione
└── README.md                # Questo file
```

## 🔐 Sicurezza

⚠️ **IMPORTANTE:** Non committare mai il file `environment.ts` con la tua chiave API!

Il file è già aggiunto al `.gitignore` per sicurezza.

## 🎯 Comandi Disponibili

```bash
# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build di produzione
npm run preview
```

## 📖 Documentazione

- **Guida Risoluzione Problemi:** `GUIDA_RISOLUZIONE_PROBLEMI.md`
- **Analisi Tecnica Problemi:** `ISSUES_TO_FIX.md`
- **Setup Supabase:** `sql/setup_supabase.sql`

## 🆘 Supporto

Se hai bisogno di aiuto:

1. Controlla la console del browser (F12) per errori
2. Consulta `GUIDA_RISOLUZIONE_PROBLEMI.md`
3. Verifica che tutti i bucket Supabase siano creati
4. Assicurati che la chiave API Gemini sia configurata

## 📝 Note Tecniche

- **Framework:** Angular 21
- **Rendering 3D:** Three.js
- **AI:** Google Gemini 2.5 Flash
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth

## 🎮 Come Giocare

1. **Avvia l'app** con `npm run dev`
2. **Registrati** o effettua il login
3. **Scegli una modalità:**
   - Sfida Locale (vs amico)
   - Sfida AI (vs Gemini)
   - Carriera (100 livelli)
4. **Personalizza** i tuoi pezzi nella sezione Setup
5. **Gioca e divertiti!** 🎉

---

**Versione:** 1.0  
**Ultima modifica:** 2026-02-14
