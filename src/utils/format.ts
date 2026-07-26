/** จัดรูปแบบราคาเป็นสกุลเงินบาท เช่น 1234.5 -> "฿1,234.50" */
export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** ราคาที่ใช้จริงของสินค้า (ถ้ามีราคาลดให้ใช้ราคาลด) */
export function effectivePrice(product: { price: number; salePrice?: number }): number {
  return product.salePrice ?? product.price;
}

/** เปอร์เซ็นต์ส่วนลด เช่น 20 -> "20%" */
export function discountPercent(product: { price: number; salePrice?: number }): number {
  if (!product.salePrice || product.salePrice >= product.price) return 0;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}
