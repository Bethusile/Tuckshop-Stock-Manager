import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { QueryResult } from 'pg';

// Load environment variables from the server/.env file
dotenv.config({ path: 'server/.env' }); // Ensure the path is correct relative to the compiled file

// --- Interfaces for Type Safety ---

interface NewProductBody {
    Name: string;
    Description?: string;
    Price: number;
    CategoryID: number;
    InitialStock?: number; // The starting quantity
    LowStockThreshold?: number;
}

interface NewMovementBody {
    ProductID: number;
    MovementType: 'RECEIPT' | 'SALE' | 'ADJUSTMENT'; // Enforce allowed types
    Quantity: number; // The absolute amount of stock change
    // You could optionally add a UserID or Reason field here
}

// --- Configuration ---
const PORT = process.env.PORT || 3001;

// PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Test the database connection
pool.connect()
    .then(() => console.log('✅ PostgreSQL Database Connected!'))
    .catch((err) => console.error('❌ Database connection error', err));

// --- Application Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// --- Routes ---

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Tuckshop Stock Manager API is running!');
});

// GET: Fetch all active products
app.get('/api/products', async (req: Request, res: Response) => {
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
        console.error('API Error /api/products:', error);
        res.status(500).json({ message: 'Error retrieving products.' });
    }
});

// POST: Create a new product and optionally set initial stock
app.post('/api/products', async (req: Request<{}, {}, NewProductBody>, res: Response) => {
    const { 
        Name, 
        Description, 
        Price, 
        CategoryID, 
        InitialStock = 0, 
        LowStockThreshold 
    } = req.body;

    // 1. Basic Validation
    if (!Name || Price === undefined || CategoryID === undefined) {
        return res.status(400).json({ 
            message: 'Missing required fields: Name, Price, and CategoryID.' 
        });
    }

    // Use a database client from the pool to run transactions
    const client = await pool.connect();

    try {
        // Start a transaction for ACID compliance
        await client.query('BEGIN'); 

        // 2. Insert into the Product table
        const productQuery = `
            INSERT INTO "Product" ("Name", "Description", "Price", "CategoryID", "LowStockThreshold")
            VALUES ($1, $2, $3, $4, COALESCE($5, 5))
            RETURNING "ItemID", "Name", "StockLevel";
        `;
        const productValues = [
            Name, 
            Description, 
            Price, 
            CategoryID, 
            LowStockThreshold 
        ];
        
        const newProductResult: QueryResult = await client.query(productQuery, productValues);
        const newProductId = newProductResult.rows[0].ItemID;
        const newProductName = newProductResult.rows[0].Name;

        // 3. Insert initial StockMovement (if stock is provided and > 0)
        if (InitialStock > 0) {
            const movementQuery = `
                INSERT INTO "StockMovements" ("ProductID", "MovementType", "QuantityChange")
                VALUES ($1, 'RECEIPT', $2);
            `;
            const movementValues = [newProductId, InitialStock];
            await client.query(movementQuery, movementValues);
            // The PostgreSQL trigger handles the Product.StockLevel update here.
        }
        
        // 4. Commit the transaction
        await client.query('COMMIT'); 

        // Fetch the final StockLevel after the trigger has run
        const finalProductResult: QueryResult = await pool.query('SELECT "StockLevel" FROM "Product" WHERE "ItemID" = $1', [newProductId]);

        res.status(201).json({
            message: `Product '${newProductName}' created successfully.`,
            product: {
                ...newProductResult.rows[0],
                StockLevel: finalProductResult.rows[0].StockLevel // Return updated level
            },
            initialStock: InitialStock
        });

    } catch (error) {
        // 5. Rollback the transaction on any error
        await client.query('ROLLBACK'); 
        console.error('Transaction Error (POST /api/products):', error);
        
        // Specific Foreign Key violation (invalid CategoryID)
        if (error instanceof Error && 'code' in error && error.code === '23503') {
            return res.status(400).json({
                message: 'Invalid CategoryID provided. Please ensure the category exists.'
            });
        }

        res.status(500).json({ 
            message: 'Error creating product. The server has been notified.' 
        });
    } finally {
        // Always release the client back to the pool
        client.release();
    }
});


// POST: Record a new stock movement (Sale, Receipt, Adjustment)
app.post('/api/stock/movements', async (req: Request<{}, {}, NewMovementBody>, res: Response) => {
    const { ProductID, MovementType, Quantity } = req.body;
    
    // 1. Validation and quantity calculation
    if (!ProductID || !MovementType || Quantity === undefined || Quantity <= 0) {
        return res.status(400).json({ 
            message: 'Missing required fields or invalid quantity.' 
        });
    }

    const isSale = MovementType === 'SALE';
    // QuantityChange must be negative for sales, positive otherwise.
    const quantityChange = isSale ? -Math.abs(Quantity) : Math.abs(Quantity);

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // *** CRITICAL BUSINESS RULE: Check Stock Before Sale ***
        if (isSale) {
            // Use SELECT ... FOR UPDATE to lock the row and prevent race conditions
            // when multiple sales happen simultaneously.
            const stockCheckQuery = `
                SELECT "StockLevel" FROM "Product" WHERE "ItemID" = $1 FOR UPDATE;
            `;
            const result: QueryResult = await client.query(stockCheckQuery, [ProductID]);
            
            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Product not found.' });
            }

            const currentStock = result.rows[0].StockLevel;

            if (currentStock + quantityChange < 0) { // currentStock - quantity < 0
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
        const movementValues = [ProductID, MovementType, quantityChange];
        const newMovementResult: QueryResult = await client.query(movementQuery, movementValues);

        // The Product.StockLevel is automatically updated by the PostgreSQL trigger.

        // 3. Commit the transaction
        await client.query('COMMIT'); 

        // 4. Fetch the new StockLevel to return it to the client
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
        console.error('Transaction Error (POST /api/stock/movements):', error);
        res.status(500).json({ 
            message: 'Error recording stock movement. The server has been notified.' 
        });
    } finally {
        client.release();
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`⚡️ Server is listening on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api/products`);
});