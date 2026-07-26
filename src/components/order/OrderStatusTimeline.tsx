import { Stepper, Step, StepLabel, Box, Typography, Chip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Order } from '@/types';
import { orderFlow, orderStatusLabel, formatDateTime } from '@/utils/order';

/** แสดงความคืบหน้าของคำสั่งซื้อเป็นขั้นตอน (stepper) */
export default function OrderStatusTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 2,
          bgcolor: 'error.light',
          color: 'error.contrastText',
          borderRadius: 2,
        }}
      >
        <CancelIcon />
        <Typography>คำสั่งซื้อนี้ถูกยกเลิกแล้ว</Typography>
      </Box>
    );
  }

  // หา index ของสถานะปัจจุบันในลำดับ flow
  const activeIndex = orderFlow.indexOf(order.status);

  // เก็บเวลาที่ไปถึงแต่ละสถานะจาก statusHistory
  const reachedAt = new Map<string, string>();
  order.statusHistory.forEach((ev) => {
    if (!reachedAt.has(ev.status)) reachedAt.set(ev.status, ev.at);
  });

  return (
    <Stepper activeStep={activeIndex} alternativeLabel sx={{ flexWrap: 'wrap', gap: 1 }}>
      {orderFlow.map((status) => {
        const at = reachedAt.get(status);
        return (
          <Step key={status} completed={orderFlow.indexOf(status) < activeIndex}>
            <StepLabel
              optional={
                at ? (
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(at)}
                  </Typography>
                ) : undefined
              }
            >
              {orderStatusLabel[status]}
              {status === order.status && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip label="ปัจจุบัน" color="primary" size="small" />
                </Box>
              )}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
