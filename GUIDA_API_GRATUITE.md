# 🆓 Guida API Gratuite per Scacchi 3D

Questa guida ti aiuta a configurare l'AI **completamente GRATIS** usando Gemini Flash o DeepSeek.

---

## 🚀 OPZIONE 1: GEMINI FLASH (CONSIGLIATO)

### ✅ Vantaggi:
- **1500 richieste/giorno GRATIS** (circa 100 partite)
- Veloce e affidabile
- Nessuna carta di credito richiesta
- Modello: `gemini-2.0-flash-exp` (il più veloce)

### 📝 Come Ottenere la Chiave (2 minuti):

1. **Vai sul sito:**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Accedi con Google:**
   - Usa il tuo account Gmail
   - Accetta i termini di servizio

3. **Crea la chiave:**
   - Clicca su **"Create API Key"**
   - Seleziona un progetto esistente o creane uno nuovo
   - Clicca su **"Create API key in existing project"**
   - Copia la chiave (inizia con `AIza...`)

4. **Configura l'app:**
   - Apri: `src/environments/environment.ts`
   - Trova la riga: `geminiApiKey: '',`
   - Incolla la tua chiave tra gli apici: `geminiApiKey: 'AIza...',`
   - Assicurati che: `aiProvider: 'gemini'`
   - Salva il file

5. **Riavvia il server:**
   ```bash
   # Ferma il server (Ctrl+C nella console)
   # Riavvia
   npm run dev
   ```

6. **Verifica:**
   - Apri la console del browser (F12)
   - Dovresti vedere: `✅ AiService: Gemini Flash inizializzato (GRATUITO - 1500 req/giorno)`
   - Avvia una partita contro l'AI
   - L'AI dovrebbe muovere in 1-2 secondi

---

## 🚀 OPZIONE 2: DEEPSEEK (ALTERNATIVA GRATUITA)

### ✅ Vantaggi:
- **Completamente gratuito** (nessun limite giornaliero)
- Buone performance
- Nessuna carta di credito richiesta

### 📝 Come Ottenere la Chiave (3 minuti):

1. **Vai sul sito:**
   ```
   https://platform.deepseek.com/
   ```

2. **Registrati:**
   - Clicca su **"Sign Up"**
   - Usa email o account Google
   - Verifica la tua email

3. **Crea la chiave:**
   - Vai su **"API Keys"** nel menu
   - Clicca su **"Create API Key"**
   - Dai un nome (es: "Scacchi 3D")
   - Copia la chiave (inizia con `sk-...`)

4. **Configura l'app:**
   - Apri: `src/environments/environment.ts`
   - Trova la riga: `deepseekApiKey: '',`
   - Incolla la tua chiave: `deepseekApiKey: 'sk-...',`
   - Cambia il provider: `aiProvider: 'deepseek'`
   - Salva il file

5. **Riavvia il server:**
   ```bash
   npm run dev
   ```

6. **Verifica:**
   - Console del browser: `✅ AiService: DeepSeek inizializzato (GRATUITO)`
   - Testa una partita contro l'AI

---

## 🖥️ OPZIONE 3: MOTORE LOCALE (NESSUNA CONFIGURAZIONE)

### ✅ Vantaggi:
- **Nessuna configurazione richiesta**
- Funziona offline
- Nessun limite di utilizzo

### ⚠️ Svantaggi:
- Più lento (3-5 secondi per mossa)
- Usa la CPU del tuo computer
- Meno intelligente ai livelli alti

### 📝 Come Usarlo:

**È già attivo!** Se non configuri né Gemini né DeepSeek, l'app usa automaticamente il motore locale.

Vedrai nella console:
```
⚠️ AiService: Nessuna API configurata. Uso motore locale (CPU).
```

---

## 📊 CONFRONTO

| Feature | Gemini Flash | DeepSeek | Motore Locale |
|---------|-------------|----------|---------------|
| **Velocità** | ⚡⚡⚡ 1-2 sec | ⚡⚡ 2-3 sec | ⚡ 3-5 sec |
| **Intelligenza** | 🧠🧠🧠 Ottima | 🧠🧠 Buona | 🧠 Base |
| **Limite giornaliero** | 1500 richieste | ∞ Illimitato | ∞ Illimitato |
| **Configurazione** | 2 minuti | 3 minuti | 0 minuti |
| **Costo** | 🆓 Gratis | 🆓 Gratis | 🆓 Gratis |
| **Offline** | ❌ No | ❌ No | ✅ Sì |

**Raccomandazione:** Usa **Gemini Flash** per la migliore esperienza!

---

## 🔧 RISOLUZIONE PROBLEMI

### ❌ "Quota API esaurita"
**Soluzione:** Hai superato le 1500 richieste/giorno di Gemini.
- L'app passa automaticamente al motore locale
- Aspetta 24 ore per il reset
- Oppure usa DeepSeek (illimitato)

### ❌ "API Key non valida"
**Soluzione:**
1. Verifica che la chiave sia copiata correttamente (nessuno spazio extra)
2. Controlla che la chiave sia attiva sul dashboard
3. Per Gemini: verifica su https://aistudio.google.com/app/apikey
4. Per DeepSeek: verifica su https://platform.deepseek.com/api_keys

### ❌ "L'AI non si muove"
**Soluzione:**
1. Apri la console del browser (F12)
2. Cerca errori in rosso
3. Verifica che il provider sia configurato correttamente in `environment.ts`
4. Riavvia il server con `npm run dev`

### ❌ "Errore CORS" (solo DeepSeek)
**Soluzione:** DeepSeek potrebbe avere restrizioni CORS. In questo caso:
- Usa Gemini Flash invece
- Oppure usa il motore locale

---

## 📝 ESEMPIO CONFIGURAZIONE

### File: `src/environments/environment.ts`

**Con Gemini Flash:**
```typescript
export const environment = {
  production: false,
  aiProvider: 'gemini',
  geminiApiKey: 'AIzaSyABC123...', // ⬅️ La tua chiave qui
  deepseekApiKey: '',
};
```

**Con DeepSeek:**
```typescript
export const environment = {
  production: false,
  aiProvider: 'deepseek',
  geminiApiKey: '',
  deepseekApiKey: 'sk-abc123...', // ⬅️ La tua chiave qui
};
```

**Motore Locale (nessuna configurazione):**
```typescript
export const environment = {
  production: false,
  aiProvider: 'local',
  geminiApiKey: '',
  deepseekApiKey: '',
};
```

---

## 🎯 CHECKLIST VELOCE

### Per Gemini Flash:
- [ ] Vai su https://aistudio.google.com/app/apikey
- [ ] Crea API Key
- [ ] Copia la chiave
- [ ] Incolla in `environment.ts` → `geminiApiKey`
- [ ] Imposta `aiProvider: 'gemini'`
- [ ] Riavvia: `npm run dev`
- [ ] Testa una partita AI

### Per DeepSeek:
- [ ] Vai su https://platform.deepseek.com/
- [ ] Registrati e verifica email
- [ ] Crea API Key
- [ ] Copia la chiave
- [ ] Incolla in `environment.ts` → `deepseekApiKey`
- [ ] Imposta `aiProvider: 'deepseek'`
- [ ] Riavvia: `npm run dev`
- [ ] Testa una partita AI

---

## 💡 SUGGERIMENTI

1. **Usa Gemini per partite importanti** (più intelligente)
2. **Usa DeepSeek se superi il limite di Gemini** (illimitato)
3. **Usa Motore Locale per test offline** (nessuna connessione richiesta)
4. **L'app passa automaticamente al motore locale** se l'API fallisce

---

## 🆘 SUPPORTO

Se hai problemi:
1. Controlla la console del browser (F12)
2. Verifica che la chiave API sia corretta
3. Riavvia il server
4. Prova con l'altro provider
5. In caso di dubbi, usa il motore locale (sempre funzionante)

---

**Ultima modifica:** 2026-02-14  
**Versione:** 2.0 - Supporto API Gratuite
