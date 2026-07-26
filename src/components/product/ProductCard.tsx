import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Link as RouterLink } from 'react-router-dom';
import type { Product } from '@/types';
import { formatBaht, effectivePrice, discountPercent } from '@/utils/format';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardActionArea component={RouterLink} to={`/products/${product.slug}`}>
          <CardMedia
            component="img"
            image={product.images[0]}
            alt={product.name}
            sx={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
          />
        </CardActionArea>
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            color="secondary"
            size="small"
            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
          />
        )}
        {outOfStock && (
          <Chip
            label="สินค้าหมด"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'grey.700', color: '#fff' }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {product.brand}
        </Typography>
        <Typography
          component={RouterLink}
          to={`/products/${product.slug}`}
          variant="subtitle2"
          sx={{
            color: 'text.primary',
            textDecoration: 'none',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 40,
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Rating value={product.rating} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">
            ({product.reviewCount})
          </Typography>
        </Stack>

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
              {formatBaht(effectivePrice(product))}
            </Typography>
            {discount > 0 && (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatBaht(product.price)}
              </Typography>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<AddShoppingCartIcon />}
            disabled={outOfStock}
            onClick={() => addItem(product)}
            sx={{ mt: 1 }}
          >
            {outOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
