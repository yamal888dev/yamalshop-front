import { useState, type FormEvent } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
  Box,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          เข้าสู่ระบบ
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          ยินดีต้อนรับกลับสู่ Yamal888 Shop
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              เข้าสู่ระบบ
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          ยังไม่มีบัญชี?{' '}
          <Link component={RouterLink} to="/register">
            สมัครสมาชิก
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
