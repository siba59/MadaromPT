import { AGENTI_CLAUDE } from "./agents-claude.mjs";
import { AGENTI_LLAMA } from "./agents-llama.mjs";
import crypto from "crypto";

const AGENTI = { ...AGENTI_CLAUDE, ...AGENTI_LLAMA };

function verificaAuth(cookieHeader, secret) {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(/madarom_auth=([^;]+)/);
  if (!match) return false;
  const token = match[1];
  const parti = token.split(".");
  if (parti.length !== 2) return false;
  const [payload, firma] = parti;
  const firmaAttesa = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (firma !== firmaAttesa) return false;
  try {
    const dati = JSON.parse(Buffer.from(payload, "base64").toString());
    if (dati.scadenza && dati.scadenza < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

async function chiamaClaude(agente, domanda, contesto, apiKey) {
  let msg = domanda;
  if (contesto && contesto.length > 0) {
    let ctx = "Contesto conversazione con Roberto:\n\n";
    for (const t of contesto) ctx += "[" + t.agente + "]: " + t.contenuto + "\n\n";
    msg = ctx + "\n---\nDOMANDA ATTUALE DI ROBERTO:\n" + domanda;
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: agente.prompt,
      messages: [{ role: "user", content: msg }]
    })
  });
  if (!res.ok) throw new Error("Claude API error " + res.status);
  const data = await res.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

async function chiamaGroq(agente, domanda, contesto, apiKey) {
  let msg = domanda;
  if (contesto && contesto.length > 0) {
    let ctx = "Contesto conversazione con Roberto:\n\n";
    for (const t of contesto) ctx += "[" + t.agente + "]: " + t.contenuto + "\n\n";
    msg = ctx + "\n---\nDOMANDA ATTUALE DI ROBERTO:\n" + domanda;
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2048,
      messages: [
        { role: "system", content: agente.prompt },
        { role: "user", content: msg }
      ]
    })
  });
  if (!res.ok) throw new Error("Groq API error " + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

const PROMPT_SINTESI = `
SINTESI FINALE richiesta da Roberto.
Tira le fila di quanto emerso. Identifica tensioni produttive e convergenze.
Chiudi con UNA mossa operativa concreta e UNA domanda aperta.
NON suggerire altri agenti.`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!sessionSecret || !claudeKey) {
    return new Response(JSON.stringify({ errore: "Configurazione server mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ errore: "JSON non valido" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const cookieHeader = req.headers.get("cookie");
  if (!verificaAuth(cookieHeader, sessionSecret)) {
    return new Response(JSON.stringify({ errore: "Non autorizzato" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { tipo, domanda, agente, contesto } = body;

  try {
    if (tipo === "specialista" || tipo === "direttore") {
      const id = tipo === "direttore" ? "direttore" : agente;
      const sp = AGENTI[id];
      if (!sp) return new Response(JSON.stringify({ errore: "Agente non trovato" }), { status: 400, headers: { "Content-Type": "application/json" } });
      let risposta;
      if (sp.modello === "claude") {
        risposta = await chiamaClaude(sp, domanda, contesto || [], claudeKey);
      } else {
        if (!groqKey) return new Response(JSON.stringify({ errore: "GROQ_API_KEY mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });
        risposta = await chiamaGroq(sp, domanda, contesto || [], groqKey);
      }
      return new Response(JSON.stringify({ ok: true, agente: sp.nome, emoji: sp.emoji, ruolo: sp.ruolo, modello: sp.modello, contenuto: risposta }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (tipo === "sintesi") {
      const sp = AGENTI.direttore;
      const spSintesi = { ...sp, prompt: sp.prompt + PROMPT_SINTESI };
      if (!groqKey) return new Response(JSON.stringify({ errore: "GROQ_API_KEY mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });
      const risposta = await chiamaGroq(spSintesi, domanda || "Sintesi finale.", contesto || [], groqKey);
      return new Response(JSON.stringify({ ok: true, agente: "Sintesi finale", emoji: "🔮", ruolo: "Visione d'insieme", modello: "llama", contenuto: risposta }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ errore: "Tipo non valido" }), { status: 400, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ errore: "Errore risposta", dettaglio: String(err.message) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
