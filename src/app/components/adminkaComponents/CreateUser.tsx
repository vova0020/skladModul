'use client';
/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box, TextField, Button, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogActions, DialogContent, MenuItem, Checkbox, FormControl, InputLabel, ListItemText, Select } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Иконка для смены пароля
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Register from './Register';
import { ruRU } from '@mui/x-data-grid/locales/ruRU';

type Sector = {
    id: number;
    name: string;
};

export default function CreateUsers() {
    const [users, setUsers] = useState<Sector[]>([]);
    const [stanocks, setStanock] = useState<Sector[]>([]);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'add' | 'edit' | null>(null);
    const [stanockName, setStanockName] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [redisterModal, setRedisterModal] = useState(false);
    
    // Состояния для смены пароля
    const [changePasswordDialog, setChangePasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        getSectors();
    }, []);

    const getSectors = async () => {
        try {
            const response = await axios.get('/api/adminka/updateUsers');
            setUsers(response.data.sort((a: Sector, b: Sector) => a.id - b.id));

            // console.log(response.data);

        } catch (error) {
            showSnackbar('Ошибка загрузки данных.', 'error');
        }
    };

    useMemo(() => {
        const intervalId = setInterval(() => {
            getSectors(); // Обновляем данные
        }, 8000); // Обновляем каждые 5 секунд

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(intervalId);

    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setStanockName([]);
        setDialogAction(null);
    };

    // Обработчик открытия диалога смены пароля
    // @ts-ignore
    const handlePasswordDialogOpen = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setChangePasswordDialog(true);
    };

    // Обработчик закрытия диалога смены пароля
    const handlePasswordDialogClose = () => {
        setChangePasswordDialog(false);
        setSelectedUser(null);
        setNewPassword('');
        setConfirmPassword('');
    };

    // Функция смены пароля
    const handleChangePassword = async () => {
        if (!selectedUser) return;
        
        // Проверка на совпадение паролей
        if (newPassword !== confirmPassword) {
            showSnackbar('Пароли не совпадают!', 'error');
            return;
        }
        
        // Проверка минимальной длины пароля
        if (newPassword.length < 6) {
            showSnackbar('Пароль должен содержать минимум 6 символов!', 'error');
            return;
        }

        try {
            await axios.put('/api/adminka/updateUsers', { 
                // @ts-ignore
                userId: selectedUser.id, 
                newPassword: newPassword 
            });
            showSnackbar('Пароль успешно изменён!', 'success');
            handlePasswordDialogClose();
        } catch (error) {
            showSnackbar('Ошибка при смене пароля.', 'error');
        }
    };

    const handleEditSector = async () => {
        // if (!selectedSector || !sectorName.trim()) return;
        console.log(selectedSector);

        try {
            // @ts-ignore
            await axios.put('/api/adminka/updateUsers', { sectorId: selectedSector.id, data: stanockName });
            showSnackbar('Пользователь успешно обновлён!', 'success');
            getSectors();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при обновлении пользователя.', 'error');
        }
    };
    const handleClean = async () => {
        // if (!selectedSector || !sectorName.trim()) return;
        console.log(selectedSector);
         {/* @ts-ignore */}
        const stanock = selectedSector.machines
         {/* @ts-ignore */}
        const stanockMaster = selectedSector.masterMachines

        try {
            await axios.put('/api/adminka/cleanStanockUser', { stanock, stanockMaster});
            showSnackbar('Связи удалены!', 'success');
            getSectors();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при удалении связей.', 'error');
        }
    };
// @ts-ignore
    const handleDeleteSector = async (clickId) => {
        // if (!selectedSector) return;
        try {
            await axios.delete('/api/adminka/updateUsers', { data: { sectorId: clickId } });
            showSnackbar('Пользователь удалён!', 'success');
            getSectors();
        } catch {
            showSnackbar('Ошибка при удалении пользователя.', 'error');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 25 },
        { field: 'firstName', headerName: 'Имя', width: 100 },
        { field: 'lastName', headerName: 'Фамилия', width: 100 },
        { field: 'login', headerName: 'Логин', width: 100 },

        {
            field: 'roleName',
            headerName: 'Роль',
            width: 100,
            renderCell: (params) => (
                params.row?.role?.name || 'Без участка'
            ),
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handlePasswordDialogOpen(params.row)} title="Изменить пароль">
                        <VpnKeyIcon />
                    </IconButton>
                    <IconButton onClick={() => { setSelectedSector(params.row); handleDeleteSector(params.row.id); }} title="Удалить пользователя">
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
            width: 150,
        },
    ];

    return (
        <div style={{ minHeight: '50vh', overflowY: 'auto' }}>
            <Box sx={{ height: '97%', p: 4, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Управление пользователями
                </Typography>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setRedisterModal(true)}>
                    Добавить пользователя
                </Button>
                <Box sx={{ height: '70%', mt: 3 }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        autoHeight={false}
                        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                        disableRowSelectionOnClick />
                </Box>

                <Dialog open={openDialog} onClose={handleDialogClose}>
                    <DialogTitle>{dialogAction === 'add' ? 'Добавить пользователя' : 'Редактировать станок пользователя'}</DialogTitle>
                    <DialogContent>
                         {/* @ts-ignore */}
                        {selectedSector?.role?.name === "Оператор" ? (
                           
                            <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="stanock-label">Название станка</InputLabel>
                            <Select
                                labelId="stanock-label"
                                value={stanockName} // Строка с выбранным значением
                                // @ts-ignore
                                onChange={(e) => setStanockName(e.target.value)} // Просто устанавливаем выбранное значение
                                renderValue={(selected) => {
                                    // @ts-ignore
                                    const selectedStanock = stanocks.find((s) => s.id === selected);
                                    return selectedStanock ? selectedStanock.name : ''; // Отображаем имя выбранного станка
                                }}
                            >
                                {stanocks.map((stanock) => (
                                    <MenuItem key={stanock.id} value={stanock.id}> {/* Убираем 'multiple' */}
                                        {stanock.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        ) : (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel id="stanock-label">Название станка</InputLabel>
                                <Select
                                    labelId="stanock-label"
                                    multiple
                                    value={stanockName} // Здесь должен быть массив выбранных значений
                                    // @ts-ignore
                                    onChange={(e) => setStanockName(e.target.value as string[])} // Приведение значения к массиву строк
                                    renderValue={(selected) => selected.map((id) => {
                                        const selectedStanock = stanocks.find((s) => s.id === id);
                                        return selectedStanock ? selectedStanock.name : id;
                                    }).join(', ')} // Отображение выбранных элементов
                                >
                                    {stanocks.map((stanock) => (
                                        <MenuItem key={stanock.id} value={stanock.id || ''}>
                                            {/*  @ts-ignore */}
                                            <Checkbox checked={stanockName.includes(stanock.id)} /> {/* Галочка для выбранного элемента */}
                                            <ListItemText primary={stanock.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </DialogContent>
                    
                        <DialogActions>
                        <Button onClick={handleDialogClose}>Отмена</Button>
                        <Button onClick={handleClean}  sx={{ color: 'red' }}>Убрать связи</Button>
                        <Button onClick={handleEditSector} variant="contained">
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Диалог смены пароля */}
                <Dialog open={changePasswordDialog} onClose={handlePasswordDialogClose}>
                    <DialogTitle>
                    {/*  @ts-ignore */}
                        Изменить пароль{selectedUser ? ` для ${selectedUser.firstName} ${selectedUser.lastName}` : ''}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Новый пароль"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Подтвердите пароль"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePasswordDialogClose}>Отмена</Button>
                        <Button onClick={handleChangePassword} variant="contained" color="primary">
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                     {/* @ts-ignore */}
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>


            {
                redisterModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                        }}
                    >
                         {/* @ts-ignore */}
                        <Register closeModal={() => setRedisterModal(false)} />
                    </div>
                )
            }
        </div >

    );
}