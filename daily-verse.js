/* ═══════════════════════════════════════════
   DAILY VERSE — bible-api.com
   52 curated child-friendly verses, one per week.
   Refreshes daily; cached in localStorage.
═══════════════════════════════════════════ */

const VERSES = [
  "john 3:16",       "psalm 23:1",      "proverbs 3:5",    "matthew 19:14",
  "philippians 4:13","jeremiah 29:11",  "psalm 46:1",      "isaiah 40:31",
  "john 14:6",       "romans 8:28",     "psalm 119:105",   "matthew 6:33",
  "joshua 1:9",      "john 15:13",      "psalm 27:1",      "1 john 4:9",
  "romans 5:8",      "ephesians 2:8",   "psalm 91:1",      "matthew 5:9",
  "galatians 5:22",  "colossians 3:23", "1 corinthians 13:4", "james 1:17",
  "psalm 34:8",      "proverbs 22:6",   "matthew 7:7",     "isaiah 41:10",
  "john 11:25",      "psalm 139:14",    "luke 1:37",       "1 peter 5:7",
  "hebrews 11:1",    "psalm 37:4",      "philippians 4:6", "romans 15:13",
  "matthew 5:16",    "2 timothy 1:7",   "psalm 18:2",      "john 8:12",
  "ephesians 6:1",   "proverbs 15:1",   "psalm 100:1",     "matthew 5:6",
  "1 john 1:9",      "psalm 56:3",      "galatians 6:9",   "john 6:35",
  "romans 12:2",     "psalm 121:2",     "matthew 11:28",   "revelation 3:20"
];

const CACHE_KEY   = "yknd_daily_verse";
const CACHE_DATE  = "yknd_verse_date";

function getTodayString(){
  return new Date().toISOString().slice(0, 10); // "2026-03-20"
}

function getWeeklyVerse(){
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return VERSES[week % VERSES.length];
}

function setDateLabel(){
  const el = document.getElementById("dv-date");
  if(!el) return;
  const d = new Date();
  el.innerText = d.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

function showVerse(text, reference){
  const textEl = document.getElementById("dv-text");
  const refEl  = document.getElementById("dv-reference");
  if(!textEl || !refEl) return;

  textEl.style.opacity = "0";
  refEl.style.opacity  = "0";

  setTimeout(()=>{
    textEl.innerHTML = text;
    refEl.innerHTML  = "— " + reference;
    textEl.style.transition = "opacity 0.6s ease";
    refEl.style.transition  = "opacity 0.6s ease";
    textEl.style.opacity = "1";
    refEl.style.opacity  = "1";
  }, 200);
}

function showError(){
  const el = document.getElementById("dv-text");
  if(el) el.innerHTML = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.";
  const ref = document.getElementById("dv-reference");
  if(ref) ref.innerHTML = "— John 3:16 (NIV)";
}

async function fetchVerse(verseRef){
  const url = `https://bible-api.com/${encodeURIComponent(verseRef)}?translation=kjv`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return {
    text:      (data.text || "").trim(),
    reference: data.reference || verseRef
  };
}

async function loadDailyVerse(forceRefresh = false){
  setDateLabel();
  const today   = getTodayString();
  const cached  = localStorage.getItem(CACHE_KEY);
  const cachedDate = localStorage.getItem(CACHE_DATE);

  // Use cache if today's verse is already saved
  if(!forceRefresh && cached && cachedDate === today){
    const { text, reference } = JSON.parse(cached);
    showVerse(text, reference);
    return;
  }

  // Spin the refresh icon
  const icon = document.getElementById("dv-refresh-icon");
  if(icon) icon.style.animation = "spin 1s linear infinite";

  try {
    const verseRef = getWeeklyVerse();
    const { text, reference } = await fetchVerse(verseRef);

    // Cache it
    localStorage.setItem(CACHE_KEY,  JSON.stringify({ text, reference }));
    localStorage.setItem(CACHE_DATE, today);

    showVerse(text, reference);
  } catch(e) {
    // Fall back to John 3:16 if API fails
    showError();
  } finally {
    if(icon) icon.style.animation = "";
  }
}

window.refreshVerse = function(){
  // On manual refresh, pick a random verse
  const icon = document.getElementById("dv-refresh-icon");
  if(icon) icon.style.animation = "spin 0.7s linear infinite";

  const random = VERSES[Math.floor(Math.random() * VERSES.length)];
  const textEl = document.getElementById("dv-text");
  if(textEl) textEl.innerHTML = '<span class="dv-loading"><span></span><span></span><span></span></span>';
  const refEl = document.getElementById("dv-reference");
  if(refEl) refEl.innerHTML = "";

  fetchVerse(random)
    .then(({ text, reference }) => showVerse(text, reference))
    .catch(() => showError())
    .finally(() => { if(icon) icon.style.animation = ""; });
};

// Run on page load
document.addEventListener("DOMContentLoaded", loadDailyVerse);
