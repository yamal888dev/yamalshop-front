import { useMemo } from 'react';
import {
  Container,
  Typography,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchParams } from 'react-router-dom';
import { categories, getCategoryBySlug } from '@/data/categories';
import { useCatalog } from '@/context/CatalogContext';
import { effectivePrice } from '@/utils/format';
import ProductCard from '@/components/product/ProductCard';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'ยอดนิยม' },
  { value: 'newest', label: 'ใหม่ล่าสุด' },
  { value: 'price-asc', label: 'ราคาต่ำ → สูง' },
  { value: 'price-desc', label: 'ราคาสูง → ต่ำ' },
];

export default function ProductListPage() {
  const { products } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const categorySlug = params.get('category') ?? '';
  const sort = (params.get('sort') as SortKey) || 'popular';

  const activeCategory = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory) {
      list = list.filter((p) => p.categoryId === activeCategory.id);
    }

    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term)),
      );
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'price-desc':
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case 'newest':
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      default:
        list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, activeCategory, q, sort]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {activeCategory ? activeCategory.name : 'สินค้าทั้งหมด'}
      </Typography>

      {/* ค้นหาในหน้า */}
      <TextField
        fullWidth
        value={q}
        onChange={(e) => setParam('q', e.target.value)}
        placeholder="ค้นหาสินค้า ชื่อ แบรนด์ หรือแท็ก…"
        sx={{ mb: 2, maxWidth: 480 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* ตัวกรองหมวดหมู่ */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label="ทั้งหมด"
          color={!categorySlug ? 'primary' : 'default'}
          onClick={() => setParam('category', '')}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={`${cat.icon} ${cat.name}`}
            color={categorySlug === cat.slug ? 'primary' : 'default'}
            onClick={() => setParam('category', cat.slug)}
          />
        ))}
      </Stack>

      {/* จำนวน + เรียงลำดับ */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          พบ {filtered.length} รายการ
          {q && (
            <>
              {' '}
              สำหรับ “<strong>{q}</strong>”
            </>
          )}
        </Typography>
        <TextField
          select
          size="small"
          label="เรียงตาม"
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {sortOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            ไม่พบสินค้าที่ตรงกับเงื่อนไข
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะครับ
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((product) => (
            <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
