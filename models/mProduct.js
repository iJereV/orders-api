import moongose, { get } from 'mongoose'

const productSchema = new moongose.Schema({
    name: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,  
    },
    category:{
        type: String,
    },
    providers: {
        type: [String],
    },
    stock: {
        type: Number,
        default: 0
    }
});

const Product = moongose.model('Product',productSchema);

const mProduct = {
    create: async(name, price, category, providers, stock) => {
        try {
            const newProduct = new Product({name, price, category, providers, stock});
            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw {status: 500, text: "Error al crear un producto."};
        }
    },
    getOne: async(id) => {
        try {
            const product = await Product.findById(id);
            return product;
        } catch (error) {
            throw {status: 500, text: "Error al obtener los datos."};
        }
    },
    getAll: async() => {
        try {
            const products = await Product.find();
            return products;
        } catch (error) {
            throw {status: 500, text: "Error al obtener los datos."};
        }
    },
    edit: async(id, product) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, product)
            return updatedProduct;
        } catch (error) {
            throw {status: 500, text: "Error al actualizar un producto."};
        }
    },
    deleteMany: async(ids) => {
        try {
            const deletedProducts = await Product.deleteMany({_id: {$in: ids}});
            return deletedProducts;
        } catch (error) {
            throw {status: 500, text: "Error al eliminar productos."};
        }
    }
}

export default mProduct;