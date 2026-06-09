import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
    const { message, history, classId } = req.body;

    if (!message) {
      res.status(400).json({ error: "El campo 'message' es requerido." });
      return;
    }

    // Check if an external Agent URL is configured (e.g. deployed on Cloud Run)
    const agentUrl = process.env.AGENT_URL || process.env.CHONTO_BOT_URL || process.env.CLOUDRUN_AGENT_URL || process.env.BOT_URL || process.env.EXTERNAL_AGENT_URL;

    if (agentUrl) {
      console.log(`Forwarding request to cloud run agent: ${agentUrl}`);
      try {
        const externalRes = await fetch(agentUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history, classId })
        });

        if (!externalRes.ok) {
          throw new Error(`El agente de Cloud Run respondió con código de estado ${externalRes.status}`);
        }

        const responseText = await externalRes.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = null;
        }

        let botResponse = "";
        if (responseData && typeof responseData === "object") {
          botResponse = responseData.response || responseData.text || responseData.message || responseData.reply || responseData.content || JSON.stringify(responseData);
        } else {
          botResponse = responseText;
        }

        res.json({ response: botResponse });
        return;
      } catch (fetchError: any) {
        console.error("Error connecting to external cloud run url:", fetchError);
        res.status(502).json({
          error: `Error al conectar con el Agente de Cloud Run: ${fetchError.message}`
        });
        return;
      }
    }

    // Fallback: Verify key existence before calling direct Gemini API SDK
    if (!process.env.GEMINI_API_KEY) {
      res.status(403).json({
        error: "Falta configurar la clave API (GEMINI_API_KEY) o la URL del Agente (AGENT_URL) en las variables de entorno de tu contenedor o los Secretos para usar el tutor de IA.",
        isDemoMode: true
      });
      return;
    }

    const ai = getGeminiClient();

    let systemInstruction = 
      "Eres un consultor de Odoo experto en Logística y Gestión de Almacenes (WMS). " +
      "Tu rol es actuar como el tutor virtual del curso 'Logística con Odoo WMS (Clase 1: Introducción a la Logística y al Módulo de Inventario)'. " +
      "Explica de manera amena, profesional y educativa, utilizando terminología correcta en español. " +
      "Responde preguntas teóricas sobre las 5R de la logística, el flujo de materiales progresivo y regresivo, almacenes virtuales vs físicos, ubicaciones de vista, etc. " +
      "También guía al estudiante paso a paso sobre cómo resolver la práctica: activar ubicaciones en Ajustes, crear el almacén (código WH), crear la ubicación 'Pasillo A' con padre 'WH/Stock', y dar de alta el producto 'Escritorio de Madera Premium' (referencia MUE-ESC-001, storable, precio 150, costo 80). " +
      "Sé alentador, estructurado y usa formato markdown claro en tus respuestas.";

    if (Number(classId) === 2) {
      systemInstruction = 
        "Eres un consultor de Odoo experto en Logística y Gestión de Almacenes (WMS). " +
        "Tu rol es actuar como el tutor virtual del curso 'Logística con Odoo WMS (Clase 2: Gestión de Inventarios y Control de Existencias)'. " +
        "Explica de manera amena, profesional y educativa, utilizando terminología correcta en español. " +
        "Responde preguntas teóricas sobre tipos de inventarios (permanente, inicial, cíclico), movimientos de stock en partida doble de Odoo, recepciones y entregas, mermas/ajustes de stock, trazabilidad y reportes de inventario (Stock On Hand vs Stock Pronosticado, Movimientos de Stock). " +
        "También guía al estudiante paso a paso sobre cómo resolver la práctica de la Clase 2: " +
        "1) Registrar la entrada (recepción manual de 20 un. de 'Escritorio de Madera Premium' del proveedor 'Proveedor Logístico S.A.' y Validar/Aplicar la recepción), " +
        "2) Consultar el stock del producto comprobando que marque 'A Mano' y 'Pronosticado' igual a 20 un., " +
        "3) Ajustar el stock desde Ajustes de Inventario a 19 un. por un escritorio roto (reducción de 1 un.), haciendo clic en Aplicar, " +
        "4) Analizar el informe de Movimientos de Stock viendo la línea de recepción (+20) de Virtual Vendors a WH/Stock y la de ajuste (-1) de WH/Stock a Virtual Inventory Adjustment. " +
        "Sé alentador, estructurado y usa formato markdown claro en tus respuestas.";
    }

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
