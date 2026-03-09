"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const APIKEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

const P = {
  yellow: "#FCD23A", blue: "#428BCA", dark: "#232323",
  light: "#F5F5F5", white: "#ffffff",
  t82: "rgba(255,255,255,0.82)", t72: "rgba(255,255,255,0.72)",
  g4: "#444", g5: "#555", g6: "#666",
};

const BW = 1140, BH = 751;
const FONT = "Funnel Sans, sans-serif";

/* ───── canvas helpers ───── */
function cover(ctx, img, w, h) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  ctx.drawImage(img, (w - img.naturalWidth * s) / 2, (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
}

function wrapLines(ctx, words, maxW) {
  const lines = []; let row = [], rw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w + " ").width;
    if (row.length && rw + ww > maxW) { lines.push(row); row = [w]; rw = ww; }
    else { row.push(w); rw += ww; }
  }
  if (row.length) lines.push(row);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function paint(cvs, s) {
  const ctx = cvs.getContext("2d");
  ctx.clearRect(0, 0, BW, BH);

  // background
  if (s.img) cover(ctx, s.img, BW, BH);
  else {
    ctx.fillStyle = P.light; ctx.fillRect(0, 0, BW, BH);
    ctx.fillStyle = P.g6; ctx.font = `600 22px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("← Wybierz zdjęcie z biblioteki", BW / 2, BH / 2);
    ctx.textAlign = "start";
  }

  // overlay
  if (s.ov > 0) {
    const [a, b] = s.ovTop ? [0, BH * 0.65] : [BH * 0.2, BH];
    const g = ctx.createLinearGradient(0, a, 0, b);
    g.addColorStop(0, s.ovTop ? `rgba(0,0,0,${s.ov})` : "rgba(0,0,0,0)");
    g.addColorStop(1, s.ovTop ? "rgba(0,0,0,0)" : `rgba(0,0,0,${s.ov})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, BW, BH);
  }

  // determine text block bottom position
  const hasSub = s.sub.trim().length > 0;
  const hasTags = s.tags.trim().length > 0;
  let bottomReserve = 30;
  if (hasTags) bottomReserve += 60;
  if (hasSub) bottomReserve += 55;

  // label (small text above headline)
  let labelBottom = 0;
  if (s.label.trim()) {
    const lFont = `700 14px ${FONT}`;
    ctx.font = lFont;
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const ly = s.pos === "top" ? 50
             : s.pos === "center" ? (BH - 80) / 2 - 10
             : BH - bottomReserve - (s.head.trim() ? s.hPx * wrapLines(ctx, s.head.trim().split(/\s+/), BW - 100).length * 1.12 + 20 : 40) - 20;
    ctx.fillStyle = P.yellow;
    ctx.fillText(s.label.toUpperCase(), BW / 2, ly);
    ctx.letterSpacing = "0px";
    labelBottom = ly + 8;
  }

  // headline
  if (s.head.trim()) {
    const it = s.hIt ? "italic " : "";
    const font = `${it}${s.hBold ? "800" : "700"} ${s.hPx}px ${FONT}`;
    ctx.font = font;
    const hlSet = new Set(s.hlH.map(w => w.toLowerCase()));
    const lines = wrapLines(ctx, s.head.trim().split(/\s+/), BW - 100);
    const lh = s.hPx * 1.12;
    const total = lines.length * lh;

    let y0;
    if (s.pos === "top") y0 = (labelBottom || 50) + s.hPx + 4;
    else if (s.pos === "center") y0 = (BH - total) / 2 + s.hPx;
    else y0 = BH - bottomReserve - total + s.hPx - 10;

    ctx.textBaseline = "alphabetic";
    for (let li = 0; li < lines.length; li++) {
      const ln = lines[li], y = y0 + li * lh;
      ctx.font = font;
      const lw = ctx.measureText(ln.join(" ")).width;
      let x = (BW - lw) / 2;
      ctx.textAlign = "left";
      for (let wi = 0; wi < ln.length; wi++) {
        const wd = ln[wi], sp = wi < ln.length - 1 ? wd + " " : wd;
        ctx.font = font;
        ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
        ctx.fillStyle = hlSet.has(wd.toLowerCase()) ? s.cHl : s.cTx;
        ctx.fillText(sp, x, y);
        x += ctx.measureText(sp).width;
      }
    }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }

  // subtitle bar
  if (hasSub) {
    const sf = `700 ${s.sPx}px ${FONT}`;
    ctx.font = sf;
    const words = s.sub.trim().split(/\s+/);
    const sSet = new Set(s.hlS.map(w => w.toLowerCase()));
    const fw = ctx.measureText(s.sub.trim()).width;
    const px = 30, py = 12;
    const bw = fw + px * 2, bh = s.sPx + py * 2;
    const bx = (BW - bw) / 2;
    const by = hasTags ? BH - bh - 70 : BH - bh - 25;

    roundRect(ctx, bx, by, bw, bh, s.rnd ? 10 : 0);
    ctx.fillStyle = P.yellow; ctx.fill();

    let tx = bx + px;
    const ty = by + py + s.sPx * 0.8;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    for (let i = 0; i < words.length; i++) {
      const w = words[i], isH = sSet.has(w.toLowerCase());
      const ws = i < words.length - 1 ? w + " " : w;
      ctx.font = isH ? `800 italic ${s.sPx}px ${FONT}` : sf;
      ctx.fillStyle = isH ? s.cSh : P.dark;
      ctx.fillText(ws, tx, ty);
      tx += ctx.measureText(ws).width;
    }
  }

  // bottom tags/badges
  if (hasTags) {
    const tagArr = s.tags.split(",").map(t => t.trim()).filter(Boolean);
    const tagFont = `700 13px ${FONT}`;
    ctx.font = tagFont;
    const tagH = 36, tagR = 20, tagGap = 14, tagPx = 22;

    // measure total width
    let totalW = 0;
    const widths = tagArr.map(t => {
      const tw = ctx.measureText(t.toUpperCase()).width + tagPx * 2;
      totalW += tw;
      return tw;
    });
    totalW += (tagArr.length - 1) * tagGap;

    let tx = (BW - totalW) / 2;
    const ty = BH - tagH - 20;

    for (let i = 0; i < tagArr.length; i++) {
      const tw = widths[i];
      // outlined rounded pill
      roundRect(ctx, tx, ty, tw, tagH, tagR);
      ctx.strokeStyle = P.yellow;
      ctx.lineWidth = 2;
      ctx.stroke();
      // fill semi-transparent
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();

      ctx.fillStyle = P.white;
      ctx.font = tagFont;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(tagArr[i].toUpperCase(), tx + tw / 2, ty + tagH / 2 + 1);
      ctx.textAlign = "left";

      tx += tw + tagGap;
    }
  }
}

/* ───── Chips ───── */
function Chips({ text, list, setList, color }) {
  if (!text.trim()) return null;
  const words = text.trim().split(/\s+/);
  const set = new Set(list.map(w => w.toLowerCase()));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {words.map((w, i) => {
        const on = set.has(w.toLowerCase());
        return (
          <button key={i}
            onClick={() => on ? setList(list.filter(h => h.toLowerCase() !== w.toLowerCase())) : setList([...list, w])}
            style={{
              padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${on ? color : "#ddd"}`,
              background: on ? color + "18" : P.white,
              color: on ? (color === P.yellow ? "#b8960a" : color) : P.g5,
              cursor: "pointer", transition: "all .12s",
            }}>{w}</button>
        );
      })}
    </div>
  );
}

/* ═════════════════════ PAGE ═════════════════════ */
export default function Page() {
  const cvs = useRef(null);
  const [fontsOk, setFontsOk] = useState(false);
  const [mlOk, setMlOk] = useState(false);

  const [img, setImg] = useState(null);
  const [head, setHead] = useState("");
  const [sub, setSub] = useState("");
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [hlH, setHlH] = useState([]);
  const [hlS, setHlS] = useState([]);
  const [hPx, setHPx] = useState(72);
  const [sPx, setSPx] = useState(22);
  const [hBold, setHBold] = useState(true);
  const [hIt, setHIt] = useState(false);
  const [ov, setOv] = useState(0.55);
  const [ovTop, setOvTop] = useState(false);
  const [pos, setPos] = useState("bottom");
  const [rnd, setRnd] = useState(true);
  const [cTx, setCTx] = useState("#FFFFFF");
  const [cHl, setCHl] = useState(P.yellow);
  const [cSh, setCSh] = useState("#E63946");
  const [aiP, setAiP] = useState("");
  const [aiL, setAiL] = useState(false);
  const [upl, setUpl] = useState(false);
  const [uMsg, setUMsg] = useState(null);

  useEffect(() => {
    document.fonts?.ready?.then(() => setFontsOk(true));
    setTimeout(() => setFontsOk(true), 2500);
    const check = () => { if (window.cloudinary) setMlOk(true); else setTimeout(check, 300); };
    check();
  }, []);

  useEffect(() => {
    if (!cvs.current || !fontsOk) return;
    paint(cvs.current, {
      img, head, sub, label, tags, hlH, hlS, hPx, sPx,
      hBold, hIt, ov, ovTop, pos, rnd, cTx, cHl, cSh,
    });
  });

  const loadImg = useCallback((url) => {
    const i = new Image(); i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.onerror = () => alert("Nie udało się załadować zdjęcia");
    i.src = url;
  }, []);

  const openLib = useCallback(() => {
    if (!window.cloudinary) return;
    window.cloudinary.openMediaLibrary(
      { cloud_name: CLOUD, api_key: APIKEY, multiple: false, max_files: 1 },
      { insertHandler: (d) => {
        const a = d?.assets?.[0];
        if (a) loadImg(a.secure_url || `https://res.cloudinary.com/${CLOUD}/image/upload/${a.public_id}.${a.format || "jpg"}`);
      }}
    );
  }, [loadImg]);

  const aiGen = useCallback(async () => {
    if (!aiP.trim()) return; setAiL(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiP }),
      });
      const p = await r.json();
      if (p.error) throw new Error(p.error);
      if (p.headline) setHead(p.headline);
      if (p.subtitle) setSub(p.subtitle);
      if (p.label) setLabel(p.label);
      if (p.tags) setTags(p.tags);
      if (p.highlightMain) setHlH(p.highlightMain);
      if (p.highlightSub) setHlS(p.highlightSub);
    } catch (e) { alert("Błąd AI: " + e.message); }
    setAiL(false);
  }, [aiP]);

  const uploadToCloud = useCallback(async () => {
    if (!cvs.current) return; setUpl(true); setUMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", cvs.current.toDataURL("image/png"));
      fd.append("upload_preset", PRESET);
      fd.append("folder", "banners");
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: fd });
      const j = await r.json();
      if (j.secure_url) setUMsg({ ok: true, url: j.secure_url, id: j.public_id });
      else setUMsg({ ok: false, err: j.error?.message || "Upload error" });
    } catch (e) { setUMsg({ ok: false, err: e.message }); }
    setUpl(false);
  }, []);

  const download = () => {
    if (!cvs.current) return;
    const a = document.createElement("a"); a.download = "banner.png";
    a.href = cvs.current.toDataURL("image/png"); a.click();
  };

  /* ── style tokens ── */
  const inp = { width: "100%", padding: "9px 12px", background: P.white, border: "1.5px solid #e0e0e0", borderRadius: 6, color: P.g4, fontSize: 13, outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 10, color: P.g6, marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" };
  const sec = { padding: "12px 16px", borderBottom: "1px solid #eee" };
  const chip = (on) => ({ padding: "4px 12px", borderRadius: 5, fontSize: 11, fontWeight: 700, border: `1.5px solid ${on ? P.blue : "#ddd"}`, background: on ? P.blue + "12" : P.white, color: on ? P.blue : P.g6, cursor: "pointer", transition: "all .12s" });
  const yellowBtn = (dis) => ({ padding: "10px 16px", background: dis ? "#ccc" : P.yellow, color: P.dark, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: dis ? "wait" : "pointer", opacity: dis ? 0.7 : 1, transition: "all .15s" });
  const ghostBtn = { padding: "10px 16px", background: P.white, border: "1.5px solid #ddd", borderRadius: 8, color: P.g4, fontSize: 12, fontWeight: 600, cursor: "pointer" };

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: P.blue, textTransform: "uppercase", letterSpacing: "2.5px", padding: "14px 16px 4px" }}>
      {children}
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: P.white, color: P.g4, overflow: "hidden" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1.5px solid #eee", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: P.dark }}>Banner</span> <span style={{ color: P.blue }}>Generator</span>
          </span>
          {CLOUD && <span style={{ fontSize: 9, background: P.blue + "14", color: P.blue, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{CLOUD}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={download} style={ghostBtn}>↓ PNG</button>
          <button onClick={uploadToCloud} disabled={upl} style={yellowBtn(upl)}>{upl ? "Wysyłam…" : "☁ Prześlij do Cloudinary"}</button>
        </div>
      </div>

      {/* TOAST */}
      {uMsg && (
        <div style={{ padding: "8px 20px", fontSize: 12, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: uMsg.ok ? "#f0fdf4" : "#fef2f2", borderBottom: "1px solid #eee" }}>
          {uMsg.ok ? <><span>✓ Przesłano do <b>banners/</b></span><span style={{ color: P.g6 }}>{uMsg.id}</span></> : <span style={{ color: "#dc2626" }}>✗ {uMsg.err}</span>}
          {uMsg.ok && <a href={uMsg.url} target="_blank" rel="noopener noreferrer" style={{ color: P.blue, fontWeight: 700, fontSize: 11, marginLeft: "auto" }}>Otwórz →</a>}
          <button onClick={() => setUMsg(null)} style={{ background: "none", border: "none", color: P.g6, cursor: "pointer", fontSize: 15, marginLeft: uMsg.ok ? 8 : "auto" }}>×</button>
        </div>
      )}

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* SIDEBAR */}
        <div style={{ width: 330, minWidth: 330, overflowY: "auto", borderRight: "1.5px solid #eee", background: P.light }}>

          <SectionTitle>Zdjęcie</SectionTitle>
          <div style={sec}>
            <button onClick={openLib} disabled={!mlOk} style={{ ...yellowBtn(!mlOk), width: "100%", fontSize: 14, padding: "13px", borderRadius: 8 }}>
              {mlOk ? "📁 Otwórz bibliotekę Cloudinary" : "Ładowanie…"}
            </button>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <input id="__url" placeholder="lub wklej URL…" style={{ ...inp, flex: 1, fontSize: 12 }}
                onKeyDown={e => e.key === "Enter" && loadImg(e.target.value.trim())} />
              <button onClick={() => { const v = document.getElementById("__url")?.value?.trim(); if (v) loadImg(v); }}
                style={{ ...ghostBtn, padding: "8px 12px", fontSize: 11 }}>OK</button>
            </div>
          </div>

          <SectionTitle>AI tekst</SectionTitle>
          <div style={sec}>
            <textarea value={aiP} onChange={e => setAiP(e.target.value)}
              placeholder="Opisz baner, np. Letni obóz językowy, zniżka early bird…"
              rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.5, fontSize: 12 }} />
            <button onClick={aiGen} disabled={aiL || !aiP.trim()}
              style={{ ...yellowBtn(aiL), width: "100%", marginTop: 8, fontSize: 13 }}>
              {aiL ? "Generuję…" : "✨ Generuj tekst"}
            </button>
          </div>

          <SectionTitle>Etykieta</SectionTitle>
          <div style={sec}>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="np. SUPER EARLY BIRD" style={{ ...inp, fontSize: 12, letterSpacing: "1px" }} />
            <div style={{ fontSize: 10, color: P.g6, marginTop: 4 }}>Mały tekst nad nagłówkiem (żółty, uppercase)</div>
          </div>

          <SectionTitle>Nagłówek</SectionTitle>
          <div style={sec}>
            <textarea value={head} onChange={e => setHead(e.target.value)}
              placeholder="Twój chwytliwy nagłówek…" rows={2}
              style={{ ...inp, fontSize: 15, fontWeight: 700, resize: "vertical" }} />
            {head.trim() && <><div style={{ ...lbl, marginTop: 8 }}>Wyróżnij słowa:</div>
              <Chips text={head} list={hlH} setList={setHlH} color={P.yellow} /></>}
          </div>

          <SectionTitle>Podtytuł</SectionTitle>
          <div style={sec}>
            <input value={sub} onChange={e => setSub(e.target.value)}
              placeholder="Tekst na żółtym pasku…" style={{ ...inp, fontSize: 12 }} />
            {sub.trim() && <><div style={{ ...lbl, marginTop: 8 }}>Wyróżnij słowa:</div>
              <Chips text={sub} list={hlS} setList={setHlS} color="#E63946" /></>}
          </div>

          <SectionTitle>Tagi / badges</SectionTitle>
          <div style={sec}>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="Polska, Europa, USA, Japonia" style={{ ...inp, fontSize: 12 }} />
            <div style={{ fontSize: 10, color: P.g6, marginTop: 4 }}>Oddzielone przecinkami — pillsy na dole banera</div>
          </div>

          <SectionTitle>Styl</SectionTitle>
          <div style={sec}>
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Nagłówek: {hPx}px</div>
              <input type="range" min={32} max={120} value={hPx} onChange={e => setHPx(+e.target.value)} style={{ width: "100%", accentColor: P.blue }} />
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <button onClick={() => setHBold(!hBold)} style={chip(hBold)}><b>B</b> Bold</button>
              <button onClick={() => setHIt(!hIt)} style={chip(hIt)}><i>I</i> Italic</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Pozycja tekstu</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["top", "Góra"], ["center", "Środek"], ["bottom", "Dół"]].map(([k, l]) => (
                  <button key={k} onClick={() => setPos(k)} style={chip(pos === k)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Overlay: {Math.round(ov * 100)}%</div>
              <input type="range" min={0} max={100} value={ov * 100} onChange={e => setOv(+e.target.value / 100)} style={{ width: "100%", accentColor: P.blue }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={() => setOvTop(false)} style={chip(!ovTop)}>Od dołu</button>
                <button onClick={() => setOvTop(true)} style={chip(ovTop)}>Od góry</button>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={lbl}>Podtytuł: {sPx}px</div>
              <input type="range" min={14} max={34} value={sPx} onChange={e => setSPx(+e.target.value)} style={{ width: "100%", accentColor: P.blue }} />
              <div style={{ marginTop: 6 }}>
                <button onClick={() => setRnd(!rnd)} style={chip(rnd)}>Zaokrąglone rogi</button>
              </div>
            </div>
            <div>
              <div style={lbl}>Kolory</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { l: "Tekst", v: cTx, s: setCTx },
                  { l: "Highlight", v: cHl, s: setCHl },
                  { l: "Sub accent", v: cSh, s: setCSh },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input type="color" value={c.v} onChange={e => c.s(e.target.value)}
                      style={{ width: 26, height: 26, border: "1.5px solid #ddd", borderRadius: 4, cursor: "pointer", background: "none", padding: 0 }} />
                    <span style={{ fontSize: 10, color: P.g6 }}>{c.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 40 }} />
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, overflow: "auto", background: P.light }}>
          <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px #eee" }}>
            <canvas ref={cvs} width={BW} height={BH} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: P.g6, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{BW}×{BH}px</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: P.g6 }} />
            <span>PNG</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: P.g6 }} />
            <span>→ banners/</span>
          </div>
        </div>
      </div>
    </div>
  );
}
