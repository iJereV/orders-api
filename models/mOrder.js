import mongoose, { get } from 'mongoose'

const productSchema = new mongoose.Schema({
  cantidad: {
    type: Number,
    required: true,
    min: [0, "La cantidad no puede ser negativa"],
  },
  item: {
    type: String,
    required: true,
    minlength: [2, "El nombre del ordero debe tener al menos 2 caracteres"],
    maxlength: [100, "El nombre del ordero no puede superar los 100 caracteres"],
  },
  precio: {
    type: Number,
    required: true,
    min: [0, "El precio no puede ser negativo"],
  },
  variacion: {
    type: Number,
    min: [0, "La variación no puede ser negativa"],
  }
});

const orderSchema = new mongoose.Schema({
  cliente: {
    type: String,
    required: true,
    maxlength: [50, "El nombre del cliente no puede superar los 50 caracteres"],
  },
  itinerario: {
    type: String,
    required: true,
    maxlength: [100, "El itinerario no puede superar los 100 caracteres"],
  },
  productos: {
    type: [productSchema],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "Debe haber al menos un producto",
    },
  },
  avion: {
    type: Boolean,
    required: true,
  },
  fecha: {
    type: String,
    required: true,
    match: [/^\d{2}\/\d{2}\/\d{4}$/, "El formato de fecha debe ser dd/mm/yyyy"],
  },
  direccion: {
    type: String,
    default: "",
  },
  localidad: {
    type: String,
    default: "",
  },
  archivado: {
    type: Boolean,
    default: false
  },
});

const Order = mongoose.model("Order", orderSchema);

const mOrder = {
    create: async({ cliente, itinerario, productos, avion, fecha, direccion, localidad }) => {
      try {
          const newOrder = new Order({ cliente, itinerario, productos, avion, fecha, direccion, localidad });
          await newOrder.save();
          return newOrder;
      } catch (error) {
          throw {status: 500, text: "Error a crear el pedido."};
      }
    },
    getOne: async(id) => {
      try {
          const order = await Order.findById(id);
          return order;
      } catch (error) {
          throw {status: 500, text: "Error al obtener los datos."};
      }
    },
    search: async (archivado) => {
      try {
        const filter = {};

        if (archivado !== undefined) {
          filter.archivado = archivado;
        }

        const orders = await Order.find(filter);
        return orders;
      } catch (error) {
        throw { status: 500, text: "Error al buscar pedidos." };
      }
    },
    getMany: async(ids) => {
      try {
          const orders = await Order.find({_id: {$in: ids}});
          return orders;
      } catch (error) {
          throw {status: 500, text: "Error al obtener los datos."};
      }
    },
    edit: async(id, order) => {
      try {
          const updatedOrder = await Order.findByIdAndUpdate(id, order)
          return updatedOrder;
      } catch (error) {
          throw {status: 500, text: "Error al actualizar pedidos."};
      }
    },
    deleteMany: async(ids) => {
      try {
          const deletedOrders = await Order.deleteMany({_id: {$in: ids}});
          return deletedOrders;
      } catch (error) {
          throw {status: 500, text: "Error al eliminar pedidos"};
      }
    },
    archiveMany: async (ids) => {
      try {
        const result = await Order.updateMany(
          { _id: { $in: ids } },
          { $set: { archivado: true } }
        );
        return {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        };
      } catch (error) {
        throw { status: 500, text: "Error al archivar pedidos." };
      }
    },
    unarchiveMany: async (ids) => {
      try {
        const result = await Order.updateMany(
          { _id: { $in: ids } },
          { $set: { archivado: false } }
        );
        return {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        };
      } catch (error) {
        throw { status: 500, text: "Error al desarchivar pedidos." };
      }
    }
}

export default mOrder;