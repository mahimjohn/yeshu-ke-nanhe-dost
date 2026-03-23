import { rtdb, auth } from "./firebase.js";

import { ref, set, get }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import { RecaptchaVerifier, signInWithPhoneNumber } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


/* ===============================
ELEMENTS
================================ */

const menuBtn = document.querySelector(".menu");
const menu = document.getElementById("user-menu");
const overlay = document.getElementById("menu-overlay");

const loginBtn = document.querySelector(".login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");

const loginDropdown = document.getElementById("login-dropdown");
const userLoginBtn = document.getElementById("user-login");
const adminLoginBtn = document.getElementById("admin-login");

const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");

const sendOtp = document.getElementById("send-otp");
const verifyOtp = document.getElementById("verify-otp");
const saveUser = document.getElementById("signup-otp");

const phoneInput = document.getElementById("phone-input");
const nameInput = document.getElementById("name-input");

const phoneSection = document.getElementById("phone-step");
const otpSection = document.getElementById("otp-step");
const nameSection = document.getElementById("name-step");

const otpInputs = document.querySelectorAll(".otp-input");

const resendBtn = document.getElementById("resend-otp");
const timerText = document.getElementById("otp-timer");

const openSignup = document.getElementById("open-signup");
const openLogin = document.getElementById("open-login");

const signupPhone = document.getElementById("signup-phone");

/* ===============================
GLOBAL VARIABLES
================================ */

let otpCode = "";
let timer = 30;
let timerInterval;
let isSignup = false;


/* ===============================
OPEN / CLOSE MENU
================================ */

if(menuBtn && menu && overlay){

menuBtn.onclick = () => {

menu.classList.toggle("active");
overlay.classList.toggle("active");

};

overlay.onclick = () => {

menu.classList.remove("active");
overlay.classList.remove("active");

};

}


/* ===============================
CLICK OUTSIDE MENU
================================ */

document.addEventListener("click", function(e){

if(menu && menu.classList.contains("active")){

if(!menu.contains(e.target) && !menuBtn.contains(e.target)){

menu.classList.remove("active");
overlay.classList.remove("active");

}

}

});


/* ===============================
USER LOGIN STATE
================================ */

const user = JSON.parse(localStorage.getItem("user"));

if(user){

if(loginBtn) loginBtn.style.display="none";
if(logoutBtn) logoutBtn.style.display="block";

if(userName){

userName.innerHTML = `
<strong>${user.name}</strong><br>
<span style="color:#777;font-size:14px">${user.phone}</span>
`;

}

if(userAvatar && user.photo){
userAvatar.src = user.photo;
}

}else{

if(logoutBtn) logoutBtn.style.display="none";

}


/* ===============================
LOGOUT
================================ */

if(logoutBtn){

logoutBtn.onclick = () => {

localStorage.removeItem("user");
location.reload();

};

}


/* ===============================
CART COUNTER
================================ */

function updateCartCount(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];

const count = cart.reduce((sum,item)=>sum + item.qty,0);

const el = document.getElementById("cart-count");

if(el){
el.innerText = count;
}

}

updateCartCount();


/* ===============================
LOGIN DROPDOWN
================================ */

if(loginBtn){

loginBtn.onclick = (e)=>{

e.stopPropagation();

loginDropdown.style.display =
loginDropdown.style.display === "flex" ? "none" : "flex";

};

}


if(userLoginBtn){

userLoginBtn.onclick = ()=>{

loginDropdown.style.display="none";

if(loginPopup){
loginPopup.classList.add("active");
}

};

}


if(adminLoginBtn){

adminLoginBtn.onclick = ()=>{

window.location.href = "admin-login.html";

};

}


/* CLOSE DROPDOWN WHEN CLICK OUTSIDE */

document.addEventListener("click",(e)=>{

if(loginDropdown && !loginDropdown.contains(e.target) && e.target !== loginBtn){

loginDropdown.style.display="none";

}

});


/* ===============================
RESET POPUP
================================ */

function resetPopup(){

if(phoneSection) phoneSection.style.display="block";
if(otpSection) otpSection.style.display="none";
if(nameSection) nameSection.style.display="none";

if(phoneInput) phoneInput.value="";
if(nameInput) nameInput.value="";

phoneInput.style.border="";

const err=document.getElementById("user-error");
if(err) err.remove();

otpInputs.forEach(i=>i.value="");

}


/* CLOSE LOGIN POPUP */

if(closeLogin){

closeLogin.onclick = ()=>{

loginPopup.classList.remove("active");
resetPopup();

};

}


/* ===============================
SEND OTP
================================ */

// ✅ FIX 1: Initialize recaptcha once on page load
const recaptchaVerifier = new RecaptchaVerifier(
  auth,
  'recaptcha-container',
  { size: 'invisible' }
);

if(sendOtp){

sendOtp.onclick = ()=>{

const phone = phoneInput.value.trim();

/* VALIDATE PHONE */

const phoneRegex = /^[0-9]{10}$/;

if(!phoneRegex.test(phone)){
alert("Please enter a valid 10-digit mobile number");
return;
}

/* REMOVE OLD ERROR */

const oldError=document.getElementById("user-error");
if(oldError) oldError.remove();

phoneInput.style.border="";

/* CHECK USER IN FIREBASE */

get(ref(rtdb, "users/" + phone))
.then((snapshot) => {

if(snapshot.exists()){

isSignup = false;

/* GENERATE OTP */

const phoneNumber = "+91" + phone;

signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
.then((confirmationResult) => {

window.confirmationResult = confirmationResult;

phoneSection.style.display = "none";
otpSection.style.display = "block";

startOtpTimer();

})
.catch((error) => {

console.error(error);
alert("OTP failed to send");

});

}
else{

phoneInput.style.border = "2px solid red";

let error=document.getElementById("user-error");

if(!error){

error=document.createElement("p");
error.id="user-error";
error.style.color="red";
error.style.fontSize="13px";
error.innerText="User not found";

phoneInput.after(error);

}

}

});

};

}


/* ===============================
OTP INPUT AUTO MOVE
================================ */

otpInputs.forEach((input,index)=>{

input.addEventListener("input",()=>{

if(input.value.length === 1 && index < otpInputs.length-1){
otpInputs[index+1].focus();
}

});

input.addEventListener("keydown",(e)=>{

if(e.key === "Backspace" && input.value === "" && index > 0){
otpInputs[index-1].focus();
}

});

});


/* ===============================
PASTE OTP SUPPORT
================================ */

if(otpInputs.length>0){

otpInputs[0].addEventListener("paste",(e)=>{

const paste=e.clipboardData.getData("text").trim();

if(paste.length===otpInputs.length){

otpInputs.forEach((input,i)=>{
input.value=paste[i];
});

}

});

}


/* ===============================
VERIFY OTP
================================ */

if(verifyOtp){

verifyOtp.onclick = ()=>{

let enteredOtp="";

otpInputs.forEach(input=>{
enteredOtp+=input.value;
});

if(enteredOtp.length !== 6){
alert("Please enter the full OTP");
return;
}

verifyOtp.innerText="Verifying...";
verifyOtp.disabled=true;

window.confirmationResult.confirm(enteredOtp)

.then((result)=>{

/* GET USER DATA */

// ✅ FIX 2: was db (undefined), corrected to rtdb
get(ref(rtdb,"users/"+phoneInput.value))
.then((snapshot)=>{

if(snapshot.exists()){

const userData=snapshot.val();

localStorage.setItem("user",JSON.stringify(userData));

loginPopup.classList.remove("active");

location.reload();

}

});

})

.catch(()=>{

alert("Invalid OTP");

verifyOtp.innerText="Verify";
verifyOtp.disabled=false;

});

};

}



/* ===============================
SAVE USER (SIGNUP)
================================ */

if(saveUser){

saveUser.onclick = ()=>{

const name = nameInput.value.trim();
const phone = signupPhone.value.trim();

if(!name){
alert("Enter your name");
return;
}

if(phone.length !== 10){
alert("Enter valid phone number");
return;
}

/* CHECK IF PHONE ALREADY EXISTS */

get(ref(rtdb,"users/"+phone))
.then((snapshot)=>{

if(snapshot.exists()){

signupPhone.style.border="2px solid red";

let error=document.getElementById("signup-error");

if(!error){

error=document.createElement("p");
error.id="signup-error";
error.style.color="red";
error.style.fontSize="13px";
error.innerText="Number already used. Please enter a different number.";

signupPhone.after(error);

}

return;

}

/* CREATE NEW USER */

const userData={
name:name,
phone:phone
};

// ✅ FIX 3: was db (undefined), corrected to rtdb
set(ref(rtdb,"users/"+phone),userData)
.then(()=>{

localStorage.setItem("user",JSON.stringify(userData));

loginPopup.classList.remove("active");

location.reload();

});

});

};

}


/* ===============================
OTP TIMER
================================ */

function startOtpTimer(){

timer=30;

if(resendBtn) resendBtn.style.display="none";
if(timerText) timerText.style.display="block";

timerText.innerText="Resend OTP in 30s";

timerInterval=setInterval(()=>{

timer--;

timerText.innerText="Resend OTP in "+timer+"s";

if(timer<=0){

clearInterval(timerInterval);

timerText.style.display="none";
resendBtn.style.display="inline";

}

},1000);

}


/* ===============================
RESEND OTP
================================ */

if(resendBtn){

resendBtn.onclick = ()=>{

otpCode=Math.floor(100000+Math.random()*900000).toString();

alert("New OTP: "+otpCode);

startOtpTimer();

};

}


/* ===============================
SIGNUP SWITCH
================================ */

if(openSignup){

openSignup.onclick = ()=>{

if(phoneSection) phoneSection.style.display="none";
if(nameSection) nameSection.style.display="block";

};

}


/* ===============================
LOGIN SWITCH
================================ */

if(openLogin){

openLogin.onclick = ()=>{

if(nameSection) nameSection.style.display="none";
if(phoneSection) phoneSection.style.display="block";

};

}