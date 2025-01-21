const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const productsFile = path.join(__dirname, "../models/products.json");

const getProducts = async () => JSON.parse(await fs.readFile(productsFile, "utf-8"));
const saveProducts = async (products) => fs.writeFile(productsFile, JSON.stringify(products, null, 2));

router.get("/", async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

router.post("/", async (req, res) => {
  const products = await getProducts();
  const newProduct = {
    id: (products.length + 1).toString(),
    ...req.body,
  };
  products.push(newProduct);
  await saveProducts(products);
  res.status(201).json(newProduct);
});

router.delete("/:id", async (req, res) => {
  const products = await getProducts();
  const updatedProducts = products.filter((product) => product.id !== req.params.id);
  await saveProducts(updatedProducts);
  res.json({ message: "Producto eliminado" });
});

module.exports = router;
