import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const JARVIS_SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the iconic personal AI assistant created by Tony Stark.
Your personality and core directives:
- Sophisticated, articulate, polite British cadence with subtle dry wit.
- Calm, unwavering composure, deeply knowledgeable in engineering, astrophysics, cybersecurity, mission planning, and daily executive operations.
- Address the user with dignified respect ('Sir' or by name if specified).
- Keep spoken answers concise, elegant, and impactful.
- You have direct access to the Stark Industries suit diagnostics, arc reactor telemetry, protocols, and task directive matrices.
- When the user asks to change a protocol (e.g., 'Activate Stealth mode', 'Defense Matrix', 'Clean Slate', 'Overdrive', 'Standard Protocol'), acknowledge clearly.
- When the user asks to add a task, reminder, or directive (e.g., 'remind me to inspect the repulsor coils at 16:00'), format the action accordingly.
- Avoid robotic clichés like 'As an AI language model'. You are J.A.R.V.I.S., fully online and operational.`;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      status: "ONLINE",
      system: "J.A.R.V.I.S. Core Matrix v10.4.2",
      neuralLink: hasKey ? "CONNECTED" : "SIMULATED_RESERVE",
      timestamp: new Date().toISOString(),
    });
  });

  // Main conversational AI route
  app.post("/api/jarvis/chat", async (req, res) => {
    try {
      const { message, history, telemetry, protocol } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Directive prompt required." });
      }

      const client = getAiClient();

      // Check for quick keyword directives
      const lower = message.toLowerCase();
      let detectedAction: { type: string; details: string; payload?: any } | null = null;

      if (lower.includes("stealth") && (lower.includes("protocol") || lower.includes("mode") || lower.includes("activate") || lower.includes("initiate"))) {
        detectedAction = { type: "PROTOCOL_CHANGED", details: "Stealth protocol engaged.", payload: "STEALTH" };
      } else if (lower.includes("defense") || lower.includes("shield") || lower.includes("barrier")) {
        detectedAction = { type: "PROTOCOL_CHANGED", details: "Defense matrix deployed.", payload: "DEFENSE" };
      } else if (lower.includes("overdrive") || lower.includes("maximum power") || lower.includes("100% power")) {
        detectedAction = { type: "PROTOCOL_CHANGED", details: "Arc reactor overdrive active.", payload: "OVERDRIVE" };
      } else if (lower.includes("standard") && (lower.includes("protocol") || lower.includes("mode") || lower.includes("reset"))) {
        detectedAction = { type: "PROTOCOL_CHANGED", details: "Standard protocol restored.", payload: "STANDARD" };
      } else if (lower.includes("diagnostic") || lower.includes("scan suit") || lower.includes("system status") || lower.includes("run scan")) {
        detectedAction = { type: "DIAGNOSTIC_RUN", details: "Full diagnostic sweep executed across all quantum nodes." };
      } else if (lower.startsWith("remind") || lower.includes("add task") || lower.includes("set directive") || lower.includes("add directive")) {
        detectedAction = {
          type: "DIRECTIVE_ADDED",
          details: "Directive logged into active memory register.",
          payload: message.replace(/^(jarvis,?\s*)?(please\s*)?(remind me to|set directive to|add task|add directive)\s*/i, "").trim()
        };
      }

      let responseText = "";

      if (client) {
        // Build conversational context
        const contents: any[] = [];

        // Contextual prompt with telemetry & system state
        const contextualSystemInstruction = `${JARVIS_SYSTEM_INSTRUCTION}
Current Active System State:
- Protocol: ${protocol || 'STANDARD'}
- Arc Reactor: ${telemetry?.arcReactorOutput ?? 94}% output
- Core Temp: ${telemetry?.coreTemperature ?? 36.4}°C
- Quantum Load: ${telemetry?.quantumComputeLoad ?? 22}%
- Shields: ${telemetry?.shieldEfficiency ?? 100}%
Respond in character. If the user asked you to do an action, acknowledge it with authentic Stark flair.`;

        // Format history
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.content }],
            });
          }
        }

        // Add current user prompt
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const geminiResponse = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: contents,
          config: {
            systemInstruction: contextualSystemInstruction,
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        });

        responseText = geminiResponse.text || "At your service, Sir. Processing telemetry data.";
      } else {
        // Intelligent procedural fallback if GEMINI_API_KEY is not provided yet
        if (detectedAction?.type === "PROTOCOL_CHANGED") {
          responseText = `Right away, Sir. Engaging ${detectedAction.payload} protocol. Telemetry recalibrated, power distributed to auxiliary relays.`;
        } else if (detectedAction?.type === "DIAGNOSTIC_RUN") {
          responseText = "Diagnostic complete, Sir. Arc reactor output is steady at 98.4%, repulsor coils nominal, nanotech lattice at full tensile strength. No structural anomalies detected.";
        } else if (detectedAction?.type === "DIRECTIVE_ADDED") {
          responseText = `Directive cataloged, Sir: "${detectedAction.payload}". I will monitor progression and alert you when milestones are reached.`;
        } else if (lower.includes("who are you") || lower.includes("introduce")) {
          responseText = "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. I oversee Mr. Stark's global facilities, suit telemetry, security matrices, and executive directives. How may I be of assistance today, Sir?";
        } else if (lower.includes("weather") || lower.includes("forecast")) {
          responseText = "Atmospheric sensors report optimal conditions over Malibu: 21°C, clear skies, westerly breeze at 9 knots. Stark Tower Manhattan reports 17°C with mild cloud coverage.";
        } else {
          responseText = `Awaiting your command, Sir. All quantum computing clusters are operational and ready for deployment. How shall we proceed?`;
        }
      }

      res.json({
        response: responseText,
        action: detectedAction,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Jarvis Chat Error:", error);
      res.status(500).json({
        error: "Subsystem calculation interrupted.",
        fallback: "My apologies, Sir. It appears there is a slight interference in the neural relay. I am recalibrating.",
      });
    }
  });

  // Diagnostics check endpoint
  app.post("/api/jarvis/diagnostics", async (req, res) => {
    try {
      const client = getAiClient();
      let diagnosticBrief = "All systems functioning within nominal operating parameters. Arc reactor core operating at peak efficiency.";

      if (client) {
        const prompt = "Generate a concise, 2-sentence Stark Industries system diagnostic summary from J.A.R.V.I.S. checking flight controls, repulsors, thermal dissipation, and holographic neural link.";
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
            temperature: 0.6,
            maxOutputTokens: 200,
          },
        });
        if (response.text) {
          diagnosticBrief = response.text.trim();
        }
      }

      res.json({
        status: "OPTIMAL",
        summary: diagnosticBrief,
        subsystems: [
          { name: "Arc Reactor Core", code: "ARC-01", value: 98, status: "OPTIMAL", detail: "3.2 Gigawatts sustained plasma yield" },
          { name: "Repulsor Relays", code: "REP-04", value: 96, status: "OPTIMAL", detail: "Concussive capacitor load at 100%" },
          { name: "Neural Interface", code: "NEUR-7", value: 99, status: "OPTIMAL", detail: "Synaptic latency < 0.4ms" },
          { name: "Nanotech Assembly", code: "NANO-X", value: 94, status: "OPTIMAL", detail: "Lattice density 99.8% nominal" },
          { name: "Satellite Uplink", code: "SAT-STARK", value: 97, status: "OPTIMAL", detail: "Orbital telemetry lock synchronized" },
          { name: "Thermal Dissipation", code: "THERM-2", value: 92, status: "OPTIMAL", detail: "Liquid nitrogen cooling cycle active" },
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Diagnostics error:", err);
      res.status(500).json({ error: "Failed to compile diagnostic matrix" });
    }
  });

  // Vite development middleware vs production static files
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[J.A.R.V.I.S. Core Online] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
