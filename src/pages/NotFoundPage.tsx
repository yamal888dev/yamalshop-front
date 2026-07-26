import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        ไม่พบหน้าที่คุณต้องการ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained" size="large">
          กลับหน้าแรก
        </Button>
      </Box>
    </Container>
  );
}
