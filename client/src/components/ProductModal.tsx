import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Select, MenuItem,
    InputLabel, FormControl, useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

// --- UPDATED INTERFACES (Matching your provided structure) ---
export interface Product {
    id?: number; 
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryName: string; // The display name
    categoryId: number; // The ID sent to the API
    lowStockThreshold: number;
}

export interface Category {
    CategoryID: number;
    Name: string;
}

export interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    // Accept a broader shape to be compatible with different client DTOs
    productToEdit: any | null;
    onSave: (product: any) => void | Promise<void>;
    // --- CRITICAL CHANGE: RECEIVE CATEGORIES VIA PROPS ---
    categories: Category[]; 
    // ----------------------------------------------------
}


// --- UPDATED DEFAULT STATE ---
// Must match the new Product interface
const initialProductState: Product = {
    id: undefined,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryName: '', // Initialize name
    categoryId: 0,    // Initialize ID
    lowStockThreshold: 5,
};

// --- REMOVE THE HARDCODED CATEGORIES ARRAY ---
// const categories = ['Snacks', 'Beverages', 'School Supplies', 'Confectionery', 'Misc'];
// ----------------------------------------------------------------------------------

const ProductModal: React.FC<ProductModalProps> = ({
    open,
    onClose,
    productToEdit,
    onSave,
    categories, // <-- Destructure the categories prop here
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
                name === 'price' || name === 'stock' || name === 'lowStockThreshold'
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    // --- CRITICAL FIX: Handle category select ---
    const handleSelectChange = (e: any) => {
        const selectedCategoryName = e.target.value;
        // Find the full category object to get the ID
        const selectedCategory = categories.find(c => c.Name === selectedCategoryName);

        setProduct((prev) => ({
            ...prev,
            categoryName: selectedCategoryName, // Save the name for UI display
            categoryId: selectedCategory?.CategoryID || 0, // Save the ID for API payload
        }));
    };
    // ------------------------------------------

    // Validate and save
    const handleSave = async () => {
        // Basic validation check
        if (product.name.trim() === '' || product.price <= 0 || product.categoryId === 0) {
            alert(
                'Please ensure Name is not empty, Price is greater than zero, and a Category is selected.'
            );
            return;
        }

        try {
            await onSave(product);
            onClose();
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save product. See console for details.');
        }
    };

    const isEditMode = Boolean(productToEdit);
    const dialogTitle = isEditMode ? 'Edit Product Details' : 'Add New Product';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: {
                    backgroundColor: 'rgba(4, 29, 53, 0.7)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(180, 139, 2, 0.99)',
                    borderRadius: 4,
                    // Ensure the theme variable is used here:
                    boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}33`, 
                }, }}
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
                    {/* ... Name and Description TextFields ... */}
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

                    {/* --- CATEGORY DROPDOWN USING FETCHED DATA --- */}
                    <FormControl fullWidth required>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            name="categoryName" // Changed name to reflect state key
                            value={product.categoryName} // Bind to the display name
                            label="Category"
                            onChange={handleSelectChange}
                        >
                            {/* Map over the categories prop */}
                            {categories.map((c) => (
                                <MenuItem key={c.CategoryID} value={c.Name}>
                                    {c.Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* ------------------------------------------- */}

                    {/* New field for Low Stock Threshold */}
                    <TextField
                        label="Low Stock Threshold"
                        name="lowStockThreshold"
                        value={product.lowStockThreshold}
                        onChange={handleChange}
                        type="number"
                        inputProps={{ min: '1', step: '1' }}
                        fullWidth
                    />

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                {/* ... Dialog Actions ... */}
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