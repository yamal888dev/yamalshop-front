import { useEffect, useState } from 'react';
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
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { apiFetch, ApiError } from '@/lib/api';
import { formatBaht } from '@/utils/format';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<AdminUser[]>('/users');
        if (active) setUsers(data);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        จัดการสมาชิก
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        สมาชิกทั้งหมด {users.length} คน
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>สมาชิก</TableCell>
              <TableCell>อีเมล</TableCell>
              <TableCell>เบอร์โทร</TableCell>
              <TableCell>สิทธิ์</TableCell>
              <TableCell align="right">จำนวนออเดอร์</TableCell>
              <TableCell align="right">ยอดซื้อรวม</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: u.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {u.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phone ?? '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={u.role === 'admin' ? 'ผู้ดูแล' : 'ลูกค้า'}
                    color={u.role === 'admin' ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{u.orderCount}</TableCell>
                <TableCell align="right">{formatBaht(u.totalSpend)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
