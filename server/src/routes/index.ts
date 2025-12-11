import { Router } from 'express';
// Assuming these exist in your project structure:
import stockRouter from './stockRoutes'; // For Product and Stock Movements

// Create the main router instance
const router = Router();

// --- API Route Modules ---

/**
 * Stock Management Module
 * Routes: /api/products, /api/stock/movements
 */
router.use('/', stockRouter);


// --- Additional Module Examples (e.g., if you add a User Management) ---

// import userRouter from './userRoutes';
// router.use('/', userRouter);


export default router;