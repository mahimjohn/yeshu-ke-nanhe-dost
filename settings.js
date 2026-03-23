import { rtdb, storage } from "./firebase.js";
import { ref as dbRef, get, update, remove }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ── USER ── */
const user = JSON.parse(localStorage.getItem("user"));
if(!user){ window.location.href = "index.html"; }

/* ── FILL PROFILE ── */
function fillProfile(){
  document.getElementById("settings-avatar").src = user.photo || "logo/logo.png";
  document.getElementById("profile-name").innerText  = user.name || "";
  document.getElementById("profile-phone").innerText = user.phone || "";
  document.getElementById("settings-name").value     = user.name || "";
  document.getElementById("settings-phone-display").value = user.phone || "";
}
fillProfile();

/* ── LOAD SAVED PREFS ── */
function loadPrefs(){
  // Language
  const lang = localStorage.getItem("lang") || "en";
  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Notifications
  const notifPrefs = JSON.parse(localStorage.getItem("notifPrefs")||"{}");
  document.getElementById("notif-orders").checked  = notifPrefs.orders  !== false;
  document.getElementById("notif-stories").checked = notifPrefs.stories === true;
  document.getElementById("notif-offers").checked  = notifPrefs.offers  === true;
}
loadPrefs();

/* ── SAVE NAME ── */
window.saveName = async function(){
  const newName = document.getElementById("settings-name").value.trim();
  if(!newName){ alert("Please enter a name"); return; }

  const btn = document.querySelector(".sf-save-btn");
  btn.innerText = "Saving..."; btn.disabled = true;

  try{
    await update(dbRef(rtdb,"users/"+user.phone),{ name: newName });
    user.name = newName;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("profile-name").innerText = newName;
    btn.innerText = "Saved ✓";
    setTimeout(()=>{ btn.innerText = "Save"; btn.disabled = false; }, 1500);
  }catch(e){
    alert("Error saving name: "+e.message);
    btn.innerText = "Save"; btn.disabled = false;
  }
};

/* ── CHANGE PHOTO ── */
document.getElementById("photo-upload").addEventListener("change", async function(){
  const file = this.files[0]; if(!file) return;
  const status = document.getElementById("photo-upload-status");
  status.innerText = "Uploading...";

  try{
    const path = "users/photos/" + user.phone + "_" + Date.now();
    const snap = await uploadBytes(sRef(storage, path), file);
    const url  = await getDownloadURL(snap.ref);

    await update(dbRef(rtdb,"users/"+user.phone),{ photo: url });
    user.photo = url;
    localStorage.setItem("user", JSON.stringify(user));

    document.getElementById("settings-avatar").src = url;
    // Also update navbar avatar if present
    const navAvatar = document.getElementById("user-avatar");
    if(navAvatar) navAvatar.src = url;

    status.innerText = "Photo updated ✓";
    setTimeout(()=>{ status.innerText = ""; }, 3000);
  }catch(e){
    status.innerText = "Upload failed — works on live site";
    setTimeout(()=>{ status.innerText = ""; }, 4000);
  }
  this.value = "";
});

/* ── LANGUAGE ── */
window.setLanguage = function(lang, btn){
  localStorage.setItem("lang", lang);
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  // Show a confirmation
  const hint = btn.closest(".sf").querySelector(".sf-hint");
  if(hint){
    const orig = hint.innerText;
    hint.innerText = "Language saved ✓";
    setTimeout(()=>{ hint.innerText = orig; }, 2000);
  }
};

/* ── NOTIFICATIONS ── */
window.saveNotifPref = function(){
  const prefs = {
    orders:  document.getElementById("notif-orders").checked,
    stories: document.getElementById("notif-stories").checked,
    offers:  document.getElementById("notif-offers").checked,
  };
  localStorage.setItem("notifPrefs", JSON.stringify(prefs));
};

/* ── CLEAR CART ── */
window.clearCart = function(){
  if(!confirm("Clear your entire cart?")) return;
  localStorage.removeItem("cart");
  alert("Cart cleared.");
};

/* ── DELETE ACCOUNT ── */
window.deleteAccount = async function(){
  if(!confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
  if(!confirm("Last warning — this will delete ALL your data including orders and addresses.")) return;

  try{
    await remove(dbRef(rtdb,"users/"+user.phone));
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    alert("Account deleted. We're sorry to see you go.");
    window.location.href = "index.html";
  }catch(e){
    alert("Error deleting account: "+e.message);
  }
};

/* ── LOGOUT ── */
window.logoutUser = function(){
  localStorage.removeItem("user");
  window.location.href = "index.html";
};
