const socket = io();

const form = document.getElementById("create-product-form");
const productList = document.getElementById("product-list");

socket.emit("requestProducts");

socket.on("updateProducts", (products) => {
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.textContent = `${product.title} - ${product.price}`;
    productList.appendChild(li);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const product = Object.fromEntries(formData);
  socket.emit("createProduct", product);
  form.reset();
});





