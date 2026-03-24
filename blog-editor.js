import { rtdb, fdb, storage } from "./firebase.js";

/* ── CLOUD FUNCTION URLs ── */
const PUBLISH_FN = "https://us-central1-yeshu-ke-nanhe-dost.cloudfunctions.net/publishToBlogger";
const UPDATE_FN  = "https://us-central1-yeshu-ke-nanhe-dost.cloudfunctions.net/updateBloggerPost";
import { ref as sRef, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { collection, addDoc, doc, getDoc, updateDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── ADMIN AUTH CHECK ── */
const admin = JSON.parse(localStorage.getItem("admin"));
if(!admin){ window.location.href = "admin-login.html"; }

/* ── AUTO-FILL PUBLISHED DATE ── */
const dateEl = document.getElementById("blog-publish-date");
if(dateEl){
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dateEl.value = now.toISOString().slice(0,16);
}

/* ── CHECK IF EDITING EXISTING STORY ── */
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

if(editId){
  document.getElementById("be-mode-label").innerText = "Edit Story";
  document.getElementById("edit-story-id").value = editId;
  document.getElementById("publish-btn-text").innerText = "Update";
  loadStory(editId);
}

async function loadStory(id){
  const snap = await getDoc(doc(fdb,"stories",id));
  if(!snap.exists()) return;
  const s = snap.data();
  document.getElementById("blog-title").value    = s.title||"";
  document.getElementById("blog-editor").innerHTML = s.content||"";
  document.getElementById("blog-image").value    = s.image||"";
  document.getElementById("blog-tags").value     = (s.tags||[]).join(", ");
  if(s.published) document.getElementById("blog-publish-date").value = new Date(s.published).toISOString().slice(0,16);
  if(s.permalink) document.getElementById("blog-permalink").value = s.permalink;
  if(s.location)  document.getElementById("blog-location").value  = s.location;
  if(s.image){
    document.getElementById("cover-preview").innerHTML = `<img src="${s.image}">`;
  }
}

/* ── UPLOAD HELPER ── */
async function uploadFile(file, folder){
  const path = folder + "/" + Date.now() + "_" + file.name;
  const snap = await uploadBytes(sRef(storage, path), file);
  return await getDownloadURL(snap.ref);
}

/* ── TOOLBAR ── */
window.fmt       = (cmd,val) => { document.execCommand(cmd,false,val||null); document.getElementById("blog-editor")?.focus(); };
window.fmtBlock  = tag => { if(tag) document.execCommand("formatBlock",false,tag); document.getElementById("blog-editor")?.focus(); };
window.insertLink= () => { const u=prompt("Enter URL:"); if(u) document.execCommand("createLink",false,u); document.getElementById("blog-editor")?.focus(); };
window.insertHR  = () => { document.execCommand("insertHTML",false,"<hr style='border:none;border-top:1px solid #ddd;margin:20px 0;'>"); };
window.insertEmoji=()=>{ const e=prompt("Enter emoji:"); if(e) document.execCommand("insertText",false,e); };
window.applyColor=(cmd,color)=>{ document.execCommand(cmd,false,color); closeMenus(); document.getElementById("blog-editor")?.focus(); };
window.insertTable=()=>{
  const r=prompt("Rows:",3),c=prompt("Cols:",3);
  if(!r||!c) return;
  let h='<table style="border-collapse:collapse;width:100%;margin:12px 0;">';
  for(let i=0;i<parseInt(r);i++){ h+='<tr>'; for(let j=0;j<parseInt(c);j++) h+=`<td style="border:1px solid #ddd;padding:8px 12px;">${i===0?'<strong>Header</strong>':'Cell'}</td>`; h+='</tr>'; }
  h+='</table>';
  document.execCommand("insertHTML",false,h);
};

window.togglePicker = id => { closeMenus(); const el=document.getElementById(id); if(el) el.style.display=el.style.display==="block"?"none":"block"; };
window.toggleMenu   = id => { closeMenus(); const el=document.getElementById(id); if(el) el.style.display=el.style.display==="block"?"none":"block"; };
window.closeMenus   = () => ["text-color-picker","highlight-picker","align-menu","more-menu"].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display="none"; });

window.togglePS = head => {
  const body=head.nextElementSibling, chev=head.querySelector(".ps-chev");
  if(body.style.display==="none"){ body.style.display="block"; if(chev) chev.style.transform=""; }
  else{ body.style.display="none"; if(chev) chev.style.transform="rotate(-90deg)"; }
};

/* ── MEDIA INSERT ── */
window.insertBodyImage = async input => {
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("be-status"); status.innerText="Uploading image...";
  try{ const url=await uploadFile(file,"blogs/images"); document.execCommand("insertHTML",false,`<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;">`); status.innerText=""; }
  catch(e){ status.innerText="Upload failed: "+e.message; }
  input.value=""; document.getElementById("blog-editor")?.focus();
};

window.insertBodyVideo = async input => {
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("be-status"); status.innerText="Uploading video...";
  try{ const url=await uploadFile(file,"blogs/videos"); document.execCommand("insertHTML",false,`<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`); status.innerText=""; }
  catch(e){ status.innerText="Upload failed: "+e.message; }
  input.value=""; document.getElementById("blog-editor")?.focus();
};

window.setCover = async input => {
  const file=input.files[0]; if(!file) return;
  const status=document.getElementById("be-status"); status.innerText="Uploading cover...";
  try{
    const url=await uploadFile(file,"blogs/covers");
    document.getElementById("blog-image").value=url;
    document.getElementById("cover-preview").innerHTML=`<img src="${url}">`;
    status.innerText="";
  }catch(e){ status.innerText="Cover upload failed: "+e.message; }
  input.value="";
};

/* ── PREVIEW ── */
window.previewBlog = () => {
  const title   = document.getElementById("blog-title").value.trim();
  const content = document.getElementById("blog-editor").innerHTML;
  const image   = document.getElementById("blog-image").value;
  const w = window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:Georgia,serif;max-width:780px;margin:60px auto;padding:0 24px;line-height:1.85;color:#222;}
h1{font-size:2.5em;line-height:1.2;margin-bottom:8px;}h2{font-size:1.8em;margin:1em 0 0.4em;}h3{font-size:1.4em;margin:0.8em 0 0.3em;}
img{max-width:100%;border-radius:8px;margin:8px 0;display:block;}video{max-width:100%;border-radius:8px;}
blockquote{border-left:4px solid #ff9800;padding:8px 16px;margin:16px 0;color:#555;font-style:italic;background:#fff8f0;}
pre{background:#f4f1eb;padding:14px 18px;border-radius:8px;overflow-x:auto;font-size:14px;}
hr{border:none;border-top:1px solid #ddd;margin:24px 0;}table{border-collapse:collapse;width:100%;margin:16px 0;}td,th{border:1px solid #ddd;padding:8px 12px;}
.cover{width:100%;max-height:400px;object-fit:cover;border-radius:12px;margin-bottom:32px;}</style></head><body>
${image?`<img src="${image}" class="cover">`:""}
<h1>${title}</h1>${content}</body></html>`);
  w.document.close();
};

/* ── PUBLISH / UPDATE ── */
window.publishBlog = async () => {
  const title     = document.getElementById("blog-title").value.trim();
  const content   = document.getElementById("blog-editor").innerHTML.trim();
  const image     = document.getElementById("blog-image").value.trim();
  const tags      = (document.getElementById("blog-tags").value||"").split(",").map(t=>t.trim()).filter(Boolean);
  const dateVal   = document.getElementById("blog-publish-date").value;
  const permalink = document.getElementById("blog-permalink")?.value.trim()||"";
  const location  = document.getElementById("blog-location")?.value.trim()||"";
  const comments  = document.getElementById("blog-allow-comments")?.checked!==false;
  const pinned    = document.getElementById("blog-pinned")?.checked||false;
  const storyId   = document.getElementById("edit-story-id").value.trim();
  const published = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

  if(!title){ alert("Please enter a title"); return; }
  if(!content||content==="<br>"){ alert("Please write some content"); return; }

  const btn=document.getElementById("publish-btn"), btnText=document.getElementById("publish-btn-text");
  const status=document.getElementById("be-status");
  if(btn) btn.disabled=true;
  if(btnText) btnText.innerText=storyId?"Updating...":"Publishing...";

  try{
    const data={title,content,image,tags,published,permalink,location,comments,pinned};

    if(storyId){
      // Get existing bloggerId if any
      const existing = await getDoc(doc(fdb,"stories",storyId));
      const bloggerId = existing.exists() ? existing.data().bloggerId : null;

      // Update Firebase
      await updateDoc(doc(fdb,"stories",storyId),{...data,updatedAt:new Date().toISOString()});
      if(status) status.innerText="Story updated! Syncing to Blogger...";

      // Sync to Blogger if it was previously published there
      if(bloggerId){
        const bRes = await fetch(UPDATE_FN, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({bloggerId, title, content, tags})
        });
        const bData = await bRes.json();
        if(bData.error) throw new Error("Blogger sync failed: "+JSON.stringify(bData.error));
      }
      if(status) status.innerText="Story updated & synced to Blogger!";

    }else{
      // Publish to Blogger first to get bloggerId
      if(status) status.innerText="Publishing to Blogger...";
      const bRes = await fetch(PUBLISH_FN, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({title, content, tags})
      });
      const bData = await bRes.json();
      if(bData.error) throw new Error("Blogger sync failed: "+JSON.stringify(bData.error));

      // Save to Firebase with bloggerId
      await addDoc(collection(fdb,"stories"),{
        ...data,
        bloggerId: bData.bloggerId,
        bloggerUrl: bData.bloggerUrl,
        autoTagged: false,
        createdAt: new Date().toISOString()
      });
      if(status) status.innerText="Published to site & Blogger!";

      // Clear for new story
      document.getElementById("blog-title").value="";
      document.getElementById("blog-editor").innerHTML="";
      document.getElementById("blog-image").value="";
      document.getElementById("blog-tags").value="";
      document.getElementById("cover-preview").innerHTML="";
    }

    setTimeout(()=>{ if(status) status.innerText=""; },4000);

  }catch(e){
    if(status) status.innerText="Error: "+e.message;
  }

  if(btn) btn.disabled=false;
  if(btnText) btnText.innerText=storyId?"Update":"Publish";
};
