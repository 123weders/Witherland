// ===== Настройки сервера =====
const SERVER = {
  name: "WitherLand",
  ip: "mc.witherland.ru",
  version: "1.8 – 26.3",
  core: "Purpur",
  serverVersion: "1.21.11",
  discord: "#",
  modes: [
    { name: "SMP 1", active: true, icon: "⚔️", desc: "Классическое выживание" },
    { name: "SMP 2", active: true, icon: "🛡️", desc: "Выживание с приватами" },
    { name: "SMP 3", active: false, icon: "🌍", desc: "Скоро открытие" },
    { name: "...", active: false, icon: "✨", desc: "Новые режимы" },
    { name: "SMP 14", active: false, icon: "👑", desc: "Скоро открытие" }
  ]
};

const PAGES = [
  { file: "index.html", title: "Главная" },
  { file: "rules.html", title: "Правила" },
  { file: "status.html", title: "Статус" },
  { file: "info.html", title: "О сервере" }
];

function go(page) { window.location.href = page; }

function toast(text) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = text; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800);
}

function copyIP() {
  const done = () => toast("IP " + SERVER.ip + " скопирован!");
  if (navigator.clipboard) navigator.clipboard.writeText(SERVER.ip).then(done).catch(done);
  else done();
}

function buildLayout() {
  const current = location.pathname.split("/").pop() || "index.html";
  const links = PAGES.map(p =>
    `<a class="nav-link ${p.file === current ? "active" : ""}" href="${p.file}">${p.title}</a>`).join("");
  const h = document.getElementById("site-header");
  if (h) h.innerHTML = `
    <div class="nav">
      <a class="logo" href="index.html"><span class="logo-icon">☠</span>${SERVER.name}</a>
      <nav id="menu">${links}<a class="nav-link discord-link" href="#">Discord</a></nav>
      <button class="btn btn-ip" onclick="copyIP()"><span class="server-ip"></span></button>
      <button class="burger" aria-label="Меню" onclick="document.getElementById('menu').classList.toggle('open')">☰</button>
    </div>`;
  const f = document.getElementById("site-footer");
  if (f) f.innerHTML = `
    <div class="footer-grid">
      <div><div class="logo">☠ ${SERVER.name}</div><p>Minecraft сервер с несколькими режимами выживания.</p></div>
      <div><h4>Страницы</h4>${PAGES.map(p => `<a href="${p.file}">${p.title}</a>`).join("")}</div>
      <div><h4>Подключение</h4><a href="#" onclick="copyIP();return false">IP: <span class="server-ip"></span></a><a href="info.html">Как зайти</a><a class="discord-link" href="#">Discord</a></div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${SERVER.name} — не является продуктом Mojang AB</div>`;
}

function fillData() {
  const set = (c, v) => document.querySelectorAll(c).forEach(e => e.textContent = v);
  set(".server-ip", SERVER.ip); set(".server-version", SERVER.version);
  set(".server-core", SERVER.core); set(".server-sversion", SERVER.serverVersion);
  set(".modes-count", SERVER.modes.filter(m => m.active).length);
  document.querySelectorAll(".discord-link").forEach(e => e.href = SERVER.discord);
  document.querySelectorAll(".modes").forEach(box => {
    box.innerHTML = SERVER.modes.map(m => `
      <div class="mode ${m.active ? "on" : "soon"} reveal">
        <div class="mode-icon">${m.icon}</div><h3>${m.name}</h3><p>${m.desc}</p>
        <span class="badge">${m.active ? "Доступен" : "Скоро"}</span>
      </div>`).join("");
  });
}

async function loadStatus() {
  const q = id => document.getElementById(id);
  const text = (id, v) => { const e = q(id); if (e) e.textContent = v; };
  const box = q("status-box");
  try {
    const d = await (await fetch("https://api.mcsrvstat.us/3/" + SERVER.ip)).json();
    document.querySelectorAll(".online-count").forEach(e => e.textContent = d.online ? d.players.online : 0);
    if (!box) return;
    if (d.online) {
      box.className = "card status-card online";
      text("st-state", "Сервер онлайн");
      text("st-players", d.players.online + " / " + d.players.max);
      text("st-version", d.version || SERVER.version);
      text("st-motd", d.motd && d.motd.clean ? d.motd.clean.join(" ") : "");
      const list = q("st-list");
      if (list) list.innerHTML = (d.players.list || []).map(p => `<li>${p.name}</li>`).join("") || "<li class='empty'>Список скрыт или никого нет</li>";
    } else {
      box.className = "card status-card offline";
      text("st-state", "Сервер оффлайн"); text("st-players", "0 / 0");
    }
  } catch (e) {
    document.querySelectorAll(".online-count").forEach(x => x.textContent = "—");
    if (box) { box.className = "card status-card offline"; text("st-state", "Не удалось получить статус"); }
  }
}

function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("shown"); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(e => io.observe(e));
}

document.addEventListener("DOMContentLoaded", () => {
  buildLayout(); fillData(); loadStatus(); initReveal();
  const r = document.getElementById("refresh");
  if (r) r.addEventListener("click", () => { document.getElementById("st-state").textContent = "Загрузка..."; loadStatus(); });
});
