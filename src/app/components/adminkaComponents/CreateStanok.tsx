'use client';
/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Checkbox,
    Autocomplete,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
import { ruRU } from '@mui/x-data-grid/locales/ruRU';

type Product = {
    id: number;
    name: string;
};

export default function CreateSectors() {
    const [stanock, setStanock] = useState<any[]>([]);
    const [product, setProduct] = useState<Product[]>([]);
    const [selectedSector, setSelectedSector] = useState<any | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'add' | 'edit' | null>(null);
    const [sectorName, setSectorName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Функция для отображения уведомлений
    const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Получение данных о станках и изделиях
    const getSectors = useCallback(async () => {
        try {
            const response = await axios.get('/api/adminka/updateStanock');
            const stanockData = response.data.map((stan: any) => ({
                ...stan,
                productNames:
                    stan.product && stan.product.length > 0
                        ? stan.product.map((p: any) => p.product.name).join(', ')
                        : 'Без изделий',
            }));
            setStanock(stanockData.sort((a: any, b: any) => a.id - b.id));

            const response3 = await axios.get('/api/adminka/updateProduct');
            // @ts-ignore
            setProduct(response3.data.sort((a, b) => a.id - b.id));
        } catch (error) {
            showSnackbar('Ошибка загрузки данных.', 'error');
        }
    }, [showSnackbar]);

    useEffect(() => {
        getSectors();
    }, [getSectors]);

    useEffect(() => {
        console.log(selectedProducts);
        console.log(product);
    }, [selectedProducts, product]);

    // Обновление данных каждые 8 секунд
    useEffect(() => {
        const intervalId = setInterval(() => {
            getSectors(); // Обновляем данные
        }, 8000);
        return () => clearInterval(intervalId);
    }, [getSectors]);

    const handleDialogClose = useCallback(() => {
        setOpenDialog(false);
        setSectorName('');
        setSelectedProducts([]);
        setDialogAction(null);
    }, []);

    const handleAddSector = async () => {
        if (!sectorName.trim() || selectedProducts.length === 0) {
            showSnackbar('Название и изделия не могут быть пустыми.', 'error');
            return;
        }
        try {
            await axios.post('/api/adminka/updateStanock', {
                name: sectorName,
                productId: selectedProducts,
            });
            showSnackbar('Станок успешно добавлен!', 'success');
            getSectors();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при добавлении станка.', 'error');
        }
    };

    const handleEditSector = async () => {
        if (!selectedSector) return;
        try {
            await axios.put('/api/adminka/updateStanock', {
                stanockId: selectedSector.id,
                name: sectorName,
                productId: selectedProducts,
            });
            showSnackbar('Станок успешно обновлён!', 'success');
            getSectors();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при обновлении станка.', 'error');
        }
    };

    const handleDeleteSector = useCallback(async (clickId: number) => {
        try {
            await axios.delete('/api/adminka/updateStanock', { data: { stanockId: clickId } });
            showSnackbar('Станок удалён!', 'success');
            getSectors();
        } catch {
            showSnackbar('Ошибка при удалении станка.', 'error');
        }
    }, [getSectors, showSnackbar]);

    // Мемоизированное определение колонок, чтобы их объект не пересоздавался при обновлении данных
    const columns: GridColDef[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: 20 },
        { field: 'name', headerName: 'Название', width: 150 },
        {
            field: 'productNames',
            headerName: 'Связь с изделиями',
            width: 200,
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        onClick={() => {
                            setSelectedSector(params.row);
                            setDialogAction('edit');
                            setSectorName(params.row.name);
                            // Используем правильное поле для id изделий
                            setSelectedProducts(params.row.product?.map((p: any) => p.product.id) || []);
                            setOpenDialog(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSector(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
            width: 150,
        },
    ], [handleDeleteSector]);

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <Box sx={{ height: '97%', p: 4, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom>
                Управление станками
            </Typography>
            <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => {
                    setDialogAction('add');
                    setOpenDialog(true);
                }}
            >
                Добавить станок
            </Button>
            <Box sx={{ height: '70%', mt: 3 }}>
                <DataGrid
                    rows={stanock}
                    columns={columns}
                    autoHeight={false}
                    localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                />
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="md" // Увеличиваем ширину диалога
                fullWidth // Растягиваем диалог на всю доступную ширину
            >
                <DialogTitle>
                    {dialogAction === 'add' ? 'Добавить станок' : 'Редактировать станок'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Название станка"
                        variant="outlined"
                        fullWidth
                        value={sectorName}
                        onChange={(e) => setSectorName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Autocomplete
                        multiple
                        options={product}
                        getOptionLabel={(option) => option.name}
                        value={product.filter((p) => selectedProducts.includes(p.id))}
                        onChange={(event, newValue) => {
                            setSelectedProducts(newValue.map((p) => p.id));
                        }}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.name}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Изделия" placeholder="Выберите изделия" />
                        )}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button
                        onClick={dialogAction === 'add' ? handleAddSector : handleEditSector}
                        variant="contained"
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                // @ts-ignore
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
