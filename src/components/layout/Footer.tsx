import { Box, Container, Typography, Link, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'grey.300', mt: 6, py: 4 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h6" color="common.white" gutterBottom>
              Yamal888 Shop
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 320 }}>
              ช้อปออนไลน์ครบ จบในที่เดียว สินค้าคุณภาพ ราคาดี ส่งไว
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="common.white">
              ช่วยเหลือ
            </Typography>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              วิธีสั่งซื้อ
            </Link>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              การจัดส่ง
            </Link>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              ติดต่อเรา
            </Link>
          </Stack>
        </Stack>
        <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.7 }}>
          © {new Date().getFullYear()} Yamal888 Shop — เว็บไซต์สาธิต (ข้อมูลจำลอง)
        </Typography>
      </Container>
    </Box>
  );
}
