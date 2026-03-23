// ✅ Use shared Firebase instance — no duplicate initializeApp
import { rtdb as db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


document.getElementById("admin-login-btn").onclick = async function(){

const id = document.getElementById("admin-id").value.trim();
const password = document.getElementById("admin-password").value.trim();

if(!id || !password){

document.getElementById("admin-login-error").innerText="Enter ID and password";
return;

}

const snap = await get(ref(db,"admins/"+id));

if(!snap.exists()){

document.getElementById("admin-login-error").innerText="Admin not found";
return;

}

const admin = snap.val();

if(admin.password !== password){

document.getElementById("admin-login-error").innerText="Wrong password";
return;

}


localStorage.setItem("admin",JSON.stringify({

id:id,
role:admin.role,
name:admin.name

}));


if(admin.role === "superadmin"){

window.location.href="super-admin.html";

}else{

window.location.href="admin.html";

}

};