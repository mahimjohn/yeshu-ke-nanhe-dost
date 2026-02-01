console.log("Admin JS Loaded");

// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const categoryInput = document.getElementById("category");
  const badgeInput = document.getElementById("badge");
  const descInput = document.getElementById("description");
  const imageInput = document.getElementById("image");
  const productList = document.getElementById("productList");
  const addBtn = document.getElementById("addBtn");

  addBtn.addEventListener("click", addProduct);

  // ---------------- ADD PRODUCT ----------------

  function addProduct(){

    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const category = categoryInput.value;
    const badge = badgeInput.value;
    const description = descInput.value.trim();
    const images = imageInput.files;

    if(!name || !price || images.length === 0){
      alert("Please fill all required fields");
      return;
    }

    const id = db.ref("products").push().key;
    const urls = [];

    Array.from(images).forEach((file,index)=>{

      const imgRef = storage.ref("products/" + id + "_" + index);

      imgRef.put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {

          urls.push(url);

          if(urls.length === images.length){

            db.ref("products/" + id).set({
              name,
              price,
              category,
              badge,
              description,
              images: urls
            });

            alert("Product Added Successfully");

            nameInput.value="";
            priceInput.value="";
            descInput.value="";
            imageInput.value="";

          }

        })
        .catch(err=>{
          console.error(err);
          alert("Image Upload Failed");
        });

    });

  }

  // ---------------- LOAD PRODUCTS ----------------

  db.ref("products").on("value", snapshot => {

    productList.innerHTML = "";

    snapshot.forEach(child => {

      const p = child.val();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${p.images[0]}">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <p>${p.category}</p>
        <button onclick="deleteProduct('${child.key}')">Delete</button>
      `;

      productList.appendChild(card);

    });

  });

});

// ---------------- DELETE PRODUCT ----------------

function deleteProduct(id){
  if(confirm("Delete this product?")){
    db.ref("products/" + id).remove();
  }
}
