import { orderSchema } from '../schemas/sOrder.js';
import mOrder from '../models/mOrder.js';

const cOrder = {
  getAll: async (req, res) => {
    try {
      const orders = await mOrder.search(false);
      res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  getArchived: async (req, res) => {
    try {
      const orders = await mOrder.search(true);
      res.status(200).json(orders);
    } catch (error) {
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await mOrder.getOne(id);
      if (!order) {
        return res.status(404).json({ text: "Pedido no encontrado." });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  create: async (req, res) => {
    try {
      const { cliente, itinerario, productos, avion, fecha, direccion, localidad } = req.body;

      const validation = orderSchema.safeParse({ cliente, itinerario, productos, avion, fecha, direccion, localidad });
      if (!validation.success) {
        throw {
          status: 403,
          text: validation.error.errors[0].message,
        };
      }

      const newOrder = await mOrder.create({ cliente, itinerario, productos, avion, fecha, direccion, localidad });
      res.status(201).json(newOrder);
    } catch (error) {
      console.log(error);
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { cliente, itinerario, productos, avion, fecha, direccion, localidad } = req.body;

      const validation = orderSchema.safeParse({ cliente, itinerario, productos, avion, fecha, direccion, localidad });
      if (!validation.success) {
        throw {
          status: 403,
          text: validation.error.errors[0].message,
        };
      }

      const updatedOrder = await mOrder.edit(id, { cliente, itinerario, productos, avion, fecha, direccion, localidad });
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error.text);
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  deleteMany: async (req, res) => {
    try {
      const { ids } = req.body;
      console.log(ids);
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ text: "Arreglo de ids de pedidos inválido." });
      }

      await mOrder.deleteMany(ids);
      res.status(200).json({ text: "Pedidos eliminados correctamente." });
    } catch (error) {
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  archiveMany: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ text: "Arreglo de ids de pedidos inválido." });
      }

      await mOrder.archiveMany(ids);
      res.status(200).json({ text: "Pedidos archivados corrrectamente." });
    } catch (error) {
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
  unarchiveMany: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ text: "Arreglo de ids de pedidos inválido." });
      }

      await mOrder.unarchiveMany(ids);
      res.status(200).json({ text: "Pedidos desarchivados corrrectamente.." });
    } catch (error) {
      res.status(error.status || 500).json({ text: error.text || "Internal server error." });
    }
  },
};

export default cOrder;
