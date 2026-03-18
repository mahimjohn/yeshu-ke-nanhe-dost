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

div.innerHTML=`
<img src="${blog.image || blog.imageUrl || 'https://via.placeholder.com/300'}">
<h3>${blog.title || 'No Title'}</h3>
<button onclick="event.stopPropagation(); openStory('${doc.id}')">
Read Story
</button>
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
div.className="dynamic-card";

div.innerHTML=`
<img src="${
(p.images && p.images[0]) || 
p.image || 
p.imageUrl || 
'https://via.placeholder.com/300'
}">
<h3>${p.name || 'Product'}</h3>
<p>₹${p.price || 0}</p>
<button onclick="event.stopPropagation(); openProduct('${doc.id}')">
Buy Now
</button>
`;

container.appendChild(div);

});

});

// ===============================
// AUTO SCROLL
// ===============================
function autoScroll(containerId){

const container = document.getElementById(containerId);
if(!container) return;

setInterval(()=>{

container.scrollBy({
left:270,
behavior:"smooth"
});

if(container.scrollLeft + container.clientWidth >= container.scrollWidth){
container.scrollTo({ left:0, behavior:"smooth" });
}

},3000);

}

autoScroll("blogs-slider");
autoScroll("products-slider");

// ===============================
// MANUAL ARROWS
// ===============================
window.slideLeft = function(id){
const container = document.getElementById(id);
container.scrollBy({ left:-300, behavior:"smooth" });
};

window.slideRight = function(id){
const container = document.getElementById(id);
container.scrollBy({ left:300, behavior:"smooth" });
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