const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

/* ================= AUTH ================= */

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href="login.html";
  }else{
    userEmail.innerText = user.email;
    loadSettings(user.uid);
  }
});

/* ================= BACK ================= */

function goBack(){
  window.location.href="dashboard.html";
}

/* ================= SAVE PROFILE ================= */

function saveProfile(){

  const user = auth.currentUser;
  const name = usernameInput.value;
  const file = photoInput.files[0];

  if(file){
    const ref = storage.ref("profiles/"+user.uid);
    ref.put(file).then(()=>{
      ref.getDownloadURL().then(url=>{
        saveUserData(name,url);
      });
    });
  }else{
    saveUserData(name,null);
  }
}

function saveUserData(name,photo){
  db.ref("settings/"+auth.currentUser.uid).update({
    username:name,
    photo:photo
  });
  alert("Profile updated");
}

/* ================= SETTINGS ================= */

themeSelect.onchange = saveSettings;
languageSelect.onchange = saveSettings;
notifyToggle.onchange = saveSettings;

function saveSettings(){

  const data={
    theme:themeSelect.value,
    language:languageSelect.value,
    notifications:notifyToggle.checked
  };

  db.ref("settings/"+auth.currentUser.uid).update(data);
  applyTheme(data.theme);
  applyLanguage(data.language);
}

/* ================= LOAD SETTINGS ================= */

function loadSettings(uid){

  db.ref("settings/"+uid).once("value",snap=>{
    if(snap.exists()){
      const d=snap.val();

      usernameInput.value=d.username||"";
      themeSelect.value=d.theme||"light";
      languageSelect.value=d.language||"en";
      notifyToggle.checked=d.notifications||false;

      if(d.photo){ profilePic.src=d.photo; }

      applyTheme(d.theme);
      applyLanguage(d.language||"en");
    }
  });
}

/* ================= THEME ================= */

function applyTheme(theme){
  if(theme==="dark"){
    document.body.classList.add("dark");
  }else{
    document.body.classList.remove("dark");
  }
}

/* ================= PASSWORD ================= */

function resetPassword(){
  auth.sendPasswordResetEmail(auth.currentUser.email)
  .then(()=>alert("Reset email sent"));
}

/* ================= LOGOUT ================= */

function logout(){
  auth.signOut().then(()=>window.location.href="login.html");
}

/* ================= DELETE ================= */

function deleteAccount(){
  if(!confirm("Delete account permanently?")) return;

  const user=auth.currentUser;
  db.ref("settings/"+user.uid).remove();
  user.delete().then(()=>{
    window.location.href="signup.html";
  }).catch(()=>{
    alert("Login again then delete.");
  });
}

/* ================= TRANSLATION ================= */

const defaultTexts={
  settings_title:"Settings",
  back:"Back",
  profile:"Profile",
  enter_username:"Enter username",
  save_profile:"Save Profile",
  theme:"Theme",
  language:"Language",
  notifications:"Notifications",
  enable_notifications:"Enable Notifications",
  password:"Password",
  reset_email:"Send Reset Email",
  delete_account:"Delete Account",
  logout:"Logout"
};

async function translateText(text,target){
  const res=await fetch("https://libretranslate.de/translate",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      q:text,
      source:"en",
      target:target,
      format:"text"
    })
  });
  const data=await res.json();
  return data.translatedText;
}

async function applyLanguage(lang){

  document.querySelectorAll("[data-i18n]").forEach(async el=>{
    const key=el.getAttribute("data-i18n");
    el.innerText=await translateText(defaultTexts[key],lang);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(async el=>{
    const key=el.getAttribute("data-i18n-placeholder");
    el.placeholder=await translateText(defaultTexts[key],lang);
  });
}
