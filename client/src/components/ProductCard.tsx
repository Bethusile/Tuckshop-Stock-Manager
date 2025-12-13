import React from 'react';
import {
    Card, CardContent, Typography, Chip, Box, Button,
    IconButton, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icon for product

// --- Import the shared Product type (or define it here if not using a shared types.ts) ---
// Assuming this interface is defined in a shared file (e.g., ../types) or is identical
// to the one in ProductModal.tsx
interface Product {
    id: number; // ItemID
    name: string;
    description: string;
    price: number;
    stock: number; // StockLevel
    categoryName: string; // CategoryName
    categoryId: number; 
    lowStockThreshold: number; // Used for the low stock check
}

// 2. Define the props for the ProductCard component
interface ProductCardProps {
    product: Product;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

// Helper function to format currency (assuming your prices are in pounds based on the '£' symbol)
const formatPrice = (price: number) => `£${price.toFixed(2)}`;

// Component for the Product Card
const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    
    // Determine if stock is low using the database's threshold value
    const isLowStock = product.stock <= product.lowStockThreshold;

    return (
        <Card 
            sx={{ 
                minWidth: 275, 
                borderRadius: 3, 
                transition: '0.3s',
                '&:hover': { 
                    boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4)',
                    transform: 'translateY(-2px)',
                },
                backgroundColor: 'background.paper', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <CardContent>
                {/* Header Section */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Inventory2Icon color="primary" />
                        <Typography variant="h6" component="div">
                            {product.name}
                        </Typography>
                    </Box>
                    <Chip 
                        label={product.categoryName} // Use categoryName from API
                        size="small" 
                        variant="outlined" 
                        color="secondary" 
                    />
                </Box>

                <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Price and Stock Details */}
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Price</Typography>
                    <Typography variant="h6" color="primary.main">{formatPrice(product.price)}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">Stock</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" color={isLowStock ? 'error.main' : 'text.primary'}>
                            {product.stock} // Use stock level from API
                        </Typography>
                        {isLowStock && (
                            <Chip label={`Low Stock (<${product.lowStockThreshold})`} size="small" color="error" variant="filled" />
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                {/* Action Buttons */}
                <Box display="flex" justifyContent="space-between" mt={1}>
                    <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />} 
                        onClick={() => onEdit(product.id)}
                        sx={{ flexGrow: 1, mr: 1, color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                        Edit
                    </Button>
                    <IconButton 
                        aria-label="delete" 
                        onClick={() => onDelete(product.id)}
                        color="error"
                        size="large"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProductCard;