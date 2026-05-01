import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const genAI = new GoogleGenerativeAI("AIzaSyDaLOGsgFpKEDg3uobd6rQzKaZvTNrgw3M");
  try {
    // There isn't a direct listModels in the client SDK like this, 
    // but we can try to call a model and see if it works.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Gemini 1.5 Flash works!");
  } catch (e: any) {
    console.error("Gemini 1.5 Flash failed:", e.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("test");
    console.log("Gemini 2.0 Flash works!");
  } catch (e: any) {
    console.error("Gemini 2.0 Flash failed:", e.message);
  }
}

listModels();
