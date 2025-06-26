import { Router } from 'express';
import cDocuments from '../controllers/cDocuments.js';
import { authRequired } from '../middlewares/validateToken.js';

const rDocuments = Router();

rDocuments.post('/loadSheet',authRequired, cDocuments.generateLoadSheet);
rDocuments.post('/receipts',authRequired, cDocuments.generateReceipts);
rDocuments.post('/orders_summary',authRequired, cDocuments.generateOrdersSummary);
rDocuments.post('/products_summary',authRequired, cDocuments.generateProductsSummary);

export default rDocuments;