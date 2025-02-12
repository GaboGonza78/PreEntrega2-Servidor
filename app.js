require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const productsRouter = require("./src/routes/products");
const cartsRouter = require("./src/routes/carts");


dotenv.config(); 
connectDB(); 

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.engine("hbs", engine({ 
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "src", "views", "layouts")
   }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);


const productsFile = path.join(__dirname, "src/models/products.json");

const getProducts = async () => {
  const data = await fs.readFile(productsFile, "utf-8");
  return JSON.parse(data);
};

const saveProducts = async (products) => {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};


app.get("/", async (req, res) => {
  const products = await getProducts();
  res.render("home", { products });
});

app.get("/realtimeproducts", async (req, res) => {
  const products = await getProducts();
  res.render("realTimeProducts", { products });
});


io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("requestProducts", async () => {
    const products = await getProducts();
    socket.emit("updateProducts", products);
  });

  socket.on("createProduct", async (product) => {
    const products = await getProducts();
    const newProduct = {
      id: (products.length + 1).toString(),
      ...product,
    };
    products.push(newProduct);
    await saveProducts(products);

    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", async (productId) => {
    let products = await getProducts();
    products = products.filter((p) => p.id !== productId);
    await saveProducts(products);

    io.emit("updateProducts", products);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});


const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
