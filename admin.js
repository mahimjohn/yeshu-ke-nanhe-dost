// ✅ rtdb = Realtime DB (orders, blogs, admins)
// ✅ fdb  = Firestore (products, stories)
import { rtdb, fdb, storage } from "./firebase.js";

import { ref, onValue, update, push, set }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import { collection, addDoc, onSnapshot, doc, deleteDoc, getDoc, updateDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { ref as sRef, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ===============================
ADMIN SESSION CHECK
================================ */

const admin = JSON.parse(localStorage.getItem("admin"));

if(!admin){
window.location.href="admin-login.html";
}

const chipName = document.getElementById("admin-chip-name");
const chipRole = document.getElementById("admin-chip-role");
if(chipName && admin) chipName.innerText = admin.name || admin.id || "Admin";
if(chipRole && admin) chipRole.innerText = admin.role || "Administrator";

/* ===============================
GLOBAL VARIABLES
================================ */

let allOrders = {};
let chartInstance = null;

/* ===============================
LOAD ORDERS — Realtime DB
================================ */

const container = document.getElementById("orders-container");

onValue(ref(rtdb,"orders"),snapshot=>{

container.innerHTML="";

if(!snapshot.exists()){
container.innerHTML="No orders yet";
updateStats({});
updateChart({});
return;
}

const orders = snapshot.val();
allOrders = orders;

renderOrders(orders);
updateStats(orders);
updateChart(orders);
renderOrdersTable(orders);

});

/* ===============================
RENDER ORDER CARDS
================================ */

function renderOrders(orders){

Object.entries(orders).reverse().forEach(([id,order])=>{

const card = document.createElement("div");
card.className="order-card";

let itemsHTML="";

(order.items || []).forEach(item=>{
itemsHTML += `<div class="item-row">${item.name} x${item.qty} — ₹${item.price}</div>`;
});

card.innerHTML = `
<div class="order-card-head">
  <span class="order-id">#${id.slice(-6)}</span>
  <span class="status ${order.status}">${order.status}</span>
</div>
<p class="order-meta"><b>Customer:</b> ${order.name}</p>
<p class="order-meta"><b>Phone:</b> ${order.phone}</p>
<p class="order-meta"><b>Total:</b> ₹${order.total}</p>
<div class="order-items-box">${itemsHTML}</div>
<div class="order-actions">
  <button class="btn-packed" onclick="updateStatus('${id}','packed')">Packed</button>
  <button class="btn-shipped" onclick="updateStatus('${id}','shipped')">Shipped</button>
  <button class="btn-delivered" onclick="updateStatus('${id}','delivered')">Delivered</button>
</div>`;

container.appendChild(card);

});

}

/* ===============================
ORDERS TABLE
================================ */

function renderOrdersTable(orders){

const table = document.getElementById("ordersTable");
if(!table) return;

table.innerHTML = "";

Object.entries(orders).reverse().forEach(([id,order])=>{

const tr = document.createElement("tr");
const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";

tr.innerHTML = `
<td>${id.slice(-5)}</td>
<td>${order.name}</td>
<td>${date}</td>
<td><span class="status ${order.status}">${order.status}</span></td>
<td>₹${order.total}</td>`;

table.appendChild(tr);

});

}

/* ===============================
UPDATE STATS
================================ */

function updateStats(orders){

let totalRevenue = 0;
let totalOrders  = 0;
let customerSet  = new Set();

Object.values(orders).forEach(order=>{
totalOrders++;
if(order.phone) customerSet.add(order.phone);
if(order.status === "delivered") totalRevenue += Number(order.total) || 0;
});

const revenueEl   = document.getElementById("stat-revenue");
const ordersEl    = document.getElementById("stat-orders");
const customersEl = document.getElementById("stat-customers");
const deliveredEl = document.getElementById("stat-delivered");

if(revenueEl)   revenueEl.innerText   = "₹" + totalRevenue;
if(ordersEl)    ordersEl.innerText    = totalOrders;
if(customersEl) customersEl.innerText = customerSet.size;
if(deliveredEl) deliveredEl.innerText = Object.values(orders).filter(o=>o.status==="delivered").length;

}

/* ===============================
CHART
================================ */

function updateChart(orders){

if(!orders || Object.keys(orders).length===0) return;

let revenueByDate    = {};
let ordersCountByDate = {};

const range = document.getElementById("rangeFilter")?.value || "all";
const type  = document.getElementById("dataType")?.value  || "both";
const today = new Date();

Object.values(orders).forEach(order=>{

if(!order.createdAt) return;
const d = new Date(order.createdAt);

if(range === "daily"   && d.toDateString() !== today.toDateString()) return;
if(range === "weekly"  && (today - d) / (1000*60*60*24) > 7) return;
if(range === "monthly" && d.getMonth() !== today.getMonth()) return;

const dateKey = d.toISOString().split("T")[0];

if(!revenueByDate[dateKey]){ revenueByDate[dateKey] = 0; ordersCountByDate[dateKey] = 0; }

ordersCountByDate[dateKey]++;
if(order.status === "delivered") revenueByDate[dateKey] += Number(order.total) || 0;

});

if(Object.keys(revenueByDate).length === 0){
revenueByDate = { "No Data": 0 };
ordersCountByDate = { "No Data": 0 };
}

const sortedDates = Object.keys(revenueByDate).sort();
const labels      = sortedDates.map(d => new Date(d).toLocaleDateString());
const revenueData = sortedDates.map(d => revenueByDate[d]);
const ordersData  = sortedDates.map(d => ordersCountByDate[d]);

if(chartInstance) chartInstance.destroy();

let datasets = [];

if(type === "both" || type === "revenue"){
datasets.push({ label:"Revenue (₹)", data:revenueData, borderColor:"#6366f1", backgroundColor:"rgba(99,102,241,0.15)", tension:0.4, fill:true, pointRadius:4 });
}

if(type === "both" || type === "orders"){
datasets.push({ label:"Orders", data:ordersData, borderColor:"#22c55e", backgroundColor:"rgba(34,197,94,0.15)", tension:0.4, fill:true, yAxisID:"y1", pointRadius:4 });
}

const ctx = document.getElementById("salesChart");
if(!ctx) return;

chartInstance = new Chart(ctx,{
type:"line",
data:{ labels, datasets },
options:{
responsive:true, maintainAspectRatio:false,
scales:{
y:{ beginAtZero:true, ticks:{ callback:v=>"₹"+v } },
y1:{ beginAtZero:true, position:"right", grid:{ drawOnChartArea:false } }
},
plugins:{ legend:{ display:true } }
}
});

}

/* ===============================
UPDATE ORDER STATUS — Realtime DB
================================ */

window.updateStatus = async function(orderId,status){
await update(ref(rtdb,"orders/"+orderId),{ status });
};

/* ===============================
LOGOUT
================================ */

document.getElementById("logout-btn").onclick = function(){
localStorage.removeItem("admin");
window.location.href="admin-login.html";
};

/* ===============================
SECTION SWITCH
================================ */

const headings = {overview:"Overview",orders:"Orders",products:"Products",blogs:"Blogs"};

window.showSection = function(section, el){

document.querySelectorAll(".section").forEach(sec=>{ sec.style.display="none"; });
document.getElementById("section-"+section).style.display="block";
document.querySelectorAll(".nav-item").forEach(li=>{ li.classList.remove("active"); });

if(el) el.classList.add("active");

const h = document.getElementById("page-heading");
if(h) h.innerText = headings[section] || section;

};

/* ─── UPLOAD FILE TO STORAGE ─── */
async function uploadFile(file, folder){
  const path = folder + "/" + Date.now() + "_" + file.name;
  const snap = await uploadBytes(sRef(storage, path), file);
  return await getDownloadURL(snap.ref);
}

/* ===============================
BLOGS — sub-tabs + full Blogger toolbar
================================ */

window.showBlogTab = function(tab, el){
  document.querySelectorAll(".blog-tab").forEach(t=>t.style.display="none");
  document.getElementById("blog-tab-"+tab).style.display="block";
  document.querySelectorAll(".blog-subnav-btn").forEach(b=>b.classList.remove("active"));
  if(el) el.classList.add("active");
  if(tab==="update") loadUpdateList();
  if(tab==="view")   loadViewList();
  if(tab==="add")    clearEditor();
};

window.fmt = function(cmd,val){ document.execCommand(cmd,false,val||null); document.getElementById("blog-editor")?.focus(); };
window.fmtBlock = function(tag){ if(tag) document.execCommand("formatBlock",false,tag); document.getElementById("blog-editor")?.focus(); };

window.insertLink = function(){
  const url=prompt("Enter URL:");
  if(url) document.execCommand("createLink",false,url);
  document.getElementById("blog-editor")?.focus();
};

window.insertHR = function(){
  document.execCommand("insertHTML",false,"<hr style='border:none;border-top:1px solid #ddd;margin:20px 0;'>");
  document.getElementById("blog-editor")?.focus();
};

window.applyColor = function(cmd,color){
  document.execCommand(cmd,false,color);
  closeMenus();
  document.getElementById("blog-editor")?.focus();
};

window.insertEmoji = function(){
  const e=prompt("Enter emoji:");
  if(e) document.execCommand("insertText",false,e);
  document.getElementById("blog-editor")?.focus();
};

window.toggleAlignMenu = function(){ toggleMenu("align-menu"); };
window.toggleMoreMenu  = function(){ toggleMenu("more-menu"); };

function toggleMenu(id){
  closeMenus();
  const m=document.getElementById(id);
  if(m) m.style.display=m.style.display==="block"?"none":"block";
}

window.closeMenus = function(){
  ["align-menu","more-menu","text-color-picker","highlight-picker"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display="none";
  });
};

window.toggleColorPicker = function(id){
  closeMenus();
  const el=document.getElementById(id);
  if(el) el.style.display=el.style.display==="block"?"none":"block";
};

document.addEventListener("click",function(e){
  if(!e.target.closest(".tb-dropdown-wrap") && !e.target.closest(".color-picker") && !e.target.closest(".tb-dropdown-menu")){
    closeMenus();
  }
});

window.insertTable = function(){
  const rows=prompt("Number of rows:",3);
  const cols=prompt("Number of columns:",3);
  if(!rows||!cols) return;
  let html='<table style="border-collapse:collapse;width:100%;margin:14px 0;">';
  for(let r=0;r<parseInt(rows);r++){
    html+='<tr>';
    for(let cc=0;cc<parseInt(cols);cc++){
      html+=`<td style="border:1px solid #ddd;padding:8px 12px;min-width:80px;">${r===0?'<strong>Header</strong>':'Cell'}</td>`;
    }
    html+='</tr>';
  }
  html+='</table>';
  document.execCommand("insertHTML",false,html);
  document.getElementById("blog-editor")?.focus();
};

window.insertBodyImage = async function(input){
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("blog-status");
  if(status) status.innerText="Uploading image...";
  try{
    const url=await uploadFile(file,"blogs/images");
    document.execCommand("insertHTML",false,`<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;">`);
    if(status) status.innerText="";
  }catch(e){ if(status) status.innerText="Upload failed: "+e.message; }
  input.value="";
  document.getElementById("blog-editor")?.focus();
};

window.insertBodyVideo = async function(input){
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("blog-status");
  if(status) status.innerText="Uploading video...";
  try{
    const url=await uploadFile(file,"blogs/videos");
    document.execCommand("insertHTML",false,`<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`);
    if(status) status.innerText="";
  }catch(e){ if(status) status.innerText="Video upload failed: "+e.message; }
  input.value="";
  document.getElementById("blog-editor")?.focus();
};

window.setCover = async function(input){
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("blog-status");
  if(status) status.innerText="Uploading cover...";
  try{
    const url=await uploadFile(file,"blogs/covers");
    document.getElementById("blog-image").value=url;
    const prev=document.getElementById("cover-preview");
    if(prev) prev.innerHTML=`<img src="${url}">`;
    if(status) status.innerText="";
  }catch(e){ if(status) status.innerText="Cover upload failed: "+e.message; }
  input.value="";
};

window.togglePS = function(head){
  const body=head.nextElementSibling;
  const chevron=head.querySelector(".ps-chevron");
  if(body.style.display==="none"){
    body.style.display="block";
    if(chevron) chevron.style.transform="";
  }else{
    body.style.display="none";
    if(chevron) chevron.style.transform="rotate(-90deg)";
  }
};

window.clearEditor = function(){
  ["blog-title","blog-tags","blog-publish-date","blog-permalink","blog-location","edit-story-id","blog-image"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  const ed=document.getElementById("blog-editor"); if(ed) ed.innerHTML="";
  const prev=document.getElementById("cover-preview"); if(prev) prev.innerHTML="";
  const status=document.getElementById("blog-status"); if(status) status.innerText="";
  const btnText=document.getElementById("publish-btn-text"); if(btnText) btnText.innerText="Publish";
};

window.previewBlog = function(){
  const title=document.getElementById("blog-title").value.trim();
  const content=document.getElementById("blog-editor").innerHTML;
  const image=document.getElementById("blog-image").value;
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
body{font-family:Georgia,serif;max-width:780px;margin:60px auto;padding:0 24px;line-height:1.85;color:#222;}
h1{font-size:2.5em;line-height:1.2;margin-bottom:8px;}
h2{font-size:1.8em;margin:1em 0 0.4em;}
h3{font-size:1.4em;margin:0.8em 0 0.3em;}
img{max-width:100%;border-radius:8px;margin:8px 0;display:block;}
video{max-width:100%;border-radius:8px;}
blockquote{border-left:4px solid #ff9800;padding:8px 16px;margin:16px 0;color:#555;font-style:italic;background:#fff8f0;}
pre{background:#f4f1eb;padding:14px 18px;border-radius:8px;overflow-x:auto;font-size:14px;}
hr{border:none;border-top:1px solid #ddd;margin:24px 0;}
table{border-collapse:collapse;width:100%;margin:16px 0;}
td,th{border:1px solid #ddd;padding:8px 12px;}
.cover{width:100%;max-height:400px;object-fit:cover;border-radius:12px;margin-bottom:32px;}
</style></head><body>
${image?`<img src="${image}" class="cover">`:""}
<h1>${title}</h1>
${content}
</body></html>`);
  w.document.close();
};

window.publishBlog = async function(){
  const title     = document.getElementById("blog-title").value.trim();
  const content   = document.getElementById("blog-editor").innerHTML.trim();
  const image     = document.getElementById("blog-image").value.trim();
  const tagsRaw   = document.getElementById("blog-tags")?.value||"";
  const tags      = tagsRaw.split(",").map(t=>t.trim()).filter(Boolean);
  const dateVal   = document.getElementById("blog-publish-date")?.value;
  const permalink = document.getElementById("blog-permalink")?.value.trim()||"";
  const location  = document.getElementById("blog-location")?.value.trim()||"";
  const comments  = document.getElementById("blog-allow-comments")?.checked !== false;
  const pinned    = document.getElementById("blog-pinned")?.checked || false;
  const editId    = document.getElementById("edit-story-id").value.trim();
  const published = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

  if(!title){ alert("Please enter a title"); return; }
  if(!content || content==="<br>"){ alert("Please write some content"); return; }

  const status  = document.getElementById("blog-status");
  const btn     = document.getElementById("publish-blog-btn");
  const btnText = document.getElementById("publish-btn-text");
  if(btn) btn.disabled=true;
  if(btnText) btnText.innerText = editId ? "Updating..." : "Publishing...";

  try{
    const data={title,content,image,tags,published,permalink,location,comments,pinned};
    if(editId){
      await updateDoc(doc(fdb,"stories",editId),{...data, updatedAt: new Date().toISOString()});
      if(status) status.innerText="Story updated!";
    }else{
      await addDoc(collection(fdb,"stories"),{...data, createdAt: new Date().toISOString()});
      if(status) status.innerText="Story published!";
    }
    setTimeout(()=>{ if(status) status.innerText=""; },3000);
    clearEditor();
  }catch(e){
    if(status) status.innerText="Error: "+e.message;
  }
  if(btn) btn.disabled=false;
  if(btnText) btnText.innerText="Publish";
};

function loadUpdateList(){
  const c=document.getElementById("update-stories-list"); if(!c) return;
  onSnapshot(collection(fdb,"stories"),snapshot=>{
    c.innerHTML="";
    if(snapshot.empty){c.innerHTML="<p style='color:#aaa;font-size:13px;'>No stories yet</p>";return;}
    snapshot.forEach(docSnap=>{
      const s=docSnap.data(),id=docSnap.id;
      const div=document.createElement("div"); div.className="blog-card";
      div.innerHTML=`
<img src="${s.image||'https://via.placeholder.com/56'}" alt="${s.title}">
<div style="flex:1;"><h4>${s.title}</h4><span style="font-size:11px;color:#aaa;">${s.published?new Date(s.published).toLocaleDateString():""}</span></div>
<button class="edit-btn" onclick="loadStoryForEdit('${id}')">Edit</button>`;
      c.appendChild(div);
    });
  });
}

window.loadStoryForEdit = async function(id){
  const snap=await getDoc(doc(fdb,"stories",id));
  if(!snap.exists()) return;
  const s=snap.data();
  document.getElementById("blog-title").value=s.title||"";
  document.getElementById("blog-editor").innerHTML=s.content||"";
  document.getElementById("blog-image").value=s.image||"";
  if(document.getElementById("blog-tags")) document.getElementById("blog-tags").value=(s.tags||[]).join(", ");
  document.getElementById("edit-story-id").value=id;
  if(s.published&&document.getElementById("blog-publish-date")) document.getElementById("blog-publish-date").value=new Date(s.published).toISOString().slice(0,16);
  if(document.getElementById("blog-permalink")) document.getElementById("blog-permalink").value=s.permalink||"";
  if(document.getElementById("blog-location")) document.getElementById("blog-location").value=s.location||"";
  const prev=document.getElementById("cover-preview");
  if(prev&&s.image) prev.innerHTML=`<img src="${s.image}">`;
  const btnText=document.getElementById("publish-btn-text"); if(btnText) btnText.innerText="Update";
  const status=document.getElementById("blog-status"); if(status) status.innerText=`Editing: "${s.title}"`;
  showBlogTab("add",document.querySelectorAll(".blog-subnav-btn")[0]);
};

function loadViewList(){
  const c=document.getElementById("blogs-container"); if(!c) return;
  onSnapshot(collection(fdb,"stories"),snapshot=>{
    c.innerHTML="";
    if(snapshot.empty){c.innerHTML="<p style='color:#aaa;font-size:13px;'>No stories yet</p>";return;}
    snapshot.forEach(docSnap=>{
      const s=docSnap.data(),id=docSnap.id;
      const plain=(s.content||"").replace(/<[^>]*>/g,"").substring(0,100);
      const div=document.createElement("div"); div.className="blog-card";
      div.innerHTML=`
<img src="${s.image||'https://via.placeholder.com/56'}" alt="${s.title}">
<div style="flex:1;">
  <h4>${s.title}</h4>
  <p style="font-size:13px;color:#777;margin:2px 0;">${plain}...</p>
  <div style="margin-top:4px;">
    <span style="font-size:11px;color:#aaa;">${s.published?new Date(s.published).toLocaleDateString():""}</span>
    ${(s.tags||[]).map(t=>`<span style="font-size:10px;background:#ede9fe;color:#7c3aed;padding:2px 7px;border-radius:20px;margin-left:4px;">${t}</span>`).join("")}
  </div>
</div>
<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
  <button class="edit-btn" onclick="loadStoryForEdit('${id}')">Edit</button>
  <button class="delete-btn" onclick="deleteStory('${id}')">Delete</button>
</div>`;
      c.appendChild(div);
    });
  });
}

window.deleteStory = async function(id){
  if(!confirm("Delete this story?")) return;
  await deleteDoc(doc(fdb,"stories",id));
};

/* ===============================
PRODUCTS — list only, add/edit via product-upload.html
================================ */

// ✅ Load products from Firestore
onSnapshot(collection(fdb,"products"), snapshot=>{
  const c=document.getElementById("products-container"); if(!c) return; c.innerHTML="";
  if(snapshot.empty){
    c.innerHTML="<p style='color:#aaa;font-size:13px;'>No products yet. Click Add Product to begin.</p>";
    return;
  }
  snapshot.forEach(docSnap=>{
    const p=docSnap.data(), id=docSnap.id;
    const thumb=(p.images&&p.images[0])||"https://via.placeholder.com/64";
    const div=document.createElement("div"); div.className="product-item";
    div.innerHTML=`
<img src="${thumb}" alt="${p.name}">
<div style="flex:1;">
  <h4>${p.name}</h4>
  <p>₹${p.price}${p.originalPrice?` <s style="color:#bbb">₹${p.originalPrice}</s>`:""} &nbsp;·&nbsp; Stock: ${p.stock??'?'}</p>
  ${p.type?`<span class="product-type-badge">${p.type}</span>`:""}
  ${p.videoUrl?`<span style="font-size:11px;color:#6366f1;margin-left:6px;">📹 Video</span>`:""}
</div>
<div class="product-item-actions">
  <a href="product-upload.html?id=${id}" class="edit-btn" style="text-align:center;text-decoration:none;">Edit</a>
  <button class="delete-btn" onclick="deleteProduct('${id}')">Delete</button>
</div>`;
    c.appendChild(div);
  });
});

window.deleteProduct = async function(id){
  if(!confirm("Delete this product?")) return;
  await deleteDoc(doc(fdb,"products",id));
};

/* ===============================
FILTER LISTENERS
================================ */

document.getElementById("rangeFilter")?.addEventListener("change",()=>{ updateChart(allOrders); });
document.getElementById("dataType")?.addEventListener("change",()=>{ updateChart(allOrders); });