console.log("Admin JS Loaded");

/* ---------------- ADD PRODUCT ---------------- */

function addProduct(){

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const badge = document.getElementById("badge").value;
  const description = document.getElementById("description").value;
  const images = document.getElementById("image").files;

  if(!name || !price || images.length === 0){
    alert("Fill all required fields");
    return;
  }

  const productId = db.ref("products").push().key;
  const imageUrls = [];

  Array.from(images).forEach((file,index)=>{

    const imgRef = storage.ref("products/" + productId + "_" + index);

    imgRef.put(file).then(snapshot=>{
      snapshot.ref.getDownloadURL().then(url=>{
        imageUrls.push(url);

        if(imageUrls.length === images.length){

          db.ref("products/" + productId).set({
            name,
            price,
            category,
            badge,
            description,
            images: imageUrls
          });

          alert("Product Added Successfully");

          document.getElementById("name").value="";
          document.getElementById("price").value="";
          document.getElementById("description").value="";
          document.getElementById("image").value="";

        }
      });
    });

  });

}

/* ---------------- LOAD PRODUCTS ---------------- */

db.ref("products").on("value", snapshot=>{

  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  snapshot.forEach(child=>{

    const p = child.val();

    productList.innerHTML += `
      <div class="card">
        <img src="${p.images[0]}">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <p>${p.category}</p>
        <button onclick="deleteProduct('${child.key}')">Delete</button>
      </div>
    `;
  });

});

/* ---------------- DELETE ---------------- */

function deleteProduct(id){
  if(confirm("Delete this product?")){
    db.ref("products/" + id).remove();
  }
}
