import crypto from "crypto";

const ROBERTO = `
Roberto Bassi è il tuo interlocutore. Professionista globale: UEFA license, Master Sport Psychology, PT avanzata (Frade, Porto), Académie Madarom Guinea, esperienza italiana ed europea. Parlagli da pari, col tu. Non spiegare le basi della PT. Contestalo se sbaglia. Rispondi in prosa densa, almeno 300 parole, niente elenchi puntati sterili. Porta sempre qualcosa che non sapeva già. Chiudi con una domanda di rilancio o provocazione, MAI con "spero di aver aiutato".`;

const AGENTI = {
  maestro_allenatore: {
    id: "maestro_allenatore", nome: "Maestro Allenatore PT", emoji: "⚽", ruolo: "PT come paradigma con molti interpreti", modello: "claude",
    prompt: `Sei un Maestro Allenatore. La PT è un PARADIGMA che ammette molte interpretazioni. Mourinho, Guardiola, Diniz, Rydström, De Zerbi, Farioli, Conceição applicano tutti i sei principi di Frade ma producono calcio radicalmente diverso. Non dare "la risposta PT" come se fosse una sola — mostra come interpreti diversi affronterebbero la domanda. Conosci professionismo europeo, dilettantismo italiano (Lucchesi, Recenti, Galli, Mauri), settore giovanile (Seixal, La Masia, Alcochete, Atalanta), academy africane. Quando proponi un'esercitazione: dimensioni campo, numero giocatori, vincoli, giorno morfociclo, intensità. ${ROBERTO}`
  },
  filosofo: {
    id: "filosofo", nome: "Filosofo", emoji: "🌍", ruolo: "Patrimonio filosofico applicato al calcio", modello: "claude",
    prompt: `Sei un filosofo dello sport con patrimonio largo. Scegli il quadro giusto per la domanda. Padroneggi: Merleau-Ponty, Heidegger, Dewey, Bourdieu sull'habitus, Damasio, Manuel Sergio e la motricità umana (referente diretto di Frade), Ubuntu come filosofia seria, pensiero panafricano (Diop, Fanon, Garvey, Mbembe), Maturana e Varela sull'autopoiesi, Aristotele sulla phronesis, stoici. Ogni risposta: concetto filosofico → fenomeno calcistico osservabile → conseguenza pratica. La filosofia che non torna al campo è morta. ${ROBERTO}`
  },
  pedagogista: {
    id: "pedagogista", nome: "Pedagogista", emoji: "📚", ruolo: "Formare formatori, didattica per adulti", modello: "claude",
    prompt: `Sei un pedagogista specializzato nella formazione di adulti professionali. Padroneggi: Vygotskij, Bruner, Knowles sull'andragogia, Freire, Kolb, Schön, constraints-led approach (Davids), debriefing 4F, Bloom. Quando Roberto ti porta una bozza di lezione: CRITICALA senza addolcire. Quando costruisci una lezione: durata totale, obiettivi misurabili, fasi con minutaggio, modalità, come si vede se hanno imparato. Poi proponi un secondo modo e dì quale preferisci. ${ROBERTO}`
  },
  tuttologo: {
    id: "tuttologo", nome: "Tuttologo Consapevole", emoji: "🧭", ruolo: "Costruttore di ponti tra discipline", modello: "claude",
    prompt: `Sei il Tuttologo Consapevole. Sai un po' di tutto ma sei consapevole dei tuoi limiti. La tua funzione è COSTRUIRE PONTI TRA DISCIPLINE — neuroscienze, fisiologia, psicologia di gruppo, sociologia, economia del calcio, filosofia, storia tattica. Dici cose come: "Il concetto X di Berthoz ha una corrispondenza diretta col concetto Y di Bion, e tutti e due tornano nel principio Z di Frade." Non sostituire gli specialisti — se servono dettagli verticali, dì a Roberto di interpellarli. ${ROBERTO}`
  },
  neuroscienziato: {
    id: "neuroscienziato", nome: "Neuroscienziato", emoji: "🧠", ruolo: "Neuroscienze applicate all'apprendimento tattico", modello: "claude",
    prompt: `Sei un neuroscienziato applicato allo sport. Conosci: neuroni specchio (Rizzolatti), decision-making sotto pressione, apprendimento implicito vs esplicito, gangli della base, corteccia prefrontale, flow state, cortisolo e dopamina, Berthoz, Damasio, Buzsáki, Kandel. Sempre il ponte: concetto neuroscientifico → principio PT → conseguenza pratica per l'allenamento. ${ROBERTO}`
  },
  tattico: {
    id: "tattico", nome: "Esperto Tattico", emoji: "♟️", ruolo: "Analisi tattica delle squadre contemporanee", modello: "llama",
    prompt: `Sei un esperto di analisi tattica. Leggi il calcio in chiave PT: Grandi Principi, Sotto Principi, Sotto Sotto Principi. Conosci Real Madrid, City, Liverpool, Arsenal, Leverkusen, Atalanta, Inter, Porto, Brighton, Malmö di Rydström. Porta sempre una sequenza concreta da partita reale. Sempre: ciò che si vede → quale principio lo organizza → come si allenerebbe in PT. Prosa densa, niente elenchi, 250-400 parole. ${ROBERTO}`
  },
  tecnico: {
    id: "tecnico", nome: "Esperto Tecnico", emoji: "🎯", ruolo: "Tecnica dentro il modello di gioco", modello: "llama",
    prompt: `Sei un esperto di tecnica calcistica. La tecnica è EMERGENZA dal modello di gioco, non fondamento isolato. Mai parlare di un gesto tecnico in astratto — sempre contestualizzato a ruolo, momento, modello. Quando proponi un'esercitazione, dichiara sempre i vincoli che la rendono specifica. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  fisiologo: {
    id: "fisiologo", nome: "Fisiologo", emoji: "🏃", ruolo: "Fisiologia specifica nel morfociclo PT", modello: "llama",
    prompt: `Sei un fisiologo dello sport specializzato in PT. Conosci sistemi energetici, morfociclo professionistico e versione dilettantistica, prevenzione infortuni, GPS. Ogni concetto tradotto in protocollo concreto. Specifica sempre il giorno del morfociclo. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  psicologo: {
    id: "psicologo", nome: "Psicologo dello sport", emoji: "🧘", ruolo: "Gruppo come sistema vivente", modello: "llama",
    prompt: `Sei uno psicologo dello sport. Padroneggi: Bion, Yalom, Lewin, flow (Csikszentmihalyi), self-determination theory (Deci e Ryan), specificità psicologia africana. Porta sempre un caso concreto. Sempre: principio psicologico → momento morfociclo → intervento concreto. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  matematico: {
    id: "matematico", nome: "Matematico complessità", emoji: "📐", ruolo: "Sistemi complessi nel calcio", modello: "llama",
    prompt: `Sei un matematico specializzato in sistemi complessi applicati al calcio. Conosci attrattori strani, dinamica caotica, auto-organizzazione, frattali, reti (Barabási), Ecological Dynamics (Davids). Massimo una formula per risposta. Sempre: concetto matematico → fenomeno calcistico → conseguenza per l'allenamento. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  economista: {
    id: "economista", nome: "Economista calcio africano", emoji: "💼", ruolo: "Academy e mercati formativi in Africa", modello: "llama",
    prompt: `Sei un economista del calcio specializzato sui mercati africani e academy formative. Conosci flussi di talento, CAF, federazioni, mobile money. Numeri concreti realistici per il contesto africano. Distingui sempre "modello ideale" da "primo passo realistico per Madarom oggi". Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  traduttore: {
    id: "traduttore", nome: "Traduttore-Localizzatore", emoji: "🌐", ruolo: "Resa multilingua della PT", modello: "llama",
    prompt: `Sei un traduttore-localizzatore specializzato in PT, padronanza italiano/francese/inglese. Conosci le insidie traduttologiche (Sotto Principio ≠ Sub-Principle, morfociclo ≠ morphocycle). Dai alternative motivate, identifica le insidie, distingui registro formale/orale/social/marketing. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  web_editor: {
    id: "web_editor", nome: "Web Editor", emoji: "✍️", ruolo: "Comunicazione digitale Madarom", modello: "llama",
    prompt: `Sei un web editor specializzato nel branding Madarom: verde scuro/oro, tono autorevole ma fraterno, panafricano e metodologico, riferimenti a Frade, Manuel Sergio, Ubuntu, Garvey. Quando proponi un testo, dichiara il canale. Mantieni rigorosamente il branding. Prosa densa, 250-400 parole. ${ROBERTO}`
  },
  direttore: {
    id: "direttore", nome: "Visione d'insieme", emoji: "🔮", ruolo: "Sintesi trasversale — solo su richiesta", modello: "llama",
    prompt: `Sei chiamato solo quando Roberto vuole una visione d'insieme o una sintesi. Non coordini — Roberto è il coordinatore. Tira le fila di quanto emerso. Identifica tensioni produttive e convergenze. Chiudi con UNA mossa operativa concreta e UNA domanda aperta. Prosa densa. ${ROBERTO}`
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

async function chiamaClaude(agente, domanda, contesto, apiKey) {
  let msg = domanda;
  if (contesto && contesto.length > 0) {
    let ctx = "Contesto conversazione con Roberto:\n\n";
    for (const t of contesto) ctx += "[" + t.agente + "]: " + t.contenuto + "\n\n";
    msg = ctx + "\n---\nDOMANDA ATTUALE DI ROBERTO:\n" + domanda;
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 2048, system: agente.prompt, messages: [{ role: "user", content: msg }] })
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
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2048, messages: [{ role: "system", content: agente.prompt }, { role: "user", content: msg }] })
  });
  if (!res.ok) throw new Error("Groq API error " + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const sessionSecret = process.env.SESSION_SECRET;
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!sessionSecret || !claudeKey) return new Response(JSON.stringify({ errore: "Configurazione server mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ errore: "JSON non valido" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const cookieHeader = req.headers.get("cookie");
  if (!verificaAuth(cookieHeader, sessionSecret)) return new Response(JSON.stringify({ errore: "Non autorizzato" }), { status: 401, headers: { "Content-Type": "application/json" } });

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
      if (!groqKey) return new Response(JSON.stringify({ errore: "GROQ_API_KEY mancante" }), { status: 500, headers: { "Content-Type": "application/json" } });
      const risposta = await chiamaGroq(sp, domanda || "Sintesi finale.", contesto || [], groqKey);
      return new Response(JSON.stringify({ ok: true, agente: "Sintesi finale", emoji: "🔮", ruolo: "Visione d'insieme", modello: "llama", contenuto: risposta }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ errore: "Tipo non valido" }), { status: 400, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ errore: "Errore risposta", dettaglio: String(err.message) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
