import { fdb } from "./firebase.js";
import { collection, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allVideos = [];
let activeTag = "All";

const grid      = document.getElementById("vs-grid");
const filterBar = document.getElementById("vs-filters");
const searchEl  = document.getElementById("vs-search");

/* ── LOAD FROM FIRESTORE ── */
onSnapshot(collection(fdb, "visual_stories"), snapshot => {
  allVideos = [];
  const tags = new Set();

  snapshot.forEach(doc => {
    const v = { id: doc.id, ...doc.data() };
    allVideos.push(v);
    (v.tags || (v.tag ? [v.tag] : [])).forEach(t => tags.add(t));
  });

  // Build filter pills dynamically
  filterBar.innerHTML = `<button class="vs-filter-btn active" data-tag="All">All</button>`;
  tags.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "vs-filter-btn";
    btn.dataset.tag = t;
    btn.innerText = t;
    filterBar.appendChild(btn);
  });

  renderGrid();
});

/* ── RENDER CARDS ── */
function renderGrid(){
  const query    = searchEl.value.toLowerCase();
  const filtered = allVideos.filter(v => {
    const matchTag  = activeTag === "All" || (v.tags || [v.tag]).includes(activeTag);
    const matchText = !query
      || (v.title||"").toLowerCase().includes(query)
      || (v.description||"").toLowerCase().includes(query);
    return matchTag && matchText;
  });

  if(!filtered.length){
    grid.innerHTML = `
      <div class="vs-empty">
        <div class="vs-empty-icon">🎬</div>
        <p>${allVideos.length ? "No videos match your search." : "No videos yet. Check back soon!"}</p>
      </div>`;
    return;
  }

  grid.innerHTML = "";
  filtered.forEach(v => {
    const card  = document.createElement("div");
    card.className = "vs-card";

    const thumb = v.thumbnail
      ? `<img src="${v.thumbnail}" alt="${v.title||''}" loading="lazy">`
      : `<div class="vs-card-thumb-placeholder">🎬</div>`;

    card.innerHTML = `
      <div class="vs-card-thumb">
        ${thumb}
        <div class="vs-play-overlay">
          <div class="vs-play-circle">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="vs-card-body">
        <h3>${v.title || "Untitled"}</h3>
        <button>▶ Watch Video</button>
      </div>`;

    card.addEventListener("click", () => playVideo(v));
    grid.appendChild(card);
  });
}

/* ── FILTER ── */
filterBar.addEventListener("click", e => {
  const btn = e.target.closest(".vs-filter-btn");
  if(!btn) return;
  document.querySelectorAll(".vs-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeTag = btn.dataset.tag;
  renderGrid();
});

/* ── SEARCH ── */
searchEl.addEventListener("input", renderGrid);

/* ── PLAY POPUP ── */
function playVideo(v){
  document.getElementById("vs-modal-title").innerText = v.title || "Video";

  const descEl = document.getElementById("vs-modal-desc");
  if(v.description){
    descEl.innerText = v.description;
    descEl.classList.add("has-text");
  } else {
    descEl.innerText = "";
    descEl.classList.remove("has-text");
  }

  const videoEl = document.getElementById("vs-modal-video");
  if(v.youtubeId){
    videoEl.innerHTML = `<iframe src="https://www.youtube.com/embed/${v.youtubeId}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else if(v.youtubeUrl){
    const id = getYouTubeId(v.youtubeUrl);
    videoEl.innerHTML = id
      ? `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      : `<p style="color:#aaa;padding:40px;text-align:center;">Video unavailable</p>`;
  } else if(v.videoUrl){
    videoEl.innerHTML = `<video src="${v.videoUrl}" controls autoplay></video>`;
  } else {
    videoEl.innerHTML = `<p style="color:#aaa;padding:40px;text-align:center;">No video source found</p>`;
  }

  document.getElementById("vs-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePopup(){
  document.getElementById("vs-overlay").classList.remove("active");
  document.getElementById("vs-modal-video").innerHTML = "";
  document.body.style.overflow = "";
}

/* ── CLOSE TRIGGERS ── */
document.getElementById("vs-modal-close").addEventListener("click", closePopup);

document.getElementById("vs-overlay").addEventListener("click", e => {
  if(e.target === document.getElementById("vs-overlay")) closePopup();
});

document.addEventListener("keydown", e => {
  if(e.key === "Escape") closePopup();
});

/* ── HELPER ── */
function getYouTubeId(url){
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}
