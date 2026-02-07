console.log("Admin Layout Loaded");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("logoutBtn");

menuBtn.onclick = () => {
  sidebar.classList.toggle("show");
};

logoutBtn.onclick = () => {
  firebase.auth().signOut().then(()=>{
    window.location.href = "../index.html";
  });
};
