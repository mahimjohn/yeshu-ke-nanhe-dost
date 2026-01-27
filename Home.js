const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggleBtn.textContent = "☀️";
    } else {
        toggleBtn.textContent = "🌙";
    }
};

const auth = firebase.auth();

const loginLink = document.getElementById("loginLink");
const userAvatar = document.getElementById("userAvatar");

auth.onAuthStateChanged((user) => {
  if (user) {
    // User logged in
    loginLink.style.display = "none";
    userAvatar.style.display = "block";
    userAvatar.src = user.photoURL;
  } else {
    // User logged out
    loginLink.style.display = "block";
    userAvatar.style.display = "none";
  }
});

userAvatar.addEventListener("click", () => {
  firebase.auth().signOut();
});
