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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Grid from '@mui/material/Grid2';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { ordersApi } from '@/lib/orders';
import type { Order } from '@/types';
import { formatBaht } from '@/utils/format';
import {
  orderStatusLabel,
  orderStatusColor,
  paymentMethodLabel,
  formatDateTime,
} from '@/utils/order';
import OrderStatusTimeline from '@/components/order/OrderStatusTimeline';

const issueTopics = [
  'สินค้าชำรุด/เสียหาย',
  'ได้รับสินค้าไม่ครบ',
  'ได้รับสินค้าผิด',
  'จัดส่งล่าช้า',
  'อื่น ๆ',
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [issueOpen, setIssueOpen] = useState(false);
  const [topic, setTopic] = useState(issueTopics[0]);
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    ordersApi
      .get(id)
      .then((o) => active && setOrder(o))
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          ไม่พบคำสั่งซื้อนี้
        </Typography>
        <Button component={RouterLink} to="/orders" variant="contained">
          ไปที่ประวัติการสั่งซื้อ
        </Button>
      </Container>
    );
  }

  const needsPayment = order.status === 'pending_payment';
  const canConfirmReceived = order.status === 'shipped';

  const markSlipUploaded = async () => {
    setOrder(await ordersApi.pay(order.id));
  };

  const confirmReceived = async () => {
    setOrder(await ordersApi.confirmReceived(order.id));
  };

  const submitIssue = async () => {
    if (!detail.trim()) return;
    const updated = await ordersApi.addIssue(order.id, topic, detail.trim());
    setOrder(updated);
    setDetail('');
    setIssueOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {isNew && (
        <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3 }}>
          สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อของคุณคือ <strong>{order.id}</strong>
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">{order.id}</Typography>
          <Typography variant="body2" color="text.secondary">
            สั่งเมื่อ {formatDateTime(order.createdAt)}
          </Typography>
        </Box>
        <Chip
          label={orderStatusLabel[order.status]}
          color={orderStatusColor[order.status]}
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* ไทม์ไลน์สถานะ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ติดตามสถานะ
        </Typography>
        <Box sx={{ overflowX: 'auto', py: 1 }}>
          <OrderStatusTimeline order={order} />
        </Box>
      </Paper>

      {/* คำแนะนำการชำระเงิน */}
      {needsPayment && (
        <Paper sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
          <Typography variant="h6" gutterBottom>
            รอการชำระเงิน — {paymentMethodLabel[order.paymentMethod]}
          </Typography>

          {order.paymentMethod === 'promptpay' ? (
            <Stack alignItems="center" spacing={1} sx={{ my: 2 }}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                }}
              >
                <QrCode2Icon sx={{ fontSize: 140 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                สแกน QR พร้อมเพย์เพื่อชำระ {formatBaht(order.total)} (ตัวอย่างจำลอง)
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ my: 2 }}>
              <Typography variant="body2">
                โอนเงินจำนวน <strong>{formatBaht(order.total)}</strong> มาที่:
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                ธนาคารกสิกรไทย · เลขที่บัญชี <strong>123-4-56789-0</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ชื่อบัญชี: บริษัท ยามาล888 จำกัด
              </Typography>
            </Box>
          )}

          <Button variant="contained" onClick={markSlipUploaded} sx={{ mt: 1 }}>
            แจ้งชำระเงิน / แนบสลิป (จำลอง)
          </Button>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            เมื่อกดแล้ว ระบบจะเปลี่ยนสถานะเป็น “รอตรวจสอบการชำระเงิน” ให้แอดมินยืนยัน
          </Typography>
        </Paper>
      )}

      {order.status === 'awaiting_verification' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          เราได้รับแจ้งการชำระเงินแล้ว กำลังรอแอดมินตรวจสอบและยืนยัน
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* รายการสินค้า */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              รายการสินค้า
            </Typography>
            <Stack divider={<Divider />} spacing={1.5}>
              {order.items.map((it) => (
                <Stack key={it.productId} direction="row" spacing={2} alignItems="center">
                  <Box
                    component={RouterLink}
                    to={`/products/${it.slug}`}
                    sx={{ flexShrink: 0 }}
                  >
                    <Box
                      component="img"
                      src={it.image}
                      alt={it.name}
                      sx={{ width: 64, height: 64, borderRadius: 1.5, objectFit: 'cover' }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {it.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatBaht(it.price)} × {it.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatBaht(it.price * it.quantity)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                ยอดรวมสินค้า
              </Typography>
              <Typography variant="body2">{formatBaht(order.subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                ค่าจัดส่ง
              </Typography>
              <Typography variant="body2">
                {order.shippingFee === 0 ? 'ฟรี' : formatBaht(order.shippingFee)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                ยอดรวมทั้งหมด
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                {formatBaht(order.total)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* ที่อยู่ + การชำระเงิน + ปัญหา */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ที่อยู่จัดส่ง
            </Typography>
            <Typography variant="body2">{order.shippingAddress.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {order.shippingAddress.address} {order.shippingAddress.district}{' '}
              {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              วิธีชำระเงิน
            </Typography>
            <Typography variant="body2">{paymentMethodLabel[order.paymentMethod]}</Typography>
          </Paper>

          {/* แจ้งปัญหาสินค้า */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              แจ้งปัญหาสินค้า
            </Typography>
            {order.issues.length > 0 && (
              <List dense sx={{ mb: 1 }}>
                {order.issues.map((iss) => (
                  <ListItem key={iss.id} disableGutters>
                    <ListItemText
                      primary={iss.topic}
                      secondary={iss.detail}
                    />
                    <Chip
                      label={iss.status === 'open' ? 'รอดำเนินการ' : 'แก้ไขแล้ว'}
                      color={iss.status === 'open' ? 'warning' : 'success'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="outlined"
              color="warning"
              startIcon={<ReportProblemIcon />}
              onClick={() => setIssueOpen(true)}
              fullWidth
            >
              แจ้งปัญหา
            </Button>
          </Paper>

          {canConfirmReceived && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 3 }}
              startIcon={<CheckCircleIcon />}
              onClick={confirmReceived}
            >
              ได้รับสินค้าแล้ว
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Dialog แจ้งปัญหา */}
      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>แจ้งปัญหาสินค้า — {order.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="หัวข้อปัญหา"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              fullWidth
            >
              {issueTopics.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="รายละเอียด"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              placeholder="อธิบายปัญหาที่พบ…"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={submitIssue} disabled={!detail.trim()}>
            ส่งเรื่อง
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
