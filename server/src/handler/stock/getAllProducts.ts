import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect'; // Note the adjusted path: '../../db/connect'

/**
 * GET /api/products - Fetches all active products.
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                p."ItemID", 
                p."Name", 
                p."Price", 
                p."StockLevel",
                p."LowStockThreshold",
                c."Name" AS "CategoryName"
            FROM "Product" p
            JOIN "Category" c ON p."CategoryID" = c."CategoryID"
            WHERE p."IsActive" = TRUE
            ORDER BY p."Name";
        `;
        const result: QueryResult = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Handler Error (getAllProducts):', error);
        res.status(500).json({ message: 'Error retrieving products.' });
    }
};