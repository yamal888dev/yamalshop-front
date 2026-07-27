import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Category, OrderItem, Product } from '@/types';
import { apiFetch } from '@/lib/api';

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
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => Product | undefined;
  getBySlug: (slug: string) => Product | undefined;
  getByCategory: (categoryId: string) => Product[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  featured: (limit?: number) => Product[];
  addProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, patch: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setStock: (id: string, stock: number) => Promise<void>;
  /** ตัดสต็อกในหน่วยความจำแบบ optimistic (ชั่วคราว จนกว่าจะ wire ระบบคำสั่งซื้อ) */
  applyOrderStock: (items: OrderItem[]) => void;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        apiFetch<Product[]>('/products'),
        apiFetch<Category[]>('/categories'),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setError(null);
    } catch {
      setError('โหลดข้อมูลสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ===== อ่านข้อมูล (คิดจาก state ที่โหลดมาแล้ว) =====
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
  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );
  const getCategoryBySlug = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories],
  );

  // ===== แก้ไขข้อมูล (ยิง API แล้วอัปเดต state) =====
  const upsertLocal = useCallback((product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [product, ...prev];
      const next = [...prev];
      next[idx] = product;
      return next;
    });
  }, []);

  const addProduct = useCallback(
    async (input: ProductInput) => {
      const created = await apiFetch<Product>('/products', { method: 'POST', body: input });
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateProduct = useCallback(
    async (id: string, patch: Partial<ProductInput>) => {
      const updated = await apiFetch<Product>(`/products/${id}`, {
        method: 'PATCH',
        body: patch,
      });
      upsertLocal(updated);
    },
    [upsertLocal],
  );

  const deleteProduct = useCallback(async (id: string) => {
    await apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setStock = useCallback(
    async (id: string, stock: number) => {
      const updated = await apiFetch<Product>(`/products/${id}/stock`, {
        method: 'PATCH',
        body: { stock: Math.max(0, Math.floor(stock)) },
      });
      upsertLocal(updated);
    },
    [upsertLocal],
  );

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
      categories,
      loading,
      error,
      refresh,
      getById,
      getBySlug,
      getByCategory,
      getCategoryById,
      getCategoryBySlug,
      featured,
      addProduct,
      updateProduct,
      deleteProduct,
      setStock,
      applyOrderStock,
    }),
    [
      products,
      categories,
      loading,
      error,
      refresh,
      getById,
      getBySlug,
      getByCategory,
      getCategoryById,
      getCategoryBySlug,
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
