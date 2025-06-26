
import Router from 'express';
import cProduct from '../controllers/cProduct.js';
import { authRequired } from '../middlewares/validateToken.js';

const rProduct = Router();

rProduct.get('/products', authRequired, cProduct.getAll);
rProduct.post('/products', authRequired, cProduct.create);
rProduct.get('/products/:id',authRequired, cProduct.getOne);
rProduct.put('/products/:id', authRequired, cProduct.update);
rProduct.delete('/products', authRequired, cProduct.deleteMany);

export default rProduct;