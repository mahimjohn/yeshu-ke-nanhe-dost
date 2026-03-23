// ✅ Use shared Firebase instance — no duplicate initializeApp
import { fdb as db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


/* CART COUNT */

function updateCartCount(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const count = cart.reduce((sum,item)=>sum + (item.qty || 1),0);

const el = document.getElementById("cart-count");

if(el) el.innerText = count;

}


/* FORMAT SOLD */

function formatSold(count){

if(!count) return "";

if(count < 100) return `${count} bought in past month`;
if(count < 1000) return `${Math.floor(count/100)*100}+ bought in past month`;
if(count < 10000) return `${Math.floor(count/1000)}K+ bought in past month`;

return "10K+ bought in past month";

}


/* ADD TO CART */

function addToCart(product){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const existing = cart.find(p=>p.id === product.id);

const image =
product.image ||
(product.images && product.images.length ? product.images[0] : "");

if(existing){

existing.qty += 1;

}else{

cart.push({
id: product.id,
name: product.name || "",
price: product.price || 0,
image: image || "",
qty: 1
});

}

localStorage.setItem("cart", JSON.stringify(cart));

updateCartCount();

}


/* LOAD PRODUCT */

async function loadProduct(){

if(!productId) return;

const snap = await getDoc(doc(db,"products",productId));

if(!snap.exists()){
console.error("Product not found");
return;
}

const product = snap.data();


/* NAME */

document.getElementById("product-name").innerText = product.name || "";


/* DESCRIPTION */

document.getElementById("product-description").innerText =
product.description || "";


/* PRICE */

document.getElementById("price-now").innerText =
"₹" + (product.price || 0);

document.getElementById("price-old").innerText =
product.originalPrice ? "₹" + product.originalPrice : "";


/* RATING */

document.getElementById("product-rating").innerText =
`⭐ ${product.rating || 4} (${product.ratingCount || 0})`;


/* SOLD */

document.getElementById("product-sold").innerText =
formatSold(product.sold);


/* DISCOUNT */

if(product.originalPrice){

const discount = Math.round(
((product.originalPrice - product.price) / product.originalPrice) * 100
);

document.getElementById("discount").innerText = discount + "% off";

}


/* DELIVERY */

if(product.deliveryDaysMin && product.deliveryDaysMax){

const today = new Date();

const start = new Date(today);
start.setDate(today.getDate() + product.deliveryDaysMin);

const end = new Date(today);
end.setDate(today.getDate() + product.deliveryDaysMax);

document.getElementById("delivery").innerText =
`FREE delivery ${start.getDate()} - ${end.getDate()}`;

}


/* STOCK */

if(product.stock !== undefined){

if(product.stock <= 0){

document.getElementById("stock").innerText = "Out of stock";

}else if(product.stock <= 5){

document.getElementById("stock").innerText = "Only few left in stock";

}

}


/* IMAGES */

const thumbs = document.getElementById("image-thumbs");

if(product.images && product.images.length){

product.images.forEach((img,i)=>{

const image = document.createElement("img");

image.src = img;

image.onclick = ()=>{
document.getElementById("main-image").src = img;
};

thumbs.appendChild(image);

if(i === 0){
document.getElementById("main-image").src = img;
}

});

}


/* BUTTONS */

document.getElementById("cart-btn").onclick = ()=>{

addToCart({
id: productId,
name: product.name,
price: product.price,
images: product.images
});

};

document.getElementById("buy-btn").onclick = ()=>{

addToCart({
id: productId,
name: product.name,
price: product.price,
images: product.images
});

window.location.href="cart.html";

};

}

updateCartCount();
loadProduct();