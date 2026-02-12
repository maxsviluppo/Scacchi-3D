
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  // Utilizziamo 'gemini-2.5-flash' per velocità ed efficienza
  private model = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async getBestMove(fen: string, validMoves: string[]): Promise<string | null> {
    try {
      // Prompt Constraint-Based:
      // Forniamo la lista esatta delle mosse valide generate dall'engine locale.
      // L'IA deve SOLO scegliere la migliore da questa lista.
      // Questo risolve al 100% problemi di mosse illegali, allucinazioni di colore, o formati errati.
      
      const prompt = `
      Context: Chess Game. You are playing BLACK.
      Current FEN: ${fen}
      
      ALLOWED MOVES LIST:
      [${validMoves.join(', ')}]
      
      Task: Select the absolute best move for Black from the ALLOWED MOVES LIST above.
      
      Output Rules:
      1. Return ONLY the move string (e.g. "e7e5").
      2. Do NOT output any explanation.
      3. You MUST pick one from the list.
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
      
      // Verifica se la mossa restituita è effettivamente nella lista (sicurezza extra)
      if (validMoves.includes(move)) {
        return move;
      }
      
      // Tentativo di pulizia (magari ha aggiunto punteggiatura)
      const cleanMove = move.replace(/[^a-z0-9]/g, '');
      if (validMoves.includes(cleanMove)) {
          return cleanMove;
      }

      console.warn('AI returned move not in valid list:', move);
      return null;
    } catch (e) {
      console.error('AI Error:', e);
      return null;
    }
  }
}
