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

/* AUTH */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }else{
    userPhoto.src = user.photoURL || "logos/logo.png";
    sidePhoto.src = user.photoURL || "logos/logo.png";
    userName.innerText = user.displayName || "User";
    sideName.innerText = user.displayName || "User";

    loadRequests(user.uid);
  }
});

/* SUBMIT PRAYER */

prayerForm.addEventListener("submit", e=>{
  e.preventDefault();

  const user = auth.currentUser;

  db.ref("prayers/" + user.uid).push({
    name: personName.value,
    topic: prayerTopic.value,
    description: prayerDescription.value,
    status: "Submitted",
    time: Date.now()
  });

  prayerForm.reset();
});

/* LOAD REQUESTS */

function loadRequests(uid){
  db.ref("prayers/" + uid).on("value", snap=>{
    requestList.innerHTML="";
    snap.forEach(child=>{
      const d = child.val();

      const div = document.createElement("div");
      div.className="request-card";
      div.innerHTML = `
        <strong>${d.name}</strong><br>
        <em>${d.topic}</em>
        <p>${d.description}</p>
        <span class="status">Status: ${d.status}</span>
      `;
      requestList.appendChild(div);
    });
  });
}

/* LOGOUT */

logoutBtn.onclick = ()=>{
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
