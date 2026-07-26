# Yamal888 Shop — Frontend

เว็บไซต์ E-commerce สำหรับขายสินค้าออนไลน์ พัฒนาด้วย **React + TypeScript + Vite** และ **Material UI (MUI v6)**

> เฟสปัจจุบันใช้ **ข้อมูลจำลอง (mock data)** + `localStorage` ยังไม่ต่อ Backend

## เทคโนโลยีที่ใช้

- React 18 + TypeScript
- Vite (dev server / build)
- Material UI v6 (`@mui/material`, `@mui/icons-material`)
- React Router v6
- ฟอนต์ Kanit (`@fontsource/kanit`)

## ระบบที่ทำแล้ว

**เฟส 1**

1. **ระบบสินค้า** — หมวดหมู่ 6 หมวด, ค้นหา (ชื่อ/แบรนด์/แท็ก), เรียงลำดับ, หน้ารายละเอียดสินค้า + สินค้าที่เกี่ยวข้อง
2. **ระบบตะกร้าสินค้า** — เพิ่ม/ลบ/แก้จำนวน, คำนวณราคารวม + ค่าส่ง (ซื้อครบ ฿1,000 ส่งฟรี), จำค่าไว้ใน `localStorage`
3. **ระบบสมาชิก** — สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ, หน้าบัญชี, ป้องกันหน้าที่ต้องล็อกอิน (mock auth บน `localStorage`)

**เฟส 2**

4. **ระบบชำระเงิน** — หน้า checkout (ที่อยู่จัดส่ง + 4 ช่องทาง: บัตรเครดิต / พร้อมเพย์ QR / โอนธนาคาร / COD), แนบสลิป, ตัดสต็อกอัตโนมัติ
5. **ระบบจัดการคำสั่งซื้อ** — ประวัติการสั่งซื้อ, ติดตามสถานะ (timeline 6 ขั้น), แจ้งปัญหาสินค้า
6. **Admin Dashboard** — ภาพรวม (ยอดขาย/ออเดอร์/สต็อกใกล้หมด), จัดการสินค้า (เพิ่ม/แก้/ลบ), จัดการคำสั่งซื้อ (ยืนยันชำระเงิน/อัปเดตสถานะ), จัดการสมาชิก, จัดการสต็อก

### บัญชีทดสอบ

- **แอดมิน:** `admin@yamal888.com` / `admin1234` → เข้า `/admin`
- **ลูกค้า:** สมัครเองผ่านหน้า `/register`

### ขั้นตอนสถานะคำสั่งซื้อ

`รอชำระเงิน → รอตรวจสอบการชำระเงิน → ชำระเงินแล้ว → กำลังจัดเตรียม → จัดส่งแล้ว → ได้รับสินค้าแล้ว`
(บัตรเครดิต = ชำระทันที, COD = ข้ามไปจัดเตรียม, โอน/พร้อมเพย์ = แนบสลิปแล้วรอแอดมินยืนยัน)

## วิธีรัน

```bash
npm install
npm run dev      # เปิด http://localhost:5173
```

คำสั่งอื่น:

```bash
npm run build    # tsc + vite build (ออกที่ dist/)
npm run preview  # พรีวิว build
```

## โครงสร้างโปรเจกต์

```
src/
├─ components/
│  ├─ layout/       Navbar, Footer, Layout
│  ├─ product/      ProductCard
│  ├─ order/        OrderStatusTimeline
│  ├─ admin/        AdminLayout, ProductFormDialog
│  └─ auth/         ProtectedRoute, AdminRoute
├─ context/         CartContext, AuthContext, CatalogContext (สินค้า), OrderContext (คำสั่งซื้อ)
├─ data/            categories.ts, products.ts (ข้อมูล seed เริ่มต้น)
├─ pages/           Home, ProductList, ProductDetail, Cart, Checkout,
│  │                Orders, OrderDetail, Login, Register, Account, NotFound
│  └─ admin/        Dashboard, Products, Orders, Users, Stock
├─ types/           โมเดลข้อมูลกลาง (Product, CartItem, User, Order, ...)
├─ utils/           format.ts (ราคา ฿), storage.ts (localStorage), order.ts (สถานะ/ป้ายสี)
├─ theme.ts         ธีม MUI (สีม่วง Yamal + ฟอนต์ Kanit)
└─ App.tsx          เส้นทาง (routes ร้านค้า + admin)
```

### สถาปัตยกรรมข้อมูล (mock)

ทุก context seed จากไฟล์ mock แล้ว persist ลง `localStorage` (`yamal888:*`) — สินค้าที่แอดมินแก้ไข,
คำสั่งซื้อ, และสมาชิก จะคงอยู่ข้าม session พร้อมสลับไปต่อ Backend จริงได้ทีละ context

## หมายเหตุด้านความปลอดภัย

Auth ในเฟสนี้เป็น **mock เพื่อสาธิต UI/flow เท่านั้น** — เก็บรหัสผ่านแบบ plain text ใน `localStorage`
เมื่อทำ Backend จริงต้อง hash รหัสผ่านฝั่ง server และใช้ token/session ตามมาตรฐาน

## เฟสถัดไป (แผน)

- เชื่อมต่อ Backend จริง (`yamalshop-back`) แทน mock data — hash รหัสผ่าน, JWT/session, REST API
- ชำระเงินจริงผ่าน payment gateway (Omise / Stripe / GB PrimePay)
- อัปโหลดรูปสินค้า/สลิปจริง (แทน URL/จำลอง)
- แจ้งเตือนอีเมล/SMS ตามสถานะคำสั่งซื้อ
