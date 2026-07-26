// ===== ระบบสินค้า (Product) =====

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // ชื่อ emoji หรือใช้กับ MUI icon
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // ราคาปกติ (บาท)
  salePrice?: number; // ราคาลด (ถ้ามี)
  categoryId: string;
  images: string[];
  rating: number; // 0 - 5
  reviewCount: number;
  stock: number;
  brand: string;
  tags: string[];
  createdAt: string; // ISO date
}

// ===== ระบบตะกร้าสินค้า (Cart) =====

export interface CartItem {
  product: Product;
  quantity: number;
}

// ===== ระบบสมาชิก (Member/Auth) =====

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// ข้อมูลผู้ใช้ที่เก็บใน localStorage (รวม password แบบ mock — ของจริงต้องอยู่ฝั่ง backend)
export interface StoredUser extends User {
  password: string;
}

// ===== ระบบชำระเงิน & คำสั่งซื้อ (Payment / Order) =====

export type PaymentMethod = 'credit_card' | 'promptpay' | 'bank_transfer' | 'cod';

export type OrderStatus =
  | 'pending_payment' // รอชำระเงิน
  | 'awaiting_verification' // รอตรวจสอบการชำระเงิน (แนบสลิปแล้ว)
  | 'paid' // ชำระเงินแล้ว / ยืนยันแล้ว
  | 'preparing' // กำลังจัดเตรียมสินค้า
  | 'shipped' // จัดส่งแล้ว
  | 'completed' // ได้รับสินค้าแล้ว
  | 'cancelled'; // ยกเลิก

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  district: string; // แขวง/ตำบล-เขต/อำเภอ
  province: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number; // ราคาที่จ่ายจริงต่อชิ้น ณ ตอนสั่งซื้อ
  quantity: number;
}

export interface OrderIssue {
  id: string;
  topic: string; // หัวข้อปัญหา
  detail: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string; // ISO date
  note?: string;
}

export interface Order {
  id: string; // เช่น ORD-20260727-4821
  userId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  slipUploaded: boolean; // แนบสลิปแล้วหรือยัง (โอน/พร้อมเพย์)
  statusHistory: StatusEvent[];
  issues: OrderIssue[];
  createdAt: string;
  updatedAt: string;
}
