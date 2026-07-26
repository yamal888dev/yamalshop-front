# Yamal888 Shop — Frontend

เว็บไซต์ E-commerce สำหรับขายสินค้าออนไลน์ พัฒนาด้วย **React + TypeScript + Vite** และ **Material UI (MUI v6)**

> เฟสปัจจุบันใช้ **ข้อมูลจำลอง (mock data)** + `localStorage` ยังไม่ต่อ Backend

## เทคโนโลยีที่ใช้

- React 18 + TypeScript
- Vite (dev server / build)
- Material UI v6 (`@mui/material`, `@mui/icons-material`)
- React Router v6
- ฟอนต์ Kanit (`@fontsource/kanit`)

## ระบบที่ทำแล้ว (เฟส 1)

1. **ระบบสินค้า** — หมวดหมู่ 6 หมวด, ค้นหา (ชื่อ/แบรนด์/แท็ก), เรียงลำดับ, หน้ารายละเอียดสินค้า + สินค้าที่เกี่ยวข้อง
2. **ระบบตะกร้าสินค้า** — เพิ่ม/ลบ/แก้จำนวน, คำนวณราคารวม + ค่าส่ง (ซื้อครบ ฿1,000 ส่งฟรี), จำค่าไว้ใน `localStorage`
3. **ระบบสมาชิก** — สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ, หน้าบัญชี, ป้องกันหน้าที่ต้องล็อกอิน (mock auth บน `localStorage`)

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
│  └─ auth/         ProtectedRoute
├─ context/         CartContext, AuthContext (state + localStorage)
├─ data/            categories.ts, products.ts (mock — จำลอง API)
├─ pages/           Home, ProductList, ProductDetail, Cart, Login, Register, Account, NotFound
├─ types/           โมเดลข้อมูลกลาง (Product, CartItem, User)
├─ utils/           format.ts (ราคา ฿), storage.ts (localStorage)
├─ theme.ts         ธีม MUI (สีม่วง Yamal + ฟอนต์ Kanit)
└─ App.tsx          เส้นทาง (routes)
```

## หมายเหตุด้านความปลอดภัย

Auth ในเฟสนี้เป็น **mock เพื่อสาธิต UI/flow เท่านั้น** — เก็บรหัสผ่านแบบ plain text ใน `localStorage`
เมื่อทำ Backend จริงต้อง hash รหัสผ่านฝั่ง server และใช้ token/session ตามมาตรฐาน

## เฟสถัดไป (แผน)

- ระบบชำระเงิน (หลายช่องทาง + ตรวจสอบสถานะ)
- ระบบจัดการคำสั่งซื้อ (ประวัติ / ติดตามสถานะ / แจ้งปัญหา)
- Admin Dashboard (จัดการสินค้า / คำสั่งซื้อ / สมาชิก / สต็อก)
- เชื่อมต่อ Backend (`yamalshop-back`) แทน mock data
