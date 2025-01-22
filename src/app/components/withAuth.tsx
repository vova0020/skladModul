/* eslint-disable */
// @ts-nocheck
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles: number[]) => {
  const WithAuth = (props: React.ComponentProps<typeof WrappedComponent>) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/pages/auth'); // Перенаправить на страницу авторизации, если токена нет
      } else {
        try {
          // Декодируем токен
          const decodedToken: any = jwtDecode(token);
          const userRole = Number(decodedToken.roleId); // Предполагаем, что роль хранится в поле "role"

          if (!allowedRoles.includes(userRole)) {

            
            router.push('/pages/unauthorized'); // Перенаправить на страницу "нет доступа", если роль не разрешена
          }
        } catch (error) {
          console.error('Ошибка при декодировании токена:', error);
          router.push('/pages/auth'); // Если декодирование токена не удалось, перенаправляем на страницу авторизации
        }
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  // Устанавливаем displayName для лучшей отладки
  WithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuth;
};

export default withAuth;