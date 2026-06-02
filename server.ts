import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in your environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Gemini Chat Endpoint for Odoo Virtual Tutor
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "El campo 'message' es requerido." });
      return;
    }

    // Verify key existence before calling SDK
    if (!process.env.GEMINI_API_KEY) {
      res.status(403).json({
        error: "Falta configurar la clave API (GEMINI_API_KEY) en los Secretos de AI Studio para usar el tutor de IA.",
        isDemoMode: true
      });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      "Eres un consultor de Odoo experto en Logística y Gestión de Almacenes (WMS). " +
      "Tu rol es actuar como el tutor virtual del curso 'Logística con Odoo WMS (Clase 1: Introducción a la Logística y al Módulo de Inventario)'. " +
      "Explica de manera amena, profesional y educativa, utilizando terminología correcta en español. " +
      "Responde preguntas teóricas sobre las 5R de la logística, el flujo de materiales progresivo y regresivo, almacenes virtuales vs físicos, ubicaciones de vista, etc. " +
      "También guía al estudiante paso a paso sobre cómo resolver la práctica: activar ubicaciones en Ajustes, crear el almacén (código WH), crear la ubicación 'Pasillo A' con padre 'WH/Stock', y dar de alta el producto 'Escritorio de Madera Premium' (referencia MUE-ESC-001, storable, precio 150, costo 80). " +
      "Sé alentador, estructurado y usa formato markdown claro en tus respuestas.";

    // Adapt format for Gemini chats if history is present
    // The history parameter is an array of { role: 'user' | 'model', text: string }
    // We can map history to the contents parameter directly or use a chat session
    const formattedContents = [];
    
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        formattedContents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ 
      error: "Ocurrió un error al consultar con el Tutor de IA.",
      details: error.message 
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
