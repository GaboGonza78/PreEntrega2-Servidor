const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const cartsFile = path.join(__dirname, "../models/carts.json");

const getCarts = async () => JSON.parse(await fs.readFile(cartsFile, "utf-8"));
const saveCarts = async (carts) => fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));

router.post("/", async (req, res) => {
  const carts = await getCarts();
  const newCart = {
    id: (carts.length + 1).toString(),
    products: [],
  };
  carts.push(newCart);
  await saveCarts(carts);
  res.status(201).json(newCart);
});

router.get("/:id", async (req, res) => {
  const carts = await getCarts();
  const cart = carts.find((c) => c.id === req.params.id);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart);
});

router.post("/:id/product/:pid", async (req, res) => {
  const carts = await getCarts();
  const cart = carts.find((c) => c.id === req.params.id);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const productId = req.params.pid;
  const existingProduct = cart.products.find((p) => p.product === productId);

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.products.push({ product: productId, quantity: 1 });
  }

  await saveCarts(carts);
  res.json(cart);
});

module.exports = router;
