import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// 1. IMPORT YOUR EXACT INTERFACES
// The Product interface here is the DB-structure type (ItemID, StockLevel, etc.)
import type { Product, CreateProduct, Category } from './types'; 

// Import Components
import Navbar from './components/Navbar'; 
import ProductList from './components/ProductList'; 
import ProductModal from './components/ProductModal'; 

const API_BASE_URL = 'http://localhost:3001/api';

// --- Client-Side Product Interface (camelCase structure for components) ---
// This acts as the DTO (Data Transfer Object) for the client components
interface ClientProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryName: string;
    categoryId: number; 
    lowStockThreshold: number;
    isActive: boolean;
}
// --------------------------------------------------------------------------


const Dashboard: React.FC = () => {
    // --- State Management: Now using the ClientProduct interface ---
    const [products, setProducts] = useState<ClientProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Modal expects the ClientProduct structure
    const [productToEdit, setProductToEdit] = useState<ClientProduct | null>(null);

    // --- Data Fetching Logic ---
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Products
            const productResponse = await fetch(`${API_BASE_URL}/products`);
            if (!productResponse.ok) throw new Error('Failed to fetch products');
            
            // 2. Data Mapping (CRITICAL STEP): Convert DB structure (Product) to Client structure (ClientProduct)
            const rawProducts: Product[] = await productResponse.json();
            const mappedProducts: ClientProduct[] = rawProducts.map(p => ({
                id: p.ItemID,              // DB: ItemID -> Client: id
                name: p.Name,
                description: '',           // Assuming Description is often null/missing from a join, handle default
                price: p.Price,
                stock: p.StockLevel,       // DB: StockLevel -> Client: stock
                categoryName: p.CategoryName,
                // NOTE: We need CategoryID from the backend query to put here. 
                // If your 'getAllProducts' query doesn't return CategoryID, you must modify that query.
                categoryId: 0, // Placeholder, must be fixed in backend
                lowStockThreshold: p.LowStockThreshold,
                isActive: p.IsActive,
            }));
            setProducts(mappedProducts);

            // Fetch Categories (for the dropdown)
            const categoryResponse = await fetch(`${API_BASE_URL}/categories`);
            if (!categoryResponse.ok) throw new Error('Failed to fetch categories');
            
            const categoryData: Category[] = await categoryResponse.json();
            setCategories(categoryData);

        } catch (err) {
            console.error("API Fetch Error:", err);
            setError("Failed to load inventory data. Check if the server is running on port 3001.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- Modal Handlers ---

    const handleOpenModal = (product: ClientProduct | null = null) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    // --- Action Handlers ---

    // 1. EDIT ACTION: Opens modal with existing product data
    const handleEditProduct = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            handleOpenModal(product);
        }
    };

    // 2. DELETE ACTION: Calls API to set IsActive = FALSE
    const handleDeleteProduct = (productId: number) => {
        if (window.confirm(`Are you sure you want to retire product ID ${productId}?`)) {
            // TODO: Implement DELETE API CALL HERE (e.g., PUT /api/products/:id/deactivate)
            console.log(`Deleting product ${productId}... (API call needed)`);
            // After successful API call:
            // fetchAllData(); 
        }
    };

    // 3. SAVE ACTION: Handles creation (POST) or update (PUT)
    // The input type should match what the modal gives back (ClientProduct structure)
    // We must then convert it to the CreateProduct/UpdateProduct structure for the API.
    const handleSaveProduct = async (productData: ClientProduct) => {
        const isNew = productData.id === 0 || productData.id === undefined;
        const method = isNew ? 'POST' : 'PUT';
        const endpoint = isNew ? `${API_BASE_URL}/products` : `${API_BASE_URL}/products/${productData.id}`;

        // Convert the client data back into the payload structure the API expects
        const apiPayload: CreateProduct = {
            id: productData.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            initialStock: productData.stock, // Use stock as initialStock for new/update
            categoryId: productData.categoryId,
            lowStockThreshold: productData.lowStockThreshold,
        };

        // TODO: Implement API logic (POST or PUT)
        console.log(`${method} data to ${endpoint}:`, apiPayload);

        // After successful save/update:
        // await fetchAllData(); 
    };

    // --- Render Logic (using ClientProduct type for list) ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>Loading Inventory...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">{error}</Typography>
                <Button onClick={fetchAllData} variant="contained" sx={{ mt: 2 }}>Try Again</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#121212' }}>
            <Navbar />

            <Container maxWidth="xl" sx={{ mt: 4, py: 2 }}>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.light' }}>
                        Inventory Overview ({products.length} Items)
                    </Typography>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        // Pass null to indicate a new product
                        onClick={() => handleOpenModal(null)} 
                        sx={{
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(79, 195, 247, 0.4)',
                        }}
                    >
                        Add New Product
                    </Button>
                </Box>

                {/* Product List Grid */}
                <ProductList
                    products={products}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                />
            </Container>

            {/* Product Modal Component */}
            <ProductModal
                open={isModalOpen}
                onClose={handleCloseModal}
                productToEdit={productToEdit} // ClientProduct is passed
                onSave={handleSaveProduct as (product: ClientProduct) => Promise<void>} // Cast for now, fix in ModalProps
                categories={categories}
            />
        </Box>
    );
};

export default Dashboard;