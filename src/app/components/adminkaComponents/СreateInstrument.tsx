'use client';
/* eslint-disable */
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
    Checkbox,
    Autocomplete,
    Input,
} from '@mui/material';
import { DataGrid, GridColDef, GridColumnResizeParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import axios from 'axios';
import { ruRU } from '@mui/x-data-grid/locales/ruRU';
import ExcelJS from 'exceljs';

type Instrument = {
    id: number;
    name: string;
    quantity: number;
    drawing?: { id: number; name: string; filePath: string };
    toolCell?: { storageCells: { id: number; name: string }; quantity: number }[];
    machines?: { id: number; instrumentId: number; machine: { id: number; name: string } }[];
    // Дополнительные поля, сформированные на сервере:
    drawingName?: string;
    storageCellNames?: string;
    machineNames?: string;
};

type StorageCell = {
    id: number;
    name: string;
};

type Machine = {
    id: number;
    name: string;
};

type StorageCellSelection = {
    storageCellId: number;
    quantity: number;
};

export default function CreateInstrument() {
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [storageCells, setStorageCells] = useState<StorageCell[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'add' | 'edit' | null>(null);
    const [instrumentName, setInstrumentName] = useState('');
    const [instrumentQanti, setInstrumentQanti] = useState(0);
    const [selectedStorageCells, setSelectedStorageCells] = useState<StorageCellSelection[]>([]);
    const [selectedMachines, setSelectedMachines] = useState<number[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    // Состояние для хранения изменённых ширин столбцов
    const [columnWidths, setColumnWidths] = useState<{ [field: string]: number }>({});

    useEffect(() => {
        getInstruments();
    }, []);

    useMemo(() => {
        const intervalId = setInterval(() => {
            getInstruments(); // Обновляем данные
        }, 8000); // Каждые 8 секунд

        return () => clearInterval(intervalId);
    }, []);

    const getInstruments = async () => {
        try {
            const response = await axios.get('/api/adminka/updateInstrument');
            const instrumentsData = response.data.map((inst: Instrument) => ({
                ...inst,
                drawingName: inst.drawing?.name || 'без чертежа',
                machineNames:
                    inst.machines && inst.machines.length > 0
                        ? inst.machines.map((m: any) => m.machine.name).join(', ')
                        : 'Без станков',
                storageCellNames:
                    inst.toolCell && inst.toolCell.length > 0
                        ? inst.toolCell.map((cell: any) => `${cell.storageCells.name} (${cell.quantity} шт)`).join(', ')
                        : 'Без ячеек',
            }));

            setInstruments(instrumentsData.sort((a: Instrument, b: Instrument) => a.id - b.id));

            const response3 = await axios.get('/api/adminka/updateCell');
            setStorageCells(response3.data.sort((a: any, b: any) => a.id - b.id));

            const response4 = await axios.get('/api/adminka/updateStanock');
            setMachines(response4.data.sort((a: any, b: any) => a.id - b.id));
        } catch (error) {
            showSnackbar('Ошибка загрузки данных.', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setInstrumentName('');
        setInstrumentQanti(0);
        setSelectedStorageCells([]);
        setSelectedMachines([]);
        setFile(null);
        setDialogAction(null);
        setSelectedInstrument(null);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleAddInstrument = async () => {
        if (!instrumentName.trim() || selectedMachines.length === 0) {
            showSnackbar('Название и станки не могут быть пустыми.', 'error');
            return;
        }

        const storageCellsData = selectedStorageCells.map((cell) => ({
            storageCellId: cell.storageCellId,
            quantity: cell.quantity || 0,
        }));

        const machineIds = selectedMachines.filter((id) => id !== null && id !== undefined);

        try {
            const formData = new FormData();
            formData.append('name', instrumentName);
            formData.append('storageCellsData', JSON.stringify(storageCellsData));
            formData.append('machineIds', JSON.stringify(machineIds));

            if (file) {
                formData.append('file', file);
            }

            await axios.post('/api/adminka/updateInstrument', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showSnackbar('Инструмент успешно добавлен!', 'success');
            getInstruments();
            handleDialogClose();
        } catch (error) {
            console.error('Ошибка при добавлении инструмента:', error);
            showSnackbar('Ошибка при добавлении инструмента.', 'error');
        }
    };

    const handleEditInstrument = async () => {
        if (!selectedInstrument) return;
        try {
            const formData = new FormData();
            formData.append('instrumentId', selectedInstrument.id.toString());
            formData.append('name', instrumentName);
            formData.append('storageCellsData', JSON.stringify(selectedStorageCells));
            formData.append('machineIds', JSON.stringify(selectedMachines));
            if (file) {
                formData.append('file', file);
            }

            await axios.put('/api/adminka/updateInstrument', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showSnackbar('Инструмент успешно обновлён!', 'success');
            getInstruments();
            handleDialogClose();
        } catch {
            showSnackbar('Ошибка при обновлении инструмента.', 'error');
        }
    };

    const handleDeleteInstrument = async (clickId: number) => {
        try {
            await axios.delete('/api/adminka/updateInstrument', { data: { instrumentId: clickId } });
            showSnackbar('Инструмент удалён!', 'success');
            getInstruments();
        } catch {
            showSnackbar('Ошибка при удалении инструмента.', 'error');
        }
    };

    // Мемоизированное определение колонок с учетом сохранённых ширин
    const columns: GridColDef[] = useMemo(() => [
        { field: 'id', headerName: 'ID', width: columnWidths['id'] || 20 },
        { field: 'name', headerName: 'Название', width: columnWidths['name'] || 150 },
        { field: 'quantity', headerName: 'Количество', width: columnWidths['quantity'] || 150 },
        { field: 'drawingName', headerName: 'Чертеж', width: columnWidths['drawingName'] || 150 },
        { field: 'storageCellNames', headerName: 'Ячейки хранения', width: columnWidths['storageCellNames'] || 200 },
        { field: 'machineNames', headerName: 'Станки', width: columnWidths['machineNames'] || 150 },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: columnWidths['actions'] || 150,
            renderCell: (params) => (
                <>
                    <IconButton
                        onClick={() => {
                            setSelectedInstrument(params.row);
                            setDialogAction('edit');
                            setInstrumentName(params.row.name);
                            setInstrumentQanti(params.row.quantity);
                            setSelectedStorageCells(
                                params.row.toolCell?.map((cell: any) => ({
                                    storageCellId: cell.storageCells.id,
                                    quantity: cell.quantity,
                                })) || []
                            );
                            setSelectedMachines(params.row.machines?.map((m: any) => m.machine.id) || []);
                            setOpenDialog(true);
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteInstrument(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ], [columnWidths]);

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    // Функция экспорта в Excel
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Инструменты');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Название', key: 'name', width: 30 },
            { header: 'Количество', key: 'quantity', width: 15 },
            { header: 'Чертеж', key: 'drawing', width: 20 },
            { header: 'Ячейки хранения', key: 'storageCells', width: 40 },
            { header: 'Станки', key: 'machines', width: 30 },
        ];

        // Оформление заголовков
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4CAF50' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        instruments.forEach((inst) => {
            worksheet.addRow({
                id: inst.id,
                name: inst.name,
                quantity: inst.quantity,
                drawing: inst.drawing ? inst.drawing.name : 'без чертежа',
                storageCells: inst.storageCellNames,
                machines: inst.machineNames,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Инструменты.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ height: '97%', p: 4, backgroundColor: '#fff', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom>
                Управление инструментами
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => {
                        setDialogAction('add');
                        setOpenDialog(true);
                    }}
                >
                    Добавить инструмент
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleExportExcel}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 'bold',
                        boxShadow: 3,
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                    }}
                >
                    Выгрузить в Excel
                </Button>
            </Box>
            <Box sx={{ height: '70%', mt: 3 }}>
                <DataGrid
                    rows={instruments}
                    columns={columns}
                    autoHeight={false}
                    localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                    onColumnResize={(params: GridColumnResizeParams) => {
                        setColumnWidths((prev) => ({
                            ...prev,
                            [params.colDef.field]: params.width,
                        }));
                    }}
                />
            </Box>

            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogAction === 'add' ? 'Добавить инструмент' : 'Редактировать инструмент'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Название инструмента"
                        variant="outlined"
                        fullWidth
                        value={instrumentName}
                        onChange={(e) => setInstrumentName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Общее количество инструмента"
                        variant="outlined"
                        fullWidth
                        value={instrumentQanti}
                        onChange={(e) => setInstrumentQanti(Number(e.target.value))}
                        sx={{ mt: 2 }}
                    />
                    <Autocomplete
                        multiple
                        options={storageCells}
                        getOptionLabel={(option) => option.name}
                        value={storageCells.filter((cell) =>
                            selectedStorageCells.some((selected) => selected.storageCellId === cell.id)
                        )}
                        onChange={(event, newValue) => {
                            const updatedSelection = newValue.map((cell) => {
                                const existing = selectedStorageCells.find(
                                    (selected) => selected.storageCellId === cell.id
                                );
                                return {
                                    storageCellId: cell.id,
                                    quantity: existing ? existing.quantity : 0,
                                };
                            });
                            setSelectedStorageCells(updatedSelection);
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
                            <TextField {...params} label="Ячейки хранения" placeholder="Выберите ячейки" />
                        )}
                        sx={{ mt: 2 }}
                    />
                    {selectedStorageCells.map((cell, index) => (
                        <Box key={cell.storageCellId} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1">
                                {storageCells.find((c) => c.id === cell.storageCellId)?.name}
                            </Typography>
                            <TextField
                                label="Количество"
                                variant="outlined"
                                type="number"
                                value={cell.quantity}
                                onChange={(e) => {
                                    const updatedCells = [...selectedStorageCells];
                                    updatedCells[index].quantity = Number(e.target.value);
                                    setSelectedStorageCells(updatedCells);
                                }}
                                inputProps={{ min: 0 }}
                            />
                        </Box>
                    ))}
                    <Autocomplete
                        multiple
                        options={machines}
                        getOptionLabel={(option) => option.name}
                        value={machines.filter((m) => selectedMachines.includes(m.id))}
                        onChange={(event, newValue) => {
                            setSelectedMachines(newValue.map((m) => m.id));
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
                            <TextField {...params} label="Станки" placeholder="Выберите станки" />
                        )}
                        sx={{ mt: 2 }}
                    />
                    <Input
                        type="file"
                        inputProps={{ accept: 'application/pdf' }}
                        onChange={handleFileChange}
                        sx={{ mt: 2 }}
                    />
                    {dialogAction === 'edit' && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Название Чертежа: {selectedInstrument?.drawing?.name || 'Без чертежа'}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={dialogAction === 'add' ? handleAddInstrument : handleEditInstrument} variant="contained">
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
                //@ts-ignore
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
