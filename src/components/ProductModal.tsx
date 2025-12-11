import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

// This MUST match App.tsx exactly — id is optional for new products
export interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onSave: (product: Product) => void;
}


// Default state for new products
const initialProductState: Product = {
  id: undefined,
  name: '',
  category: 'Snacks',
  price: 0,
  stock: 0,
  description: '',
};

const categories = ['Snacks', 'Beverages', 'School Supplies', 'Confectionery', 'Misc'];

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  productToEdit,
  onSave,
}) => {
  const theme = useTheme();
  const [product, setProduct] = useState<Product>(initialProductState);

  // Load product when editing OR reset for new
  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      setProduct(initialProductState);
    }
  }, [productToEdit, open]);

  // Handle text inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stock'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Handle category select
  const handleSelectChange = (e: any) => {
    setProduct((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  // Validate and save
  const handleSave = () => {
    if (product.name.trim() === '' || product.price <= 0 || product.stock < 0) {
      alert(
        'Please ensure Name is not empty, Price is greater than zero, and Stock is non-negative.'
      );
      return;
    }

    onSave(product);
    onClose();
  };

  const isEditMode = Boolean(productToEdit);
  const dialogTitle = isEditMode ? 'Edit Product Details' : 'Add New Product';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(4, 29, 53, 0.7)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(180, 139, 2, 0.99)',
          borderRadius: 4,
          boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}33`,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ color: 'primary.light', fontWeight: 600 }}>
          {dialogTitle}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'grid', gap: 3 }}
        >
          <TextField
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Description (Optional)"
            name="description"
            value={product.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Price (£)"
              name="price"
              value={product.price}
              onChange={handleChange}
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              fullWidth
              required
            />

            <TextField
              label="Stock Quantity"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              type="number"
              inputProps={{ min: '0', step: '1' }}
              fullWidth
              required
            />
          </Box>

          <FormControl fullWidth required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={product.category}
              label="Category"
              onChange={handleSelectChange}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          color="secondary"
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          startIcon={<SaveIcon />}
          color="primary"
          variant="contained"
        >
          {isEditMode ? 'Save Changes' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
