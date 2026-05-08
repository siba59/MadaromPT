const SPECIALISTI = {
  maestro_allenatore: { id: "maestro_allenatore", nome: "Maestro Allenatore PT", emoji: "⚽", ruolo: "PT come paradigma con molti interpreti" },
  filosofo:           { id: "filosofo",           nome: "Filosofo",               emoji: "🌍", ruolo: "Patrimonio filosofico applicato al calcio" },
  pedagogista:        { id: "pedagogista",         nome: "Pedagogista",            emoji: "📚", ruolo: "Formare formatori, didattica per adulti" },
  tuttologo:          { id: "tuttologo",           nome: "Tuttologo Consapevole",  emoji: "🧭", ruolo: "Costruttore di ponti tra discipline" },
  neuroscienziato:    { id: "neuroscienziato",     nome: "Neuroscienziato",        emoji: "🧠", ruolo: "Neuroscienze applicate alla PT" },
  tattico:            { id: "tattico",             nome: "Esperto Tattico",        emoji: "♟️", ruolo: "Analisi tattica in chiave PT" },
  tecnico:            { id: "tecnico",             nome: "Esperto Tecnico",        emoji: "🎯", ruolo: "Tecnica dentro il modello di gioco" },
  fisiologo:          { id: "fisiologo",           nome: "Fisiologo",              emoji: "🏃", ruolo: "Fisiologia specifica nel morfociclo PT" },
  psicologo:          { id: "psicologo",           nome: "Psicologo dello sport",  emoji: "🧘", ruolo: "Gruppo come sistema vivente" },
  matematico:         { id: "matematico",          nome: "Matematico complessita", emoji: "📐", ruolo: "Sistemi complessi e PT" },
  economista:         { id: "economista",          nome: "Economista calcio africano", emoji: "💼", ruolo: "Academy PT e mercati formativi in Africa" },
  traduttore:         { id: "traduttore",          nome: "Traduttore-Localizzatore",   emoji: "🌐", ruolo: "Resa multilingua della PT" },
  web_editor:         { id: "web_editor",          nome: "Web Editor",             emoji: "✍️", ruolo: "Comunicazione digitale Madarom" },
  direttore:          { id: "direttore",           nome: "Visione d insieme",      emoji: "🔮", ruolo: "Sintesi trasversale - solo su richiesta" }
};

let conversazione   = [];
let domandaCorrente = null;
let occupato        = false;

const loginScreen      = document.getElementById("login-screen");
const appScreen        = document.getElementById("app-screen");
const loginForm        = document.getElementById("login-form");
const passwordInput    = document.getElementById("password-input");
const loginBtn         = document.getElementById("login-btn");
const loginError       = document.getElementById("login-error");
const conversazioneDiv = document.getElementById("conversazione");
const chatForm         = document.getElementById("chat-form");
const domandaInput     = document.getElementById("domanda-input");
const inviaBtn         = document.getElementById("invia-btn");
const agenteSelect     = document.getElementById("agente-select");
const btnSintesi       = document.getElementById("btn-sintesi");
const resetBtn         = document.getElementById("reset-btn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = passwordInput.value.trim();
  if (!password) return;
  loginBtn.disabled = true;
  loginBtn.textContent = "Verifica…";
  loginError.textContent = "";
  try {
    const res = await fetch("/.netlify/functions/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.ok) {
      mostraApp();
      passwordInput.value = "";
    } else {
      loginError.textContent = data.errore || "Password errata";
    }
  } catch {
    loginError.textContent = "Errore di connessione";
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Entra";
  }
});

function mostraApp() {
  loginScreen.classList.add("nascosto");
  appScreen.classList.remove("nascosto");
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const testo = domandaInput.value.trim();
  if (!testo || occupato) return;
  const id = agenteSelect.value;
  const sp = SPECIALISTI[id];
  if (!sp) return;
  eseguiAgente(sp, testo);
});

async function eseguiAgente(sp, testo) {
  if (occupato) return;
  occupato = true;

  const primaRisposta = !domandaCorrente;
  if (primaRisposta) {
    domandaCorrente = testo;
    rimuoviBenvenuto();
    aggiungiBollaUtente(testo);
  }

  // Rimette sempre la domanda nel campo dopo l'invio
  domandaInput.value = domandaCorrente;
  domandaInput.style.height = "auto";
  domandaInput.style.height = Math.min(domandaInput.scrollHeight, 140) + "px";

  inviaBtn.disabled = true;
  btnSintesi.disabled = true;
  aggiungiSistema(sp.emoji + " " + sp.nome + " sta pensando…");
  const ind = mostraIndicatore(sp.nome);
  scorri();

  try {
    const body = { tipo: "specialista", domanda: domandaCorrente, agente: sp.id, contesto: conversazione };
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    ind.remove();
    if (res.status === 401) {
      loginScreen.classList.remove("nascosto");
      appScreen.classList.add("nascosto");
      loginError.textContent = "Sessione scaduta";
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      mostraErrore((data.errore || "Errore") + (data.dettaglio ? " — " + data.dettaglio : ""));
      return;
    }
    aggiungiBolla(data);
    conversazione.push({ agente: data.agente, contenuto: data.contenuto });
    aggiornaSintesi();
    scorri();
  } catch (err) {
    ind.remove();
    mostraErrore("Errore di connessione: " + err.message);
  } finally {
    occupato = false;
    inviaBtn.disabled = false;
    btnSintesi.disabled = false;
  }
}

btnSintesi.addEventListener("click", async () => {
  if (conversazione.length === 0 || occupato) return;
  occupato = true;
  inviaBtn.disabled = true;
  btnSintesi.disabled = true;
  aggiungiSistema("🔮 Visione d insieme in elaborazione…");
  const ind = mostraIndicatore("Elaborazione");
  scorri();
  try {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "sintesi", domanda: domandaCorrente, contesto: conversazione })
    });
    ind.remove();
    if (res.status === 401) { loginScreen.classList.remove("nascosto"); appScreen.classList.add("nascosto"); return; }
    const data = await res.json();
    if (!data.ok) { mostraErrore(data.errore || "Errore"); return; }
    aggiungiBolla(data, true);
    conversazione.push({ agente: data.agente, contenuto: data.contenuto });
    scorri();
  } catch (err) {
    ind.remove();
    mostraErrore("Errore: " + err.message);
  } finally {
    occupato = false;
    inviaBtn.disabled = false;
    btnSintesi.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Nuova conversazione?")) return;
  conversazione = [];
  domandaCorrente = null;
  domandaInput.value = "";
  domandaInput.style.height = "auto";
  conversazioneDiv.innerHTML = `
    <div class="msg-benvenuto">
      <h2>Dipartimento Madarom</h2>
      <p>Scegli un agente dal menu, scrivi la domanda e premi →</p>
    </div>`;
  aggiornaSintesi();
});

function rimuoviBenvenuto() {
  const el = conversazioneDiv.querySelector(".msg-benvenuto");
  if (el) el.remove();
}

function aggiungiBollaUtente(testo) {
  const div = document.createElement("div");
  div.className = "bolla-utente";
  div.textContent = testo;
  conversazioneDiv.appendChild(div);
  scorri();
}

function aggiungiBolla(data, sintesi = false) {
  const div = document.createElement("div");
  div.className = "bolla-agente";
  if (sintesi) div.classList.add("bolla-sintesi");
  const header = document.createElement("div");
  header.className = "agente-header";
  header.innerHTML = `
    <div class="agente-emoji">${data.emoji || "🟡"}</div>
    <div>
      <div class="agente-nome">${esc(data.agente || "")}</div>
      <div class="agente-ruolo">${esc(data.ruolo || "")}</div>
    </div>`;
  const contenuto = document.createElement("div");
  contenuto.className = "agente-contenuto";
  contenuto.innerHTML = formatta(data.contenuto || "");
  div.appendChild(header);
  div.appendChild(contenuto);
  conversazioneDiv.appendChild(div);
  scorri();
}

function formatta(testo) {
  return testo
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function mostraIndicatore(nome) {
  const div = document.createElement("div");
  div.className = "indicatore-scrittura";
  div.innerHTML = `<span>${esc(nome)}</span><div class="puntini"><span></span><span></span><span></span></div>`;
  conversazioneDiv.appendChild(div);
  scorri();
  return div;
}

function aggiungiSistema(testo) {
  const div = document.createElement("div");
  div.className = "msg-sistema";
  div.textContent = testo;
  conversazioneDiv.appendChild(div);
  scorri();
}

function mostraErrore(msg) {
  const div = document.createElement("div");
  div.className = "bolla-agente";
  div.style.borderLeftColor = "#c0392b";
  div.innerHTML = `
    <div class="agente-header"><div class="agente-emoji">⚠️</div><div><div class="agente-nome">Errore</div></div></div>
    <div class="agente-contenuto"><p>${esc(msg)}</p></div>`;
  conversazioneDiv.appendChild(div);
  scorri();
}

function aggiornaSintesi() {
  btnSintesi.classList.toggle("nascosto", conversazione.length === 0);
}

function scorri() {
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 200);
}

domandaInput.addEventListener("input", () => {
  domandaInput.style.height = "auto";
  domandaInput.style.height = Math.min(domandaInput.scrollHeight, 140) + "px";
});

domandaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});
