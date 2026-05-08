const SPECIALISTI = [
  { id: "maestro_allenatore", nome: "Maestro Allenatore PT",      emoji: "⚽", modello: "claude", gruppo: "pensatori" },
  { id: "filosofo",           nome: "Filosofo",                   emoji: "🌍", modello: "claude", gruppo: "pensatori" },
  { id: "pedagogista",        nome: "Pedagogista",                emoji: "📚", modello: "claude", gruppo: "pensatori" },
  { id: "tuttologo",          nome: "Tuttologo Consapevole",      emoji: "🧭", modello: "claude", gruppo: "pensatori" },
  { id: "neuroscienziato",    nome: "Neuroscienziato",            emoji: "🧠", modello: "claude", gruppo: "pensatori" },
  { id: "tattico",            nome: "Esperto Tattico",            emoji: "♟️", modello: "llama",  gruppo: "specialisti" },
  { id: "tecnico",            nome: "Esperto Tecnico",            emoji: "🎯", modello: "llama",  gruppo: "specialisti" },
  { id: "fisiologo",          nome: "Fisiologo",                  emoji: "🏃", modello: "llama",  gruppo: "specialisti" },
  { id: "psicologo",          nome: "Psicologo dello sport",      emoji: "🧘", modello: "llama",  gruppo: "specialisti" },
  { id: "matematico",         nome: "Matematico complessità",     emoji: "📐", modello: "llama",  gruppo: "specialisti" },
  { id: "economista",         nome: "Economista calcio africano", emoji: "💼", modello: "llama",  gruppo: "specialisti" },
  { id: "traduttore",         nome: "Traduttore-Localizzatore",   emoji: "🌐", modello: "llama",  gruppo: "specialisti" },
  { id: "web_editor",         nome: "Web Editor",                 emoji: "✍️", modello: "llama",  gruppo: "specialisti" }
];

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
const listaPensatori   = document.getElementById("lista-pensatori");
const listaSpecialisti = document.getElementById("lista-specialisti");
const btnSintesi       = document.getElementById("btn-sintesi");
const resetBtn         = document.getElementById("reset-btn");

// LOGIN — nessun bypass automatico
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
  costruisciSidebar();
}

function toggleGruppo(id) {
  document.getElementById(id).classList.toggle("chiuso");
}
window.toggleGruppo = toggleGruppo;

function costruisciSidebar() {
  listaPensatori.innerHTML = "";
  listaSpecialisti.innerHTML = "";
  SPECIALISTI.forEach(sp => {
    const btn = document.createElement("button");
    btn.className = "agente-btn";
    btn.dataset.id = sp.id;
    const badgeClass = sp.modello === "claude" ? "badge-claude" : "badge-llama";
    const badgeLabel = sp.modello === "claude" ? "profondo" : "rapido";
    btn.innerHTML = `
      <span class="btn-emoji">${sp.emoji}</span>
      <span class="btn-nome">${sp.nome}</span>
      <span class="btn-badge ${badgeClass}">${badgeLabel}</span>
    `;
    btn.addEventListener("click", () => {
      const testo = domandaCorrente || domandaInput.value.trim();
      if (!testo) { pulsaDomanda(); return; }
      if (occupato) return;
      eseguiAgente(sp, testo);
    });
    if (sp.gruppo === "pensatori") listaPensatori.appendChild(btn);
    else listaSpecialisti.appendChild(btn);
  });
}

// Invio form — primo agente disponibile tra i pensatori
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const testo = domandaInput.value.trim();
  if (!testo || occupato) return;
  const primo = SPECIALISTI.find(s => s.gruppo === "pensatori");
  eseguiAgente(primo, testo);
});

async function eseguiAgente(sp, testo) {
  if (occupato) return;
  occupato = true;

  const primaRisposta = !domandaCorrente;
  if (primaRisposta) {
    domandaCorrente = testo;
    domandaInput.value = "";
    domandaInput.style.height = "auto";
    rimuoviBenvenuto();
    aggiungiBollaUtente(testo);
  }

  segnaAttivo(sp.id);
  setDisabilitati(true);
  aggiungiSistema(`${sp.emoji} ${sp.nome} sta cercando e pensando…`);
  const ind = mostraIndicatore(sp.nome);
  scorri();

  try {
    const tipo = sp.id === "direttore" ? "direttore" : "specialista";
    const body = { tipo, domanda: domandaCorrente, contesto: conversazione };
    if (tipo === "specialista") body.agente = sp.id;

    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    ind.remove();

    if (res.status === 401) {
      loginScreen.classList.remove("nascosto");
      appScreen.classList.add("nascosto");
      loginError.textContent = "Sessione scaduta — inserisci di nuovo la password";
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
    setDisabilitati(false);
    segnaAttivo(null);
  }
}

btnSintesi.addEventListener("click", async () => {
  if (conversazione.length === 0 || occupato) return;
  occupato = true;
  setDisabilitati(true);
  aggiungiSistema("🔮 Visione d'insieme in elaborazione…");
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
    setDisabilitati(false);
  }
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Nuova conversazione?")) return;
  conversazione = [];
  domandaCorrente = null;
  conversazioneDiv.innerHTML = `
    <div class="msg-benvenuto">
      <h2>Dipartimento Madarom</h2>
      <p>Scrivi la tua domanda e scegli con chi vuoi confrontarti.<br>Sei tu il coordinatore.</p>
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
}

function aggiungiBolla(data, sintesi = false) {
  const div = document.createElement("div");
  div.className = "bolla-agente";
  if (sintesi) div.classList.add("bolla-sintesi");
  if (data.modello === "claude") div.classList.add("bolla-claude");
  else div.classList.add("bolla-llama");

  const badgeClass = data.modello === "claude" ? "badge-claude" : "badge-llama";
  const badgeLabel = data.modello === "claude" ? "profondo" : "rapido";

  const header = document.createElement("div");
  header.className = "agente-header";
  header.innerHTML = `
    <div class="agente-emoji">${data.emoji || "🟡"}</div>
    <div>
      <div class="agente-nome">${esc(data.agente || "")} <span class="badge-modello ${badgeClass}">${badgeLabel}</span></div>
      <div class="agente-ruolo">${esc(data.ruolo || "")}</div>
    </div>`;

  const contenuto = document.createElement("div");
  contenuto.className = "agente-contenuto";
  contenuto.innerHTML = formatta(data.contenuto || "");

  div.appendChild(header);
  div.appendChild(contenuto);
  conversazioneDiv.appendChild(div);

  setTimeout(() => div.scrollIntoView({ behavior: "smooth", block: "end" }), 80);
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

function pulsaDomanda() {
  domandaInput.style.borderColor = "#c0392b";
  domandaInput.focus();
  setTimeout(() => { domandaInput.style.borderColor = ""; }, 900);
}

function setDisabilitati(dis) {
  inviaBtn.disabled = dis;
  btnSintesi.disabled = dis;
  document.querySelectorAll(".agente-btn").forEach(b => b.disabled = dis);
}

function aggiornaSintesi() {
  btnSintesi.classList.toggle("nascosto", conversazione.length === 0);
}

function segnaAttivo(id) {
  document.querySelectorAll(".agente-btn").forEach(b => {
    b.classList.toggle("attivo", id !== null && b.dataset.id === id);
  });
}

function scorri() {
  requestAnimationFrame(() => {
    conversazioneDiv.scrollTop = conversazioneDiv.scrollHeight;
  });
}

domandaInput.addEventListener("input", () => {
  domandaInput.style.height = "auto";
  domandaInput.style.height = Math.min(domandaInput.scrollHeight, 160) + "px";
  if (domandaInput.value.trim() !== domandaCorrente) domandaCorrente = null;
});

domandaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});
