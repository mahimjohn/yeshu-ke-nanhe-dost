firebase.auth().onAuthStateChanged(user => {

  if (!user) {
    window.location.href = "/admin-login.html";
    return;
  }

  firebase.database()
    .ref("admins/" + user.uid)
    .once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        alert("Admins only");
        window.location.href = "/";
      }
    });

});
