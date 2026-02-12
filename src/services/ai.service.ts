
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  // Utilizziamo 'gemini-2.5-flash': È il modello più veloce ed efficiente.
  private model = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async getBestMove(fen: string): Promise<string | null> {
    try {
      // Prompt ottimizzato e rafforzato per evitare che l'AI muova i pezzi bianchi
      const prompt = `
      Current FEN: ${fen}.
      You are playing as BLACK. 
      Your pieces are lowercase in FEN.
      Generate only the best move in UCI format (e.g. e7e5). 
      DO NOT move White pieces.
      `;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          temperature: 0.1, 
        }
      });

      const text = response.text;
      if (!text) return null;

      const move = text.trim();
      // Validazione base formato UCI
      if (move.length >= 4 && move.length <= 5) {
        return move;
      }
      return null;
    } catch (e) {
      console.error('AI Error:', e);
      return null;
    }
  }
}
