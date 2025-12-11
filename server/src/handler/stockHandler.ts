import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../db/connect'; // Import the pool instance

// --- Interfaces for Type Safety ---

interface NewProductBody {
    Name: string;
    Description?: string;
    Price: number;
    CategoryID: number;
    InitialStock?: number; 
    LowStockThreshold?: number;
}

interface NewMovementBody {
    ProductID: number;
    MovementType: 'RECEIPT' | 'SALE' | 'ADJUSTMENT';
    Quantity: number; 
}

// --- Handler Functions ---

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
        await client.query('BEGIN'); // Start Transaction

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

        // 2. Insert initial StockMovement (if > 0)
        if (InitialStock > 0) {
            const movementQuery = `
                INSERT INTO "StockMovements" ("ProductID", "MovementType", "QuantityChange")
                VALUES ($1, 'RECEIPT', $2);
            `;
            await client.query(movementQuery, [newProductId, InitialStock]);
        }
        
        await client.query('COMMIT'); // Commit Transaction

        // Fetch the final StockLevel after the trigger has run
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
        
        // Handle Foreign Key violation
        if (error instanceof Error && 'code' in error && error.code === '23503') {
            return res.status(400).json({ message: 'Invalid CategoryID provided.' });
        }

        res.status(500).json({ message: 'Error creating product.' });
    } finally {
        client.release();
    }
};

/**
 * POST /api/stock/movements - Records a new stock movement.
 */
export const recordStockMovement = async (req: Request<{}, {}, NewMovementBody>, res: Response) => {
    const { ProductID, MovementType, Quantity } = req.body;
    
    if (!ProductID || !MovementType || Quantity === undefined || Quantity <= 0) {
        return res.status(400).json({ message: 'Missing required fields or invalid quantity.' });
    }

    const isSale = MovementType === 'SALE';
    const quantityChange = isSale ? -Math.abs(Quantity) : Math.abs(Quantity);

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // *** Check Stock Before Sale (Critical Business Rule) ***
        if (isSale) {
            const stockCheckQuery = `
                SELECT "StockLevel" FROM "Product" WHERE "ItemID" = $1 FOR UPDATE;
            `;
            const result: QueryResult = await client.query(stockCheckQuery, [ProductID]);
            
            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Product not found.' });
            }

            const currentStock = result.rows[0].StockLevel;

            if (currentStock + quantityChange < 0) {
                await client.query('ROLLBACK');
                return res.status(409).json({ 
                    message: `Insufficient stock. Current stock: ${currentStock}. Cannot sell ${Quantity}.` 
                });
            }
        }

        // 2. Insert the StockMovement
        const movementQuery = `
            INSERT INTO "StockMovements" ("ProductID", "MovementType", "QuantityChange")
            VALUES ($1, $2, $3)
            RETURNING "MovementID", "MovementTimestamp";
        `;
        const newMovementResult: QueryResult = await client.query(movementQuery, [ProductID, MovementType, quantityChange]);

        await client.query('COMMIT'); 

        // 3. Fetch the new StockLevel to return it to the client
        const finalStockResult: QueryResult = await pool.query('SELECT "StockLevel" FROM "Product" WHERE "ItemID" = $1', [ProductID]);

        res.status(201).json({
            message: `Stock movement recorded: ${MovementType}.`,
            movement: {
                ...newMovementResult.rows[0],
                NewStockLevel: finalStockResult.rows[0].StockLevel
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Handler Error (recordStockMovement):', error);
        res.status(500).json({ message: 'Error recording stock movement.' });
    } finally {
        client.release();
    }
};