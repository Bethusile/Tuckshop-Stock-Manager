import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect';

// Interface for the incoming request body
interface NewProductBody {
    Name: string;
    Description?: string;
    Price: number;
    CategoryID: number;
    InitialStock?: number; 
    LowStockThreshold?: number;
}

/**
 * POST /api/products - Creates a new product and initial stock.
 */
export const createProduct = async (req: Request<{}, {}, NewProductBody>, res: Response) => {
    const { 
        Name, 
        Description, 
        Price, 
        CategoryID, 
        InitialStock = 0, 
        LowStockThreshold 
    } = req.body;

    if (!Name || Price === undefined || CategoryID === undefined) {
        return res.status(400).json({ message: 'Missing required fields: Name, Price, and CategoryID.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 

        // 1. Insert into Product table
        const productQuery = `
            INSERT INTO "Product" ("Name", "Description", "Price", "CategoryID", "LowStockThreshold")
            VALUES ($1, $2, $3, $4, COALESCE($5, 5))
            RETURNING "ItemID", "Name";
        `;
        const productValues = [Name, Description, Price, CategoryID, LowStockThreshold];
        const newProductResult: QueryResult = await client.query(productQuery, productValues);
        const newProductId = newProductResult.rows[0].ItemID;
        const newProductName = newProductResult.rows[0].Name;

        // 2. Insert initial StockMovement
        if (InitialStock > 0) {
            const movementQuery = `
                INSERT INTO "StockMovements" ("ProductID", "MovementType", "QuantityChange")
                VALUES ($1, 'RECEIPT', $2);
            `;
            await client.query(movementQuery, [newProductId, InitialStock]);
        }
        
        await client.query('COMMIT'); 

        const finalProductResult: QueryResult = await pool.query('SELECT "StockLevel" FROM "Product" WHERE "ItemID" = $1', [newProductId]);

        res.status(201).json({
            message: `Product '${newProductName}' created successfully.`,
            product: {
                ...newProductResult.rows[0],
                StockLevel: finalProductResult.rows[0].StockLevel 
            },
        });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Handler Error (createProduct):', error);
        
        if (error instanceof Error && 'code' in error && error.code === '23503') {
            return res.status(400).json({ message: 'Invalid CategoryID provided.' });
        }

        res.status(500).json({ message: 'Error creating product.' });
    } finally {
        client.release();
    }
};