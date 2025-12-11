import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Props for the Navbar component (can be extended later for real links/actions)
interface NavbarProps {
  appName?: string;
  userName?: string;
  onAdminClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  appName = "TuckShop", 
  userName = "Admin",
  onAdminClick = () => console.log('Admin clicked'), 
}) => {
  return (
    <AppBar 
      position="static" // Use 'sticky' or 'fixed' if needed, 'static' is fine for now
      sx={{ 
        // Custom styling to fit the dark/glassmorphism theme
        // Making the background transparent or semi-transparent
        backgroundColor: 'rgba(18, 59, 97, 0.8)', // Slightly transparent paper background
        backdropFilter: 'blur(10px)', // Glassmorphism blur effect
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', // Subtle shadow
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Light bottom border
      }}
    >
      <Toolbar>
        {/* App Logo and Name */}
        <Box display="flex" alignItems="center" flexGrow={1}>
          <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600 }}
          >
            {appName}
          </Typography>
        </Box>

        {/* User/Admin Profile Section */}
        <Button 
          color="inherit" 
          onClick={onAdminClick}
          sx={{
            borderRadius: 8, // Rounded button container
            p: '6px 16px', // Padding
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 28, 
              height: 28, 
              mr: 1,
              bgcolor: 'primary.main' 
            }}
          >
            <AccountCircleIcon fontSize="small" />
          </Avatar>
          <Typography variant="body1" sx={{ textTransform: 'none', fontWeight: 500 }}>
            {userName}
          </Typography>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;