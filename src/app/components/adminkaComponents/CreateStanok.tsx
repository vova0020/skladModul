'use client';
/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
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
    MenuItem,
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

type Sector = {
    id: number;
    name: string;
    section?: { name: string };
    sectionId?: number;
    product?: { id: number; name: string }[];
};

type Product = {
    id: number;
    name: string;
};

export default function CreateSectors() {
    const [stanock, setStanock] = useState<Sector[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [product, setProduct] = useState<Product[]>([]);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'add' | 'edit' | null>(null);
    const [sectorName, setSectorName] = useState('');
    const [selectSector, setSelectSector] = useState<number | ''>('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        getSectors();
    }, []);

    useMemo(() => {
        const intervalId = setInterval(() => {
            getSectors(); // Обновляем данные
        }, 8000); // Обновляем каждые 8 секунд

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []);

    const getSectors = async () => {
        try {
            const response = await axios.get('/api/adminka/updateStanock');
            setStanock(response.data.sort((a: Sector, b: Sector) => a.id - b.id));
            // console.log(response);

            const response2 = await axios.get('/api/adminka/updateSector');
            setSectors(response2.data.sort((a, b) => a.id - b.id));

            const response3 = await axios.get('/api/adminka/updateProduct');
            setProduct(response3.data.sort((a, b) => a.id - b.id));
        } catch (error) {
            showSnackbar('Ошибка загрузки данных.', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSectorName('');
        setSelectSector('');
        setSelectedProducts([]);
        setDialogAction(null);
    };

    const handleAddSector = async () => {
        if (!sectorName.trim() || !selectSector || selectedProducts.length === 0) {
            showSnackbar('Название, участок и изделия не могут быть пустыми.', 'error');
            return;
        }

        try {
            await axios.post('/api/adminka/updateStanock', {
                name: sectorName,
                productId: selectedProducts,
                sectionId: selectSector,
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
                sectionId: selectSector,
            });
            showSnackbar('Станок успешно обновлён!', 'success');
            getSectors();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при обновлении станка.', 'error');
        }
    };

    const handleDeleteSector = async (clickId: number) => {
        try {
            await axios.delete('/api/adminka/updateStanock', { data: { stanockId: clickId } });
            showSnackbar('Станок удалён!', 'success');
            getSectors();
        } catch {
            showSnackbar('Ошибка при удалении станка.', 'error');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 20 },
        { field: 'name', headerName: 'Название', width: 150 },
        {
            field: 'sectionName',
            headerName: 'Связь с участком',
            width: 150,
            renderCell: (params) => params.row?.section?.name || 'Без участка',
        },
        {
            field: 'productName',
            headerName: 'Связь с изделиями',
            width: 150,
            renderCell: (params) => {
                if (params.row.product && params.row.product.length > 0) {
                    return params.row.product.map(p => p.product.name).join(', ');
                } else {
                    return 'Без изделий';
                }
            },
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
                            setSelectSector(params.row.sectionId || '');
                            // Устанавливаем выбранные изделия
                            setSelectedProducts(params.row.product?.map(p => p.id) || []);
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
    ];

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

            <Dialog open={openDialog} onClose={handleDialogClose}
                maxWidth="md" // Увеличиваем ширину диалога
                fullWidth // Растягиваем диалог на всю доступную ширину
            >
                <DialogTitle>{dialogAction === 'add' ? 'Добавить станок' : 'Редактировать станок'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Название станка"
                        variant="outlined"
                        fullWidth
                        value={sectorName}
                        onChange={(e) => setSectorName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        select
                        label="Участок"
                        variant="outlined"
                        fullWidth
                        value={selectSector}
                        onChange={(e) => setSelectSector(Number(e.target.value))}
                        sx={{ mt: 2 }}
                    >
                        {sectors.map((sector) => (
                            <MenuItem key={sector.id} value={sector.id}>
                                {sector.name}
                            </MenuItem>
                        ))}
                    </TextField>
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
                    <Button onClick={dialogAction === 'add' ? handleAddSector : handleEditSector} variant="contained">
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
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}