import { Router } from 'express';
import { allowAll } from '../middleware/allowAll'; 

// --- ADD NEW HANDLER HERE ---
import { getAllProducts } from '../handler/stock/getAllProducts';
import { createProduct } from '../handler/stock/createProduct';
import { updateProduct } from '../handler/stock/updateProduct';
import { recordStockMovement } from '../handler/stock/recordMovement';
import { getProductById } from '../handler/stock/getProductById'; 
import { getAllCategories } from '../handler/stock/getAllCategories';

const stockRouter = Router();

// Products
stockRouter.get('/products', allowAll, getAllProducts);
stockRouter.post('/products', allowAll, createProduct);
stockRouter.put('/products/:id', allowAll, updateProduct); 

// ADD NEW GET ROUTE
stockRouter.get('/products/:id', allowAll, getProductById); 

// Stock Movements
stockRouter.post('/stock/movements', allowAll, recordStockMovement);

// Categories
stockRouter.get('/categories', allowAll, getAllCategories);

export default stockRouter;