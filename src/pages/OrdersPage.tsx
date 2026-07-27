import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link as RouterLink } from 'react-router-dom';
import { ordersApi } from '@/lib/orders';
import { ApiError } from '@/lib/api';
import type { Order } from '@/types';
import { formatBaht } from '@/utils/format';
import { orderStatusLabel, orderStatusColor, formatDateTime } from '@/utils/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    ordersApi
      .mine()
      .then((data) => active && setOrders(data))
      .catch((err) =>
        active && setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ'),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ประวัติการสั่งซื้อ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <ReceiptLongIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            ยังไม่มีคำสั่งซื้อ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่
          </Typography>
          <Button component={RouterLink} to="/products" variant="contained">
            เริ่มช้อป
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {order.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(order.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  label={orderStatusLabel[order.status]}
                  color={orderStatusColor[order.status]}
                  size="small"
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" spacing={1} sx={{ mb: 1.5, overflowX: 'auto' }}>
                {order.items.map((it) => (
                  <Box
                    key={it.productId}
                    component="img"
                    src={it.image}
                    alt={it.name}
                    title={`${it.name} × ${it.quantity}`}
                    sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
                  />
                ))}
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {order.items.reduce((n, it) => n + it.quantity, 0)} ชิ้น · รวม{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {formatBaht(order.total)}
                  </Box>
                </Typography>
                <Button component={RouterLink} to={`/orders/${order.id}`} size="small">
                  ดูรายละเอียด
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
