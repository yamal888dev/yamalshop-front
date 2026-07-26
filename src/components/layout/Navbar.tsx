import { useState, type FormEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Divider,
  Container,
  alpha,
  useTheme,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { totalQuantity } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* โลโก้ */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <StorefrontIcon />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              Yamal888
            </Typography>
          </Box>

          {/* ช่องค้นหา */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'relative',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.15),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
              flexGrow: 1,
              maxWidth: 520,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
            }}
          >
            <Box sx={{ pl: 1.5, display: 'flex', alignItems: 'center' }}>
              <SearchIcon fontSize="small" />
            </Box>
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า…"
              sx={{ color: 'inherit', px: 1.5, py: 1, width: '100%' }}
              inputProps={{ 'aria-label': 'ค้นหาสินค้า' }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />

          {/* เมนูสินค้า */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/products"
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            สินค้าทั้งหมด
          </Button>

          {/* ตะกร้า */}
          <IconButton color="inherit" component={RouterLink} to="/cart" aria-label="ตะกร้าสินค้า">
            <Badge badgeContent={totalQuantity} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* บัญชี */}
          {isAuthenticated ? (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="บัญชีของฉัน"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Box>
                    <Typography variant="subtitle2">{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem
                  component={RouterLink}
                  to="/account"
                  onClick={() => setAnchorEl(null)}
                >
                  บัญชีของฉัน
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/orders"
                  onClick={() => setAnchorEl(null)}
                >
                  ประวัติการสั่งซื้อ
                </MenuItem>
                {isAdmin && (
                  <MenuItem
                    component={RouterLink}
                    to="/admin"
                    onClick={() => setAnchorEl(null)}
                  >
                    แผงควบคุมผู้ดูแล
                  </MenuItem>
                )}
                <Divider />
                <MenuItem
                  onClick={() => {
                    logout();
                    setAnchorEl(null);
                    navigate('/');
                  }}
                >
                  ออกจากระบบ
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{ borderColor: alpha('#fff', 0.5), flexShrink: 0 }}
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
