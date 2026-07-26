import type { OrderStatus, PaymentMethod } from '@/types';

type ChipColor = 'default' | 'warning' | 'info' | 'success' | 'error' | 'secondary';

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: 'รอชำระเงิน',
  awaiting_verification: 'รอตรวจสอบการชำระเงิน',
  paid: 'ชำระเงินแล้ว',
  preparing: 'กำลังจัดเตรียมสินค้า',
  shipped: 'จัดส่งแล้ว',
  completed: 'ได้รับสินค้าแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

export const orderStatusColor: Record<OrderStatus, ChipColor> = {
  pending_payment: 'warning',
  awaiting_verification: 'info',
  paid: 'secondary',
  preparing: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'error',
};

/** ลำดับสถานะปกติสำหรับแสดง timeline (ไม่รวม cancelled) */
export const orderFlow: OrderStatus[] = [
  'pending_payment',
  'awaiting_verification',
  'paid',
  'preparing',
  'shipped',
  'completed',
];

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  credit_card: 'บัตรเครดิต/เดบิต',
  promptpay: 'พร้อมเพย์ (QR)',
  bank_transfer: 'โอนผ่านธนาคาร',
  cod: 'เก็บเงินปลายทาง (COD)',
};

/** สร้างเลขคำสั่งซื้อ เช่น ORD-20260727-4821 */
export function generateOrderId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ymd}-${rand}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
