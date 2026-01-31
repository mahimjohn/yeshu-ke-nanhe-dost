const products = [

{
 id:1,
 name:"Christian Hoodie",
 price:999,
 image:"https://via.placeholder.com/400"
},

{
 id:2,
 name:"Faith Bracelet",
 price:299,
 image:"https://via.placeholder.com/400/ff0000"
},

{
 id:3,
 name:"Bible Study Notebook",
 price:199,
 image:"https://via.placeholder.com/400/0000ff"
},

{
 id:4,
 name:"Jesus T-Shirt",
 price:599,
 image:"https://via.placeholder.com/400/00ff00"
}

];

const featuredRow = document.getElementById("featuredRow");
const grid = document.getElementById("productGrid");

/* LOAD PRODUCTS */

products.forEach(p=>{

  const card = document.createElement("div");
  card.className="card";
  card.onclick=()=>openProduct(p.id);

  card.innerHTML=`
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
  window.location.href="product.html?id="+id;
}

/* NAV */

function goBack(){
  window.location.href="dashboard.html";
}

function viewCart(){
  window.location.href="cart.html";
}
