import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../db/connect';

/**
 * GET /api/categories - Fetches all categories.
 */
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT "CategoryID", "Name"
            FROM "Category"
            ORDER BY "Name";
        `;
        const result: QueryResult = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Handler Error (getAllCategories):', error);
        res.status(500).json({ message: 'Error retrieving categories.' });
    }
};