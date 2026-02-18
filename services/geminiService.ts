
import { GoogleGenAI } from "@google/genai";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEventRecommendations = async (userPreference: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O usuário gosta de: ${userPreference}. Baseado na cultura de Moçambique, sugira 3 tipos de eventos (ex: Marrabenta, Jazz, Teatro, Festivais de Verão em Bilene) que ele gostaria de ver. Retorne apenas um parágrafo curto e amigável em Português.`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível carregar sugestões personalizadas no momento.";
  }
};

export const chatWithSupport = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: "Você é o assistente virtual da MozTickets, uma plataforma de venda de bilhetes em Moçambique. Ajude os usuários com dúvidas sobre pagamentos (M-Pesa, e-Mola), eventos locais e como baixar seus bilhetes. Seja educado e use expressões locais de Moçambique como 'Estamos juntos' ou 'Kanimambo'."
      }
    });
    return response.text;
  } catch (error) {
    return "Desculpe, estou com dificuldades técnicas. Tente novamente.";
  }
};
