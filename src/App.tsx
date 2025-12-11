import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  Card,
  CardContent,
  useTheme,
  Grid,
  Switch,
  Slider
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import GridViewIcon from '@mui/icons-material/GridView';

import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';

// --- Shared Product Interface ---
interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

// --- Mock Initial Data ---
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Biscuits', category: 'snacks', price: 0.90, stock: 2, description: 'Assorted biscuit pack.' },
  { id: 2, name: 'Chocolate Bar', category: 'snacks', price: 1.50, stock: 25, description: 'Milk chocolate bar.' },
  { id: 3, name: 'Crisps Pack', category: 'snacks', price: 0.80, stock: 40, description: 'Salted potato crisps.' },
  { id: 4, name: 'Energy Drink', category: 'beverages', price: 2.50, stock: 18, description: 'High-caffeine energy drink.' },
  { id: 5, name: 'Pencil Case', category: 'school supplies', price: 5.00, stock: 1, description: 'Zipped pencil case.' },
  { id: 6, name: 'Gummy Bears', category: 'confectionery', price: 0.50, stock: 100, description: 'Bag of mixed gummy bears.' },
  { id: 7, name: 'Juice Box', category: 'beverages', price: 1.20, stock: 3, description: 'Apple flavored juice box.' },
  { id: 8, name: 'Notebook', category: 'school supplies', price: 3.50, stock: 15, description: 'A4 lined notebook.' },
];

// --- Stats Card ---
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card 
      sx={{ 
        borderRadius: 2, 
        backgroundColor: 'background.paper',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}1A` }}>
            {icon}
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const App: React.FC = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // --------------------------------------------------------
  // ✅ FILTER STATES (NEW)
  // --------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // --------------------------------------------------------

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const nextId = products.length > 0 ? Math.max(0, ...products.map(p => p.id ?? 0)) + 1 : 1;

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToEdit(product);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = (productData: Product) => {
    if (productData.id) {
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    } else {
      const newProduct = { ...productData, id: nextId };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm(`Are you sure you want to delete product ID ${id}?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // --------------------------------------------------------
  // ✅ APPLY FILTERS & SORT LOGIC
  // --------------------------------------------------------
  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product =>
      categoryFilter ? product.category === categoryFilter : true
    )
    .filter(product =>
      lowStockOnly ? product.stock <= 5 : true
    )
    .filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      const fieldA = a[sortBy as keyof Product];
      const fieldB = b[sortBy as keyof Product];

      if (typeof fieldA === 'string')
        return sortOrder === 'asc'
          ? fieldA.localeCompare(fieldB as string)
          : (fieldB as string).localeCompare(fieldA);

      return sortOrder === 'asc'
        ? (fieldA as number) - (fieldB as number)
        : (fieldB as number) - (fieldA as number);
    });
  // --------------------------------------------------------

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Navbar />

      <Box sx={{ p: 4 }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#6BB7FF' }} >
              Products
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e354bff' }} >
              Manage your tuck shop inventory
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ p: 1.5, borderRadius: 2, fontWeight: 600 }}
          >
            Add Product
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ flexGrow: 1, mb: 4 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <StatsCard 
                title="Total Products" 
                value={totalProducts} 
                icon={<GridViewIcon sx={{ color: theme.palette.primary.main }} />}
                color={theme.palette.primary.main}
              />
            </Grid>

            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <StatsCard 
                title="Low Stock" 
                value={lowStockCount} 
                icon={<WarningIcon sx={{ color: theme.palette.error.main }} />}
                color={theme.palette.error.main}
              />
            </Grid>
          </Grid>
        </Box>

        {/* --------------------------------------------------------
            FILTERS + SEARCH UI  (added extra controls)
        --------------------------------------------------------- */}
        <Box display="flex" gap={2} mb={4} sx={{ backgroundColor: 'background.paper', p: 2, borderRadius: 2 }}>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Category Filter */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="cat-label">Category</InputLabel>
            <Select
              labelId="cat-label"
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="snacks">Snacks</MenuItem>
              <MenuItem value="beverages">Beverages</MenuItem>
              <MenuItem value="school supplies">School Supplies</MenuItem>
              <MenuItem value="confectionery">Confectionery</MenuItem>
            </Select>
          </FormControl>

          {/* Low Stock */}
          <FormControl size="small">
            <Typography variant="caption">Low Stock</Typography>
            <Switch
              checked={lowStockOnly}
              onChange={() => setLowStockOnly(prev => !prev)}
            />
          </FormControl>

          {/* Price Range */}
          <Box sx={{ width: 200 }}>
            <Typography variant="caption">Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={(_, val) => setPriceRange(val as number[])}
              min={0}
              max={10}
              step={0.5}
            />
          </Box>

          {/* Sort By */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="sort-label">Sort by</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
            </Select>
          </FormControl>

          {/* Sort Order */}
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="order-label">Order</InputLabel>
            <Select
              labelId="order-label"
              label="Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="asc">A–Z</MenuItem>
              <MenuItem value="desc">Z–A</MenuItem>
            </Select>
          </FormControl>

        </Box>

        {/* Product Grid */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 8, md: 12 }}>
            {filteredProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 2, sm: 4, md: 3 }}>
                <ProductCard
                  product={product}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteProduct}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>

      <ProductModal
        open={isModalOpen}
        onClose={handleCloseModal}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />
    </Box>
  );
};

export default App;
