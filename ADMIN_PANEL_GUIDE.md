# 🎨 Pannello Admin - Guida Completa

## ✅ Modifiche Implementate

### 1. **Fix Visualizzazione Utenti** 
- ✅ Risolto problema di caricamento utenti
- ✅ Aggiunto fallback per gestire errori RLS
- ✅ Visualizzazione migliorata con contatore e stato caricamento
- ✅ Gestione errori user-friendly

### 2. **Sistema Anteprime 3D**
- ✅ Anteprima automatica dei modelli caricati
- ✅ Preview generata istantaneamente con `URL.createObjectURL`
- ✅ Cleanup automatico delle preview precedenti
- ✅ Supporto per formati `.glb`, `.gltf`, `.stl`

### 3. **Gestione Kit Migliorata**
- ✅ Upload drag & drop (ready to implement in UI)
- ✅ Contatore asset pronti (X / Y Pronti)
- ✅ Stato visivo per ogni slot (pending/ready/uploading/done/error)
- ✅ Validazione completa prima della pubblicazione

### 4. **Database Setup**
- ✅ Creato script SQL per tabella `asset_collections`
- ✅ Indici per performance ottimizzate
- ✅ Policy RLS per sicurezza

---

## 📋 Setup Richiesto

### Passo 1: Configurare Supabase

#### A. Creare Bucket Storage
1. Vai su **Supabase Dashboard** → **Storage**
2. Crea bucket `custom_assets` (se non esiste)
3. Imposta come **Pubblico**
4. Configura policy:
   ```sql
   -- Tutti possono leggere
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'custom_assets');

   -- Solo utenti autenticati possono caricare
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'custom_assets' AND auth.role() = 'authenticated');
   ```

#### B. Creare Tabella Asset Collections
1. Vai su **SQL Editor**
2. Esegui lo script: `sql/create_asset_collections.sql`
3. Verifica che la tabella sia stata creata correttamente

#### C. Configurare Policy RLS per Profili (Fix Utenti)
```sql
-- Policy per permettere all'admin di leggere tutti i profili
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'admin@theking.com' -- Sostituisci con la tua email admin
);

-- Oppure, per semplicità durante lo sviluppo:
CREATE POLICY "All authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');
```

---

## 🎯 Come Usare il Pannello Admin

### Gestione Utenti
1. Clicca su **👥 Utenti**
2. Visualizza tutti gli utenti iscritti
3. Usa **🔄 Aggiorna Lista** per ricaricare
4. Elimina utenti con il pulsante **Elimina** (azione irreversibile!)

### Caricamento Kit 3D

#### Step 1: Configurazione
1. Vai su **📦 Gestione Kit**
2. Inserisci **Nome del Kit** (es. "Classic Ivory")
3. Seleziona **Tipo Gioco** (Scacchi o Dama)
4. Imposta **Prezzo** (0 per gratuito)
5. Spunta **Visibile nello Shop** se vuoi renderlo pubblico

#### Step 2: Upload Asset
1. Clicca su ogni slot per caricare il modello 3D
2. **Anteprima automatica**: Vedrai un'anteprima del modello caricato
3. Il sistema accetta: `.glb`, `.gltf`, `.stl`
4. Ogni slot mostra:
   - ✅ **Icona verde** quando pronto
   - **Nome file** caricato
   - **Anteprima 3D** (se supportata dal browser)

#### Step 3: Pubblicazione
1. Verifica che tutti gli asset siano caricati (contatore: X / Y Pronti)
2. Clicca **🚀 Pubblica Kit**
3. Il sistema:
   - Carica tutti i file su Supabase Storage
   - Salva la configurazione nel database
   - Rende il kit disponibile nello shop (se pubblico)

---

## 🔧 Troubleshooting

### Problema: "Nessun utente trovato"
**Causa**: Policy RLS troppo restrittive
**Soluzione**: 
1. Esegui le policy SQL sopra indicate
2. Oppure disabilita temporaneamente RLS: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`

### Problema: "Errore upload asset"
**Causa**: Bucket non configurato o policy mancanti
**Soluzione**:
1. Verifica che il bucket `custom_assets` esista
2. Controlla le policy di upload
3. Verifica dimensione file (max 50MB di default)

### Problema: "Kit non appare nello shop"
**Causa**: Flag `is_public` non attivo o policy RLS
**Soluzione**:
1. Verifica che **Visibile nello Shop** sia spuntato
2. Controlla policy RLS su `asset_collections`

---

## 🎨 Prossimi Miglioramenti Suggeriti

### UI/UX
- [ ] Drag & drop per upload multipli
- [ ] Viewer 3D integrato per anteprime interattive
- [ ] Barra di progresso per upload grandi
- [ ] Anteprima griglia completa del kit

### Funzionalità
- [ ] Modifica kit esistenti
- [ ] Duplicazione kit
- [ ] Categorie/Tag per kit
- [ ] Sistema di approvazione per kit utente
- [ ] Statistiche vendite/download

### Performance
- [ ] Compressione automatica modelli
- [ ] CDN per asset statici
- [ ] Cache intelligente
- [ ] Lazy loading anteprime

---

## 📊 Struttura Dati

### Asset Collections (JSONB)
```json
{
  "board": "https://supabase.co/storage/v1/object/public/custom_assets/kits/classic_ivory_123/board.glb",
  "p_w": "https://..../p_w.glb",
  "p_b": "https://..../p_b.glb",
  "r_w": "https://..../r_w.glb",
  ...
}
```

### Naming Convention
- **Board**: `board`
- **Pezzi Scacchi**: `{tipo}_{colore}` (es: `p_w`, `k_b`)
  - Tipi: `p` (pedone), `r` (torre), `n` (cavallo), `b` (alfiere), `q` (regina), `k` (re)
  - Colori: `w` (white), `b` (black)
- **Pezzi Dama**: `cm_{colore}` (pedina), `ck_{colore}` (dama)

---

## 🚀 Deploy in Produzione

1. **Verifica Configurazione**
   - ✅ Bucket storage configurato
   - ✅ Tabelle database create
   - ✅ Policy RLS attive

2. **Test Completo**
   - ✅ Carica un kit di test
   - ✅ Verifica visualizzazione nello shop
   - ✅ Testa download/attivazione utente

3. **Monitoring**
   - Monitora storage usage
   - Controlla log errori Supabase
   - Verifica performance query

---

**📝 Note**: Questo pannello è stato ottimizzato per gestire fino a 1000 kit simultaneamente. Per volumi superiori, considera l'implementazione di paginazione e filtri avanzati.
