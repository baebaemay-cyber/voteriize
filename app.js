import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, onSnapshot, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("en-US");
const esc = (t) => { const d = document.createElement("div"); d.textContent = t == null ? "" : t; return d.innerHTML.replace(/"/g, "&quot;"); };
const hhmm = (t) => t ? new Date(t).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-";

// ดาวพื้นหลัง
(() => {
  const fr = document.createDocumentFragment();
  for (let i = 0; i < 22; i++) {
    const s = document.createElement("div");
    s.className = "star"; s.textContent = i % 3 ? "✦" : "★";
    s.style.left = Math.random() * 96 + "vw"; s.style.top = Math.random() * 96 + "vh";
    s.style.fontSize = 10 + Math.random() * 18 + "px";
    fr.appendChild(s);
  }
  document.body.appendChild(fr);
})();

if (firebaseConfig.apiKey.startsWith("YOUR")) {
  $("list").innerHTML = '<div class="msg">ยังไม่ได้ตั้งค่า Firebase — ดู README.md และแก้ไฟล์ firebase-config.js</div>';
  throw new Error("Firebase not configured");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let filter = "all", aev = "mama", user = null, showAdmin = false;
const pub = { mama: null, mma: null };
const priv = { mama: { items: [], url: "", tag: "" }, mma: { items: [], url: "", tag: "" } };

const tweet = (text, tag) =>
  "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text + (tag ? " " + tag : "")) + "&url=" + encodeURIComponent(location.href.split("#")[0]);

const acts = (d, text) =>
  '<div class="acts">' +
  (d.url ? `<a class="btn w" target="_blank" rel="noopener" href="${esc(d.url)}">โหวตเลย ↗</a>` : "") +
  `<a class="btn" target="_blank" rel="noopener" href="${tweet(text, d.tag)}">แชร์ทวิต 🐦</a></div>`;

function section(k) {
  const d = pub[k];
  let h = `<h3>${k.toUpperCase()}</h3>`;
  if (!d || !d.items || !d.items.length) return h + '<div class="msg">ยังไม่มีข้อมูล</div>';
  d.items.forEach((it, i) => {
    let inner, foot, share;
    if (k === "mama") {
      const p = it.pct.toFixed(1);
      inner = `<div class="top"><span class="chip"><span class="dot"></span>MAMA</span><span class="cnt">อันดับ ${i + 1}</span></div>
        <div class="name">${esc(it.name)}</div>
        <div class="track"><div class="fill" style="width:${Math.min(100, it.pct)}%"></div><div class="pct">${p}%</div></div>`;
      foot = `<div class="info">อัปเดตล่าสุด: ${hhmm(d.updated)}</div>`;
      share = `MAMA: ${it.name} ตอนนี้ได้ ${p}% แล้ว! ช่วยกันโหวตให้ติดอันดับกันนะ 💜`;
    } else {
      const a = it.above, lead = !!it.lead;
      const mx = Math.max(it.votes, a ? a.votes : 0) || 1;
      const w1 = it.votes * 100 / mx, w2 = a ? a.votes * 100 / mx : 0;
      const em = a ? esc(a.emoji || "⭐") : "";
      inner = `<div class="top"><span class="chip"><span class="dot b"></span>MMA</span></div>
        <div class="track"><div class="fill" style="width:${w1}%"></div><div class="lab">${esc(it.name)}</div><div class="pct">${fmt(it.votes)}</div></div>` +
        (a ? `<div class="track t2"><div class="fill f2" style="width:${w2}%"></div><div class="lab">${em}</div><div class="pct">${fmt(a.votes)}</div></div>` : "");
      foot = `<div class="info">${lead ? `นำ ${em} อยู่ <b>${fmt(it.gap)}</b> โหวต` : `ขาดอีก <b>${fmt(it.gap)}</b> โหวต เพื่อแซง ${em} ขึ้นอันดับ`}<br>อัปเดตล่าสุด: ${hhmm(d.updated)}</div>`;
      share = lead
        ? `${it.name} นำ ${a ? (a.emoji || "⭐") : ""} อยู่ ${fmt(it.gap)} โหวต! ช่วยกันโหวตรักษาตำแหน่งนะ 👑`
        : `${it.name} ขาดอีก ${fmt(it.gap)} โหวต จะแซง ${a ? (a.emoji || "⭐") : ""} ขึ้นอันดับแล้ว! ช่วยกันโหวตหน่อยนะ 🔥`;
    }
    h += `<div class="card">${inner}<div class="foot">${foot}${acts(d, share)}</div></div>`;
  });
  return h;
}

function renderList() {
  $("list").innerHTML = (filter !== "mma" ? section("mama") : "") + (filter !== "mama" ? section("mma") : "");
}

function renderAdmin() {
  const el = $("admin");
  $("adminToggle").textContent = user ? "ADMIN ✓" : "ADMIN";
  if (!showAdmin) { el.innerHTML = ""; return; }
  if (!user) {
    el.innerHTML = `<div class="panel"><h2>ADMIN LOGIN</h2>
      <input class="s" id="em" type="email" placeholder="อีเมล" autocomplete="username">
      <input class="s" id="pw" type="password" placeholder="รหัสผ่าน" autocomplete="current-password">
      <div class="acts"><button class="btn w" id="login">เข้าสู่ระบบ</button></div><div id="st" class="note"></div></div>`;
    const go = async () => {
      $("st").textContent = "กำลังเข้าสู่ระบบ...";
      try { await signInWithEmailAndPassword(auth, $("em").value.trim(), $("pw").value); }
      catch (e) { $("st").textContent = "เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมล/รหัสผ่าน"; }
    };
    $("login").onclick = go;
    $("pw").onkeydown = (e) => { if (e.key === "Enter") go(); };
    return;
  }
  const P = priv[aev], rows = P.items, mma = aev === "mma";
  let h = `<div class="panel"><h2>ADMIN</h2>
    <div class="pills"><button class="pill${aev === "mama" ? " on" : ""}" data-a="mama">MAMA</button><button class="pill${mma ? " on" : ""}" data-a="mma">MMA</button></div>
    <input class="s" id="url" placeholder="ลิงก์ไปโหวต (ไม่บังคับ)" value="${esc(P.url)}">
    <input class="s" id="tag" placeholder="แฮชแท็กสำหรับทวิต เช่น #MAMA2026" value="${esc(P.tag)}">`;
  rows.forEach((r, i) => {
    h += `<div class="row"><input class="n" data-i="${i}" placeholder="ชื่อ" value="${esc(r.name)}">` +
      (mma ? `<input class="e" data-i="${i}" placeholder="😀" value="${esc(r.emoji)}"><label><input type="checkbox" class="m" data-i="${i}"${r.mine ? " checked" : ""}>ของเรา</label>` : "") +
      `<input class="v" data-i="${i}" type="number" min="0" inputmode="numeric" placeholder="ยอดโหวต" value="${r.votes || 0}"><button class="btn x" data-del="${i}">✕</button></div>`;
  });
  h += `<div class="acts"><button class="btn" id="add">+ เพิ่มรายชื่อ</button><button class="btn w" id="save">บันทึก</button><button class="btn" id="out">ออกจากระบบ</button></div><div id="st" class="note"></div></div>`;
  el.innerHTML = h;
  el.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => { aev = b.dataset.a; renderAdmin(); });
  el.querySelectorAll("input.n").forEach((x) => x.oninput = () => rows[x.dataset.i].name = x.value);
  el.querySelectorAll("input.e").forEach((x) => x.oninput = () => rows[x.dataset.i].emoji = x.value);
  el.querySelectorAll("input.v").forEach((x) => x.oninput = () => rows[x.dataset.i].votes = Number(x.value) || 0);
  el.querySelectorAll("input.m").forEach((x) => x.onchange = () => { rows.forEach((r) => r.mine = false); rows[x.dataset.i].mine = x.checked; renderAdmin(); });
  $("url").oninput = (e) => P.url = e.target.value;
  $("tag").oninput = (e) => P.tag = e.target.value;
  el.querySelectorAll("[data-del]").forEach((b) => b.onclick = () => { rows.splice(+b.dataset.del, 1); renderAdmin(); });
  $("add").onclick = () => { rows.push({ name: "", emoji: "", votes: 0 }); renderAdmin(); };
  $("save").onclick = save;
  $("out").onclick = () => signOut(auth);
}

async function save() {
  const k = aev, P = priv[k];
  const rows = P.items.filter((r) => (r.name || "").trim())
    .map((r) => ({ name: r.name.trim(), emoji: (r.emoji || "").trim(), votes: Number(r.votes) || 0, mine: !!r.mine }));
  const s = rows.slice().sort((a, b) => b.votes - a.votes);
  const total = s.reduce((t, r) => t + r.votes, 0);
  let items;
  if (k === "mama") {
    items = s.map((r) => ({ name: r.name, pct: total ? r.votes * 100 / total : 0 }));
  } else {
    let mi = s.findIndex((r) => r.mine);
    if (mi < 0) mi = s.findIndex((r) => /riize/i.test(r.name));
    if (mi < 0) { $("st").textContent = 'กรุณาติ๊ก "ของเรา" ที่รายชื่อของเราก่อน'; return; }
    const me = s[mi], ab = mi === 0 ? s[1] : s[mi - 1];
    items = [{ name: me.name, votes: me.votes, lead: mi === 0, above: ab ? { emoji: ab.emoji, votes: ab.votes } : null,
      gap: !ab ? 0 : (mi === 0 ? me.votes - ab.votes : ab.votes - me.votes + 1) }];
  }
  $("st").textContent = "กำลังบันทึก...";
  try {
    const meta = { url: (P.url || "").trim(), tag: (P.tag || "").trim() };
    await setDoc(doc(db, "private", k), { items: rows, ...meta });
    await setDoc(doc(db, "public", k), { items, ...meta, updated: Date.now() });
    P.items = rows;
    $("st").textContent = "บันทึกแล้ว ✓";
  } catch (e) { $("st").textContent = "บันทึกไม่สำเร็จ: " + (e.message || e); }
}

document.querySelectorAll("#filters .pill").forEach((b) => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll("#filters .pill").forEach((x) => x.classList.toggle("on", x === b));
  renderList();
});
$("adminToggle").onclick = () => { showAdmin = !showAdmin; renderAdmin(); };

["mama", "mma"].forEach((k) =>
  onSnapshot(doc(db, "public", k), (s) => { pub[k] = s.exists() ? s.data() : null; renderList(); },
    () => { $("list").innerHTML = '<div class="msg">โหลดข้อมูลไม่ได้ ตรวจสอบ Firestore rules</div>'; }));

onAuthStateChanged(auth, async (u) => {
  user = u;
  if (u) {
    for (const k of ["mama", "mma"]) {
      try {
        const s = await getDoc(doc(db, "private", k));
        const d = s.exists() ? s.data() : {};
        priv[k] = { items: d.items || [], url: d.url || "", tag: d.tag || "" };
      } catch (e) { /* ไม่ใช่แอดมิน */ }
    }
  }
  renderAdmin();
});
renderList();
