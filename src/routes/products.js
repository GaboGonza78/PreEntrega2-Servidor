const express = require("express");
const Product = require("../models/product");

const router = express.Router();

// Obtener productos con filtros, paginación y ordenamiento
router.get("/", async (req, res) => {
    try {
        let { limit = 10, page = 1, query, sort } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        // Filtros: por categoría o disponibilidad (stock > 0)
        let filter = {};
        if (query) {
            if (query === "available") {
                filter.stock = { $gt: 0 }; // Productos con stock disponible
            } else {
                filter.category = query; // Filtrar por categoría
            }
        }

        // Ordenamiento por precio ascendente o descendente
        const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {}; 

        // Obtener productos con paginación
        const products = await Product.find(filter)
            .sort(sortOption)
            .limit(limit)
            .skip((page - 1) * limit);

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Construir enlaces para paginación
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

        const prevLink = hasPrevPage ? `${baseUrl}?limit=${limit}&page=${page - 1}${query ? `&query=${query}` : ""}${sort ? `&sort=${sort}` : ""}` : null;
        const nextLink = hasNextPage ? `${baseUrl}?limit=${limit}&page=${page + 1}${query ? `&query=${query}` : ""}${sort ? `&sort=${sort}` : ""}` : null;

        res.json({
            status: "success",
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Error al obtener productos" });
    }
});

// Crear un nuevo producto
router.post("/", async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ status: "error", error: "Error al crear el producto" });
    }
});

// Eliminar un producto por ID
router.delete("/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ status: "error", error: "Error al eliminar el producto" });
    }
});

module.exports = router;



