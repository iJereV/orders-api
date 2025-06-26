
import Router from 'express';
import cOrder from '../controllers/cOrder.js';
import { authRequired } from '../middlewares/validateToken.js';

const rOrder = Router();

rOrder.get('/orders', authRequired, cOrder.getAll);
rOrder.get('/orders/archived', authRequired, cOrder.getArchived);
rOrder.post('/orders', authRequired, cOrder.create);
rOrder.get('/orders/:id', authRequired, cOrder.getOne);
rOrder.put('/orders/:id', authRequired, cOrder.update);
rOrder.delete('/orders', authRequired, cOrder.deleteMany);
rOrder.post('/orders/archive', authRequired, cOrder.archiveMany);
rOrder.post('/orders/unarchive', authRequired, cOrder.unarchiveMany);

export default rOrder;