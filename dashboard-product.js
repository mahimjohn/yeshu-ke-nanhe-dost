const products = [

/* CLOTHING */
{ id:1, name:"Christian Hoodie", price:999, image:"https://via.placeholder.com/400?text=Hoodie"},
{ id:2, name:"Jesus T-Shirt", price:599, image:"https://via.placeholder.com/400?text=T-Shirt"},
{ id:3, name:"Faith Jacket", price:1499, image:"https://via.placeholder.com/400?text=Jacket"},

/* WATCHES */
{ id:4, name:"Men's Wrist Watch", price:1299, image:"https://via.placeholder.com/400?text=Watch"},
{ id:5, name:"Smart Watch", price:2499, image:"https://via.placeholder.com/400?text=Smart+Watch"},
{ id:6, name:"Leather Strap Watch", price:1999, image:"https://via.placeholder.com/400?text=Leather+Watch"},

/* BOOKS */
{ id:7, name:"Holy Bible", price:499, image:"https://via.placeholder.com/400?text=Bible"},
{ id:8, name:"Prayer Journal", price:299, image:"https://via.placeholder.com/400?text=Journal"},
{ id:9, name:"Bible Study Notebook", price:199, image:"https://via.placeholder.com/400?text=Notebook"},

/* BAGS */
{ id:10, name:"Backpack", price:899, image:"https://via.placeholder.com/400?text=Backpack"},
{ id:11, name:"Travel Bag", price:1599, image:"https://via.placeholder.com/400?text=Travel+Bag"},
{ id:12, name:"Laptop Bag", price:1199, image:"https://via.placeholder.com/400?text=Laptop+Bag"},

/* ACCESSORIES */
{ id:13, name:"Faith Bracelet", price:299, image:"https://via.placeholder.com/400?text=Bracelet"},
{ id:14, name:"Cross Necklace", price:399, image:"https://via.placeholder.com/400?text=Necklace"},
{ id:15, name:"Keychain Cross", price:149, image:"https://via.placeholder.com/400?text=Keychain"},

/* ELECTRONICS */
{ id:16, name:"Wireless Headphones", price:1799, image:"https://via.placeholder.com/400?text=Headphones"},
{ id:17, name:"Bluetooth Speaker", price:1299, image:"https://via.placeholder.com/400?text=Speaker"},
{ id:18, name:"Power Bank", price:999, image:"https://via.placeholder.com/400?text=Powerbank"},

/* HOME */
{ id:19, name:"Water Bottle", price:399, image:"https://via.placeholder.com/400?text=Bottle"},
{ id:20, name:"Coffee Mug", price:249, image:"https://via.placeholder.com/400?text=Mug"},
{ id:21, name:"Wall Poster", price:349, image:"https://via.placeholder.com/400?text=Poster"}

];

const featuredRow = document.getElementById("featuredRow");
const grid = document.getElementById("productGrid");

/* LOAD PRODUCTS */

products.forEach(p=>{

  const card = document.createElement("div");
  card.className="card";
  card.onclick = ()=>openProduct(p.id);

  card.innerHTML = `
    <img src="${p.image}">
    <div class="info">
      <h4>${p.name}</h4>
      <div class="price">₹${p.price}</div>
    </div>
  `;

  featuredRow.appendChild(card.cloneNode(true));
  grid.appendChild(card);
});

/* OPEN PRODUCT PAGE */

function openProduct(id){
  window.location.href = "product.html?id=" + id;
}

/* NAVIGATION */

function goBack(){
  window.location.href="dashboard.html";
}

function viewCart(){
  window.location.href="cart.html";
}
