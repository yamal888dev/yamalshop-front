import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import type { Product } from '@/types';
import { categories } from '@/data/categories';
import type { ProductInput } from '@/context/CatalogContext';

interface Props {
  open: boolean;
  /** ถ้ามี = โหมดแก้ไข, ถ้าไม่มี = โหมดเพิ่มใหม่ */
  product?: Product | null;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}

type FormState = {
  name: string;
  brand: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stock: string;
  image: string;
  description: string;
  tags: string;
};

const emptyForm: FormState = {
  name: '',
  brand: '',
  categoryId: categories[0].id,
  price: '',
  salePrice: '',
  stock: '',
  image: '',
  description: '',
  tags: '',
};

export default function ProductFormDialog({ open, product, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const isEdit = Boolean(product);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        price: String(product.price),
        salePrice: product.salePrice != null ? String(product.salePrice) : '',
        stock: String(product.stock),
        image: product.images[0] ?? '',
        description: product.description,
        tags: product.tags.join(', '),
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  const update =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0) return;

    const image =
      form.image.trim() ||
      `https://picsum.photos/seed/${encodeURIComponent(form.name.trim() || 'product')}/600/600`;

    onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim() || 'ไม่ระบุ',
      categoryId: form.categoryId,
      price,
      salePrice: form.salePrice.trim() ? Number(form.salePrice) : undefined,
      stock: Number.isNaN(stock) ? 0 : stock,
      images: [image],
      description: form.description.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="ชื่อสินค้า" value={form.name} onChange={update('name')} required fullWidth />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="แบรนด์" value={form.brand} onChange={update('brand')} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="หมวดหมู่"
                value={form.categoryId}
                onChange={update('categoryId')}
                fullWidth
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="ราคา (฿)"
                value={form.price}
                onChange={update('price')}
                required
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="ราคาลด (฿)"
                value={form.salePrice}
                onChange={update('salePrice')}
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
                helperText="ถ้าไม่มีเว้นว่าง"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="สต็อก"
                value={form.stock}
                onChange={update('stock')}
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
          </Grid>
          <TextField
            label="URL รูปภาพ"
            value={form.image}
            onChange={update('image')}
            fullWidth
            placeholder="เว้นว่างเพื่อใช้รูปตัวอย่างอัตโนมัติ"
          />
          <TextField
            label="แท็ก (คั่นด้วยคอมมา)"
            value={form.tags}
            onChange={update('tags')}
            fullWidth
            placeholder="เช่น ลดราคา, ขายดี"
          />
          <TextField
            label="รายละเอียด"
            value={form.description}
            onChange={update('description')}
            fullWidth
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
