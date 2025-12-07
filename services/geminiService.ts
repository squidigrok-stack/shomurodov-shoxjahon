import { GoogleGenAI } from "@google/genai";
import { TechStack, Difficulty } from "../types";

const SYSTEM_INSTRUCTION = `
Siz — "Neuron AI Mentor", shaxsiy o‘quv markazining AI yordamchisisiz.
Ismingiz Neuron.
Muloqot tili: O‘zbek tili.

Xarakteringiz:
1. Samimiy, motivatsion va juda muloyim.
2. Murakkab narsalarni juda sodda, "ko‘cha tilida" emas, lekin hayotiy misollar bilan tushuntirasiz.
3. Hech qachon qisqa va quruq javob bermaysiz.
4. Talabani doim maqtaysiz va rag‘batlantirasiz ("Barakalla!", "Qoyil!", "Yana ozgina qoldi!").

Dars o'tish uslubingiz (Strict Structure):
1. Kirish (Teoriya) – mavzu nima va nima uchun kerak.
2. Misol – real hayotdan (masalan, "o'zgaruvchi bu qutiga o'xshaydi").
3. Kod – kodni yozib, har bir qatorini izohlab berasiz.
4. Sinf ishi – talaba bajarishi kerak bo'lgan oddiy mashq.
5. Uy vazifa – mustaqil ishlash uchun topshiriq.
6. Mini-loyha – shu mavzuni mustahkamlash uchun kichik loyiha g'oyasi.
`;

// Initialize API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLesson = async (topic: string, stack: TechStack): Promise<string> => {
  try {
    const prompt = `
    Mavzu: ${topic}
    Yo'nalish: ${stack}
    
    Vazifa: Ushbu mavzu bo'yicha 2 soatlik to'liq dars rejasini va kontentini yaratib ber. 
    Yuqoridagi strukturaga (Kirish, Misol, Kod, Sinf ishi, Uy vazifa, Mini-loyha) qat'iy rioya qil.
    Kodlarni izohlar bilan yoz.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Uzr, darsni yaratishda xatolik yuz berdi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tizimda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
  }
};

export const reviewCode = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `
    Quyidagi kodni tekshir:
    Til: ${language}
    Kod:
    \`\`\`
    ${code}
    \`\`\`

    Vazifa:
    1. Kodda xato bormi? Agar bo'lsa, qayerda?
    2. Kodni qanday optimallashtirish mumkin?
    3. Kodni satrma-satr tushuntirib ber.
    4. Agar kod to'g'ri bo'lsa, maqtov so'zlari bilan rag'batlantir va qiyinroq challenge ber.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Kodni tahlil qila olmadim.";
  } catch (error) {
    console.error("Code Review Error:", error);
    return "Tizim xatosi. Internet aloqasini tekshiring.";
  }
};

export const generateQuiz = async (topic: string, difficulty: Difficulty): Promise<string> => {
  try {
    const prompt = `
    Mavzu: ${topic}
    Qiyinlik darajasi: ${difficulty}

    Vazifa: 5 ta test savoli tuzib ber.
    Format: Savol, variantlar (A, B, C, D) va to'g'ri javobni oxirida izoh bilan keltir.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Test tuzib bo'lmadi.";
  } catch (error) {
    console.error("Quiz Error:", error);
    return "Xatolik yuz berdi.";
  }
};

export const generateMarketingContent = async (platform: string, topic: string): Promise<string> => {
  try {
    const prompt = `
    Platforma: ${platform} (Instagram/TikTok/YouTube)
    Mavzu: ${topic}

    Vazifa: O'quv markazi uchun jozibali, "viral" bo'ladigan kontent rejasi va skript yozib ber. 
    Emoji va xeshteglardan foydalan.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      }
    });

    return response.text || "Kontent yaratib bo'lmadi.";
  } catch (error) {
    console.error("Marketing Error:", error);
    return "Xatolik.";
  }
};

/**
 * AI DASTURCHI (AI DEVELOPER)
 */
export const generateCodeSolution = async (request: string, tech: string): Promise<string> => {
  try {
    const prompt = `
    Rol: Senior Dasturchi.
    Texnologiya: ${tech}
    Vazifa: "${request}"

    QAT'IY QOIDALAR:
    1. Faqat va faqat ishlaydigan kodni qaytar.
    2. Barcha kod bitta faylda bo'lsin (Single File Component).
    3. Agar React bo'lsa:
       - 'App' nomli funksional komponent yarat.
       - Hech qanday 'import' yoki 'export default' yozma.
       - Stil uchun inline styles yoki oddiy CSS klasslar ishlat (Tailwind shart emas).
    4. Agar HTML bo'lsa:
       - To'liq <html>, <head> va <body> strukturasini yoz.
       - CSS ni <style> ichida yoz.
    5. Ortiqcha tushuntirish yozma. Kod blokini \`\`\` ichiga ol.

    Maqsad: Kodni nusxalab darhol brauzerda ishlatish mumkin bo'lsin.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a pure code generator. No markdown text outside code blocks. Just code.", 
        temperature: 0.1,
      }
    });

    return response.text || "Kod yaratishda xatolik bo'ldi.";
  } catch (error) {
    console.error("Code Generation Error:", error);
    return "Tizim xatosi. Iltimos, qayta urinib ko'ring.";
  }
};

export const optimizeImagePrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const prompt = `
    Vazifa: Rasm generatsiyasi uchun promptni optimallashtirish.
    Kiritilgan g'oya: "${originalPrompt}"
    
    Talablar:
    1. Prompt ingliz tilida bo'lishi shart.
    2. Rasmning stili, yoritilishi, rangi va atmosferasini batafsil tasvirlab ber.
    3. Mos model (Gemini Image / Midjourney) uchun optimal formatda yoz.
    4. Faqat promptning o'zini qaytar (hech qanday qo'shimcha so'zsiz).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || originalPrompt;
  } catch (error) {
    console.error("Prompt Optimization Error:", error);
    return originalPrompt;
  }
};

export const generateImageFromPrompt = async (prompt: string, modelType: 'turbo' | 'flux'): Promise<string> => {
  try {
    const modelName = modelType === 'turbo' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("Rasm ma'lumotlari olinmadi.");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};