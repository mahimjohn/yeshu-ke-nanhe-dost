const auth = firebase.auth();
const db = firebase.database();

const prayerForm = document.getElementById("prayerForm");
const prayerInput = document.getElementById("prayerInput");
const requestList = document.getElementById("requestList");

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }else{
    userPhoto.src=user.photoURL;
    sidePhoto.src=user.photoURL;
    userName.innerText=user.displayName;
    sideName.innerText=user.displayName;

    loadRequests(user.uid);
  }
});

/* Submit */

prayerForm.addEventListener("submit", e=>{
  e.preventDefault();

  const text=prayerInput.value.trim();
  if(text==="") return;

  const user=auth.currentUser;

  db.ref("prayers/"+user.uid).push({
    text:text,
    status:"Submitted",
    time:Date.now()
  });

  prayerInput.value="";
});

/* Load */

function loadRequests(uid){
  db.ref("prayers/"+uid).on("value", snap=>{
    requestList.innerHTML="";
    snap.forEach(child=>{
      const data=child.val();

      const div=document.createElement("div");
      div.className="request-card";
      div.innerHTML=`
        <p>${data.text}</p>
        <span class="status">Status: ${data.status}</span>
      `;
      requestList.appendChild(div);
    });
  });
}

/* Logout */

logoutBtn.onclick=()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* SIDEBAR TOGGLE */

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

menuBtn.onclick = ()=>{
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

