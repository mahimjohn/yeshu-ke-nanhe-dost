// Firebase reference
const db = firebase.database();

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const bannerImage = document.getElementById("bannerImage");

let allProducts = [];
let currentCategory = "all";

/* ---------- BANNER SLIDER ---------- */

const banners = [
  "https://via.placeholder.com/1200x300/0b3d2e/ffffff?text=Faith+Merchandise",
  "https://via.placeholder.com/1200x300/145c46/ffffff?text=Christian+Books",
  "https://via.placeholder.com/1200x300/1c7c5c/ffffff?text=Accessories+%26+Gifts"
];

let bannerIndex = 0;

function rotateBanner(){
  bannerImage.src = banners[bannerIndex];
  bannerIndex = (bannerIndex+1) % banners.length;
}

setInterval(rotateBanner,3000);
rotateBanner();

/* ---------- LOAD PRODUCTS ---------- */

db.ref("products").on("value", snapshot=>{
  allProducts = [];

  snapshot.forEach(child=>{
    allProducts.push({
      id:child.key,
      ...child.val()
    });
  });

  renderProducts(allProducts);
});

/* ---------- RENDER ---------- */

function renderProducts(list){

  productGrid.innerHTML="";

  list.forEach(p=>{

    const card = document.createElement("div");
    card.className="card";
    card.onclick=()=>openProduct(p.id);

    card.innerHTML=`
      <div style="position:relative">
        ${p.badge ? `<div class="badge">${p.badge}</div>` : ""}
        <img src="${p.image}">
      </div>

      <div class="card-body">
        <h4>${p.name}</h4>
        <div class="price">₹${p.price}</div>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

/* ---------- FILTER ---------- */

function filterCategory(cat){
  currentCategory = cat;

  if(cat==="all"){
    renderProducts(allProducts);
  }else{
    renderProducts(allProducts.filter(p=>p.category===cat));
  }
}

/* ---------- SEARCH ---------- */

searchInput.addEventListener("input",()=>{
  const text = searchInput.value.toLowerCase();

  renderProducts(
    allProducts.filter(p=>
      p.name.toLowerCase().includes(text)
    )
  );
});

/* ---------- OPEN PRODUCT ---------- */

function openProduct(id){
  window.location.href="product.html?id="+id;
}
