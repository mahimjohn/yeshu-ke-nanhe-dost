const auth = firebase.auth();
const db = firebase.database();

/* AUTH CHECK */
auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }else{
    document.getElementById("userEmail").innerText = user.email;
    loadSettings(user.uid);
  }
});

/* PASSWORD RESET */
function resetPassword(){
  const user = auth.currentUser;
  auth.sendPasswordResetEmail(user.email)
    .then(()=>{
      alert("Password reset email sent!");
    });
}

/* LOGOUT */
function logout(){
  auth.signOut().then(()=>{
    window.location.href="login.html";
  });
}

/* SAVE SETTINGS */
document.getElementById("themeSelect").addEventListener("change", saveSettings);
document.getElementById("notifyToggle").addEventListener("change", saveSettings);

function saveSettings(){
  const user = auth.currentUser;

  db.ref("settings/"+user.uid).set({
    theme: document.getElementById("themeSelect").value,
    notifications: document.getElementById("notifyToggle").checked
  });
}

/* LOAD SETTINGS */
function loadSettings(uid){
  db.ref("settings/"+uid).once("value", snap=>{
    if(snap.exists()){
      const data = snap.val();
      document.getElementById("themeSelect").value = data.theme;
      document.getElementById("notifyToggle").checked = data.notifications;

      applyTheme(data.theme);
    }
  });
}

/* APPLY THEME */
function applyTheme(theme){
  if(theme==="dark"){
    document.body.style.background="#121212";
    document.body.style.color="white";
  }else{
    document.body.style.background="#f3f3f3";
    document.body.style.color="black";
  }
}
