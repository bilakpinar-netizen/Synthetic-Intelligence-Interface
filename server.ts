import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please set your API key in the Secrets panel (Settings > Secrets) to enable live AI responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to execute prompts against the Gemini 3.5 model
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, model = "gemini-3.5-flash", systemInstruction, temperature, topP } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGemini();
      
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (typeof temperature === 'number') config.temperature = temperature;
      if (typeof topP === 'number') config.topP = topP;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config
      });

      res.json({
        text: response.text,
        candidates: response.candidates,
        usageMetadata: response.usageMetadata
      });
    } catch (err: any) {
      console.error("Gemini Ingestion/Inference Error:", err);
      const isMissingKey = !process.env.GEMINI_API_KEY || 
                           process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY" || 
                           process.env.GEMINI_API_KEY === "";
      
      res.status(isMissingKey ? 403 : 500).json({
        error: err.message || "Synthesizing of request failed.",
        isMissingKey: isMissingKey,
        suggestion: isMissingKey ? "Configure your GEMINI_API_KEY in Settings > Secrets to unleash full live capabilities." : "Check model parameters or latency limits."
      });
    }
  });

  // Mock processing step for testing workflows with simulated network jitter
  app.post("/api/pipeline/process", (req, res) => {
    const { step, payloadSize = 250, dropRate = 0.02 } = req.body;
    
    // Simulate drop rate
    if (Math.random() < dropRate) {
      return res.status(504).json({
        error: `Data stream packet dropped at step [${step || 'ingestion'}]: Node connection timeout.`,
        code: "DROP_OCCURRED",
        timestamp: new Date().toISOString()
      });
    }

    const start = Date.now();
    const duration = Math.floor(Math.random() * 80) + 10;
    
    res.json({
      success: true,
      step: step || "embedding",
      nodeId: `node-${step || 'emb'}-${Math.floor(Math.random() * 1000)}`,
      latencyMs: duration,
      payloadSize: payloadSize,
      throughputPps: Math.floor((payloadSize / duration) * 1000),
      timestamp: new Date().toISOString()
    });
  });

  // Serve static assets and inject Vite client middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Applet] Server is running on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
