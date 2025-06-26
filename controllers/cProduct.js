
import {productSchema} from '../schemas/sProduct.js';
import mProduct from '../models/mProduct.js';

const cProduct = {
    getAll: async (req, res) => {
        try {
            const products = await mProduct.getAll();
            console.log(products);
            res.status(200).json(products);
        } catch (error) {
            res.status(error.status || 500).json({ text: error.text || "Internal server error." });
        }
    },
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await mProduct.getOne(id);
            if (!product) {
                return res.status(404).json({ text: "Producto no encontrado." });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(error.status || 500).json({ text: error.text || "Internal server error." });
        }
    },
    create: async (req, res) => {
        try {
            const { name, price, category, providers, stock } = req.body;

            const validation = productSchema.safeParse({ name, price, category, providers, stock });
            if (!validation.success) {
                throw {
                    status: 403,
                    text: validation.error.errors[0].message
                };
            }

            const newProduct = await mProduct.create(name, price, category, providers, stock);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(error.status || 500).json({ text: error.text || "Internal server error." });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, category, providers, stock } = req.body;

            const validation = productSchema.safeParse({ name, price, category, providers, stock });
            if (!validation.success) {
                throw {
                    status: 403,
                    text: validation.error.errors[0].message
                };
            }

            const updatedProduct = await mProduct.edit(id,{name, price, category, providers, stock});
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(error.status || 500).json({ text: error.text || "Internal server error." });
        }
    },
    deleteMany: async (req, res) => {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ text: "Arreglo de ids de pedidos inválido." });
            }

            await mProduct.deleteMany(ids);
            res.status(200).json({ text: "Productos eliminados correctamente." });
        } catch (error) {
            res.status(error.status || 500).json({ text: error.text || "Internal server error." });
        }
    },
}

export default cProduct;