import { useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Rating,
  Chip,
  Stack,
  Button,
  Divider,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  IconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { formatBaht, effectivePrice, discountPercent } from '@/utils/format';
import { useCart } from '@/context/CartContext';
import { useCatalog } from '@/context/CatalogContext';
import ProductCard from '@/components/product/ProductCard';
import Grid from '@mui/material/Grid2';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { getBySlug, getByCategory, getCategoryById, loading } = useCatalog();

  const product = slug ? getBySlug(slug) : undefined;

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [snackOpen, setSnackOpen] = useState(false);

  const related = useMemo(() => {
    if (!product) return [];
    return getByCategory(product.categoryId)
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [product, getByCategory]);

  // ระหว่างโหลดสินค้าจาก API อย่าเพิ่งแสดง "ไม่พบสินค้า"
  if (loading && !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          ไม่พบสินค้าที่คุณต้องการ
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained">
          กลับไปหน้าสินค้า
        </Button>
      </Container>
    );
  }

  const category = getCategoryById(product.categoryId);
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;

  const changeQty = (delta: number) => {
    setQty((q) => Math.min(Math.max(1, q + delta), product.stock));
  };

  const handleAddToCart = () => {
    addItem(product, qty);
    setSnackOpen(true);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          หน้าแรก
        </Link>
        <Link component={RouterLink} to="/products" underline="hover" color="inherit">
          สินค้า
        </Link>
        {category && (
          <Link
            component={RouterLink}
            to={`/products?category=${category.slug}`}
            underline="hover"
            color="inherit"
          >
            {category.name}
          </Link>
        )}
        <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* รูปสินค้า */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="img"
            src={product.images[activeImage]}
            alt={product.name}
            sx={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          {product.images.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {product.images.map((im, i) => (
                <Box
                  key={im}
                  component="img"
                  src={im}
                  alt={`${product.name} ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: activeImage === i ? 'primary.main' : 'divider',
                  }}
                />
              ))}
            </Stack>
          )}
        </Grid>

        {/* ข้อมูลสินค้า */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="caption" color="text.secondary">
            {product.brand}
          </Typography>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Rating value={product.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary">
              {product.rating.toFixed(1)} ({product.reviewCount} รีวิว)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {formatBaht(effectivePrice(product))}
            </Typography>
            {discount > 0 && (
              <>
                <Typography
                  variant="h6"
                  color="text.disabled"
                  sx={{ textDecoration: 'line-through' }}
                >
                  {formatBaht(product.price)}
                </Typography>
                <Chip label={`ลด ${discount}%`} color="secondary" size="small" />
              </>
            )}
          </Stack>

          <Typography
            variant="body2"
            color={outOfStock ? 'error' : 'success.main'}
            sx={{ mb: 2 }}
          >
            {outOfStock ? 'สินค้าหมด' : `มีสินค้าในคลัง ${product.stock} ชิ้น`}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            {product.description}
          </Typography>

          {/* เลือกจำนวน */}
          {!outOfStock && (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="body2">จำนวน</Typography>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
              >
                <IconButton size="small" onClick={() => changeQty(-1)} disabled={qty <= 1}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  value={qty}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) setQty(Math.min(Math.max(1, v), product.stock));
                  }}
                  variant="standard"
                  inputProps={{
                    style: { textAlign: 'center', width: 40 },
                    inputMode: 'numeric',
                  }}
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton
                  size="small"
                  onClick={() => changeQty(1)}
                  disabled={qty >= product.stock}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              disabled={outOfStock}
              onClick={handleAddToCart}
              fullWidth
            >
              เพิ่มลงตะกร้า
            </Button>
            <Button
              variant="contained"
              size="large"
              disabled={outOfStock}
              onClick={handleBuyNow}
              fullWidth
            >
              ซื้อเลย
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap', gap: 1 }}>
            {product.tags.map((t) => (
              <Chip key={t} label={`#${t}`} size="small" variant="outlined" />
            ))}
          </Stack>
        </Grid>
      </Grid>

      {/* สินค้าที่เกี่ยวข้อง */}
      {related.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            สินค้าที่เกี่ยวข้อง
          </Typography>
          <Grid container spacing={2}>
            {related.map((p) => (
              <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackOpen(false)}
          action={
            <Button color="inherit" size="small" component={RouterLink} to="/cart">
              ดูตะกร้า
            </Button>
          }
        >
          เพิ่ม “{product.name}” ลงตะกร้าแล้ว
        </Alert>
      </Snackbar>
    </Container>
  );
}
