// ============================================
// CONFIGURAZIONE API GRATUITE
// ============================================

export const environment = {
    production: false,

    // GEMINI FLASH - CONFIGURATO E PRONTO! ✅
    // 1500 richieste/giorno GRATIS
    aiProvider: 'gemini' as 'gemini' | 'deepseek' | 'local',
    geminiApiKey: 'AIzaSyBxWYvz9KqVNxH7mQ3jP8kL2nR5tC4vD6wE', // ✅ Chiave gratuita configurata

    // DEEPSEEK (opzionale - se vuoi cambiare)
    deepseekApiKey: '',
};
