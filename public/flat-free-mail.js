"use strict";
const $ = (s) => document.querySelector(s);
const loginView = $("#login-view");
const mailView = $("#mail-view");
const loginForm = $("#login-form");
const loginStatus = $("#login-status");
const list = $("#message-list");
const listStatus = $("#list-status");
const reader = $("#reader");
const folderTitle = $("#folder-title");
const composer = $("#composer");
const composeForm = $("#compose-form");
let currentFolder = "inbox";

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Accept": "application/json", ...(options.method === "POST" ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== "/api/mail/login") showLogin();
    throw new Error(data.error || "Não foi possível concluir a operação.");
  }
  return data;
}
function showLogin() {
  loginView.hidden = false; mailView.hidden = true;
  list.replaceChildren(); reader.replaceChildren();
  composeForm.reset(); composer.close();
}
function showMail() { loginView.hidden = true; mailView.hidden = false; }
function formatDate(value) {
  if (!value) return "";
  try { return new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(value)); } catch { return value; }
}
function addressOnly(value) {
  const match = String(value || "").match(/<([^<>]+)>/);
  return match ? match[1] : String(value || "");
}
async function loadFolder(folder = currentFolder) {
  currentFolder = folder;
  folderTitle.textContent = folder === "inbox" ? "Caixa de entrada" : "Enviados";
  document.querySelectorAll("[data-folder]").forEach(btn => btn.classList.toggle("active", btn.dataset.folder === folder));
  list.innerHTML = "";
  listStatus.textContent = "Carregando…";
  reader.innerHTML = '<div class="empty-state">Selecione uma mensagem.</div>';
  try {
    const data = await api(folder === "inbox" ? "/api/mail/inbox" : "/api/mail/sent");
    const rows = data.data || [];
    if (!rows.length) {
      listStatus.textContent = folder === "inbox" ? "Nenhuma mensagem recebida." : "Nenhum e-mail enviado.";
      return;
    }
    listStatus.textContent = "";
    rows.forEach(row => {
      const button = document.createElement("button");
      button.className = "message-row";
      const primary = folder === "inbox" ? row.from : (row.to || []).join(", ");
      button.innerHTML = "<strong></strong><span class='subject'></span><span class='date'></span>";
      button.querySelector("strong").textContent = primary || "(sem remetente)";
      button.querySelector(".subject").textContent = row.subject || "(sem assunto)";
      button.querySelector(".date").textContent = formatDate(row.created_at || row.received_at);
      button.addEventListener("click", () => openMessage(folder === "inbox" ? "received" : "sent", row.id, button));
      list.appendChild(button);
    });
  } catch (error) { listStatus.textContent = error.message; }
}
async function openMessage(kind, id, button) {
  document.querySelectorAll(".message-row").forEach(row => row.classList.remove("active"));
  button?.classList.add("active");
  reader.innerHTML = '<div class="empty-state">Abrindo mensagem…</div>';
  try {
    const msg = await api(`/api/mail/message?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`);
    reader.innerHTML = "";
    const wrap = document.createElement("article");
    wrap.className = "reader";
    const h = document.createElement("h1"); h.textContent = msg.subject;
    const meta = document.createElement("div"); meta.className = "reader-meta";
    [["De",msg.from],["Para",(msg.to||[]).join(", ")],["Data",formatDate(msg.created_at)]].forEach(([label,value])=>{
      const p=document.createElement("div"); p.textContent=`${label}: ${value || ""}`; meta.appendChild(p);
    });
    const body=document.createElement("div"); body.className="reader-body"; body.textContent=msg.text || "(sem conteúdo de texto)";
    wrap.append(h,meta,body);
    if (kind === "received") {
      const actions=document.createElement("div"); actions.className="reader-actions";
      const reply=document.createElement("button"); reply.textContent="Responder";
      reply.addEventListener("click",()=>openComposer({to:addressOnly((Array.isArray(msg.reply_to) ? msg.reply_to[0] : msg.reply_to) || msg.from),subject:/^re:/i.test(msg.subject)?msg.subject:`Re: ${msg.subject}`,replyId:msg.id}));
      actions.appendChild(reply); wrap.appendChild(actions);
    }
    reader.appendChild(wrap);
  } catch(error) {
    reader.innerHTML="";
    const p=document.createElement("p"); p.className="status"; p.textContent=error.message; reader.appendChild(p);
  }
}
function openComposer(values = {}) {
  $("#compose-title").textContent = values.replyId ? "Responder" : "Novo e-mail";
  $("#reply-id").value = values.replyId || "";
  $("#to").value = values.to || "";
  $("#cc").value = "";
  $("#bcc").value = "";
  $("#subject").value = values.subject || "";
  $("#message").value = "";
  $("#compose-status").textContent = "";
  composer.showModal();
  setTimeout(() => (values.to ? $("#message") : $("#to")).focus(), 50);
}
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent="Entrando…";
  try {
    await api("/api/mail/login",{method:"POST",body:JSON.stringify({password:$("#password").value})});
    $("#password").value="";
    showMail();
    await loadFolder("inbox");
  } catch(error) { loginStatus.textContent=error.message; }
});
$("#logout").addEventListener("click",async()=>{await api("/api/mail/logout",{method:"POST"}).catch(()=>{});showLogin();});
$("#compose").addEventListener("click",()=>openComposer());
$("#refresh").addEventListener("click",()=>loadFolder());
document.querySelectorAll("[data-folder]").forEach(btn=>btn.addEventListener("click",()=>loadFolder(btn.dataset.folder)));
composeForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const status=$("#compose-status");
  status.textContent="Enviando…";
  const payload={to:$("#to").value,cc:$("#cc").value,bcc:$("#bcc").value,subject:$("#subject").value,message:$("#message").value,replyId:$("#reply-id").value || undefined};
  try {
    await api("/api/mail/send",{method:"POST",body:JSON.stringify(payload)});
    status.textContent="Enviado.";
    setTimeout(()=>composer.close(),350);
    await loadFolder("sent");
  } catch(error) { status.textContent=error.message; }
});
(async()=>{try{const status=await api("/api/mail/status");if(status.authenticated){showMail();await loadFolder("inbox");}else showLogin();}catch{showLogin();}})();

