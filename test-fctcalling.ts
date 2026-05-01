import { GoogleGenerativeAI, Part } from "@google/generative-ai";

/**
 * FIXES MADE:
 * 1. Added proper TypeScript typing.
 * 2. Added support for MULTIPLE function calls (Gemini often calls both functions at once for this prompt).
 * 3. Added a loop to handle sequential function calls if needed.
 * 4. Added better error handling and logging.
 * 5. Fixed the potential crash when response.text() is called on a response that only contains function calls.
 */

// Use the API Key provided in the original file
const API_KEY = "AIzaSyDaLOGsgFpKEDg3uobd6rQzKaZvTNrgw3M";
const genAI = new GoogleGenerativeAI(API_KEY);

// 1. Local function definitions
function getStockArtisanat({ metal }: { metal: string }) {
  console.log(`\n[Local Execution] Checking stock for: ${metal}`);
  const stocks: Record<string, string> = { 
    argent: "1.5kg", 
    bronze: "500g", 
    cuivre: "2kg" 
  };
  const result = { metal, quantite: stocks[metal.toLowerCase()] || "0g" };
  console.log(`[Result]`, result);
  return result;
}

function getMaterialPrice({ material }: { material: string }) {
  console.log(`\n[Local Execution] Checking price for: ${material}`);
  const prices: Record<string, number> = { 
    silver: 0.95, 
    bronze: 0.05, 
    gold: 75.0,
    argent: 0.95 // Added French key for robustness
  };
  const price = prices[material.toLowerCase()] || 1;
  const result = { material, price_per_gram: price, currency: "USD" };
  console.log(`[Result]`, result);
  return result;
}

// 2. Function map
const functions: Record<string, Function> = {
  getStockArtisanat,
  getMaterialPrice,
};

// 3. Model initialization with tools
// Using gemini-1.5-flash as it's the standard for function calling.
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [
    {
      functionDeclarations: [
        {
          name: "getStockArtisanat",
          description: "Vérifie la quantité disponible pour un métal donné (argent, bronze, cuivre).",
          parameters: {
            type: "OBJECT" as any,
            properties: {
              metal: { type: "STRING", description: "Nom du métal en français" },
            },
            required: ["metal"],
          },
        },
        {
          name: "getMaterialPrice",
          description: "Renvoie le prix d’un métal par gramme (silver, bronze, gold/argent).",
          parameters: {
            type: "OBJECT" as any,
            properties: {
              material: { type: "STRING", description: "Nom du métal" },
            },
            required: ["material"],
          },
        },
      ],
    },
  ],
});

async function askGemini(prompt: string) {
  console.log(`\n--- Asking Gemini: "${prompt}" ---`);
  
  try {
    const chat = model.startChat();
    let result = await chat.sendMessage(prompt);
    
    // Process turns until Gemini gives a final text response
    while (true) {
      const parts = result.response.candidates?.[0]?.content?.parts || [];
      const functionCalls = parts.filter(p => p.functionCall);
      
      if (functionCalls.length === 0) {
        // No more function calls, print the final answer
        try {
            console.log("\n[Gemini Final Response]:", result.response.text());
        } catch (e) {
            console.log("\n[Gemini Final Response]: (No text response available yet)");
        }
        break;
      }

      console.log(`\n[Gemini] wants to call ${functionCalls.length} function(s):`);
      
      const functionResponses: Part[] = [];

      for (const part of functionCalls) {
        const call = part.functionCall!;
        const fn = functions[call.name];
        
        if (fn) {
          const apiResponse = fn(call.args);
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: apiResponse
            }
          });
        } else {
          console.error(`Unknown function: ${call.name}`);
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { error: "Function not found" }
            }
          });
        }
      }

      // Send the function results back to Gemini
      console.log("\n[System] Sending results back to Gemini...");
      result = await chat.sendMessage(functionResponses);
    }
  } catch (error: any) {
    console.error("\n[Error] Gemini Interaction failed:");
    console.error(error.message || error);
    
    // Check if it's a quota issue
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      console.log("\nTIP: You have reached your API quota. Please wait a bit or use another key.");
    }
  }
}

// Running the test
askGemini("Combien d'argent reste et quel est le prix de 100g ?");
