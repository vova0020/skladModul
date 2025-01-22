// pages/unauthorized.tsx
'use client'
import { useRouter } from 'next/navigation';
import React from 'react';
import { Container, Typography, Button } from '@mui/material';

    
const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  // Логика редиректа, если это необходимо
  const handleGoBack = () => {
    router.push('/pages/auth'); // Перенаправление на главную страницу
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Доступ запрещен
      </Typography>
      <Typography variant="body1" gutterBottom>
        У вас нет прав для доступа к этой странице.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoBack}>
        Вернуться на главную
      </Button>
    </Container>
  );
};

export default UnauthorizedPage;
