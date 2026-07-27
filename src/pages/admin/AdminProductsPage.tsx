import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useCatalog, type ProductInput } from '@/context/CatalogContext';
import { formatBaht, effectivePrice } from '@/utils/format';
import { ApiError } from '@/lib/api';
import type { Product } from '@/types';
import ProductFormDialog from '@/components/admin/ProductFormDialog';

export default function AdminProductsPage() {
  const { products, loading, getCategoryById, addProduct, updateProduct, deleteProduct } =
    useCatalog();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [actionError, setActionError] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ProductInput) => {
    setActionError('');
    try {
      if (editing) await updateProduct(editing.id, input);
      else await addProduct(input);
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'บันทึกสินค้าไม่สำเร็จ');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError('');
    try {
      await deleteProduct(deleteTarget.id);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'ลบสินค้าไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">จัดการสินค้า</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          เพิ่มสินค้า
        </Button>
      </Stack>

      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ค้นหาสินค้า / แบรนด์"
        size="small"
        sx={{ mb: 2, maxWidth: 360 }}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      {loading && products.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>สินค้า</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell align="right">ราคา</TableCell>
              <TableCell align="right">สต็อก</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar variant="rounded" src={p.images[0]} alt={p.name} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.brand}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{getCategoryById(p.categoryId)?.name ?? '-'}</TableCell>
                <TableCell align="right">{formatBaht(effectivePrice(p))}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={p.stock}
                    size="small"
                    color={p.stock === 0 ? 'error' : p.stock <= 20 ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)} aria-label="แก้ไข">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget(p)}
                    aria-label="ลบ"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    ไม่พบสินค้า
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* ยืนยันการลบ */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>ยืนยันการลบสินค้า</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ต้องการลบ “{deleteTarget?.name}” ออกจากระบบใช่หรือไม่? การลบไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
