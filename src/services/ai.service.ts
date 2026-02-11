
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  // Using Gemini 2.5 Flash for speed
  private model = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async getBestMove(fen: string): Promise<string | null> {
    try {
      const prompt = `
        You are a chess engine playing the Black pieces.
        The current board position in FEN is: ${fen}.
        Analyze the position and provide the best move for Black.
        
        Strict Output Format:
        Return ONLY the move in UCI format (e.g., "e2e4", "g8f6", "a7a8q").
        Do NOT add any explanation, numbering, or other text.
      `;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          // Game AI Optimization: Disable thinking for low latency response
          thinkingConfig: { thinkingBudget: 0 },
          // Low temperature for more deterministic/precise play
          temperature: 0.1, 
        }
      });

      const text = response.text;
      if (!text) return null;

      const move = text.trim();
      // Basic validation of response format (4-5 chars)
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
