// Service เรียก API คำสั่งซื้อ — ใช้แทน OrderContext เดิม (แต่ละหน้าจัดการ state เอง)
import { apiFetch } from '@/lib/api';
import type { Order, OrderStatus, PaymentMethod, ShippingAddress } from '@/types';

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
}

export interface OrderStats {
  revenue: number;
  orderCount: number;
  productCount: number;
  customerCount: number;
  pendingCount: number;
}

export const ordersApi = {
  create: (input: CreateOrderInput) =>
    apiFetch<Order>('/orders', { method: 'POST', body: input }),

  /** ประวัติคำสั่งซื้อของฉัน */
  mine: () => apiFetch<Order[]>('/orders/mine'),

  /** รายละเอียดคำสั่งซื้อ (เจ้าของหรือ admin) */
  get: (id: string) => apiFetch<Order>(`/orders/${id}`),

  /** ทั้งหมด (admin) — กรองตามสถานะได้ */
  all: (status?: string) =>
    apiFetch<Order[]>(`/orders${status && status !== 'all' ? `?status=${status}` : ''}`),

  /** สรุปตัวเลข dashboard (admin) */
  stats: () => apiFetch<OrderStats>('/orders/stats'),

  /** ลูกค้าแจ้งชำระเงิน/แนบสลิป */
  pay: (id: string) => apiFetch<Order>(`/orders/${id}/pay`, { method: 'POST' }),

  /** ลูกค้ายืนยันรับสินค้า */
  confirmReceived: (id: string) =>
    apiFetch<Order>(`/orders/${id}/received`, { method: 'POST' }),

  /** ลูกค้าแจ้งปัญหา */
  addIssue: (id: string, topic: string, detail: string) =>
    apiFetch<Order>(`/orders/${id}/issues`, { method: 'POST', body: { topic, detail } }),

  /** admin อัปเดตสถานะ */
  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    apiFetch<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status, note } }),

  /** admin ปิดเรื่องที่แจ้ง */
  resolveIssue: (id: string, issueId: string) =>
    apiFetch<Order>(`/orders/${id}/issues/${issueId}/resolve`, { method: 'PATCH' }),
};
