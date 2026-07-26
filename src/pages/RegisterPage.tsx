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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (form.password !== form.confirm) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const result = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error ?? 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          สมัครสมาชิก
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          สร้างบัญชีเพื่อเริ่มช้อปกับ Yamal888
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="ชื่อ-นามสกุล"
              value={form.name}
              onChange={update('name')}
              required
              fullWidth
            />
            <TextField
              label="อีเมล"
              type="email"
              value={form.email}
              onChange={update('email')}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="เบอร์โทรศัพท์ (ไม่บังคับ)"
              value={form.phone}
              onChange={update('phone')}
              fullWidth
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              fullWidth
              helperText="อย่างน้อย 6 ตัวอักษร"
              autoComplete="new-password"
            />
            <TextField
              label="ยืนยันรหัสผ่าน"
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              required
              fullWidth
              autoComplete="new-password"
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              สมัครสมาชิก
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link component={RouterLink} to="/login">
            เข้าสู่ระบบ
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
