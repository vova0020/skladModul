import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Snackbar,
    Alert,
    Autocomplete,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface WriteOffInstrumentModalProps {
    open: boolean;
    handleClose: (refresh?: boolean) => void;
}

interface StorageCell {
    id: number;
    name: string;
}

interface ToolCell {
    id: number;
    instrumentId: number;
    storageCellsId: number;
    quantity: number; // Количество инструмента в ячейке
    storageCells: StorageCell;
}

interface Instrument {
    id: number;
    name: string;
    type: string;
    quantity: number;
    toolCell: ToolCell[]; // Связь с ячейками хранения
}

const WriteOffInstrumentModal = ({ open, handleClose }: WriteOffInstrumentModalProps) => {
    const [token, setToken] = React.useState<string | null>(null); // Токен пользователя
    const [userId, setUserId] = React.useState<number | null>(null); // Идентификатор пользователя
    const [selectedCells, setSelectedCells] = React.useState<ToolCell[]>([]);
    const [quantities, setQuantities] = React.useState<{ [key: number]: number | '' }>({}); // Используем '' для пустого значения
    const [reason, setReason] = React.useState('');
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
    const [instruments, setInstruments] = React.useState<Instrument[]>([]);
    const [selectedInstrument, setSelectedInstrument] = React.useState<Instrument | null>(null);
    const [operationType, setOperationType] = React.useState<'write_off' | 'repair'>('write_off'); // Тип операции

    React.useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            try {
                const decoded: any = jwtDecode(storedToken);
                setUserId(decoded.id);
            } catch (error) {
                console.error('Ошибка при декодировании токена:', error);
            }
        }
    }, []);

    React.useEffect(() => {
        if (open) {
            fetchInstruments();
        } else {
            // Сбрасываем Snackbar при закрытии модального окна
            setSnackbar({ open: false, message: '', severity: 'success' });
        }
    }, [open]);

    const fetchInstruments = async () => {
        try {
            const response = await axios.get('/api/adminka/updateInstrument');
            setInstruments(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке инструментов:', error);
        }
    };

    const handleCellSelection = (cellId: number, quantity: number | '') => {
        const cell = selectedInstrument?.toolCell.find((tc) => tc.storageCellsId === cellId);
        if (!cell) return;

        // Если значение пустое, устанавливаем 0
        const parsedQuantity = quantity === '' ? 0 : quantity;

        // Проверяем, чтобы количество для списания не превышало доступное количество
        if (parsedQuantity > cell.quantity) {
            setSnackbar({ open: true, message: `Количество для списания не может превышать доступное количество (${cell.quantity}).`, severity: 'error' });
            return;
        }

        setQuantities((prev) => ({ ...prev, [cellId]: quantity }));
        if (parsedQuantity > 0) {
            if (!selectedCells.some((selectedCell) => selectedCell.storageCellsId === cellId)) {
                setSelectedCells((prev) => [...prev, cell]);
            }
        } else {
            setSelectedCells((prev) => prev.filter((selectedCell) => selectedCell.storageCellsId !== cellId));
        }
    };

    const resetForm = () => {
        setSelectedCells([]);
        setQuantities({});
        setReason('');
        setSelectedInstrument(null);
        setOperationType('write_off'); // Сбрасываем тип операции
    };

    const handleSubmit = async () => {
        if (selectedCells.length === 0 || !reason.trim() || !selectedInstrument) {
            setSnackbar({ open: true, message: 'Необходимо выбрать ячейки, инструмент и указать причину.', severity: 'error' });
            return;
        }

        try {
            const response = await axios.post('/api/updateWriteOffInstrument', {
                instrumentId: selectedInstrument.id,
                userId,
                cells: selectedCells.map((cell) => ({
                    cellId: cell.storageCellsId,
                    quantity: quantities[cell.storageCellsId] === '' ? 0 : quantities[cell.storageCellsId], // Если значение пустое, отправляем 0
                })),
                reason,
                operationType, // Добавляем тип операции в запрос
            });
            setSnackbar({ open: true, message: `Инструмент успешно ${operationType === 'write_off' ? 'списан' : 'сдан в ремонт'}!`, severity: 'success' });
            resetForm(); // Сбрасываем состояние формы

            // Задержка перед закрытием модального окна
            setTimeout(() => {
                handleClose(true); // Передаем true для обновления данных в родительском компоненте
            }, 2000); // Закрываем через 2 секунды
        } catch (error) {
            setSnackbar({ open: true, message: `Ошибка при ${operationType === 'write_off' ? 'списании' : 'сдаче в ремонт'} инструмента.`, severity: 'error' });
        }
    };

    return (
        <Dialog open={open} onClose={() => handleClose()} maxWidth="md" fullWidth>
            <DialogTitle>{operationType === 'write_off' ? 'Списание инструмента' : 'Сдача инструмента в ремонт'}</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">Тип операции</FormLabel>
                    <RadioGroup
                        row
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value as 'write_off' | 'repair')}
                    >
                        <FormControlLabel value="write_off" control={<Radio />} label="Списание" />
                        <FormControlLabel value="repair" control={<Radio />} label="Сдача в ремонт" />
                    </RadioGroup>
                </FormControl>
                <Autocomplete
                    options={instruments}
                    getOptionLabel={(option) => option.name}
                    value={selectedInstrument}
                    onChange={(event, newValue) => setSelectedInstrument(newValue)}
                    renderInput={(params) => <TextField {...params} label="Выберите инструмент" />}
                    sx={{ mt: 2 }}
                />
                {selectedInstrument && (
                    <>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            {selectedInstrument.name}
                        </Typography>
                        {selectedInstrument.toolCell.map((cell) => (
                            <Box key={cell.storageCellsId} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body1">
                                    {cell.storageCells.name} (Доступно: {cell.quantity})
                                </Typography>
                                <TextField
                                    label={`Количество для ${operationType === 'write_off' ? 'списания' : 'сдачи в ремонт'}`}
                                    variant="outlined"
                                    type="number"
                                    value={quantities[cell.storageCellsId] ?? ''} // Используем пустую строку вместо 0
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                        handleCellSelection(cell.storageCellsId, value);
                                    }}
                                    inputProps={{
                                        min: 0,
                                        max: cell.quantity, // Ограничение на максимальное значение
                                    }}
                                    error={
                                        quantities[cell.storageCellsId] !== '' &&
                                        (quantities[cell.storageCellsId] ?? 0) > cell.quantity
                                    } // Показываем ошибку, если значение превышает доступное количество
                                    helperText={
                                        quantities[cell.storageCellsId] !== '' &&
                                        (quantities[cell.storageCellsId] ?? 0) > cell.quantity
                                            ? `Максимальное количество: ${cell.quantity}`
                                            : ''
                                    }
                                />
                            </Box>
                        ))}
                    </>
                )}
                <TextField
                    label="Причина"
                    variant="outlined"
                    fullWidth
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button sx={{ mr: 5 }} onClick={() => handleClose()}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {operationType === 'write_off' ? 'Списать' : 'Сдать в ремонт'}
                </Button>
            </DialogActions>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000} // Уменьшено время отображения до 3 секунд
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default WriteOffInstrumentModal;