import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Badge,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useOrders } from '@/context/OrderContext';
import { formatBaht } from '@/utils/format';
import {
  orderStatusLabel,
  orderStatusColor,
  paymentMethodLabel,
  formatDateTime,
} from '@/utils/order';
import type { Order, OrderStatus } from '@/types';
import OrderStatusTimeline from '@/components/order/OrderStatusTimeline';

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'awaiting_verification', label: 'รอตรวจสอบชำระเงิน' },
  { value: 'paid', label: 'ชำระแล้ว' },
  { value: 'preparing', label: 'กำลังจัดเตรียม' },
  { value: 'shipped', label: 'จัดส่งแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

export default function AdminOrdersPage() {
  const { orders, getById, updateStatus, resolveIssue } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      [...orders]
        .filter((o) => filter === 'all' || o.status === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, filter],
  );

  const selected = selectedId ? getById(selectedId) : undefined;

  const openIssues = (o: Order) => o.issues.filter((i) => i.status === 'open').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        จัดการคำสั่งซื้อ
      </Typography>

      <TextField
        select
        size="small"
        label="กรองตามสถานะ"
        value={filter}
        onChange={(e) => setFilter(e.target.value as OrderStatus | 'all')}
        sx={{ mb: 2, minWidth: 220 }}
      >
        {statusFilters.map((f) => (
          <MenuItem key={f.value} value={f.value}>
            {f.label}
          </MenuItem>
        ))}
      </TextField>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>เลขคำสั่งซื้อ</TableCell>
              <TableCell>ลูกค้า</TableCell>
              <TableCell>วันที่</TableCell>
              <TableCell align="right">ยอดรวม</TableCell>
              <TableCell>ชำระเงิน</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {o.id}
                    </Typography>
                    {openIssues(o) > 0 && (
                      <Badge badgeContent={openIssues(o)} color="error">
                        <ReportProblemIcon color="warning" fontSize="small" />
                      </Badge>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell>{formatDateTime(o.createdAt)}</TableCell>
                <TableCell align="right">{formatBaht(o.total)}</TableCell>
                <TableCell>{paymentMethodLabel[o.paymentMethod]}</TableCell>
                <TableCell>
                  <Chip
                    label={orderStatusLabel[o.status]}
                    color={orderStatusColor[o.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setSelectedId(o.id)}>
                    รายละเอียด
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีคำสั่งซื้อในสถานะนี้
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog รายละเอียด + จัดการสถานะ */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        fullWidth
        maxWidth="md"
      >
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <span>คำสั่งซื้อ {selected.id}</span>
                <Chip
                  label={orderStatusLabel[selected.status]}
                  color={orderStatusColor[selected.status]}
                  size="small"
                />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              {/* การแจ้งปัญหา */}
              {selected.issues.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'warning.main' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <ReportProblemIcon
                      color="warning"
                      fontSize="small"
                      sx={{ verticalAlign: 'text-bottom', mr: 0.5 }}
                    />
                    ปัญหาที่ลูกค้าแจ้ง
                  </Typography>
                  <Stack spacing={1}>
                    {selected.issues.map((iss) => (
                      <Stack
                        key={iss.id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {iss.topic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {iss.detail}
                          </Typography>
                        </Box>
                        {iss.status === 'open' ? (
                          <Button size="small" onClick={() => resolveIssue(selected.id, iss.id)}>
                            ทำเครื่องหมายแก้ไขแล้ว
                          </Button>
                        ) : (
                          <Chip label="แก้ไขแล้ว" color="success" size="small" />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}

              <Box sx={{ overflowX: 'auto', py: 1, mb: 2 }}>
                <OrderStatusTimeline order={selected} />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                รายการสินค้า
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {selected.items.map((it) => (
                  <Stack key={it.productId} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {it.name} × {it.quantity}
                    </Typography>
                    <Typography variant="body2">{formatBaht(it.price * it.quantity)}</Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ยอดรวม
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatBaht(selected.total)}
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="subtitle2" gutterBottom>
                ที่อยู่จัดส่ง
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.shippingAddress.fullName} · {selected.shippingAddress.phone}
                <br />
                {selected.shippingAddress.address} {selected.shippingAddress.district}{' '}
                {selected.shippingAddress.province} {selected.shippingAddress.postalCode}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, py: 2 }}>
              {selected.status === 'awaiting_verification' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<VerifiedIcon />}
                  onClick={() => updateStatus(selected.id, 'paid', 'แอดมินยืนยันการชำระเงิน')}
                >
                  ยืนยันการชำระเงิน
                </Button>
              )}
              {selected.status === 'paid' && (
                <Button
                  variant="contained"
                  onClick={() => updateStatus(selected.id, 'preparing')}
                >
                  เริ่มจัดเตรียมสินค้า
                </Button>
              )}
              {selected.status === 'preparing' && (
                <Button variant="contained" onClick={() => updateStatus(selected.id, 'shipped')}>
                  ทำเครื่องหมายจัดส่งแล้ว
                </Button>
              )}
              {selected.status === 'shipped' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => updateStatus(selected.id, 'completed')}
                >
                  ทำเครื่องหมายสำเร็จ
                </Button>
              )}
              {!['completed', 'cancelled'].includes(selected.status) && (
                <Button
                  color="error"
                  onClick={() => updateStatus(selected.id, 'cancelled', 'ยกเลิกโดยแอดมิน')}
                >
                  ยกเลิกคำสั่งซื้อ
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelectedId(null)}>ปิด</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
