import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { categories } from '@/data/categories';
import { getFeaturedProducts } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(120deg, #5b2be0 0%, #8259ff 60%, #ff7a00 140%)',
          color: 'common.white',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ maxWidth: 620 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
              Yamal888 Shop
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
              ช้อปออนไลน์ครบ จบในที่เดียว — สินค้าคุณภาพ ราคาดี ส่งไวถึงบ้าน
            </Typography>
            <Box>
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
              >
                เริ่มช้อปเลย
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* หมวดหมู่สินค้า */}
        <Typography variant="h5" gutterBottom>
          หมวดหมู่สินค้า
        </Typography>
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {categories.map((cat) => (
            <Grid key={cat.id} size={{ xs: 6, sm: 4, md: 2 }}>
              <Paper
                component={RouterLink}
                to={`/products?category=${cat.slug}`}
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  textDecoration: 'none',
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all .15s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light', color: '#fff' },
                }}
              >
                <Box sx={{ fontSize: 36, lineHeight: 1 }}>{cat.icon}</Box>
                <Typography variant="body2" align="center">
                  {cat.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* สินค้าแนะนำ */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">สินค้าแนะนำ</Typography>
          <Button component={RouterLink} to="/products" endIcon={<ArrowForwardIcon />}>
            ดูทั้งหมด
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {featured.map((product) => (
            <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
