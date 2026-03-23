import { rtdb as db } from "./firebase.js";
import { ref, push, get, remove, update, set }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const user = JSON.parse(localStorage.getItem("user"));

if(!user){
window.location.href="index.html";
}

const container = document.getElementById("address-container");

let editingId = null;


/* =========================
LOAD ADDRESSES
========================= */

async function loadAddresses(){

container.innerHTML = "";

let count = 0;

const multiSnap = await get(ref(db,"users/"+user.phone+"/addresses"));
if(multiSnap.exists()){
  const data = multiSnap.val();
  Object.keys(data).forEach(id=>{ createCard(data[id],id); count++; });
}

const singleSnap = await get(ref(db,"users/"+user.phone+"/address"));
if(singleSnap.exists()){
  const addr = singleSnap.val();
  addr.default = addr.default || false;
  createCard(addr,"oldAddress");
  count++;
}

if(count === 0) showEmpty();

}


/* =========================
CREATE ADDRESS CARD
========================= */

function createCard(addr,id){

const name  = addr.name  || user.name  || "Address";
const phone = addr.phone || user.phone || "";

const card = document.createElement("div");
card.className = "address-card" + (addr.default ? " is-default" : "");

card.innerHTML = `
${addr.default ? '<div class="default-tag">✓ Default</div>' : ""}

<div class="card-pin">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
</div>

<h3>${name}</h3>

<p>
  ${addr.line1 || ""}${addr.line1 ? "<br>" : ""}
  ${addr.line2 ? addr.line2 + "<br>" : ""}
  ${addr.city || ""}${addr.city && addr.pincode ? " — " : ""}${addr.pincode || ""}<br>
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45a2 2 0 0 1 1.82-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l1.71-1.71a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${phone}
</p>

<div class="address-actions">
  <button class="addr-action-btn" onclick="editAddress('${id}')">Edit</button>
  <button class="addr-action-btn btn-default" onclick="setDefault('${id}')">
    ${addr.default ? "✓ Default" : "Set Default"}
  </button>
  <button class="addr-action-btn btn-remove" onclick="deleteAddress('${id}')">Remove</button>
</div>
`;

container.appendChild(card);

}

function showEmpty(){
  container.innerHTML = `
    <div class="addr-empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <p>No saved addresses yet</p>
    </div>
  `;
}


/* =========================
DELETE ADDRESS
========================= */

window.deleteAddress = async function(id){
  if(!confirm("Remove this address?")) return;
  if(id === "oldAddress"){
    await remove(ref(db,"users/"+user.phone+"/address"));
  } else {
    await remove(ref(db,"users/"+user.phone+"/addresses/"+id));
  }
  loadAddresses();
};


/* =========================
EDIT ADDRESS
========================= */

window.editAddress = async function(id){

if(id==="oldAddress"){

const snapshot = await get(ref(db,"users/"+user.phone+"/address"));
const data = snapshot.val();

editingId = id;

document.getElementById("name").value=data.name || user.name;
document.getElementById("phone").value=user.phone;
document.getElementById("line1").value=data.line1;
document.getElementById("line2").value=data.line2;
document.getElementById("city").value=data.city;
document.getElementById("pincode").value=data.pincode;

}else{

const snapshot = await get(ref(db,"users/"+user.phone+"/addresses/"+id));
const data = snapshot.val();

editingId = id;

document.getElementById("name").value=data.name;
document.getElementById("phone").value=data.phone;
document.getElementById("line1").value=data.line1;
document.getElementById("line2").value=data.line2;
document.getElementById("city").value=data.city;
document.getElementById("pincode").value=data.pincode;

}

document.getElementById("address-modal").style.display="flex";

};


/* =========================
SET DEFAULT
========================= */

window.setDefault = async function(id){

// ✅ Reset ALL addresses in /addresses to default:false
const multiSnap = await get(ref(db,"users/"+user.phone+"/addresses"));
if(multiSnap.exists()){
  const data = multiSnap.val();
  const resets = Object.keys(data).map(key =>
    update(ref(db,"users/"+user.phone+"/addresses/"+key),{ default:false })
  );
  await Promise.all(resets);
}

// ✅ Also reset the old /address format
const oldSnap = await get(ref(db,"users/"+user.phone+"/address"));
if(oldSnap.exists()){
  await update(ref(db,"users/"+user.phone+"/address"),{ default:false });
}

// ✅ Now set the chosen one as default
if(id === "oldAddress"){
  await update(ref(db,"users/"+user.phone+"/address"),{ default:true });
}else{
  await update(ref(db,"users/"+user.phone+"/addresses/"+id),{ default:true });
}

loadAddresses();

};


/* =========================
OPEN ADD MODAL
========================= */

document.getElementById("add-address").onclick = ()=>{

editingId=null;

document.getElementById("name").value="";
document.getElementById("phone").value="";
document.getElementById("line1").value="";
document.getElementById("line2").value="";
document.getElementById("city").value="";
document.getElementById("pincode").value="";

document.getElementById("address-modal").style.display="flex";

};


/* =========================
CLOSE MODAL
========================= */

document.getElementById("cancel-address").onclick = ()=>{

document.getElementById("address-modal").style.display="none";

};


/* =========================
SAVE ADDRESS
========================= */

document.getElementById("save-address").onclick = async ()=>{

const address = {

name:document.getElementById("name").value,
phone:document.getElementById("phone").value,

line1:document.getElementById("line1").value,
line2:document.getElementById("line2").value,

city:document.getElementById("city").value,
pincode:document.getElementById("pincode").value,

default:false

};

if(editingId && editingId!=="oldAddress"){

await update(ref(db,"users/"+user.phone+"/addresses/"+editingId),address);

}else if(editingId==="oldAddress"){

await update(ref(db,"users/"+user.phone+"/address"),address);

}else{

await push(ref(db,"users/"+user.phone+"/addresses"),address);

}

document.getElementById("address-modal").style.display="none";

loadAddresses();

};


/* =========================
RUN WHEN PAGE LOADS
========================= */

loadAddresses();