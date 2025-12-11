import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect';

// Interface for the incoming request body
interface NewMovementBody {
    ProductID: number;
    MovementType: 'RECEIPT' | 'SALE' | 'ADJUSTMENT';
    Quantity: number; 
}

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