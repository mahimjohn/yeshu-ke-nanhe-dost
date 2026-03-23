import { fdb, storage } from "./firebase.js";
import { ref as sRef, uploadBytes, getDownloadURL }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { collection, addDoc, doc, getDoc, updateDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── ADMIN AUTH CHECK ── */
const admin = JSON.parse(localStorage.getItem("admin"));
if(!admin){ window.location.href = "admin-login.html"; }

/* ── UPLOAD HELPER ── */
async function uploadFile(file, folder){
  const path = folder + "/" + Date.now() + "_" + file.name;
  const snap = await uploadBytes(sRef(storage, path), file);
  return await getDownloadURL(snap.ref);
}

/* ── STATUS HELPER ── */
function setStatus(msg, type="ok"){
  const el = document.getElementById("pu-status");
  el.innerText = msg; el.className = "pu-status " + type;
  if(type==="ok") setTimeout(()=>{ el.innerText=""; el.className="pu-status"; }, 3000);
}

/* ── CHECK IF EDITING ── */
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

if(editId){
  document.getElementById("pu-mode-label").innerText = "Edit Product";
  document.getElementById("edit-product-id").value = editId;
  document.getElementById("save-btn-text").innerText = "Update Product";
  loadProduct(editId);
}

async function loadProduct(id){
  setStatus("Loading product...");
  const snap = await getDoc(doc(fdb,"products",id));
  if(!snap.exists()){ setStatus("Product not found","err"); return; }
  const p = snap.data();

  document.getElementById("p-name").value             = p.name||"";
  document.getElementById("p-price").value            = p.price||"";
  document.getElementById("p-original-price").value   = p.originalPrice||"";
  document.getElementById("p-type").value             = p.type||"";
  document.getElementById("p-description").value      = p.description||"";
  document.getElementById("p-stock").value            = p.stock||"";
  document.getElementById("p-delivery-min").value     = p.deliveryDaysMin||"";
  document.getElementById("p-delivery-max").value     = p.deliveryDaysMax||"";
  document.getElementById("p-rating").value           = p.rating||"";
  document.getElementById("p-rating-count").value     = p.ratingCount||"";
  document.getElementById("p-sold").value             = p.sold||"";

  // Show existing images
  const images = p.images||[];
  document.getElementById("keep-images").value = JSON.stringify(images);
  if(images.length){
    document.getElementById("existing-images").style.display="block";
    renderExistingImages(images);
  }

  // Show existing video
  if(p.videoUrl){
    document.getElementById("keep-video").value = p.videoUrl;
    document.getElementById("existing-video-wrap").style.display="block";
    document.getElementById("existing-video").src = p.videoUrl;
  }

  setStatus("");
}

function renderExistingImages(images){
  const grid = document.getElementById("existing-images-grid");
  grid.innerHTML = "";
  images.forEach((url,i)=>{
    const wrap = document.createElement("div");
    wrap.className = "img-thumb-wrap";
    wrap.innerHTML = `<img src="${url}"><button class="rm-btn" onclick="removeExistingImage(${i})">×</button>`;
    grid.appendChild(wrap);
  });
}

window.removeExistingImage = function(index){
  let imgs = JSON.parse(document.getElementById("keep-images").value||"[]");
  imgs.splice(index,1);
  document.getElementById("keep-images").value = JSON.stringify(imgs);
  renderExistingImages(imgs);
  if(imgs.length===0) document.getElementById("existing-images").style.display="none";
};

window.removeVideo = function(){
  document.getElementById("keep-video").value = "";
  document.getElementById("existing-video-wrap").style.display = "none";
};

/* ── NEW IMAGE PREVIEW ── */
document.getElementById("p-images-upload").addEventListener("change", function(){
  const preview = document.getElementById("new-images-preview");
  preview.innerHTML = "";
  Array.from(this.files).forEach(file=>{
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement("img");
      img.src = ev.target.result; img.className = "upload-thumb";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

/* ── NEW VIDEO PREVIEW ── */
document.getElementById("p-video-upload").addEventListener("change", function(){
  const preview = document.getElementById("new-video-preview");
  preview.innerHTML = "";
  if(this.files[0]){
    const url = URL.createObjectURL(this.files[0]);
    preview.innerHTML = `<video src="${url}" controls class="video-thumb"></video>`;
  }
});

/* ── SAVE / UPDATE ── */
window.saveProduct = async function(){
  const name          = document.getElementById("p-name").value.trim();
  const price         = Number(document.getElementById("p-price").value)||0;
  const originalPrice = Number(document.getElementById("p-original-price").value)||0;
  const type          = document.getElementById("p-type").value;
  const description   = document.getElementById("p-description").value.trim();
  const stock         = Number(document.getElementById("p-stock").value)||0;
  const deliveryDaysMin = Number(document.getElementById("p-delivery-min").value)||3;
  const deliveryDaysMax = Number(document.getElementById("p-delivery-max").value)||7;
  const rating        = Number(document.getElementById("p-rating").value)||0;
  const ratingCount   = Number(document.getElementById("p-rating-count").value)||0;
  const sold          = Number(document.getElementById("p-sold").value)||0;
  const storyId       = document.getElementById("edit-product-id").value.trim();

  if(!name || !price){
    setStatus("Name and price are required","err"); return;
  }

  const imgInput = document.getElementById("p-images-upload");
  const vidInput = document.getElementById("p-video-upload");

  // Must have at least one image (new upload or existing kept)
  const keptImages = JSON.parse(document.getElementById("keep-images").value||"[]");
  if(keptImages.length===0 && imgInput.files.length===0){
    setStatus("Please upload at least one product image","err"); return;
  }

  const btn = document.getElementById("save-btn");
  const btnText = document.getElementById("save-btn-text");
  if(btn) btn.disabled = true;
  if(btnText) btnText.innerText = "Uploading...";
  setStatus("Uploading images...");

  try{
    // Upload new images and append to kept ones
    const newImages = [];
    for(const file of imgInput.files){
      const url = await uploadFile(file,"products/images");
      newImages.push(url);
    }
    const images = [...keptImages, ...newImages];

    // Video — keep existing or upload new
    let videoUrl = document.getElementById("keep-video").value;
    if(vidInput.files.length){
      setStatus("Uploading video...");
      videoUrl = await uploadFile(vidInput.files[0],"products/videos");
    }

    const data = {
      name, price, originalPrice, type, description,
      images, stock, deliveryDaysMin, deliveryDaysMax,
      videoUrl, rating, ratingCount, sold
    };

    if(storyId){
      await updateDoc(doc(fdb,"products",storyId), data);
      setStatus("Product updated ✅","ok");
    } else {
      await addDoc(collection(fdb,"products"),{
        ...data, createdAt: new Date().toISOString()
      });
      setStatus("Product added ✅","ok");
      // Clear form for next product
      ["p-name","p-price","p-original-price","p-description","p-stock",
       "p-delivery-min","p-delivery-max","p-rating","p-rating-count","p-sold"
      ].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
      document.getElementById("p-type").value="";
      imgInput.value=""; vidInput.value="";
      document.getElementById("new-images-preview").innerHTML="";
      document.getElementById("new-video-preview").innerHTML="";
    }

  }catch(e){
    setStatus("Error: "+e.message,"err");
  }

  if(btn) btn.disabled = false;
  if(btnText) btnText.innerText = storyId ? "Update Product" : "Save Product";
};
