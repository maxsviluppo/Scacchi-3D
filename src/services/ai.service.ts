
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private geminiAI: GoogleGenAI | null = null;
  private aiProvider: 'gemini' | 'deepseek' | 'local' = 'local';
  private model = 'gemini-2.0-flash-exp'; // Modello gratuito più veloce
  private quotaExceeded = false;

  constructor() {
    this.initializeAI();
  }

  private initializeAI() {
    try {
      // Determina quale provider usare
      const provider = environment.aiProvider || 'local';

      if (provider === 'gemini' && environment.geminiApiKey && environment.geminiApiKey.trim() !== '') {
        // Inizializza Gemini
        this.geminiAI = new GoogleGenAI({ apiKey: environment.geminiApiKey });
        this.aiProvider = 'gemini';
        console.log('✅ AiService: Gemini Flash inizializzato (GRATUITO - 1500 req/giorno)');
      } else if (provider === 'deepseek' && environment.deepseekApiKey && environment.deepseekApiKey.trim() !== '') {
        // DeepSeek configurato
        this.aiProvider = 'deepseek';
        console.log('✅ AiService: DeepSeek inizializzato (GRATUITO)');
      } else {
        // Fallback al motore locale
        this.aiProvider = 'local';
        console.warn('⚠️ AiService: Nessuna API configurata. Uso motore locale (CPU).');
        console.info('💡 Per velocizzare l\'AI:');
        console.info('   - GEMINI (consigliato): https://aistudio.google.com/app/apikey');
        console.info('   - DEEPSEEK: https://platform.deepseek.com/api_keys');
      }
    } catch (e) {
      console.error('❌ AiService: Errore inizializzazione:', e);
      this.aiProvider = 'local';
    }
  }

  async getBestMove(fen: string, validMoves: string[], mode: 'chess' | 'checkers' = 'chess', level: number = 1): Promise<string | null> {
    // Se quota esaurita, usa motore locale
    if (this.quotaExceeded) {
      console.warn('⚠️ Quota API esaurita. Uso motore locale.');
      return null;
    }

    // Prova con il provider configurato
    if (this.aiProvider === 'gemini' && this.geminiAI) {
      return await this.getGeminiMove(fen, validMoves, mode, level);
    } else if (this.aiProvider === 'deepseek') {
      return await this.getDeepSeekMove(fen, validMoves, mode, level);
    }

    // Fallback: motore locale (gestito dal chiamante)
    return null;
  }

  private async getGeminiMove(fen: string, validMoves: string[], mode: 'chess' | 'checkers', level: number): Promise<string | null> {
    if (!this.geminiAI) return null;

    try {
      const prompt = this.buildPrompt(fen, validMoves, mode, level);

      const response = await this.geminiAI.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: level < 40 ? 0.7 : 0.1,
          maxOutputTokens: 50, // Risposta breve = più veloce
        }
      });

      const text = response.text;
      if (!text) return null;

      return this.parseMove(text, validMoves);
    } catch (e: any) {
      if (e.status === 429) {
        this.quotaExceeded = true;
        console.warn('⚠️ Quota Gemini esaurita (1500/giorno). Passo al motore locale.');
      } else {
        console.error('❌ Errore Gemini:', e.message);
      }
      return null;
    }
  }

  private async getDeepSeekMove(fen: string, validMoves: string[], mode: 'chess' | 'checkers', level: number): Promise<string | null> {
    try {
      const prompt = this.buildPrompt(fen, validMoves, mode, level);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${environment.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'Sei un esperto di scacchi. Rispondi SOLO con la mossa in formato UCI (es: e2e4).' },
            { role: 'user', content: prompt }
          ],
          temperature: level < 40 ? 0.7 : 0.1,
          max_tokens: 20
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) return null;
      return this.parseMove(text, validMoves);
    } catch (e: any) {
      console.error('❌ Errore DeepSeek:', e.message);
      return null;
    }
  }

  private buildPrompt(fen: string, validMoves: string[], mode: 'chess' | 'checkers', level: number): string {
    let elo = 800 + (level * 15);
    let behavior = '';

    if (level <= 30) {
      behavior = 'Principiante (800-1200 ELO). A volte ignori minacce immediate.';
    } else if (level <= 70) {
      behavior = 'Intermedio (1400-1700 ELO). Giochi in modo solido.';
    } else {
      behavior = 'Grandmaster (2000+ ELO). Precisione assoluta, tattiche brutali.';
    }

    if (mode === 'chess') {
      return `RUOLO: Gran Maestro FIDE. Giochi con il NERO.
      
STATO:
FEN: ${fen}
MOSSE LEGALI: [${validMoves.join(', ')}]
LIVELLO: ${level}/100 (${elo} ELO)
COMPORTAMENTO: ${behavior}

ISTRUZIONI:
1. Analizza le mosse legali
2. Scegli la migliore per il NERO
3. Rispondi SOLO con la mossa (es: "e7e5")
4. NO spiegazioni, NO testo extra

MOSSA:`;
    } else {
      return `RUOLO: Esperto Dama Italiana. Giochi con il NERO.

STATO:
FEN: ${fen}
MOSSE LEGALI: [${validMoves.join(', ')}]
LIVELLO: ${level}/100

REGOLE CRITICHE:
- Presa obbligatoria se disponibile
- Pedine muovono solo avanti
- Dame muovono in tutte le direzioni

ISTRUZIONI:
1. Analizza le mosse legali
2. RISPETTA la presa obbligatoria
3. Rispondi SOLO con la mossa (es: "c3d4")

MOSSA:`;
    }
  }

  private parseMove(text: string, validMoves: string[]): string | null {
    const move = text.trim().toLowerCase();

    // Validazione diretta
    if (validMoves.includes(move)) return move;

    // Pulizia caratteri speciali
    const cleanMove = move.replace(/[^a-z0-9]/g, '');
    if (validMoves.includes(cleanMove)) return cleanMove;

    // Cerca pattern UCI nel testo (es: "e2e4")
    const uciPattern = /[a-h][1-8][a-h][1-8]/g;
    const matches = text.match(uciPattern);
    if (matches) {
      for (const match of matches) {
        if (validMoves.includes(match)) return match;
      }
    }

    console.warn('⚠️ AI ha restituito una mossa non valida:', text);
    return null;
  }
}
