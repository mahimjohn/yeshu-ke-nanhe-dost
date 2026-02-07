console.log("Admin Auth Loaded");

const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {

  const adminBtn = document.getElementById("adminPanelBtn");

  if (!user) {
    if (adminBtn) adminBtn.style.display = "none";
    return;
  }

  db.ref("admins/" + user.uid).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        // User is admin
        if (adminBtn) adminBtn.style.display = "block";
      } else {
        if (adminBtn) adminBtn.style.display = "none";
      }
    });

});
