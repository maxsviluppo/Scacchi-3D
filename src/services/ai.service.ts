
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  // Utilizziamo 'gemini-2.5-flash': È il modello più veloce ed efficiente.
  // Ideale per le quote gratuite e per avere risposte rapide nel gioco.
  private model = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async getBestMove(fen: string): Promise<string | null> {
    try {
      // Prompt ottimizzato per consumare meno token (migliore per il tier gratuito)
      const prompt = `FEN: ${fen}. Play as Black. Best move in UCI format only (e.g. e2e4). No explanations.`;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // Disabilita il "pensiero" esteso per ridurre la latenza e i costi
          thinkingConfig: { thinkingBudget: 0 },
          // Temperatura bassa per uno stile di gioco preciso e deterministico
          temperature: 0.1, 
        }
      });

      const text = response.text;
      if (!text) return null;

      const move = text.trim();
      // Validazione base formato UCI (4-5 caratteri)
      if (move.length >= 4 && move.length <= 5) {
        return move;
      }
      console.warn('AI returned invalid move format:', move);
      return null;
    } catch (e) {
      console.error('AI Error:', e);
      return null;
    }
  }
}
