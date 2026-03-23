// ✅ Use shared Firebase instance — no duplicate initializeApp
import { fdb as db } from "./firebase.js";

import {
collection,
query,
orderBy,
limit,
startAfter,
getDocs,
where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* HTML ELEMENTS */

const container = document.getElementById("stories-container");
const searchBox = document.getElementById("searchBox");
const storiesPage = document.querySelector(".stories-page");


/* STATE */

let lastDoc = null;
let currentCategory = "all";
const pageSize = 8;


/* CREATE STORY CARD */

function createStoryCard(id, story){

const card = document.createElement("div");

card.className = "story-card";

card.innerHTML = `
<img src="${story.image}">
<h3>${story.title}</h3>
<a class="read-btn" href="story.html?id=${id}">Read Story</a>
`;

container.appendChild(card);

}


/* LOAD STORIES */

async function loadStories(){

let q;

if(currentCategory === "all"){

if(lastDoc){

q = query(
collection(db,"stories"),
orderBy("published","desc"),
startAfter(lastDoc),
limit(pageSize)
);

}else{

q = query(
collection(db,"stories"),
orderBy("published","desc"),
limit(pageSize)
);

}

}else{

if(lastDoc){

q = query(
collection(db,"stories"),
where("tags","array-contains",currentCategory),
orderBy("published","desc"),
startAfter(lastDoc),
limit(pageSize)
);

}else{

q = query(
collection(db,"stories"),
where("tags","array-contains",currentCategory),
orderBy("published","desc"),
limit(pageSize)
);

}

}

const querySnapshot = await getDocs(q);

if(querySnapshot.empty){

loadBtn.innerText = "No More Stories";
loadBtn.disabled = true;
return;

}

querySnapshot.forEach(doc => {
createStoryCard(doc.id, doc.data());
});

lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

}


/* LOAD MORE BUTTON */

const loadBtn = document.createElement("button");

loadBtn.innerText = "Load More Stories";
loadBtn.className = "load-more";

loadBtn.onclick = loadStories;

storiesPage.appendChild(loadBtn);


/* INITIAL LOAD */

loadStories();


/* SEARCH */

searchBox.addEventListener("input", async () => {

const keyword = searchBox.value.toLowerCase();

container.innerHTML = "";
loadBtn.style.display = "none";

const querySnapshot = await getDocs(collection(db,"stories"));

querySnapshot.forEach(doc => {

const story = doc.data();

if(story.title.toLowerCase().includes(keyword)){
createStoryCard(doc.id, story);
}

});

});


/* CATEGORY FILTER */

const categoryButtons = document.querySelectorAll(".categories button");

categoryButtons.forEach(btn => {

btn.addEventListener("click", () => {

currentCategory = btn.dataset.category;

container.innerHTML = "";
lastDoc = null;

categoryButtons.forEach(b => b.classList.remove("active"));
btn.classList.add("active");

loadBtn.style.display = "block";
loadBtn.disabled = false;
loadBtn.innerText = "Load More Stories";

loadStories();

});

});