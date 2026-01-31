const product = {
  name:"Christian Hoodie",
  price:999,
  images:[
    "https://via.placeholder.com/400",
    "https://via.placeholder.com/400/0000FF",
    "https://via.placeholder.com/400/FF0000"
  ],
  rating:4.6,
  reviews:[
    {user:"John", comment:"Amazing quality"},
    {user:"Mary", comment:"Love it!"}
  ],
  shortDesc:"Premium cotton hoodie with faith design.",
  longDesc:"High quality hoodie made with soft fabric..."
};

/* LOAD PRODUCT */

title.innerText = product.name;
price.innerText = "₹"+product.price;
shortDesc.innerText = product.shortDesc;
longDesc.innerText = product.longDesc;
ratingText.innerText = product.rating;

mainImage.src = product.images[0];

product.images.forEach(img=>{
  const t=document.createElement("img");
  t.src=img;
  t.onclick=()=>mainImage.src=img;
  thumbs.appendChild(t);
});

/* REVIEWS */

product.reviews.forEach(r=>{
  const div=document.createElement("div");
  div.innerHTML=`<b>${r.user}</b>: ${r.comment}`;
  reviewList.appendChild(div);
});

/* CART */

function addToCart(){
  alert("Added to cart");
}

/* NAV */

function goBack(){
  window.location.href="dashboard.html";
}

function viewCart(){
  window.location.href="cart.html";
}
