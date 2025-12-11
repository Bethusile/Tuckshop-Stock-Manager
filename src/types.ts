// Define the core data structure for a Product in the application.
// We allow 'id' to be null for products that haven't been saved to the database yet (e.g., in the modal).
export interface Product {
  id: number | null; // null for a product being added, number for existing product
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

// Interface for Products that MUST have an ID (i.e., data stored in the database/state)
export interface StoredProduct extends Product {
    id: number;
}