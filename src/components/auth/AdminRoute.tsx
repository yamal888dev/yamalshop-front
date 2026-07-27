import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/** อนุญาตเฉพาะผู้ใช้ที่ล็อกอินและมีสิทธิ์ admin */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth();

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          ไม่มีสิทธิ์เข้าถึง
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
        </Typography>
        <Box>
          <Button component={RouterLink} to="/" variant="contained">
            กลับหน้าแรก
          </Button>
        </Box>
      </Container>
    );
  }

  return <>{children}</>;
}
