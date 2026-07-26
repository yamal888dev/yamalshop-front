import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import { useCatalog } from '@/context/CatalogContext';
import { getCategoryById } from '@/data/categories';

const LOW_STOCK = 20;

export default function AdminStockPage() {
  const { products, setStock } = useCatalog();
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [onlyLow, setOnlyLow] = useState(false);
  const [saved, setSaved] = useState(false);

  const valueOf = (id: string, current: number) => drafts[id] ?? current;

  const setDraft = (id: string, v: number) =>
    setDrafts((d) => ({ ...d, [id]: Math.max(0, v) }));

  const save = (id: string, current: number) => {
    setStock(id, valueOf(id, current));
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    setSaved(true);
  };

  const list = onlyLow ? products.filter((p) => p.stock <= LOW_STOCK) : products;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">จัดการสต็อก</Typography>
        <FormControlLabel
          control={<Switch checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />}
          label={`เฉพาะสต็อกใกล้หมด (≤ ${LOW_STOCK})`}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>สินค้า</TableCell>
              <TableCell>หมวดหมู่</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="center">ปรับจำนวนสต็อก</TableCell>
              <TableCell align="right">บันทึก</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((p) => {
              const draft = valueOf(p.id, p.stock);
              const changed = draft !== p.stock;
              return (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar variant="rounded" src={p.images[0]} alt={p.name} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {p.name}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{getCategoryById(p.categoryId)?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.stock === 0 ? 'หมด' : p.stock <= LOW_STOCK ? 'ใกล้หมด' : 'ปกติ'}
                      color={p.stock === 0 ? 'error' : p.stock <= LOW_STOCK ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      <IconButton size="small" onClick={() => setDraft(p.id, draft - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        value={draft}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setDraft(p.id, Number.isNaN(v) ? 0 : v);
                        }}
                        size="small"
                        inputProps={{
                          style: { textAlign: 'center', width: 56 },
                          inputMode: 'numeric',
                        }}
                      />
                      <IconButton size="small" onClick={() => setDraft(p.id, draft + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!changed}
                      onClick={() => save(p.id, p.stock)}
                    >
                      บันทึก
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={saved}
        autoHideDuration={2000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          อัปเดตสต็อกแล้ว
        </Alert>
      </Snackbar>
    </Box>
  );
}
