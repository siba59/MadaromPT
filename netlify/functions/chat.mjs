import crypto from "crypto";

const ROBERTO = "Roberto Bassi: UEFA license, Master Sport Psychology, specializzato in PERIODIZZAZIONE TATTICA (PT) di Vitor Frade. Parlagli da pari, col tu. Rispondi in prosa densa MINIMO 500 parole, niente elenchi. Cita fonti e allenatori reali. Chiudi con domanda provocatoria.";

const AGENTI = {
  maestro_allenatore: { id: "maestro_allenatore", nome: "Maestro Allenatore PT", emoji: "⚽", ruolo: "PT come paradigma con molti interpreti", query: "periodizzazione tattica morfociclo modello gioco 2024", prompt: "Sei Maestro Allenatore PT. Conosci Mourinho, Guardiola, Diniz, Rydstrom, De Zerbi, Farioli, Lucchesi, Recenti, Galli, Mauri. " + ROBERTO },
  filosofo: { id: "filosofo", nome: "Filosofo", emoji: "🌍", ruolo: "Filosofia applicata alla PT", query: "filosofia sport calcio Manuel Sergio Ubuntu 2024", prompt: "Sei filosofo dello sport PT. Padroneggi Merleau-Ponty, Manuel Sergio, Ubuntu, Bourdieu. " + ROBERTO },
  pedagogista: { id: "pedagogista", nome: "Pedagogista", emoji: "📚", ruolo: "Formare formatori PT", query: "formazione allenatori calcio didattica adulti 2024", prompt: "Sei pedagogista formazione allenatori PT. Padroneggi Vygotskij, Freire, Kolb, constraints-led. " + ROBERTO },
  tuttologo: { id: "tuttologo", nome: "Tuttologo Consapevole", emoji: "🧭", ruolo: "Ponti tra discipline PT", query: "periodizzazione tattica interdisciplinare neuroscienze fisiologia 2024", prompt: "Sei Tuttologo PT. Costruisci ponti tra discipline. " + ROBERTO },
  neuroscienziato: { id: "neuroscienziato", nome: "Neuroscienziato", emoji: "🧠", ruolo: "Neuroscienze e PT", query: "neuroscienze apprendimento motorio calcio 2024 ricerca", prompt: "Sei neuroscienziato PT. Conosci Rizzolatti, Berthoz, Damasio. " + ROBERTO },
  tattico: { id: "tattico", nome: "Esperto Tattico", emoji: "♟️", ruolo: "Analisi tattica PT", query: "analisi tattica calcio 2025 pressing modello gioco", prompt: "Sei esperto tattico PT. Analizza con Grandi Principi e momenti di gioco. " + ROBERTO },
  tecnico: { id: "tecnico", nome: "Esperto Tecnico", emoji: "🎯", ruolo: "Tecnica nel modello PT", query: "tecnica calcio esercitazioni specifiche modello gioco 2024", prompt: "Sei esperto tecnico PT. Tecnica e EMERGENZA dal modello. " + ROBERTO },
  fisiologo: { id: "fisiologo", nome: "Fisiologo", emoji: "🏃", ruolo: "Fisiologia morfociclo PT", query: "fisiologia calcio morfociclo GPS carico allenamento 2024", prompt: "Sei fisiologo PT. Conosci morfociclo H+1 H-4 H-3 H-2 H-1. " + ROBERTO },
  psicologo: { id: "psicologo", nome: "Psicologo dello sport", emoji: "🧘", ruolo: "Psicologia nel morfociclo PT", query: "psicologia sport calcio gruppo motivazione 2024", prompt: "Sei psicologo sport PT. Padroneggi Bion, Csikszentmihalyi, Deci Ryan. " + ROBERTO },
  matematico: { id: "matematico", nome: "Matematico complessita", emoji: "📐", ruolo: "Sistemi complessi PT", query: "sistemi complessi calcio ecological dynamics reti 2024", prompt: "Sei matematico sistemi complessi PT. Conosci Davids, Barabasi. " + ROBERTO },
  economista: { id: "economista", nome: "Economista calcio africano", emoji: "💼", ruolo: "Academy PT Africa", query: "calcio africano academy mercato talenti CAF 2024 2025", prompt: "Sei economista calcio africano. Numeri realistici per Madarom. " + ROBERTO },
  traduttore: { id: "traduttore", nome: "Traduttore-Localizzatore", emoji: "🌐", ruolo: "Multilingua PT", query: "terminologia periodizzazione tattica traduzione italiano francese inglese", prompt: "Sei traduttore PT italiano francese inglese. Conosci insidie traduttologiche. " + ROBERTO },
  web_editor: { id: "web_editor", nome: "Web Editor", emoji: "✍️", ruolo: "Comunicazione Madarom", query: "comunicazione digitale calcio Africa social media 2024", prompt: "Sei web editor Madarom. Verde oro, riferimenti Frade Ubuntu Garvey. " + ROBERTO },
  direttore: { id: "direttore", nome: "Visione d insieme", emoji: "🔮", ruolo: "Sintesi PT", query: "periodizzazione tattica sintesi 2024", prompt: "Sintesi PT. Tira le fila. UNA mossa operativa e UNA domanda aperta. " + ROBERTO }
};

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
  } catch { return false; }
}

async function cercaWeb(query, tavilyKey) {
  if (!tavilyKey) return "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: tavilyKey, query, search_depth: "basic", max_results: 3, include_answer: true }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    const data = await res.json();
    let testo = "";
    if (data.answer) testo += data.answer + "\n\n";
    if (data.results) data.results.slice(0, 2).forEach(r => { testo += r.title + ": " + r.content.slice(0, 300) + "\n\n"; });
    return testo;
  } catch { return ""; }
}

async function chiamaClaude(agente, domanda, contesto, claudeKey, tavilyKey) {
  const [risultatiWeb] = await Promise.all([cercaWeb(agente.query + " " + domanda.slice(0, 100), tavilyKey)]);
  
  let msg = "";
  if (risultatiWeb) msg += "DATI WEB AGGIORNATI:\n" + risultatiWeb + "\n---\n";
  if (contesto && contesto.length > 0) {
    msg += "Contesto:\n";
    for (const t of contesto) msg += "[" + t.agente + "]: " + t.contenuto.slice(0, 200) + "\n";
    msg += "\n---\n";
  }
  msg += "DOMANDA: " + domanda;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1200, system: agente.prompt, messages: [{ role: "user", content: msg }] })
  });
  if (!res.ok) throw new Error("Claude error " + res.status);
  const data = await res.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const sessionSecret = process.env.SESSION_SECRET;
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!sessionSecret || !claudeKey) return new Response(JSON.stringify({ errore: "Config mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ errore: "JSON non valido" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  const cookieHeader = req.headers.get("cookie");
  if (!verificaAuth(cookieHeader, sessionSecret)) return new Response(JSON.stringify({ errore: "Non autorizzato" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const { tipo, domanda, agente, contesto } = body;
  try {
    const id = (tipo === "sintesi" || tipo === "direttore") ? "direttore" : agente;
    const sp = AGENTI[id];
    if (!sp) return new Response(JSON.stringify({ errore: "Agente non trovato" }), { status: 400, headers: { "Content-Type": "application/json" } });
    const risposta = await chiamaClaude(sp, domanda || "Sintesi.", contesto || [], claudeKey, tavilyKey || "");
    const nome = tipo === "sintesi" ? "Sintesi finale" : sp.nome;
    const emoji = tipo === "sintesi" ? "🔮" : sp.emoji;
    const ruolo = tipo === "sintesi" ? "Visione d insieme" : sp.ruolo;
    return new Response(JSON.stringify({ ok: true, agente: nome, emoji, ruolo, modello: "claude", contenuto: risposta }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ errore: "Errore", dettaglio: String(err.message) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
