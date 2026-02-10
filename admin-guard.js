console.log("Admin Guard Loaded");

const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {

  if (!user) {
    // ❌ Not logged in
    window.location.replace("index.html");
    return;
  }

  db.ref("admins/" + user.uid).once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        // ❌ Logged in but NOT admin
        alert("Access Denied: Admins only");
        window.location.replace("dashboard.html");
      }
      // ✅ Admin → allow page
    })
    .catch(() => {
      window.location.replace("dashboard.html");
    });

});
