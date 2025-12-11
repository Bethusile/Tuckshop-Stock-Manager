import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect';

// Interface for the fields that can be updated
interface UpdateProductBody {
    Name?: string;
    Description?: string;
    Price?: number;
    CategoryID?: number;
    LowStockThreshold?: number;
    IsActive?: boolean; 
}

/**
 * PUT /api/products/:id - Updates details for a single product.
 */
export const updateProduct = async (req: Request<{ id: string }, {}, UpdateProductBody>, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const fields: string[] = [];
    // Define the type for the keys of UpdateProductBody
    const updateKeys = Object.keys(updates) as (keyof UpdateProductBody)[]; 

    const values: (string | number | boolean | undefined)[] = [];
    let paramIndex = 1;

    // Use the type-safe keys in the loop
    for (const key of updateKeys) { 
        // The check 'updates[key] !== undefined' is sufficient here
        if (updates[key] !== undefined) {
            // PostgreSQL requires column names to be quoted for case sensitivity
            fields.push(`"${key}" = $${paramIndex++}`);
            values.push(updates[key]); 
        }
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    values.push(id); 

    try {
        const updateQuery = `
            UPDATE "Product"
            SET ${fields.join(', ')}
            WHERE "ItemID" = $${paramIndex}
            RETURNING "ItemID", "Name", "StockLevel";
        `;

        const result: QueryResult = await pool.query(updateQuery, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: `Product with ID ${id} not found.` });
        }

        res.status(200).json({
            message: `Product '${result.rows[0].Name}' updated successfully.`,
            product: result.rows[0]
        });

    } catch (error) {
        console.error('Handler Error (updateProduct):', error);
        
        if (error instanceof Error && 'code' in error && error.code === '23503') {
            return res.status(400).json({ message: 'Invalid CategoryID provided for update.' });
        }
        
        res.status(500).json({ message: 'Error updating product.' });
    }
};