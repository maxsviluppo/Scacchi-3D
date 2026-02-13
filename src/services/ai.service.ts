
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

  async getBestMove(fen: string, validMoves: string[], mode: 'chess' | 'checkers' = 'chess', level: number = 1): Promise<string | null> {
    if (!this.ai) {
      console.warn('AiService: AI non inizializzata.');
      return null;
    }

    if (this.quotaExceeded) return null;

    try {
      // Configuration based on User's Training Prompt
      let elo = 800 + (level * 15);
      let depth = Math.floor(1 + (level / 10));
      let errorRate = level < 30 ? 20 - (level / 2) : 0;

      let behavior = '';
      if (level <= 30) {
        behavior = 'Principiante (800-1200 ELO). A volte ignori minacce immediate. Profondità di calcolo limitata.';
      } else if (level <= 70) {
        behavior = 'Intermedio (1400-1700 ELO). Giochi in modo solido, usi algoritmi di potatura per scartare rami inefficienti.';
      } else {
        behavior = 'Grandmaster (2000+ ELO). Precisione assoluta, tattiche brutali, efficienza massima.';
      }

      const prompt = mode === 'chess' ? `
      RUOLO: Agisci come un esperto Gran Maestro e arbitro internazionale FIDE.
      MODALITÀ: SCACCHI. Giochi con il NERO.
      
      STATO ATTUALE:
      FEN: ${fen}
      MOSSE LEGALI DISPONIBILI (UCI): [${validMoves.join(', ')}]
      LIVELLO DIFFICOLTÀ: ${level}/100 (Circa ${elo} ELO).
      COMPORTAMENTO ATTESO: ${behavior}
      
      REGOLE E LOGICA:
      - Obiettivo: Scacco Matto (Re sotto attacco e nessuna mossa legale).
      - Obblighi: Vietato lo scacco autoinflitto. Se sei in scacco, DEVI uscirne.
      - Mosse Speciali: Gestisci Arrocco, En Passant e Promozione se disponibili nella lista delle mosse legali.
      
      FUNZIONE DI VALUTAZIONE (Euristiche):
      Usa questo punteggio per valutare le mosse:
      - Pedone: 1 punto (+0.5 se passato).
      - Cavallo: 3 punti (Evita i bordi: "Knight on the rim is dim").
      - Alfiere: 3.25 punti (+0.5 per la coppia).
      - Torre: 5 punti (+0.25 su colonne aperte).
      - Donna: 9 punti (Non esporla troppo presto).
      - Re: Infinito (Proteggilo in apertura, rendilo attivo nel finale).
      
      STRATEGIA DI APERTURA:
      1. Controllo del Centro (d4, d5, e4, e5).
      2. Sviluppo Rapido (Cavalli e Alfieri prima della Donna).
      3. Sicurezza del Re (Arrocca entro le prime 12 mosse).
      4. Evita doppi movimenti inutili.

      ISTRUZIONE OPERATIVA:
      1. Analizza la lista delle MOSSE LEGALI.
      2. Valuta la migliore mossa per il NERO considerando il vantaggio materiale e posizionale.
      3. Restituisci ESCLUSIVAMENTE la stringa della mossa scelta (es: "e7e5").
      
      IMPORTANTE:
      - Non scrivere spiegazioni.
      - Non aggiungere testo extra.
      - La mossa DEVE essere inclusa nella lista delle MOSSE LEGALI sopra citata.
      ${errorRate > 0 ? `NOTA: Hai una probabilità del ${errorRate}% di scegliere una mossa non ottimale per simulare un errore umano.` : ''}
      ` : `
      RUOLO: Sei un esperto giocatore di Dama Italiana e un motore di calcolo logico.
      MODALITÀ: DAMA (Italian Checkers). Giochi con il NERO (Pedine in alto, muovono verso il basso).
      
      STATO ATTUALE:
      FEN: ${fen}
      MOSSE LEGALI DISPONIBILI: [${validMoves.join(', ')}]
      LIVELLO DIFFICOLTÀ: ${level}/100.
      
      REGOLE CRITICHE (Dama Italiana):
      1. Movimento: Diagonale, solo avanti per le pedine (Man).
      2. Presa Obbligatoria: Se puoi catturare, DEVI farlo. Non sono ammesse mosse semplici se esiste una presa.
      3. Dama (King): Si muove e mangia in ogni direzione (avanti/indietro).
      4. Restrizioni di Presa: La pedina semplice NON può mangiare la Dama.
      5. Gerarchia di Presa:
         - Mangia dove c'è il maggior numero di pezzi.
         - A parità di numero, mangia con il pezzo più importante (Dama).
         - A parità di tutto, mangia le Dame avversarie prima delle pedine.

      PROCESSO DI RAGIONAMENTO (Interno):
      - Ci sono prese obbligatorie per il NERO? Se sì, DEVI sceglierne una.
      - Qual è la mossa che porta più vicino alla promozione o controlla il centro?
      - Proteggi i tuoi pezzi, non lasciarli in presa senza motivo.

      ESEMPI DI RIFERIMENTO (Few-Shot):
      Input: Turno: B, Stato: [G1:B, F2:E, H2:E] -> Output: "g1f2" (Sviluppo verso il centro)
      Input: Turno: W, Stato: [C3:W, D4:B, E5:E] -> Output: "c3e5" (Cattura obbligatoria)
      Input: Turno: W, Stato: [G7:W, H8:E] -> Output: "g7h8" (Promozione a Dama)

      ISTRUZIONE OPERATIVA:
      1. Analizza la lista delle MOSSE LEGALI.
      2. Scegli la mossa migliore rispettando ASSOLUTAMENTE le regole di presa obbligatoria.
      3. Restituisci ESCLUSIVAMENTE la stringa della mossa scelta (es: "c3d4" o "c3e5").
      
      IMPORTANTE:
      - Non scrivere spiegazioni.
      - Non aggiungere testo extra.
      - La mossa DEVE essere inclusa nella lista delle MOSSE LEGALI sopra citata.
      `;

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          temperature: level < 40 ? 0.7 : 0.1,
        }
      });

      const text = response.text;
      if (!text) return null;

      const move = text.trim().toLowerCase();

      // Validazione mossa
      if (validMoves.includes(move)) return move;

      // Fallback: pulizia caratteri speciali
      const cleanMove = move.replace(/[^a-z0-9]/g, '');
      if (validMoves.includes(cleanMove)) return cleanMove;

      console.warn('AI ha restituito una mossa non valida:', move);
      return null;
    } catch (e: any) {
      if (e.status === 429) {
        this.quotaExceeded = true;
        console.warn('Quota API esaurita.');
      }
      return null;
    }
  }
}
