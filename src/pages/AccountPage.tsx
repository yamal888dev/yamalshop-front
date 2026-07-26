import { Container, Paper, Typography, Stack, Button, Divider, Box, Avatar } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '-'}
      </Typography>
    </Stack>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const joined = new Date(user.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        บัญชีของฉัน
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Box sx={{ my: 2 }}>
          <InfoRow label="ชื่อ-นามสกุล" value={user.name} />
          <InfoRow label="อีเมล" value={user.email} />
          <InfoRow label="เบอร์โทรศัพท์" value={user.phone} />
          <InfoRow label="เป็นสมาชิกตั้งแต่" value={joined} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/orders"
            startIcon={<ReceiptLongIcon />}
          >
            ประวัติการสั่งซื้อ
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            ออกจากระบบ
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
