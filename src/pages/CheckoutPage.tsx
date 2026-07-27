import { useState, type FormEvent } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  Alert,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';
import { ordersApi } from '@/lib/orders';
import { ApiError } from '@/lib/api';
import { formatBaht, effectivePrice } from '@/utils/format';
import { paymentMethodLabel } from '@/utils/order';
import type { PaymentMethod, ShippingAddress } from '@/types';

const SHIPPING_FLAT = 40;
const FREE_SHIPPING_MIN = 1000;

const paymentOptions: { value: PaymentMethod; icon: React.ReactNode; hint: string }[] = [
  { value: 'credit_card', icon: <CreditCardIcon />, hint: 'ชำระทันที (จำลอง)' },
  { value: 'promptpay', icon: <QrCode2Icon />, hint: 'สแกน QR แล้วแนบสลิป' },
  { value: 'bank_transfer', icon: <AccountBalanceIcon />, hint: 'โอนแล้วแนบสลิป' },
  { value: 'cod', icon: <LocalShippingIcon />, hint: 'จ่ายเมื่อรับสินค้า' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { refresh: refreshCatalog } = useCatalog();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    address: '',
    district: '',
    province: '',
    postalCode: '',
  });
  const [method, setMethod] = useState<PaymentMethod>('credit_card');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const update =
    (key: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [key]: e.target.value }));

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          ไม่มีสินค้าสำหรับชำระเงิน
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          เลือกซื้อสินค้า
        </Button>
      </Container>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{5}$/.test(address.postalCode)) {
      setError('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
      return;
    }

    setSubmitting(true);
    try {
      // ส่งแค่ productId + quantity — server คิดราคา/ตัดสต็อก/กำหนดสถานะเอง
      const order = await ordersApi.create({
        items: items.map((it) => ({ productId: it.product.id, quantity: it.quantity })),
        paymentMethod: method,
        shippingAddress: address,
      });
      clearCart();
      await refreshCatalog(); // ดึงสต็อกล่าสุด (server ตัดไปแล้ว)
      navigate(`/orders/${order.id}?new=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'สั่งซื้อไม่สำเร็จ');
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ชำระเงิน
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* ฟอร์มที่อยู่ + วิธีชำระเงิน */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                ที่อยู่จัดส่ง
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="ชื่อผู้รับ"
                    value={address.fullName}
                    onChange={update('fullName')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="เบอร์โทรศัพท์"
                    value={address.phone}
                    onChange={update('phone')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="ที่อยู่ (บ้านเลขที่ ซอย ถนน)"
                    value={address.address}
                    onChange={update('address')}
                    required
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="แขวง/ตำบล เขต/อำเภอ"
                    value={address.district}
                    onChange={update('district')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="จังหวัด"
                    value={address.province}
                    onChange={update('province')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="รหัสไปรษณีย์"
                    value={address.postalCode}
                    onChange={update('postalCode')}
                    required
                    fullWidth
                    inputProps={{ inputMode: 'numeric', maxLength: 5 }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                วิธีชำระเงิน
              </Typography>
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                <Stack spacing={1.5}>
                  {paymentOptions.map((opt) => (
                    <Paper
                      key={opt.value}
                      variant="outlined"
                      sx={{
                        px: 2,
                        borderColor: method === opt.value ? 'primary.main' : 'divider',
                        borderWidth: method === opt.value ? 2 : 1,
                      }}
                    >
                      <FormControlLabel
                        value={opt.value}
                        control={<Radio />}
                        sx={{ width: '100%', py: 1, m: 0 }}
                        label={
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            {opt.icon}
                            <Box>
                              <Typography variant="body1">
                                {paymentMethodLabel[opt.value]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {opt.hint}
                              </Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </Paper>
                  ))}
                </Stack>
              </RadioGroup>
            </Paper>
          </Grid>

          {/* สรุปคำสั่งซื้อ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 88 }}>
              <Typography variant="h6" gutterBottom>
                สรุปคำสั่งซื้อ
              </Typography>

              <Stack spacing={1} sx={{ my: 2, maxHeight: 220, overflowY: 'auto' }}>
                {items.map((it) => (
                  <Stack key={it.product.id} direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {it.product.name} × {it.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatBaht(effectivePrice(it.product) * it.quantity)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ยอดรวมสินค้า
                </Typography>
                <Typography variant="body2">{formatBaht(subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  ค่าจัดส่ง
                </Typography>
                <Typography variant="body2">
                  {shipping === 0 ? 'ฟรี' : formatBaht(shipping)}
                </Typography>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ยอดชำระ
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  {formatBaht(total)}
                </Typography>
              </Stack>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
              >
                {submitting ? 'กำลังสั่งซื้อ…' : 'ยืนยันคำสั่งซื้อ'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
