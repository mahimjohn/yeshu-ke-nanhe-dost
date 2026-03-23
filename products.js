// ✅ Import shared Firebase instance — no duplicate initializeApp
import { fdb as db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const container = document.getElementById("products-container");
const searchBox = document.getElementById("product-search");
const sortSelect = document.getElementById("product-sort");
const filtersContainer = document.getElementById("dynamic-filters");


let allProducts = [];


/* ---------------- CART SYSTEM ---------------- */

function updateCartCount(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const count = cart.reduce((sum,item)=>sum+item.qty,0);

const el = document.getElementById("cart-count");

if(el){
el.innerText = count;
}

}


function addToCart(product){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const existing = cart.find(p=>p.id===product.id);

if(existing){

existing.qty++;

}else{

cart.push({
id:product.id,
name:product.name,
price:product.price,
image:product.image || (product.images ? product.images[0] : ""),
qty:1
});

}

localStorage.setItem("cart",JSON.stringify(cart));

updateCartCount();

alert("Added to cart");

}


/* ---------------- CHECK IF PRODUCT IS NEW ---------------- */

function isNew(product){

if(!product.createdAt) return false;

const created = new Date(product.createdAt);
const today = new Date();

const diff = (today - created) / (1000*60*60*24);

return diff <= 30;

}


/* ---------------- SOLD FORMAT ---------------- */

function formatSold(count){

if(!count) return "";

if(count < 100) return `${count} bought in past month`;

if(count < 1000) return `${Math.floor(count/100)*100}+ bought in past month`;

if(count < 10000) return `${Math.floor(count/1000)}K+ bought in past month`;

return "10K+ bought in past month";

}


/* ---------------- DISCOUNT ---------------- */

function getDiscount(price, original){

if(!original || original <= price) return "";

const discount = Math.round(((original-price)/original)*100);

return `${discount}% off`;

}


/* ---------------- DELIVERY ---------------- */

function getDeliveryRange(min,max){

if(!min || !max) return "";

const today = new Date();

const start = new Date(today);
start.setDate(today.getDate()+min);

const end = new Date(today);
end.setDate(today.getDate()+max);

const options = { day: 'numeric', month: 'short' };

const startStr = start.toLocaleDateString('en-IN', options);
const endStr = end.toLocaleDateString('en-IN', options);

return `FREE delivery ${startStr} - ${endStr}`;

}


/* ---------------- STOCK ---------------- */

function getStockMessage(stock){

if(stock === undefined) return "";

if(stock <= 0) return "Out of stock";

if(stock === 1) return "Only 1 left in stock";

if(stock <= 5) return "Only few left in stock";

return "In stock";

}


/* ---------------- CREATE PRODUCT CARD ---------------- */

function createProductCard(product){

const card = document.createElement("a");
card.className = "product-row";
card.href = `product.html?id=${product.id}`;

const image = product.image || (product.images ? product.images[0] : "https://picsum.photos/400");

const name = product.name || "Product";
const description = product.description || "";

const price = product.price || 0;
const originalPrice = product.originalPrice || 0;

const rating = product.rating || 4;
const ratingCount = product.ratingCount || 0;

const soldText = formatSold(product.sold);
const discountText = getDiscount(price, originalPrice);
const deliveryText = getDeliveryRange(product.deliveryDaysMin, product.deliveryDaysMax);
const stockText = getStockMessage(product.stock);

card.innerHTML = `

<div class="row-image">
<img src="${image}" alt="${name}">
</div>

<div class="row-details">

<h2 class="row-title">
${name} ${description}
</h2>

<div class="row-rating">
⭐ ${rating} <span>(${ratingCount})</span>
</div>

${soldText ? `<div class="row-sold">${soldText}</div>` : ""}

<div class="row-price">

<span class="price-now">₹${price}</span>

${originalPrice ? `<span class="price-old">₹${originalPrice}</span>` : ""}

${discountText ? `<span class="discount">${discountText}</span>` : ""}

</div>

${deliveryText ? `<div class="delivery">${deliveryText}</div>` : ""}

<div class="row-stock">
${stockText}
</div>

<button class="cart-btn" data-id="${product.id}">
Add to Cart
</button>

</div>

`;

container.appendChild(card);

}


/* ---------------- DISPLAY PRODUCTS ---------------- */

function displayProducts(products){

container.innerHTML="";

if(products.length === 0){
container.innerHTML="<p>No products found.</p>";
return;
}

products.forEach(p=>createProductCard(p));

}


/* ---------------- FILTERS ---------------- */

function generateFilters(products){

filtersContainer.innerHTML="";

const bestLabel=document.createElement("label");

bestLabel.innerHTML=`
<input type="checkbox" value="bestseller">
Best Sellers ⭐
`;

filtersContainer.appendChild(bestLabel);

const types=new Set(products.map(p=>p.type));

types.forEach(type=>{

const hasNew=products.some(p=>p.type===type && isNew(p));

const label=document.createElement("label");

label.innerHTML=`
<input type="checkbox" value="${type}">
${type} ${hasNew?'<span class="new-filter">NEW</span>':''}
`;

filtersContainer.appendChild(label);

});

}


/* ---------------- APPLY FILTERS ---------------- */

function applyFilters(){

let filtered=[...allProducts];

const keyword=searchBox.value.toLowerCase();

if(keyword){
filtered=filtered.filter(p=>p.name.toLowerCase().includes(keyword));
}

const checked=document.querySelectorAll("#dynamic-filters input:checked");

let selectedTypes=[];
let bestSelected=false;

checked.forEach(c=>{
if(c.value==="bestseller") bestSelected=true;
else selectedTypes.push(c.value);
});

if(selectedTypes.length){
filtered=filtered.filter(p=>selectedTypes.includes(p.type));
}

if(bestSelected){
filtered=filtered.filter(p=>p.bestseller===true);
}

if(sortSelect.value==="low"){
filtered.sort((a,b)=>a.price-b.price);
}

if(sortSelect.value==="high"){
filtered.sort((a,b)=>b.price-a.price);
}

displayProducts(filtered);

}


/* ---------------- LOAD PRODUCTS ---------------- */

async function loadProducts(){

const snapshot=await getDocs(collection(db,"products"));

allProducts=[];

snapshot.forEach(doc=>{
allProducts.push({
id:doc.id,
...doc.data()
});
});

generateFilters(allProducts);
displayProducts(allProducts);

updateCartCount();

}

loadProducts();


searchBox.addEventListener("input",applyFilters);
sortSelect.addEventListener("change",applyFilters);

document.addEventListener("change",(e)=>{
if(e.target.closest("#dynamic-filters")){
applyFilters();
}
});


/* ---------------- CART CLICK ---------------- */

document.addEventListener("click", function(e){

if(e.target.classList.contains("cart-btn")){

e.preventDefault();
e.stopPropagation();

const card = e.target.closest(".product-row");

const id = e.target.dataset.id;

const product = allProducts.find(p=>p.id===id);

addToCart(product);

}

});