import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {

apiKey: "AIzaSyB6-aF6ycLVrmLBAr-1X4fL6ZVgwF0agFc",
authDomain: "yeshu-ke-nanhe-dost.firebaseapp.com",
databaseURL: "https://yeshu-ke-nanhe-dost-default-rtdb.firebaseio.com",
projectId: "yeshu-ke-nanhe-dost",
storageBucket: "yeshu-ke-nanhe-dost.firebasestorage.app",
messagingSenderId: "496839768513",
appId: "1:496839768513:web:e49e55eb2d196c8e095740"

};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===============================
CHECK SUPER ADMIN LOGIN
================================ */

const admin = JSON.parse(localStorage.getItem("admin"));

if(!admin || admin.role !== "superadmin"){

window.location.href="admin-login.html";

}

/* ===============================
LOAD ADMINS
================================ */

const adminsContainer = document.getElementById("admins-list");

onValue(ref(db,"admins"),snapshot=>{

adminsContainer.innerHTML="";

const admins = snapshot.val();

Object.entries(admins).forEach(([id,data])=>{

const div = document.createElement("div");

div.className="admin-card";

div.innerHTML=`

<b>${data.name}</b> (${data.role})

<button onclick="deleteAdmin('${id}')">Delete</button>

`;

adminsContainer.appendChild(div);

});

});

/* ===============================
ADD ADMIN
================================ */

document.getElementById("add-admin-btn").onclick=async function(){

const id = document.getElementById("new-admin-id").value.trim();
const name = document.getElementById("new-admin-name").value.trim();
const username = document.getElementById("new-admin-username").value.trim();
const password = document.getElementById("new-admin-password").value.trim();

if(!id || !name || !username || !password){

alert("Fill all fields");
return;

}

await set(ref(db,"admins/"+id),{

name,
username,
password,
role:"admin"

});

alert("Admin created");

};

/* ===============================
DELETE ADMIN
================================ */

window.deleteAdmin = async function(id){

if(id === "superadmin"){

alert("Cannot delete superadmin");
return;

}

await remove(ref(db,"admins/"+id));

};

/* ===============================
LOAD ORDERS
================================ */

const ordersContainer = document.getElementById("orders-list");

onValue(ref(db,"orders"),snapshot=>{

ordersContainer.innerHTML="";

const orders = snapshot.val();

Object.entries(orders).reverse().forEach(([id,order])=>{

const div = document.createElement("div");

div.className="admin-card";

div.innerHTML=`

<b>Order:</b> ${id}<br>
Customer: ${order.name}<br>
Total: ₹${order.total}<br>
Status: ${order.status}

`;

ordersContainer.appendChild(div);

});

});

/* ===============================
LOGOUT
================================ */

document.getElementById("logout-btn").onclick=function(){

localStorage.removeItem("admin");

window.location.href="admin-login.html";

};
