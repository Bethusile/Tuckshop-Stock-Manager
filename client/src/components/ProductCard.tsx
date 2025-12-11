import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icon for product

// 1. Define the TypeScript interface for a Product
interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

// 2. Define the props for the ProductCard component
interface ProductCardProps {
  product: Product;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

// Helper function to format currency
const formatPrice = (price: number) => `£${price.toFixed(2)}`;

// Component for the Product Card
const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  // Determine if stock is low
  const isLowStock = product.stock <= 5;

  return (
    // Card component from MUI
    <Card 
      sx={{ 
        minWidth: 275, 
        borderRadius: 3, 
        transition: '0.3s',
        '&:hover': { 
          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.4)', // Subtle hover effect
          transform: 'translateY(-2px)',
        },
        // Custom styling for the dark/glassmorphism feel
        backgroundColor: 'background.paper', // Uses the background.paper color from the dark theme
        border: '1px solid rgba(255, 255, 255, 0.1)', // Light border
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
          <Chip label={product.category} size="small" variant="outlined" color="secondary" />
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
              {product.stock}
            </Typography>
            {isLowStock && (
              <Chip label="Low Stock" size="small" color="error" variant="filled" />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

        {/* Action Buttons */}
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            onClick={() => product.id != null && onEdit(product.id)}
            sx={{ flexGrow: 1, mr: 1, color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            Edit
          </Button>
          <IconButton 
            aria-label="delete" 
            onClick={() => product.id != null && onDelete(product.id)}
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