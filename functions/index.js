const functions = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

const API_KEY = "AIzaSyDKLvTHoh1XOfSnJcmGy_7Y4Da00zEJBbA";
const BLOG_ID = "571259613266997453";

exports.syncBloggerDaily = onSchedule(
{
schedule: "0 15 * * *",
timeZone: "Asia/Kolkata",
region: "asia-south1"
},
async () => {

console.log("Starting Blogger Sync");

let nextPageToken = null;

do {

let url =
`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?maxResults=500&key=${API_KEY}`;

if(nextPageToken){
url += `&pageToken=${nextPageToken}`;
}

const response = await fetch(url);
const data = await response.json();

if(!data.items){
console.log("No posts returned");
return;
}

for(const post of data.items){

const docRef = db.collection("stories").doc(post.id);
const existingDoc = await docRef.get();

/* Skip manually edited stories */

if(existingDoc.exists){
const existingData = existingDoc.data();

if(existingData.autoTagged === false){
console.log("Skipped manual story:", post.title);
continue;
}
}

/* Extract image */

const image = extractImage(post.content);

/* Detect tags */

const tags = detectTags(post.content);

/* Main category */

const category = tags.length > 0 ? tags[0] : "Other";

/* Detect testament */

const testament = detectTestament(post.content);

/* Save story */

await docRef.set({

title: post.title,
content: post.content,
image: image,
published: post.published,
category: category,
tags: tags,
testament: testament,
autoTagged: true

});

console.log("Saved:", post.title);

}

nextPageToken = data.nextPageToken;

} while(nextPageToken);

console.log("Sync complete");

}
);


/* Extract first image */

function extractImage(html){
const match = html.match(/<img[^>]+src="([^">]+)"/);
return match ? match[1] : "";
}


/* Detect Bible characters */

function detectTags(content){

content = content.toLowerCase();
let tags = [];

if(content.includes("यीशु") || content.includes("ईसा")) tags.push("Jesus");
if(content.includes("मूसा")) tags.push("Moses");
if(content.includes("फिरौन")) tags.push("Pharaoh");
if(content.includes("मिस्र")) tags.push("Egypt");
if(content.includes("युसूफ")) tags.push("Joseph");
if(content.includes("याकूब")) tags.push("Jacob");
if(content.includes("इसहाक")) tags.push("Isaac");
if(content.includes("अब्राहम")) tags.push("Abraham");
if(content.includes("नूह")) tags.push("Noah");
if(content.includes("दाऊद")) tags.push("David");

if(
content.includes("आदम") ||
content.includes("हव्वा") ||
content.includes("सृष्टि")
){
tags.push("Creation");
}

if(tags.length === 0){
tags.push("Other");
}

return tags;

}


/* Detect testament */

function detectTestament(content){

content = content.toLowerCase();

if(
content.includes("यीशु") ||
content.includes("मरियम") ||
content.includes("पतरस") ||
content.includes("पौलुस")
){
return "New";
}

return "Old";

}

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_SRymjrJevVjRAp",
  key_secret: "U739IofeSJh1mTm4JkVb2i0C"
});

exports.createRazorpayOrder = functions.https.onRequest(async (req, res) => {

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const amount = req.body.amount;

  try {

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.send(order);

  } catch (err) {

    console.error(err);
    res.status(500).send(err);

  }

});