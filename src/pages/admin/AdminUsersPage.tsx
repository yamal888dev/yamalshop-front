import { useMemo } from 'react';
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
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { formatBaht } from '@/utils/format';

export default function AdminUsersPage() {
  const { users } = useAuth();
  const { orders } = useOrders();

  // สรุปยอดซื้อรวมของแต่ละสมาชิก
  const spendByUser = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const cur = map.get(o.userId) ?? { count: 0, total: 0 };
      map.set(o.userId, { count: cur.count + 1, total: cur.total + o.total });
    });
    return map;
  }, [orders]);

  const sorted = [...users].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        จัดการสมาชิก
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        สมาชิกทั้งหมด {users.length} คน
      </Typography>

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
            {sorted.map((u) => {
              const spend = spendByUser.get(u.id);
              return (
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
                  <TableCell align="right">{spend?.count ?? 0}</TableCell>
                  <TableCell align="right">{formatBaht(spend?.total ?? 0)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
