// Style Atlas - linked dropdowns with live counts.
// Everything is wrapped in try/catch: if anything fails, the node keeps
// working with its plain (unfiltered) Python dropdowns.
import { app } from "../../scripts/app.js";

const NODE = "StyleAtlasNode";
const ALL = "All", RANDOM = "🎲 Random", NONE = "None";
const strip = (v) => String(v ?? "").replace(/\s*\(\d+\)\s*$/, "").trim();
const label = (name, n) => `${name} (${n})`;

let DATA = null;
async function loadData(force = false) {
  if (DATA && !force) return DATA;
  try {
    const res = await fetch("/style_atlas/data");
    DATA = await res.json();
  } catch (e) {
    console.warn("[Style Atlas] data not loaded, linked dropdowns disabled", e);
    DATA = null;
  }
  return DATA;
}

const modKey = (c) => "mod_" + c.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function versionOk(r, v) {
  if (v === "Short only") return !!r.hs;
  if (v === "Long only") return !!r.hl;
  return true;
}
function realismOk(r, real, mode) {
  if (real === ALL) return true;
  const t = parseInt(real, 10);
  return mode === "Exact" ? r.r === t : Math.abs(r.r - t) <= 1;
}

function setOptions(w, items, fallback) {
  // items: [[name, count], ...]; keeps the current choice if still present
  if (!w) return;
  const current = strip(w.value);
  const values = items.map(([n, c]) => (c === null ? n : label(n, c)));
  w.options = w.options || {};
  w.options.values = values;
  const hit = items.findIndex(([n]) => n === current);
  w.value = hit >= 0 ? values[hit] : values[items.findIndex(([n]) => n === fallback)] ?? values[0];
}

function refresh(node) {
  try {
    if (!DATA || !DATA.rows?.length) return;
    const W = Object.fromEntries((node.widgets || []).map((w) => [w.name, w]));
    const g = (n) => strip(W[n]?.value);
    const version = g("version"), realism = g("realism"), mode = g("realism_mode");
    const base = DATA.rows.filter((r) => !r.m && versionOk(r, version) && realismOk(r, realism, mode));

    // Subject
    const subjects = [...new Set(DATA.rows.map((r) => r.j))].sort((a, b) => (a === "Main" ? -1 : b === "Main" ? 1 : a.localeCompare(b)));
    setOptions(W.subject, [[ALL, base.length], ...subjects.map((s) => [s, base.filter((r) => r.j === s).length])], ALL);
    const subject = g("subject");
    const bySubject = base.filter((r) => subject === ALL || r.j === subject);

    // Era
    const eras = [...new Set(bySubject.map((r) => r.e))].sort();
    setOptions(W.era, [[ALL, bySubject.length], ...eras.map((e) => [e, bySubject.filter((r) => r.e === e).length])], ALL);
    const era = g("era");
    const byEra = bySubject.filter((r) => era === ALL || r.e === era);

    // Category
    const cats = [...new Set(byEra.map((r) => r.c))];
    setOptions(W.category, [[ALL, byEra.length], ...cats.map((c) => [c, byEra.filter((r) => r.c === c).length])], ALL);
    const cat = g("category");
    const byCat = byEra.filter((r) => cat === ALL || r.c === cat);

    // Subcategory
    const subs = [...new Set(byCat.map((r) => r.s))].sort();
    setOptions(W.subcategory, [[ALL, byCat.length], ...subs.map((s) => [s, byCat.filter((r) => r.s === s).length])], ALL);
    const sub = g("subcategory");
    const pool = byCat.filter((r) => sub === ALL || r.s === sub);

    // Style
    setOptions(W.style, [[RANDOM, pool.length], ...pool.map((r) => r.n).sort().map((n) => [n, null])], RANDOM);

    // Modifiers (subject-specific ones collapse to "None" when not relevant)
    for (const mc of DATA.modifier_categories) {
      const w = W[modKey(mc)];
      if (!w) continue;
      const need = DATA.modifier_subject?.[mc];
      if (need && subject !== ALL && subject !== need) {
        setOptions(w, [[NONE, null]], NONE);
        continue;
      }
      const mods = DATA.rows.filter((r) => r.m && r.c === mc && versionOk(r, version) &&
        (subject === ALL || r.j === "Main" || r.j === subject));
      setOptions(w, [[NONE, null], [RANDOM, mods.length], ...mods.map((r) => r.n).sort().map((n) => [n, null])], NONE);
    }

    // custom_template only matters for the custom position
    const ct = W.custom_template;
    if (ct) ct.disabled = g("style_position") !== "custom template";

    node.setDirtyCanvas?.(true, true);
  } catch (e) {
    console.warn("[Style Atlas] refresh failed (node still usable)", e);
  }
}

function hook(node) {
  try {
    for (const w of node.widgets || []) {
      if (w.__atlasHooked) continue;
      const cb = w.callback;
      w.callback = function () {
        const r = cb?.apply(this, arguments);
        refresh(node);
        return r;
      };
      w.__atlasHooked = true;
    }
    loadData().then(() => refresh(node));
  } catch (e) {
    console.warn("[Style Atlas] hook failed (node still usable)", e);
  }
}

app.registerExtension({
  name: "StyleAtlas.LinkedDropdowns",
  nodeCreated(node) {
    if (node?.comfyClass === NODE) hook(node);
  },
  loadedGraphNode(node) {
    if (node?.comfyClass === NODE) hook(node);
  },
});
