import React from 'react';
import { Typography, Box } from '@mui/material';
import ProductCard from './ProductCard'; // Import the card component

// --- Define the Product interface again (or import from shared types file) ---
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryName: string;
    categoryId: number;
    lowStockThreshold: number;
}
// ----------------------------------------------------------------------------

interface ProductListProps {
    products: Product[];
    // Handlers passed from the parent component (App.tsx)
    onEditProduct: (id: number) => void;
    onDeleteProduct: (id: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
    products, 
    onEditProduct, 
    onDeleteProduct 
}) => {

    if (products.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">
                    No products found. Add a new item to the inventory!
                </Typography>
            </Box>
        );
    }

    return (
        <Box
      display="flex"
      flexWrap="wrap"
      gap={2} // spacing between items
      justifyContent="flex-start"
    >
      {products.map(product => (
        <Box
          key={product.id}
          flex="1 1 calc(25% - 16px)" // 4 items per row minus gap
          minWidth="200px" // optional min width for responsive layout
        >
          <ProductCard
            product={product}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
          />
        </Box>
      ))}
    </Box>
    );
};

export default ProductList;