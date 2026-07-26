import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { effectivePrice } from '@/utils/format';

const STORAGE_KEY = 'yamal888:cart';

interface CartContextValue {
  items: CartItem[];
  /** จำนวนสินค้ารวมทั้งหมด (นับชิ้น) */
  totalQuantity: number;
  /** ยอดรวมราคาสินค้า (บาท) */
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(STORAGE_KEY, []),
  );

  // บันทึกตะกร้าลง localStorage ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    saveToStorage(STORAGE_KEY, items);
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        // ไม่ให้เกินสต็อก
        const nextQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: nextQty } : it,
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((it) => it.product.id !== productId);
      }
      return prev.map((it) =>
        it.product.id === productId
          ? { ...it, quantity: Math.min(quantity, it.product.stock) }
          : it,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + effectivePrice(it.product) * it.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, totalQuantity, subtotal, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart ต้องใช้ภายใน <CartProvider>');
  return ctx;
}
