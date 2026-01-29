const auth = firebase.auth();
const db = firebase.database();

const prayerForm = document.getElementById("prayerForm");
const personName = document.getElementById("personName");
const prayerTopic = document.getElementById("prayerTopic");
const prayerDescription = document.getElementById("prayerDescription");
const requestList = document.getElementById("requestList");

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");

/* AUTH */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="index.html";
  }else{
    userPhoto.src = user.photoURL || "logos/logo.png";
    sidePhoto.src = user.photoURL || "logos/logo.png";
    userName.innerText = user.displayName || "User";
    sideName.innerText = user.displayName || "User";

    loadRequests(user.uid);
  }
});

/* SUBMIT */

prayerForm.addEventListener("submit", e=>{
  e.preventDefault();

  const user = auth.currentUser;

  db.ref("prayers/"+user.uid).push({
    name: personName.value,
    topic: prayerTopic.value,
    description: prayerDescription.value,
    status:"Submitted",
    time:Date.now()
  });

  prayerForm.reset();
});

/* LOAD */

function loadRequests(uid){
  db.ref("prayers/"+uid).on("value", snap=>{
    requestList.innerHTML="";
    let count=1;

    snap.forEach(child=>{
      const d=child.val();

      const row=document.createElement("tr");
      row.innerHTML=`
        <td>${count++}</td>
        <td>${d.name}</td>
        <td>${d.topic}</td>
        <td>${d.description}</td>
        <td><span class="status-badge">${d.status}</span></td>
      `;

      requestList.appendChild(row);
    });
  });
}

/* LOGOUT */

logoutBtn.onclick=()=>{
  auth.signOut().then(()=>{
    window.location.href="index.html";
  });
};

/* SIDEBAR */

menuBtn.onclick=()=>{
  sidebar.classList.toggle("show");
};
