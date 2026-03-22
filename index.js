// ===============================
// FIREBASE IMPORTS (FIRESTORE)
// ===============================
import { fdb } from "./firebase.js";

import { collection, onSnapshot }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===============================
// LOAD BLOGS
// ===============================
onSnapshot(collection(fdb,"stories"),snapshot=>{

const container = document.getElementById("blogs-slider");
if(!container) return;

container.innerHTML="";

if(snapshot.empty){
container.innerHTML = "<p>No blogs available</p>";
return;
}

snapshot.forEach(doc=>{

const blog = doc.data();

const div = document.createElement("div");
div.className="dynamic-card";

const tags = (blog.tags||[]).slice(0,2).map(t=>`<span style="font-size:10px;background:#ede9fe;color:#7c3aed;padding:2px 7px;border-radius:20px;">${t}</span>`).join(" ");
div.innerHTML=`
<img src="${blog.image || blog.imageUrl || 'https://via.placeholder.com/300x145'}">
<div class="card-body">
  <h3>${blog.title || 'No Title'}</h3>
  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">${tags}</div>
  <button class="btn-story" onclick="event.stopPropagation(); openStory('${doc.id}')">Read Story</button>
</div>
`;

container.appendChild(div);

});

});

// ===============================
// LOAD PRODUCTS
// ===============================
onSnapshot(collection(fdb,"products"),snapshot=>{

const container = document.getElementById("products-slider");
if(!container) return;

container.innerHTML="";

if(snapshot.empty){
container.innerHTML = "<p>No products available</p>";
return;
}

snapshot.forEach(doc=>{

const p = doc.data();

const div = document.createElement("div");
div.className="product-card";

const thumb = (p.images && p.images[0]) || p.image || p.imageUrl || 'https://via.placeholder.com/300';
const discount = p.originalPrice && p.originalPrice > p.price
  ? Math.round((1 - p.price/p.originalPrice)*100) : 0;
const stars = p.rating ? '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5-Math.round(p.rating)) : '★★★★★';
const delivery = p.deliveryDaysMin && p.deliveryDaysMax
  ? `Delivery in ${p.deliveryDaysMin}–${p.deliveryDaysMax} days` : '';

div.innerHTML=`
<img src="${thumb}" alt="${p.name || 'Product'}">
<div class="card-body">
  <h3>${p.name || 'Product'}</h3>
  ${p.rating ? `<div class="pc-rating"><span class="pc-stars">${stars}</span> (${p.ratingCount||0})</div>` : ''}
  <div class="pc-price-row">
    <span class="pc-price">₹${p.price || 0}</span>
    ${p.originalPrice ? `<span class="pc-original">₹${p.originalPrice}</span>` : ''}
    ${discount ? `<span class="pc-discount">${discount}% off</span>` : ''}
  </div>
  ${delivery ? `<div class="pc-delivery">🚚 ${delivery}</div>` : ''}
  <button class="btn-buy" onclick="event.stopPropagation(); openProduct('${doc.id}')">Buy Now</button>
</div>
`;

container.appendChild(div);

});

});

// ===============================
// MANUAL ARROWS — scroll one full page (4 cards)
// ===============================
window.slideLeft = function(id){
  const container = document.getElementById(id);
  if(!container) return;
  const pageWidth = container.clientWidth;
  container.scrollBy({ left: -pageWidth, behavior: "smooth" });
};

window.slideRight = function(id){
  const container = document.getElementById(id);
  if(!container) return;
  const pageWidth = container.clientWidth;
  // If at end, snap back to start
  if(container.scrollLeft + container.clientWidth >= container.scrollWidth - 10){
    container.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    container.scrollBy({ left: pageWidth, behavior: "smooth" });
  }
};

// ===============================
// NAVIGATION FUNCTIONS (FIX)
// ===============================

window.openStory = function(id){
    window.location.href = `story.html?id=${id}`;
};

window.openProduct = function(id){
    window.location.href = `product.html?id=${id}`;
};
