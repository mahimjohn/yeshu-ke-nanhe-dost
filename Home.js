const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggleBtn.textContent = "☀️";
    } else {
        toggleBtn.textContent = "🌙";
    }
};
// Later: after signup, we can replace Login | Sign Up
// with user profile picture dynamically.
// For now, it's static.