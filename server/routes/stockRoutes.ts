import { Router } from 'express';
import { getAllProducts, createProduct, recordStockMovement } from '../src/handler/stockHandler'; 
import { allowAll } from '../src/middleware/allowAll'; 

const stockRouter = Router();

// Products
stockRouter.get('/products', allowAll, getAllProducts);
stockRouter.post('/products', allowAll, createProduct);

// Stock Movements
stockRouter.post('/stock/movements', allowAll, recordStockMovement);

export default stockRouter;