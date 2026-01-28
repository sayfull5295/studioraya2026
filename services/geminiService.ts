
import { GoogleGenAI } from "@google/genai";

const FALLBACK_GREETINGS = [
  "Semoga Syawal ini membawa seribu keberkatan dan kebahagiaan buat keluarga tercinta.",
  "Keindahan Aidilfitri terpancar pada senyuman tulus ikhlas. Maaf Zahir dan Batin.",
  "Abadikan setiap detik indah di hari kemenangan ini bersama yang tersayang.",
  "Raya disambut dengan penuh kesyukuran, memori tercipta dengan penuh keindahan.",
  "Selamat Hari Raya Aidilfitri. Semoga ukhuwah kita sentiasa mekar mewangi."
];

/**
 * Fetches a festive greeting from Gemini API with session-based caching.
 */
export const getFestiveGreeting = async (name: string) => {
  const CACHE_KEY = `raya_greeting_${encodeURIComponent(name)}`;
  const cached = sessionStorage.getItem(CACHE_KEY);
  
  if (cached) return cached;

  const randomFallback = `${FALLBACK_GREETINGS[Math.floor(Math.random() * FALLBACK_GREETINGS.length)]} Selamat Hari Raya, ${name}!`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan satu ucapan selamat Hari Raya Aidilfitri yang sangat pendek, puitis, dan mewah untuk pelanggan bernama ${name}. Gunakan Bahasa Melayu yang sangat sopan. Maksimum 15 patah perkataan.`,
    });
    
    const text = response.text?.trim() || randomFallback;
    sessionStorage.setItem(CACHE_KEY, text);
    return text;
  } catch (error: any) {
    console.warn("Gemini API Quota reached (429). Using premium fallback greeting.");
    return randomFallback;
  }
};

/**
 * Generates a festive email body for payment confirmation.
 */
export const getEmailConfirmationMessage = async (name: string, bookingId: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tulis satu mesej ringkas (3-4 ayat) untuk emel pengesahan pembayaran tempahan studio foto raya bagi pelanggan bernama ${name} (ID Tempahan: ${bookingId}). Beritahu mereka bahawa pembayaran telah diterima dan QR code serta tiket kini sedia untuk dimuat turun di dashboard. Gunakan nada yang sangat mesra dan bertema Aidilfitri.`,
    });
    return response.text?.trim() || `Alhamdulillah, pembayaran anda untuk tempahan #${bookingId} telah diterima. Sila log masuk ke portal kami untuk mendapatkan Tiket QR anda. Selamat Hari Raya!`;
  } catch (error) {
    return `Alhamdulillah, pembayaran anda untuk tempahan #${bookingId} telah diterima. Sila log masuk ke portal kami untuk mendapatkan Tiket QR anda. Selamat Hari Raya!`;
  }
};
