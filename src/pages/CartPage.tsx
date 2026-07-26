import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  IconButton,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatBaht, effectivePrice } from '@/utils/format';

const SHIPPING_FLAT = 40; // ค่าส่งแบบเหมา
const FREE_SHIPPING_MIN = 1000; // ซื้อครบส่งฟรี

export default function CartPage() {
  const { items, subtotal, totalQuantity, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const goToCheckout = () => {
    if (isAuthenticated) navigate('/checkout');
    else navigate('/login', { state: { from: '/checkout' } });
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          ตะกร้าของคุณยังว่างอยู่
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          เลือกสินค้าที่ถูกใจแล้วเพิ่มลงตะกร้าได้เลย
        </Typography>
        <Button component={RouterLink} to="/products" variant="contained" size="large">
          เลือกซื้อสินค้า
        </Button>
      </Container>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ตะกร้าสินค้า ({totalQuantity} ชิ้น)
      </Typography>

      <Grid container spacing={3}>
        {/* รายการสินค้า */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {items.map(({ product, quantity }) => {
              const lineTotal = effectivePrice(product) * quantity;
              return (
                <Paper key={product.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Box
                      component={RouterLink}
                      to={`/products/${product.slug}`}
                      sx={{ flexShrink: 0 }}
                    >
                      <Box
                        component="img"
                        src={product.images[0]}
                        alt={product.name}
                        sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 2 }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        component={RouterLink}
                        to={`/products/${product.slug}`}
                        variant="subtitle1"
                        sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {formatBaht(effectivePrice(product))}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 1 }}
                      >
                        {/* ปรับจำนวน */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            value={quantity}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (!Number.isNaN(v)) updateQuantity(product.id, v);
                            }}
                            variant="standard"
                            inputProps={{
                              style: { textAlign: 'center', width: 36 },
                              inputMode: 'numeric',
                            }}
                            InputProps={{ disableUnderline: true }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {formatBaht(lineTotal)}
                        </Typography>

                        <IconButton
                          color="error"
                          onClick={() => removeItem(product.id)}
                          aria-label="ลบสินค้า"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <Button color="error" onClick={clearCart} sx={{ mt: 2 }} startIcon={<DeleteOutlineIcon />}>
            ล้างตะกร้าทั้งหมด
          </Button>
        </Grid>

        {/* สรุปคำสั่งซื้อ */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 88 }}>
            <Typography variant="h6" gutterBottom>
              สรุปคำสั่งซื้อ
            </Typography>

            <Stack spacing={1.5} sx={{ my: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  ยอดรวมสินค้า
                </Typography>
                <Typography variant="body2">{formatBaht(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  ค่าจัดส่ง
                </Typography>
                <Typography variant="body2">
                  {shipping === 0 ? 'ฟรี' : formatBaht(shipping)}
                </Typography>
              </Stack>
              {shipping > 0 && (
                <Typography variant="caption" color="text.secondary">
                  ซื้อครบ {formatBaht(FREE_SHIPPING_MIN)} ส่งฟรี!
                </Typography>
              )}
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" sx={{ my: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                ยอดชำระทั้งหมด
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                {formatBaht(total)}
              </Typography>
            </Stack>

            <Button variant="contained" size="large" fullWidth onClick={goToCheckout}>
              ดำเนินการชำระเงิน
            </Button>

            <Button
              component={RouterLink}
              to="/products"
              fullWidth
              sx={{ mt: 1 }}
            >
              เลือกซื้อสินค้าต่อ
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
