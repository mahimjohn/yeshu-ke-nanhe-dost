const auth = firebase.auth();
const db = firebase.database();

/* FORM ELEMENTS */
const prayerForm = document.getElementById("prayerForm");
const personName = document.getElementById("personName");
const prayerTopic = document.getElementById("prayerTopic");
const prayerDescription = document.getElementById("prayerDescription");
const historyBody = document.getElementById("historyBody");

/* USER INFO */
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const sidePhoto = document.getElementById("sidePhoto");
const sideName = document.getElementById("sideName");
const logoutBtn = document.getElementById("logoutBtn");

/* SIDEBAR */
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
  main.classList.toggle("shift");
};

/* AUTH CHECK */

auth.onAuthStateChanged(user => {

  if(!user){
    window.location.href="login.html";
    return;
  }

  userPhoto.src = user.photoURL || "logos/logo.png";
  sidePhoto.src = user.photoURL || "logos/logo.png";
  userName.innerText = user.displayName || "User";
  sideName.innerText = user.displayName || "User";

  loadHistory(user.uid);
});

/* SUBMIT REQUEST */

prayerForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = personName.value.trim();
  const topic = prayerTopic.value;
  const description = prayerDescription.value.trim();

  if(name === "" || topic === "" || description === ""){
    alert("Please fill all fields");
    return;
  }

  const user = auth.currentUser;

  db.ref("prayers/" + user.uid).push({
    name: name,
    topic: topic,
    description: description,
    status: "Submitted",
    time: Date.now()
  });

  prayerForm.reset();
});

/* LOAD HISTORY */

function loadHistory(uid){

  db.ref("prayers/" + uid).on("value", snapshot => {

    historyBody.innerHTML = "";
    let count = 1;

    snapshot.forEach(child => {

      const data = child.val();

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${count}</td>
        <td>${data.name}</td>
        <td>${data.topic}</td>
        <td>${data.description}</td>
        <td class="status">${data.status}</td>
      `;

      historyBody.appendChild(row);
      count++;
    });

  });

}

/* LOGOUT */

logoutBtn.onclick = () => {
  auth.signOut().then(() => {
    window.location.href="index.html";
  });
};
