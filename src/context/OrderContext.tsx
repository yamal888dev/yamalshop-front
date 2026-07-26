import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
} from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { generateOrderId } from '@/utils/order';

const STORAGE_KEY = 'yamal888:orders';

interface CreateOrderInput {
  userId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  /** สถานะเริ่มต้นของคำสั่งซื้อ ขึ้นกับช่องทางชำระเงิน */
  initialStatus: OrderStatus;
}

interface OrderContextValue {
  orders: Order[];
  getById: (id: string) => Order | undefined;
  getByUser: (userId: string) => Order[];
  createOrder: (input: CreateOrderInput) => Order;
  updateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  markSlipUploaded: (orderId: string) => void;
  addIssue: (orderId: string, topic: string, detail: string) => void;
  resolveIssue: (orderId: string, issueId: string) => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>(STORAGE_KEY, []),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY, orders);
  }, [orders]);

  const getById = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);
  const getByUser = useCallback(
    (userId: string) =>
      orders
        .filter((o) => o.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders],
  );

  const createOrder = useCallback((input: CreateOrderInput) => {
    const now = new Date().toISOString();
    const order: Order = {
      id: generateOrderId(),
      userId: input.userId,
      customerName: input.customerName,
      items: input.items,
      subtotal: input.subtotal,
      shippingFee: input.shippingFee,
      total: input.total,
      status: input.initialStatus,
      paymentMethod: input.paymentMethod,
      shippingAddress: input.shippingAddress,
      slipUploaded: false,
      statusHistory: [{ status: input.initialStatus, at: now }],
      issues: [],
      createdAt: now,
      updatedAt: now,
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateStatus = useCallback(
    (orderId: string, status: OrderStatus, note?: string) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                updatedAt: now,
                statusHistory: [...o.statusHistory, { status, at: now, note }],
              }
            : o,
        ),
      );
    },
    [],
  );

  const markSlipUploaded = useCallback(
    (orderId: string) => {
      const now = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                slipUploaded: true,
                status: 'awaiting_verification',
                updatedAt: now,
                statusHistory: [
                  ...o.statusHistory,
                  { status: 'awaiting_verification', at: now, note: 'แนบสลิปการชำระเงิน' },
                ],
              }
            : o,
        ),
      );
    },
    [],
  );

  const addIssue = useCallback((orderId: string, topic: string, detail: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              issues: [
                ...o.issues,
                { id: `iss-${Date.now()}`, topic, detail, status: 'open', createdAt: now },
              ],
              updatedAt: now,
            }
          : o,
      ),
    );
  }, []);

  const resolveIssue = useCallback((orderId: string, issueId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              issues: o.issues.map((iss) =>
                iss.id === issueId ? { ...iss, status: 'resolved' } : iss,
              ),
            }
          : o,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      orders,
      getById,
      getByUser,
      createOrder,
      updateStatus,
      markSlipUploaded,
      addIssue,
      resolveIssue,
    }),
    [
      orders,
      getById,
      getByUser,
      createOrder,
      updateStatus,
      markSlipUploaded,
      addIssue,
      resolveIssue,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders ต้องใช้ภายใน <OrderProvider>');
  return ctx;
}
