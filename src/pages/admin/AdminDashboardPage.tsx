import { useEffect, useState } from 'react';
import { Typography, Paper, Box, Stack, Chip, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Link as RouterLink } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import { ordersApi, type OrderStats } from '@/lib/orders';
import type { Order } from '@/types';
import { formatBaht } from '@/utils/format';
import { orderStatusLabel, orderStatusColor, formatDateTime } from '@/utils/order';

const LOW_STOCK = 20;

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: color,
            color: '#fff',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const { products } = useCatalog();

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([ordersApi.stats(), ordersApi.all()])
      .then(([s, all]) => {
        if (!active) return;
        setStats(s);
        setRecentOrders(all.slice(0, 5));
      })
      .catch(() => {
        /* แสดงค่าเริ่มต้นถ้าโหลดไม่ได้ */
      });
    return () => {
      active = false;
    };
  }, []);

  const revenue = stats?.revenue ?? 0;
  const orderCount = stats?.orderCount ?? 0;
  const productCount = stats?.productCount ?? products.length;
  const customerCount = stats?.customerCount ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;

  const lowStock = products.filter((p) => p.stock <= LOW_STOCK);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ภาพรวมร้านค้า
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<PaidIcon />}
            label="ยอดขายรวม"
            value={formatBaht(revenue)}
            color="#1aab5b"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<ReceiptLongIcon />}
            label="คำสั่งซื้อทั้งหมด"
            value={`${orderCount}`}
            color="#5b2be0"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<Inventory2Icon />}
            label="สินค้าในระบบ"
            value={`${productCount}`}
            color="#ff7a00"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<PeopleIcon />}
            label="สมาชิก (ลูกค้า)"
            value={`${customerCount}`}
            color="#0288d1"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* คำสั่งซื้อรอดำเนินการ + ล่าสุด */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">คำสั่งซื้อล่าสุด</Typography>
              <Button component={RouterLink} to="/admin/orders" size="small">
                ดูทั้งหมด
              </Button>
            </Stack>
            {pendingCount > 0 && (
              <Chip
                color="warning"
                label={`มี ${pendingCount} รายการรอดำเนินการ/ตรวจสอบ`}
                sx={{ mb: 2 }}
              />
            )}
            {recentOrders.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีคำสั่งซื้อ
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={1.5}>
                {recentOrders.map((o) => (
                  <Stack
                    key={o.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        component={RouterLink}
                        to="/admin/orders"
                        variant="body2"
                        sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}
                      >
                        {o.id}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {o.customerName} · {formatDateTime(o.createdAt)}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatBaht(o.total)}
                      </Typography>
                      <Chip
                        label={orderStatusLabel[o.status]}
                        color={orderStatusColor[o.status]}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* สต็อกใกล้หมด */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                <WarningAmberIcon
                  color="warning"
                  fontSize="small"
                  sx={{ verticalAlign: 'text-bottom', mr: 0.5 }}
                />
                สต็อกใกล้หมด (≤ {LOW_STOCK})
              </Typography>
              <Button component={RouterLink} to="/admin/stock" size="small">
                จัดการ
              </Button>
            </Stack>
            {lowStock.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                ไม่มีสินค้าที่สต็อกใกล้หมด 🎉
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={1}>
                {lowStock.slice(0, 6).map((p) => (
                  <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" noWrap sx={{ mr: 1 }}>
                      {p.name}
                    </Typography>
                    <Chip
                      label={`${p.stock} ชิ้น`}
                      color={p.stock === 0 ? 'error' : 'warning'}
                      size="small"
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
