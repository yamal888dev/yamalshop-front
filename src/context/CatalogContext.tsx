import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OrderItem, Product } from '@/types';
import { products as seedProducts } from '@/data/products';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const STORAGE_KEY = 'yamal888:products';

/** ข้อมูลสำหรับสร้าง/แก้ไขสินค้า (ไม่รวม field ที่ระบบกำหนดเอง) */
export type ProductInput = Omit<
  Product,
  'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt'
> & {
  rating?: number;
  reviewCount?: number;
};

interface CatalogContextValue {
  products: Product[];
  getById: (id: string) => Product | undefined;
  getBySlug: (slug: string) => Product | undefined;
  getByCategory: (categoryId: string) => Product[];
  featured: (limit?: number) => Product[];
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<ProductInput>) => void;
  deleteProduct: (id: string) => void;
  setStock: (id: string, stock: number) => void;
  /** ตัดสต็อกตามรายการในคำสั่งซื้อ (เรียกตอนสั่งซื้อสำเร็จ) */
  applyOrderStock: (items: OrderItem[]) => void;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'item'}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>(STORAGE_KEY, seedProducts),
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEY, products);
  }, [products]);

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );
  const getBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products],
  );
  const getByCategory = useCallback(
    (categoryId: string) => products.filter((p) => p.categoryId === categoryId),
    [products],
  );
  const featured = useCallback(
    (limit = 8) => [...products].sort((a, b) => b.rating - a.rating).slice(0, limit),
    [products],
  );

  const addProduct = useCallback((input: ProductInput) => {
    const now = new Date();
    const newProduct: Product = {
      ...input,
      id: `p-${Date.now()}`,
      slug: slugify(input.name),
      rating: input.rating ?? 5,
      reviewCount: input.reviewCount ?? 0,
      createdAt: now.toISOString().slice(0, 10),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<ProductInput>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setStock = useCallback((id: string, stock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, Math.floor(stock)) } : p)),
    );
  }, []);

  const applyOrderStock = useCallback((items: OrderItem[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const line = items.find((it) => it.productId === p.id);
        if (!line) return p;
        return { ...p, stock: Math.max(0, p.stock - line.quantity) };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      products,
      getById,
      getBySlug,
      getByCategory,
      featured,
      addProduct,
      updateProduct,
      deleteProduct,
      setStock,
      applyOrderStock,
    }),
    [
      products,
      getById,
      getBySlug,
      getByCategory,
      featured,
      addProduct,
      updateProduct,
      deleteProduct,
      setStock,
      applyOrderStock,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog ต้องใช้ภายใน <CatalogProvider>');
  return ctx;
}
