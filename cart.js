/* CART STORAGE */

function getCart(){
return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart){
localStorage.setItem("cart", JSON.stringify(cart));
}


/* CART COUNTER */

function updateCartCount(){

const cart = getCart();

const count = cart.reduce((sum,item)=>sum + (item.qty || 1),0);

const counter = document.getElementById("cart-count");

if(counter){
counter.innerText = count;
}

}


/* LOAD CART */

function loadCart(){

const container = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");

if(!container || !totalEl) return;

const cart = getCart();

container.innerHTML = "";

let total = 0;

if(cart.length === 0){

container.innerHTML = "<p>Your cart is empty.</p>";
totalEl.innerText = "0";
return;

}

cart.forEach((item,index)=>{

const div = document.createElement("div");

div.className = "cart-item";

div.innerHTML = `

${item.image ? `<img src="${item.image}" class="cart-image">` : ""}

<div class="cart-info">
<h3>${item.name || "Product"}</h3>
<p>₹${item.price || 0}</p>
</div>

<input
type="number"
class="qty-input"
value="${item.qty || 1}"
min="1"
data-index="${index}"
>

<button class="remove-btn" data-index="${index}">
Remove
</button>

`;

container.appendChild(div);

total += (item.price || 0) * (item.qty || 1);

});

totalEl.innerText = total;

}


/* QUANTITY CHANGE */

document.addEventListener("change",function(e){

if(e.target.classList.contains("qty-input")){

const index = e.target.dataset.index;

let cart = getCart();

let newQty = parseInt(e.target.value);

if(newQty < 1) newQty = 1;

cart[index].qty = newQty;

saveCart(cart);

loadCart();
updateCartCount();

}

});


/* REMOVE ITEM */

document.addEventListener("click",function(e){

if(e.target.classList.contains("remove-btn")){

const index = e.target.dataset.index;

let cart = getCart();

cart.splice(index,1);

saveCart(cart);

loadCart();
updateCartCount();

}

});


/* CHECKOUT */

const checkoutBtn = document.getElementById("checkout-btn");

if(checkoutBtn){

checkoutBtn.onclick = function(){

const cart = getCart();

if(cart.length === 0){

alert("Your cart is empty.");
return;

}

window.location.href = "checkout.html";

};

}


/* INIT */

updateCartCount();
loadCart();

// Auto-wrap qty inputs with +/- controls after cart renders
function wrapQtyInputs(){
  document.querySelectorAll('.qty-input').forEach(input=>{
    if(input.parentElement.classList.contains('qty-controls')) return; // already wrapped
    const wrapper = document.createElement('div');
    wrapper.className = 'qty-controls';
 
    const minus = document.createElement('button');
    minus.className = 'qty-btn';
    minus.textContent = '−';
    minus.type = 'button';
    minus.onclick = ()=>{
      const v = parseInt(input.value)||1;
      if(v > 1){ input.value = v-1; input.dispatchEvent(new Event('change', { bubbles: true })); }
    };
 
    const plus = document.createElement('button');
    plus.className = 'qty-btn';
    plus.textContent = '+';
    plus.type = 'button';
    plus.onclick = ()=>{
      input.value = (parseInt(input.value)||1) + 1;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
 
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(minus);
    wrapper.appendChild(input);
    wrapper.appendChild(plus);
  });
}
 
// Run after cart.js has rendered items
const cartObserver = new MutationObserver(()=>{ wrapQtyInputs(); });
const cartItems = document.getElementById('cart-items');
if(cartItems) cartObserver.observe(cartItems, { childList:true, subtree:true });
setTimeout(wrapQtyInputs, 300); // fallback