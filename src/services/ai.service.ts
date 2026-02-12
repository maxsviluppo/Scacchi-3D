
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI | null = null;
  // Utilizziamo 'gemini-2.5-flash' per velocità ed efficienza
  private model = 'gemini-2.5-flash';
  private quotaExceeded = false;

  constructor() {
    try {
      const apiKey = (globalThis as any).process?.env?.['API_KEY'];
      if (apiKey && apiKey !== '' && apiKey !== 'undefined') {
        this.ai = new GoogleGenAI({ apiKey });
        console.log('AiService: Gemini API inizializzata correttamente.');
      } else {
        console.warn('AiService: API_KEY mancante. L\'IA sarà disattivata (Fallback CPU).');
      }
    } catch (e) {
      console.error('AiService: Errore durante l\'inizializzazione di GoogleGenAI:', e);
    }
  }

  async getBestMove(fen: string, validMoves: string[], mode: 'chess' | 'checkers' = 'chess'): Promise<string | null> {
    // Safety check: if AI isn't initialized, return null immediately
    if (!this.ai) {
      console.warn('AiService: Chiamata saltata (Client non inizializzato/Manca API_KEY)');
      return null;
    }

    // Circuit Breaker: If we already hit the limit, don't try again.
    if (this.quotaExceeded) {
      console.warn('AI Circuit Breaker: Skipping API call (Quota Exceeded).');
      return null;
    }

    try {
      // Prompt Constraint-Based:
      // Forniamo la lista esatta delle mosse valide generate dall'engine locale.
      // L'IA deve SOLO scegliere la migliore da questa lista.
      const gameName = mode === 'chess' ? 'Chess' : 'Checkers (Dama)';
      const prompt = `
      Context: ${gameName} Game. You are an expert player playing BLACK.
      Current FEN: ${fen}
      
      ALLOWED MOVES LIST (in UCI format):
      [${validMoves.join(', ')}]
      
      Objective:
      1. Prioritize capturing opponent pieces if it gives you a tactical advantage.
      2. Protect your pieces from being captured.
      3. Aim for checkmate (Chess) or clearing the board (Checkers).
      4. Select the absolute best move for Black from the ALLOWED MOVES LIST above.
      
      Output Rules:
      1. Return ONLY the move string (e.g. "e7e5").
      2. No explanations, no extra text.
      `;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          temperature: 0.1, // Basso per essere deterministico e logico
        }
      });

      const text = response.text;
      if (!text) return null;

      const move = text.trim();

      // Verifica se la mossa restituita è effettivamente nella lista
      if (validMoves.includes(move)) {
        return move;
      }

      const cleanMove = move.replace(/[^a-z0-9]/g, '');
      if (validMoves.includes(cleanMove)) {
        return cleanMove;
      }

      console.warn('AI returned move not in valid list:', move);
      return null;
    } catch (e: any) {
      // Handle Quota Limits Gracefully
      const isQuota = e.status === 429 ||
        e.code === 429 ||
        (e.error && e.error.code === 429) ||
        (e.message && e.message.includes('429'));

      if (isQuota) {
        console.warn('Gemini API Quota Exceeded (429). Enabling Offline Fallback.');
        this.quotaExceeded = true;
        return null;
      }

      console.error('AI Error:', e);
      return null;
    }
  }
}
