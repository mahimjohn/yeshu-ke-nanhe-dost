const auth = firebase.auth();

const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

auth.onAuthStateChanged(user=>{

  if(!user){
    window.location.href="login.html";
  }else{
    userPhoto.src = user.photoURL;
    userName.innerText = user.displayName;
  }

});

logoutBtn.onclick = ()=>{
  auth.signOut();
  window.location.href="index.html";
};
