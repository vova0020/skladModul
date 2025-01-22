'use client';
/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar'; // Import Avatar component
import { jwtDecode } from 'jwt-decode';
import { useMediaQuery, useTheme } from '@mui/material';

interface DecodedToken {
  roleId: number;
}

const Navbar: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:600px)');
  const pathname = usePathname();
  const theme = useTheme();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        setRole(decoded.roleId);
      } catch (error) {
        console.error("Ошибка при декодировании токена:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const drawerList = () => (
    <List>
      {/* {role === 'Руководство' && renderLink("/pages/applicationsTable", "Согласование")}
      {(role === 'Снабжение' || role === 'Руководство') && renderLink("/pages/starie/procurementPage", "Снабжение")}
      {renderLink("/pages/createApplications", "Создание заявки")}
      {role === 'Руководство' && renderLink("/pages/createUsers", "Создание пользователя")}
      {role === 'Руководство' && renderLink("/pages/admika", "Админка")} */}
      {(role === 1 || role === 2) && renderLink("/pages/dashboard", "Главная страница")}
      {(role === 1 || role === 2) && renderLink("/pages/adminka", "Админка")}
      {role && (
        // @ts-ignore
        <ListItem button onClick={handleLogout}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 36, height: 36 }}>
            <LogoutIcon />
          </Avatar>
          <ListItemText primary="Выйти" />
        </ListItem>
      )}
    </List>
  );

  const renderLink = (href: string, label: string) => (
    <ListItem
      // @ts-ignore
      button
      component={Link}
      href={href}
      onClick={() => setDrawerOpen(false)}
      sx={{
        color: pathname === href ? theme.palette.primary.main : 'inherit',
        backgroundColor: pathname === href ? 'rgba(0, 0, 255, 0.1)' : 'inherit',
        boxShadow: pathname === href ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        borderRadius: 1,
        px: 2,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 255, 0.15)',
          color: theme.palette.primary.dark,
        },
      }}
    >
      <ListItemText primary={label} />
    </ListItem>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#333', boxShadow: 'none', borderRadius: 5,  }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            {/* Логотип или заголовок приложения */}
          </Typography>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', borderRadius: 5 }}>
            {isMobile ? (
              <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                {/* {role === 'Руководство' && renderLink("/pages/applicationsTable", "Согласование")}
                {(role === 'Снабжение' || role === 'Руководство') && renderLink("/pages/starie/procurementPage", "Снабжение")}
                {renderLink("/pages/createApplications", "Создание заявки")}
                {role === 'Руководство' && renderLink("/pages/createUsers", "Создание пользователя")}
                {role === 'Руководство' && renderLink("/pages/admika", "Админка")} */}
                {(role === 1 || role === 2) && renderLink("/pages/dashboard", "Главная страница")}
                {(role === 1 || role === 2) && renderLink("/pages/adminka", "Админка")}
            
                {role && (
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      ml: 1,
                      textTransform: 'none',
                      padding: 0,
                      minWidth: 'auto',
                      borderRadius: '50%',
                      '& .MuiAvatar-root': {
                        width: 36,
                        height: 36,
                        bgcolor: 'primary.main',
                      },
                    }}
                  >
                    <Avatar>
                      <LogoutIcon />
                    </Avatar>
                  </Button>
                )}
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList()}
      </Drawer>
    </>
  );
};

export default Navbar;
