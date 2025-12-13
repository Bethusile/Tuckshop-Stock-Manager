/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Create Category Table
    CREATE TABLE "Category" (
        "CategoryID" SERIAL PRIMARY KEY,
        "Name" VARCHAR(100) NOT NULL UNIQUE
    );

    -- 2. Create Product Table
    CREATE TABLE "Product" (
        "ItemID" SERIAL PRIMARY KEY,
        "Name" VARCHAR(255) NOT NULL,
        "Description" TEXT,
        "Price" DECIMAL(10, 2) NOT NULL,
        "CategoryID" INTEGER REFERENCES "Category"("CategoryID"),
        "StockLevel" INTEGER DEFAULT 0,
        "LowStockThreshold" INTEGER DEFAULT 5,
        "IsActive" BOOLEAN DEFAULT TRUE
    );

    -- 3. Create StockMovements Table
    CREATE TABLE "StockMovements" (
        "MovementID" SERIAL PRIMARY KEY,
        "ProductID" INTEGER REFERENCES "Product"("ItemID"),
        "MovementType" VARCHAR(20) CHECK ("MovementType" IN ('RECEIPT', 'SALE', 'ADJUSTMENT')),
        "QuantityChange" INTEGER NOT NULL,
        "MovementTimestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Create Trigger Function
    CREATE OR REPLACE FUNCTION update_stock_level()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE "Product"
        SET "StockLevel" = "StockLevel" + NEW."QuantityChange"
        WHERE "ItemID" = NEW."ProductID";
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- 5. Create Trigger
    CREATE TRIGGER trg_update_stock_level
    AFTER INSERT ON "StockMovements"
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_level();

    -- 6. Seed Categories
    INSERT INTO "Category" ("Name") VALUES 
    ('Snacks'), 
    ('Beverages'), 
    ('School Supplies'), 
    ('Confectionery'), 
    ('Misc');

    -- 7. Seed Initial Products
    INSERT INTO "Product" ("Name", "Description", "Price", "CategoryID", "StockLevel", "LowStockThreshold", "IsActive") VALUES
    ('Lays Salted Chips', 'Classic salted potato chips, 125g', 15.00, 1, 0, 10, TRUE),
    ('Coke Zero 500ml', 'Sugar-free cola soft drink', 12.00, 2, 0, 24, TRUE),
    ('Blue Ballpoint Pen', 'Standard blue biro pen', 5.00, 3, 0, 50, TRUE),
    ('Bar One', 'Choc bar with caramel and nougat', 11.00, 4, 0, 20, TRUE);

    -- 8. Seed Initial Stock (Trigger will update StockLevels)
    INSERT INTO "StockMovements" ("ProductID", "MovementType", "QuantityChange") VALUES
    (1, 'RECEIPT', 50),
    (2, 'RECEIPT', 100),
    (3, 'RECEIPT', 200),
    (4, 'RECEIPT', 48);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    -- Drop in reverse order of dependency
    DROP TRIGGER IF EXISTS trg_update_stock_level ON "StockMovements";
    DROP FUNCTION IF EXISTS update_stock_level;
    DROP TABLE IF EXISTS "StockMovements";
    DROP TABLE IF EXISTS "Product";
    DROP TABLE IF EXISTS "Category";
  `);
};