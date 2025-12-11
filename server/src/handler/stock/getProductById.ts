import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect'; // Path relative to its location in src/handler/stock

/**
 * GET /api/products/:id - Fetches a single active product by ID.
 */
export const getProductById = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: 'Invalid product ID provided.' });
    }

    try {
        const query = `
            SELECT 
                p."ItemID", 
                p."Name", 
                p."Description",
                p."Price", 
                p."StockLevel",
                p."LowStockThreshold",
                p."IsActive",
                c."Name" AS "CategoryName"
            FROM "Product" p
            JOIN "Category" c ON p."CategoryID" = c."CategoryID"
            WHERE p."ItemID" = $1 AND p."IsActive" = TRUE;
        `;
        const result: QueryResult = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Product with ID ${id} not found or is inactive.` });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Handler Error (getProductById):', error);
        res.status(500).json({ message: 'Error retrieving product details.' });
    }
};