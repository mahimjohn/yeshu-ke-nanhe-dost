import { rtdb as db } from "./firebase.js";
import { ref, push, get, set }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let selectedAddressIndex = 0;


/* ===============================
GET CART
================================ */

function getCart(){

return JSON.parse(localStorage.getItem("cart")) || [];

}


/* ===============================
LOAD ORDER SUMMARY
================================ */

function loadCheckout(){

const cart = getCart();

const container = document.getElementById("checkout-items");
const totalEl = document.getElementById("order-total");

if(!container || !totalEl) return;

container.innerHTML = "";

let total = 0;

cart.forEach(item=>{

const div = document.createElement("div");

div.className = "order-item";

div.innerHTML = `
<span>${item.name || "Product"} x${item.qty || 1}</span>
<span>₹${(item.price || 0) * (item.qty || 1)}</span>
`;

container.appendChild(div);

total += (item.price || 0) * (item.qty || 1);

});

totalEl.innerText = total;

}

loadCheckout();


/* ===============================
WORD LIMIT
================================ */

function checkWordLimit(input,limit){

const words = input.value.trim().split(/\s+/);

if(words.length > limit){

alert("Maximum "+limit+" words allowed");

words.length = limit;

input.value = words.join(" ");

}

}


document.getElementById("address1")?.addEventListener("input",(e)=>checkWordLimit(e.target,20));
document.getElementById("address2")?.addEventListener("input",(e)=>checkWordLimit(e.target,20));
document.getElementById("address3")?.addEventListener("input",(e)=>checkWordLimit(e.target,50));


/* ===============================
LOAD SAVED ADDRESS
================================ */

async function loadSavedAddress(){

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

document.getElementById("address-form").style.display="block";
return;

}

const snapshot = await get(ref(db,"users/"+user.phone));

if(!snapshot.exists()){

document.getElementById("address-form").style.display="block";
return;

}

const data = snapshot.val();

// ✅ Collect ALL addresses from BOTH storage paths
const allAddresses = [];

const fallbackName  = data.name  || user.name  || "";
const fallbackPhone = data.phone || user.phone || "";

if(data.addresses){
  Object.values(data.addresses).forEach(addr => allAddresses.push({
    ...addr,
    name:  addr.name  || fallbackName,
    phone: addr.phone || fallbackPhone
  }));
}

// Old single-address format stored at /address
if(data.address && data.address.line1){
  allAddresses.push({
    ...data.address,
    name:  data.address.name  || fallbackName,
    phone: data.address.phone || fallbackPhone
  });
}

if(allAddresses.length > 0){

// Find default — check .default flag, else pick first
let defaultAddr = allAddresses.find(a => a.default) || allAddresses[0];

document.getElementById("saved-address").style.display="block";
document.getElementById("address-form").style.display="none";

document.getElementById("saved-name").innerText = defaultAddr.name;

document.getElementById("saved-address-text").innerText =
`${defaultAddr.line1}, ${defaultAddr.line2}, ${defaultAddr.city} ${defaultAddr.pincode}`;

document.getElementById("name").value = defaultAddr.name;
document.getElementById("phone").value = defaultAddr.phone || "";
document.getElementById("address1").value = defaultAddr.line1;
document.getElementById("address2").value = defaultAddr.line2 || "";
document.getElementById("city").value = defaultAddr.city;
document.getElementById("pincode").value = defaultAddr.pincode;

}

else{

document.getElementById("address-form").style.display="block";

}

}

loadSavedAddress();

document.getElementById("change-address")?.addEventListener("click", openAddressPopup);


/* ===============================
ADDRESS POPUP
================================ */

async function openAddressPopup(){

const popup = document.getElementById("address-popup");
const list = document.getElementById("address-list");

popup.style.display="flex";

const user = JSON.parse(localStorage.getItem("user"));

const snap = await get(ref(db,"users/"+user.phone));

list.innerHTML="";

if(!snap.exists()){

list.innerHTML="<p>No saved addresses</p>";
return;

}

const data = snap.val();

// ✅ Collect ALL addresses from BOTH storage paths so popup matches addresses page
let addresses = [];

const fallbackName  = data.name  || user.name  || "";
const fallbackPhone = data.phone || user.phone || "";

if(data.addresses){
  Object.values(data.addresses).forEach(addr => addresses.push({
    ...addr,
    name:  addr.name  || fallbackName,
    phone: addr.phone || fallbackPhone
  }));
}

// Old single-address format stored at /address
if(data.address && data.address.line1){
  addresses.push({
    ...data.address,
    name:  data.address.name  || fallbackName,
    phone: data.address.phone || fallbackPhone
  });
}

if(addresses.length === 0){
  list.innerHTML="<p>No saved addresses</p>";
  return;
}

addresses.forEach((addr,index)=>{

const div = document.createElement("div");

div.innerHTML = `

<label class="popup-address-item">

<input type="radio" name="popup-address" ${index===selectedAddressIndex ? "checked" : ""} onchange="selectAddressIndex(${index})">

<div class="popup-address-content">

<strong>${addr.name}</strong>

<p>
${addr.line1}<br>
${addr.line2}<br>
${addr.city} - ${addr.pincode}<br>
Phone: ${addr.phone}
</p>

</div>

</label>

`;

list.appendChild(div);

});

window.popupAddresses = addresses;

}


/* ===============================
SELECT ADDRESS
================================ */

window.selectAddressIndex = function(index){

selectedAddressIndex = index;

const addr = window.popupAddresses[index];

document.getElementById("saved-address").style.display="block";
document.getElementById("address-form").style.display="none";

document.getElementById("saved-name").innerText = addr.name;

document.getElementById("saved-address-text").innerText =
`${addr.line1}, ${addr.line2}, ${addr.city} ${addr.pincode}`;

document.getElementById("name").value = addr.name;
document.getElementById("phone").value = addr.phone;
document.getElementById("address1").value = addr.line1;
document.getElementById("address2").value = addr.line2;
document.getElementById("city").value = addr.city;
document.getElementById("pincode").value = addr.pincode;

document.getElementById("address-popup").style.display="none";

};


/* ===============================
SAVE ADDRESS TO USER PROFILE
================================ */

async function saveAddressToUser(user, orderData){
  try {
    const snap = await get(ref(db,"users/"+user.phone));
    if(!snap.exists()) return; // user not in DB
    const data = snap.val();
    // Only save if user has NO addresses yet
    if(!data.address && !data.addresses){
      await set(ref(db,"users/"+user.phone+"/address"),{
        name:     orderData.name,
        phone:    orderData.phone,
        line1:    orderData.address.line1,
        line2:    orderData.address.line2 || "",
        city:     orderData.address.city,
        pincode:  orderData.address.pincode,
        default:  true
      });
    }
  } catch(e){
    console.warn("Could not save address to profile:", e);
  }
}

/* ===============================
PLACE ORDER
================================ */

let placingOrder = false;

document.getElementById("place-order").onclick = async function(){

if(placingOrder) return;

placingOrder = true;

const user = JSON.parse(localStorage.getItem("user"));

if(!user){

alert("Please login first");
placingOrder = false;
return;

}

const name = document.getElementById("name").value.trim();

let phone = document.getElementById("phone").value.trim();

if(phone.startsWith("0")){
phone = phone.substring(1);
}

const address1 = document.getElementById("address1").value.trim();
const address2 = document.getElementById("address2").value.trim();
const address3 = document.getElementById("address3").value.trim();

const city = document.getElementById("city").value.trim();
const pincode = document.getElementById("pincode").value.trim();

const paymentSelected = document.querySelector('input[name="payment"]:checked');

if(!paymentSelected){

alert("Please select payment method");
placingOrder = false;
return;

}

const payment = paymentSelected.value;

const cart = getCart();

if(cart.length === 0){

alert("Cart is empty");
placingOrder = false;
return;

}

let total = 0;

cart.forEach(item=>{
total += (item.price || 0) * (item.qty || 1);
});

const items = cart.map(item => ({
name:item.name,
price:item.price,
qty:item.qty,
image:item.image
}));

const orderData = {

name,
phone,

address:{
line1:address1,
line2:address2,
line3:address3,
city,
pincode
},

items,

total,

payment,

status:"pending",

createdAt:new Date().toISOString()

};


/* ===============================
ONLINE PAYMENT
================================ */

if(payment === "upi" || payment === "card" || payment === "netbanking"){

startRazorpayPayment(orderData);

return;

}


/* ===============================
COD ORDER
================================ */

const orderRef = await push(ref(db,"orders"),orderData);

// ✅ Save address to user profile on first order
await saveAddressToUser(user, orderData);

localStorage.removeItem("cart");

placingOrder = false;

window.location.href = "order-success.html?id=" + orderRef.key;

};


/* ===============================
RAZORPAY PAYMENT
================================ */

async function startRazorpayPayment(orderData){

const response = await fetch(
"https://createrazorpayorder-2twhzvf7iq-uc.a.run.app",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
amount:orderData.total * 100
})
}
);

const razorOrder = await response.json();

const options = {

key:"rzp_live_ST2ai79nINo6Qs",

amount:razorOrder.amount,
currency:"INR",
order_id:razorOrder.id,

name:"Yeshu Ke Nanhe Dost",
description:"Order Payment",

handler: async function(response){

orderData.payment="razorpay";
orderData.paymentId=response.razorpay_payment_id;
orderData.razorpayOrderId=razorOrder.id;
orderData.status="paid";

const orderRef = await push(ref(db,"orders"),orderData);

// ✅ Save address to user profile on first order
const u = JSON.parse(localStorage.getItem("user"));
if(u) await saveAddressToUser(u, orderData);

localStorage.removeItem("cart");

window.location.href="order-success.html?id="+orderRef.key;

},

modal:{

ondismiss:function(){

placingOrder = false;

}

},

prefill:{
name:orderData.name,
contact:orderData.phone
},

theme:{
color:"#ff9800"
}

};

const rzp = new Razorpay(options);

rzp.on("payment.failed",function(){

alert("Payment failed. Please try again.");

placingOrder = false;

});

rzp.open();

}


/* ===============================
BACK BUTTON
================================ */

document.getElementById("back-btn").onclick = function(){

window.location.href="cart.html";

};