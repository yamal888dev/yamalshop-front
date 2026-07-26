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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// ข้อมูลผู้ใช้ที่เก็บใน localStorage (รวม password แบบ mock — ของจริงต้องอยู่ฝั่ง backend)
export interface StoredUser extends User {
  password: string;
}
