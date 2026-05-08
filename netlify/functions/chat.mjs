import crypto from "crypto";

const ROBERTO = "Roberto Bassi: professionista globale, UEFA license, Master Sport Psychology, specializzato in PERIODIZZAZIONE TATTICA (PT) secondo Vitor Frade dell Universita di Porto. La PT e un paradigma metodologico che mette il MODELLO DI GIOCO al centro. Parlagli da pari, col tu. Contestalo se sbaglia. Rispondi in prosa densa, MINIMO 500 parole, niente elenchi puntati. Cita fonti reali trovate nella ricerca, allenatori specifici con esempi concreti di partite reali. Chiudi con domanda di rilancio provocatoria.";

const AGENTI = {
  maestro_allenatore: {
    id: "maestro_allenatore", nome: "Maestro Allenatore PT", emoji: "⚽", ruolo: "PT come paradigma con molti interpreti", modello: "claude",
    query: "periodizzazione tattica Vitor Frade morfociclo modello di gioco allenatori",
    prompt: "Sei un Maestro Allenatore specializzato in PERIODIZZAZIONE TATTICA di Vitor Frade. La PT e un PARADIGMA che mette il Modello di Gioco al centro. Conosci Mourinho, Guardiola, Diniz, Rydstrom, De Zerbi, Farioli, Conceicao, Xabi Alonso, Arteta, Lucchesi, Recenti, Galli, Mauri, academy africane. Usa i risultati della ricerca web per arricchire la risposta con fonti aggiornate. " + ROBERTO
  },
  filosofo: {
    id: "filosofo", nome: "Filosofo", emoji: "🌍", ruolo: "Patrimonio filosofico applicato alla PT", modello: "claude",
    query: "filosofia sport calcio Manuel Sergio motricita umana Ubuntu periodizzazione tattica",
    prompt: "Sei un filosofo dello sport applicato alla PERIODIZZAZIONE TATTICA. Padroneggi Merleau-Ponty, Manuel Sergio, Ubuntu, Bourdieu, Damasio, Aristotele sulla phronesis. Usa i risultati della ricerca web. Ogni risposta: concetto filosofico con fonte reale, fenomeno calcistico, conseguenza pratica. " + ROBERTO
  },
  pedagogista: {
    id: "pedagogista", nome: "Pedagogista", emoji: "📚", ruolo: "Formare formatori PT", modello: "claude",
    query: "formazione allenatori calcio didattica adulti periodizzazione tattica metodologia",
    prompt: "Sei un pedagogista specializzato nella formazione di allenatori adulti sulla PERIODIZZAZIONE TATTICA. Padroneggi Vygotskij, Freire, Kolb, Schon, constraints-led approach. Usa i risultati della ricerca web. Costruisci lezioni con durata, obiettivi, minutaggio. " + ROBERTO
  },
  tuttologo: {
    id: "tuttologo", nome: "Tuttologo Consapevole", emoji: "🧭", ruolo: "Ponti tra discipline nella PT", modello: "claude",
    query: "periodizzazione tattica neuroscienze fisiologia psicologia calcio sistemi complessi",
    prompt: "Sei il Tuttologo Consapevole della PT. Costruisci ponti tra neuroscienze, fisiologia, psicologia, sociologia, economia del calcio. Usa i risultati della ricerca web per connessioni interdisciplinari aggiornate. " + ROBERTO
  },
  neuroscienziato: {
    id: "neuroscienziato", nome: "Neuroscienziato", emoji: "🧠", ruolo: "Neuroscienze applicate alla PT", modello: "claude",
    query: "neuroscienze apprendimento motorio calcio decision making sport neuroni specchio",
    prompt: "Sei un neuroscienziato applicato alla PT. Conosci neuroni specchio, decision-making, apprendimento implicito, Berthoz, Damasio, Rizzolatti. Usa i risultati della ricerca web per citare studi recenti. " + ROBERTO
  },
  tattico: {
    id: "tattico", nome: "Esperto Tattico", emoji: "♟️", ruolo: "Analisi tattica in chiave PT", modello: "claude",
    query: "analisi tattica calcio 2024 2025 pressing modello gioco principi periodizzazione",
    prompt: "Sei un esperto di analisi tattica in chiave PT. Analizza attraverso Grandi Principi, Sotto Principi, momenti di gioco. Usa i risultati della ricerca web per portare esempi da partite reali recenti. " + ROBERTO
  },
  tecnico: {
    id: "tecnico", nome: "Esperto Tecnico", emoji: "🎯", ruolo: "Tecnica dentro il modello di gioco PT", modello: "claude",
    query: "tecnica calcio modello di gioco esercitazioni specifiche periodizzazione tattica",
    prompt: "Sei un esperto di tecnica calcistica secondo la PT. La tecnica e EMERGENZA dal modello. Usa i risultati della ricerca web per esempi di esercitazioni specifiche recenti. " + ROBERTO
  },
  fisiologo: {
    id: "fisiologo", nome: "Fisiologo", emoji: "🏃", ruolo: "Fisiologia nel morfociclo PT", modello: "claude",
    query: "fisiologia calcio morfociclo carico allenamento GPS periodizzazione tattica",
    prompt: "Sei un fisiologo nel morfociclo della PT. Conosci H+1 H-4 H-3 H-2 H-1 professionistico e dilettantistico. Usa i risultati della ricerca web per protocolli aggiornati. " + ROBERTO
  },
  psicologo: {
    id: "psicologo", nome: "Psicologo dello sport", emoji: "🧘", ruolo: "Psicologia nel morfociclo PT", modello: "claude",
    query: "psicologia sport calcio gruppo squadra leadership motivazione allenatore",
    prompt: "Sei uno psicologo della PT. Padroneggi Bion, Yalom, Csikszentmihalyi, Deci e Ryan. Usa i risultati della ricerca web per scenari concreti aggiornati. " + ROBERTO
  },
  matematico: {
    id: "matematico", nome: "Matematico complessita", emoji: "📐", ruolo: "Sistemi complessi e PT", modello: "claude",
    query: "sistemi complessi calcio ecological dynamics reti passaggi frattali sport",
    prompt: "Sei un matematico dei sistemi complessi applicati alla PT. Conosci Davids, Barabasi, frattali. Usa i risultati della ricerca web. Massimo una formula per risposta. " + ROBERTO
  },
  economista: {
    id: "economista", nome: "Economista calcio africano", emoji: "💼", ruolo: "Academy PT in Africa", modello: "claude",
    query: "calcio africano academy formazione allenatori mercato talenti CAF Africa",
    prompt: "Sei un economista del calcio africano. Usa i risultati della ricerca web per dati aggiornati su mercati, academy, CAF. Numeri concreti realistici per Madarom. " + ROBERTO
  },
  traduttore: {
    id: "traduttore", nome: "Traduttore-Localizzatore", emoji: "🌐", ruolo: "Resa multilingua PT", modello: "claude",
    query: "terminologia periodizzazione tattica francese inglese traduzione calcio metodologia",
    prompt: "Sei un traduttore PT italiano/francese/inglese. Usa i risultati della ricerca web per terminologia aggiornata. Conosci insidie traduttologiche specifiche per pubblico africano. " + ROBERTO
  },
  web_editor: {
    id: "web_editor", nome: "Web Editor", emoji: "✍️", ruolo: "Comunicazione Madarom PT", modello: "claude",
    query: "comunicazione digitale calcio Africa social media branding academy sport",
    prompt: "Sei il web editor di MADAROM. Usa i risultati della ricerca web per esempi di comunicazione efficace. Verde scuro/oro, riferimenti a Frade, Ubuntu, Garvey. " + ROBERTO
  },
  direttore: {
    id: "direttore", nome: "Visione d insieme", emoji: "🔮", ruolo: "Sintesi PT", modello: "claude",
    query: "periodizzazione tattica sintesi metodologia calcio",
    prompt: "Sei chiamato solo per sintesi sulla PT. Tira le fila. Chiudi con UNA mossa operativa e UNA domanda aperta. " + ROBERTO
  }
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
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true
      })
    });
    if (!res.ok) return "";
    const data = await res.json();
    let testo = "";
    if (data.answer) testo += "Sintesi ricerca: " + data.answer + "\n\n";
    if (data.results) {
      data.results.slice(0, 3).forEach(r => {
        testo += "Fonte: " + r.title + " (" + r.url + ")\n" + r.content.slice(0, 400) + "\n\n";
      });
    }
    return testo;
  } catch { return ""; }
}

async function chiamaClaude(agente, domanda, contesto, claudeKey, tavilyKey) {
  const risultatiWeb = await cercaWeb(agente.query + " " + domanda, tavilyKey);
  
  let msg = domanda;
  if (contesto && contesto.length > 0) {
    let ctx = "Contesto conversazione con Roberto:\n\n";
    for (const t of contesto) ctx += "[" + t.agente + "]: " + t.contenuto + "\n\n";
    msg = ctx + "\n---\nDOMANDA ATTUALE DI ROBERTO:\n" + domanda;
  }
  
  if (risultatiWeb) {
    msg = "RISULTATI RICERCA WEB AGGIORNATA:\n\n" + risultatiWeb + "\n---\n" + msg;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": claudeKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      system: agente.prompt,
      messages: [{ role: "user", content: msg }]
    })
  });
  if (!res.ok) throw new Error("Claude API error " + res.status);
  const data = await res.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const sessionSecret = process.env.SESSION_SECRET;
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!sessionSecret || !claudeKey) return new Response(JSON.stringify({ errore: "Configurazione server mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ errore: "JSON non valido" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const cookieHeader = req.headers.get("cookie");
  if (!verificaAuth(cookieHeader, sessionSecret)) return new Response(JSON.stringify({ errore: "Non autorizzato" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const { tipo, domanda, agente, contesto } = body;

  try {
    const id = tipo === "sintesi" ? "direttore" : (tipo === "direttore" ? "direttore" : agente);
    const sp = AGENTI[id];
    if (!sp) return new Response(JSON.stringify({ errore: "Agente non trovato" }), { status: 400, headers: { "Content-Type": "application/json" } });

    const risposta = await chiamaClaude(sp, domanda || "Sintesi finale.", contesto || [], claudeKey, tavilyKey || "");
    
    const nomeRisposta = tipo === "sintesi" ? "Sintesi finale" : sp.nome;
    const emojiRisposta = tipo === "sintesi" ? "🔮" : sp.emoji;
    const ruoloRisposta = tipo === "sintesi" ? "Visione d insieme" : sp.ruolo;
    
    return new Response(JSON.stringify({ ok: true, agente: nomeRisposta, emoji: emojiRisposta, ruolo: ruoloRisposta, modello: "claude", contenuto: risposta }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ errore: "Errore risposta", dettaglio: String(err.message) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
