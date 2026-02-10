console.log("Admin Guard Loaded");

auth.onAuthStateChanged(user => {

  // ❌ Not logged in
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // 🔍 Check admin permission
  db.ref("admins/" + user.uid).once("value")
    .then(snapshot => {

      // ❌ Logged in but NOT admin
      if (!snapshot.exists()) {
        alert("Access denied: Admins only");
        window.location.href = "dashboard.html";
      }

      // ✅ Admin → allow page
    })
    .catch(err => {
      console.error(err);
      window.location.href = "dashboard.html";
    });

});
