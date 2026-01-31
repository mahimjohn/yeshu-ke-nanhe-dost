const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ================= AUTH ================= */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }else{
    document.getElementById("userEmail").innerText = user.email;
    loadSettings(user.uid);
  }
});

/* ================= BACK ================= */

function goBack(){
  window.location.href="dashboard.html";
}

/* ================= PROFILE SAVE ================= */

function saveProfile(){

  const user = auth.currentUser;
  const username = document.getElementById("usernameInput").value;
  const file = document.getElementById("photoInput").files[0];

  if(file){
    const ref = storage.ref("profiles/"+user.uid);
    ref.put(file).then(()=>{
      ref.getDownloadURL().then(url=>{
        saveUserData(username,url);
      });
    });
  }else{
    saveUserData(username,null);
  }
}

function saveUserData(name,photo){
  const user = auth.currentUser;

  db.ref("settings/"+user.uid).update({
    username:name,
    photo:photo
  });

  alert("Profile updated");
}

/* ================= THEME / LANGUAGE / NOTIFY ================= */

document.getElementById("themeSelect").onchange = saveSettings;
document.getElementById("languageSelect").onchange = saveSettings;
document.getElementById("notifyToggle").onchange = saveSettings;

function saveSettings(){

  const user = auth.currentUser;

  const data = {
    theme:themeSelect.value,
    language:languageSelect.value,
    notifications:notifyToggle.checked
  };

  db.ref("settings/"+user.uid).update(data);
  applyTheme(data.theme);
}

/* ================= LOAD SETTINGS ================= */

function loadSettings(uid){

  db.ref("settings/"+uid).once("value",snap=>{
    if(snap.exists()){

      const d = snap.val();

      usernameInput.value = d.username || "";
      themeSelect.value = d.theme || "light";
      languageSelect.value = d.language || "en";
      notifyToggle.checked = d.notifications || false;

      if(d.photo){
        profilePic.src = d.photo;
      }

      applyTheme(d.theme);
    }
  });
}

/* ================= APPLY THEME ================= */

function applyTheme(theme){

  if(theme==="dark"){
    document.body.classList.add("dark");
  }else{
    document.body.classList.remove("dark");
  }
}

/* ================= PASSWORD RESET ================= */

function resetPassword(){
  auth.sendPasswordResetEmail(auth.currentUser.email)
  .then(()=>alert("Reset email sent"));
}

/* ================= LOGOUT ================= */

function logout(){
  auth.signOut().then(()=>{
    window.location.href="login.html";
  });
}

/* ================= DELETE ACCOUNT ================= */

function deleteAccount(){

  if(!confirm("This will permanently delete your account. Continue?")) return;

  const user = auth.currentUser;

  db.ref("settings/"+user.uid).remove();
  user.delete().then(()=>{
    window.location.href="signup.html";
  }).catch(()=>{
    alert("Please login again then delete.");
  });

}
