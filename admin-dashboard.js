console.log("Admin JS Loaded");

const db = firebase.database();
const storage = firebase.storage();

/* ================= ADD PRODUCT ================= */

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

  const id = db.ref("products").push().key;
  const urls = [];

  Array.from(images).forEach((file,i)=>{

    const imgRef = storage.ref("products/"+id+"_"+i);

    imgRef.put(file)
    .then(snapshot => snapshot.ref.getDownloadURL())
    .then(url => {

      urls.push(url);

      if(urls.length === images.length){

        db.ref("products/"+id).set({
          name,
          price,
          category,
          badge,
          description,
          images: urls
        });

        alert("Product Added Successfully");

        document.getElementById("name").value="";
        document.getElementById("price").value="";
        document.getElementById("description").value="";
        document.getElementById("image").value="";
      }

    });

  });

}

/* ================= LOAD PRODUCTS ================= */

db.ref("products").on("value", snapshot => {

  const list = document.getElementById("productList");
  list.innerHTML = "";

  snapshot.forEach(child => {

    const p = child.val();

    list.innerHTML += `
      <div class="card">
        <img src="${p.images[0]}">
        <h4>${p.name}</h4>
        <p>₹${p.price}</p>
        <button onclick="deleteProduct('${child.key}')">Delete</button>
      </div>
    `;

  });

});

/* ================= DELETE ================= */

function deleteProduct(id){
  if(confirm("Delete this product?")){
    db.ref("products/"+id).remove();
  }
}
