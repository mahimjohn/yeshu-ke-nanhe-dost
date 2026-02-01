const db = firebase.database();
const storage = firebase.storage();

const productList = document.getElementById("productList");

/* ================= ADD PRODUCT ================= */

function addProduct(){

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const badge = document.getElementById("badge").value;
  const description = document.getElementById("description").value;
  const images = document.getElementById("image").files;

  if(!name || !price || images.length===0){
    alert("Fill all required fields");
    return;
  }

  const productId = db.ref("products").push().key;
  const imgUrls = [];

  Array.from(images).forEach((file,index)=>{

    const ref = storage.ref("products/"+productId+"_"+index);

    ref.put(file).then(snapshot=>{
      snapshot.ref.getDownloadURL().then(url=>{
        imgUrls.push(url);

        if(imgUrls.length === images.length){

          db.ref("products/"+productId).set({
            name,
            price,
            category,
            badge,
            description,
            images: imgUrls
          });

          alert("Product Added Successfully");

          document.getElementById("name").value="";
          document.getElementById("price").value="";
          document.getElementById("description").value="";
        }
      });
    });

  });

}

/* ================= LOAD PRODUCTS ================= */

db.ref("products").on("value", snapshot=>{

  productList.innerHTML="";

  snapshot.forEach(child=>{

    const p = child.val();

    const card = document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <img src="${p.images[0]}">
      <h4>${p.name}</h4>
      <p>₹${p.price}</p>
      <p>${p.category}</p>
      <p>${p.badge || ""}</p>
      <button onclick="deleteProduct('${child.key}')">Delete</button>
    `;

    productList.appendChild(card);
  });

});

/* ================= DELETE PRODUCT ================= */

function deleteProduct(id){
  if(confirm("Delete this product?")){
    db.ref("products/"+id).remove();
  }
}
