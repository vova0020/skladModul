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
    Checkbox,
    Input,
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface ToolModalProps {
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
    quantity: number;
    toolCell: ToolCell[]; // Связь с ячейками хранения
}

interface Machine {
    id: number;
    name: string;
}

const ToolModal = ({ open, handleClose }: ToolModalProps) => {
    const [token, setToken] = React.useState<string | null>(null); // Токен пользователя
    const [userId, setUserId] = React.useState<number | null>(null); // Идентификатор пользователя
    const [quantities, setQuantities] = React.useState<{ [key: number]: number | '' }>({}); // Используем '' для пустого значения
    const [reason, setReason] = React.useState('');
    const [storageCells, setStorageCells] = React.useState<StorageCell[]>([]);
    const [machines, setMachines] = React.useState<Machine[]>([]);
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
    const [instruments, setInstruments] = React.useState<Instrument[]>([]);
    const [selectedInstrument, setSelectedInstrument] = React.useState<Instrument | null>(null);
    const [operationType, setOperationType] = React.useState<'receive' | 'receiveBalance'>('receive'); // Тип операции
    const [newSelectedCells, setNewSelectedCells] = React.useState<StorageCell[]>([]); // Новые ячейки, выбранные через Autocomplete
    const [selectedMachines, setSelectedMachines] = React.useState<number[]>([]); // Выбранные станки
    const [file, setFile] = React.useState<File | null>(null); // Файл чертежа
    const [instrumentName, setInstrumentName] = React.useState(''); // Название инструмента
    const [instrumentQuantity, setInstrumentQuantity] = React.useState(0); // Общее количество инструмента
    const [quantityError, setQuantityError] = React.useState(''); // Ошибка превышения общего количества

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
            const response2 = await axios.get('/api/adminka/updateCell');
            setStorageCells(response2.data.sort((a, b) => a.id - b.id));
            const response3 = await axios.get('/api/adminka/updateStanock');
            setMachines(response3.data.sort((a, b) => a.id - b.id));
        } catch (error) {
            console.error('Ошибка при загрузке инструментов:', error);
        }
    };

    const handleCellSelection = (cellId: number, quantity: number | '') => {
        const cell = selectedInstrument?.toolCell.find((tc) => tc.storageCellsId === cellId);
        if (!cell) return;

        // Если значение пустое, устанавливаем 0
        const parsedQuantity = quantity === '' ? 0 : quantity;

        // Проверяем, чтобы количество для получения не превышало доступное количество
        if (operationType === 'receive' && parsedQuantity > cell.quantity) {
            setSnackbar({ open: true, message: `Количество для получения не может превышать доступное количество (${cell.quantity}).`, severity: 'error' });
            return;
        }

        setQuantities((prev) => ({ ...prev, [cellId]: quantity }));
    };

    const resetForm = () => {
        setQuantities({});
        setReason('');
        setSelectedInstrument(null);
        setOperationType('receive'); // Сбрасываем тип операции
        setNewSelectedCells([]); // Сбрасываем новые ячейки
        setSelectedMachines([]); // Сбрасываем выбранные станки
        setFile(null); // Сбрасываем файл
        setInstrumentName(''); // Сбрасываем название
        setInstrumentQuantity(0); // Сбрасываем количество
        setQuantityError(''); // Сбрасываем ошибку
    };

    const validateQuantities = () => {
        if (operationType === 'receive') {
            const totalQuantity = newSelectedCells.reduce((sum, cell) => {
                const quantity = quantities[cell.id] || 0;
                return sum + (quantity === '' ? 0 : quantity);
            }, 0);

            if (totalQuantity > instrumentQuantity) {
                setQuantityError(`Сумма количеств по ячейкам (${totalQuantity}) превышает общее количество (${instrumentQuantity}).`);
                return false;
            } else {
                setQuantityError('');
                return true;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (operationType === 'receive') {
            // Логика для получения инструмента
            if (
                !instrumentName.trim() ||
                newSelectedCells.length === 0 ||
                selectedMachines.length === 0
            ) {
                setSnackbar({ open: true, message: 'Название, ячейки хранения и станки не могут быть пустыми.', severity: 'error' });
                return;
            }

            if (!validateQuantities()) {
                return;
            }

            const storageCellsData = newSelectedCells.map((cell) => ({
                storageCellId: cell.id,
                quantity: quantities[cell.id] || 0,
            }));

            const machineIds = selectedMachines.filter((id) => id !== null && id !== undefined);

            try {
                const formData = new FormData();
                formData.append('name', instrumentName);
                formData.append('userId', userId);
                formData.append('quantity', instrumentQuantity.toString());
                formData.append('storageCellsData', JSON.stringify(storageCellsData));
                formData.append('machineIds', JSON.stringify(machineIds));

                if (file) {
                    formData.append('file', file);
                }

                const response = await axios.post('/api/updateCreateNewInstrument', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                setSnackbar({ open: true, message: 'Инструмент успешно получен!', severity: 'success' });
                resetForm(); // Сбрасываем состояние формы

                // Задержка перед закрытием модального окна
                setTimeout(() => {
                    handleClose(true); // Передаем true для обновления данных в родительском компоненте
                }, 2000); // Закрываем через 2 секунды
            } catch (error) {
                setSnackbar({ open: true, message: 'Ошибка при получении инструмента.', severity: 'error' });
            }
        } else {
            // Логика для возврата из ремонта
            if (!selectedInstrument) {
                setSnackbar({ open: true, message: 'Необходимо выбрать инструмент.', severity: 'error' });
                return;
            }

            // Собираем все ячейки: существующие и новые
            const allCells = [
                ...(selectedInstrument.toolCell || []).map((cell) => ({
                    id: cell.storageCellsId,
                    quantity: quantities[cell.storageCellsId] || 0,
                })),
                ...newSelectedCells.map((cell) => ({
                    id: cell.id,
                    quantity: quantities[cell.id] || 0,
                })),
            ];

            // Фильтруем ячейки, оставляя только те, для которых указано количество больше 0
            const filteredCells = allCells.filter((cell) => {
                const quantity = quantities[cell.id];
                return quantity !== '' && quantity > 0;
            });

            if (filteredCells.length === 0) {
                setSnackbar({ open: true, message: 'Необходимо указать количество хотя бы для одной ячейки.', severity: 'error' });
                return;
            }

            try {
                const response = await axios.post('/api/updateRemontInstrument', {
                    instrumentId: selectedInstrument.id,
                    userId,
                    cells: filteredCells.map((cell) => ({
                        cellId: cell.id,
                        quantity: quantities[cell.id] === '' ? 0 : quantities[cell.id],
                    })),
                    operationType,
                });
                setSnackbar({ open: true, message: 'Инструмент успешно добавлен в базу!', severity: 'success' });
                resetForm(); // Сбрасываем состояние формы

                // Задержка перед закрытием модального окна
                setTimeout(() => {
                    handleClose(true); // Передаем true для обновления данных в родительском компоненте
                }, 2000); // Закрываем через 2 секунды
            } catch (error) {
                setSnackbar({ open: true, message: 'Ошибка при добавлении инструмента в базу.', severity: 'error' });
            }
        }
    };

    return (
        <Dialog open={open} onClose={() => handleClose()} maxWidth="md" fullWidth>
            <DialogTitle>{operationType === 'receive' ? 'Новый инструмент без баланса' : 'Новый инструмент на балансе'}</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">Тип операции</FormLabel>
                    <RadioGroup
                        row
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value as 'receive' | 'receiveBalance')}
                    >
                        <FormControlLabel value="receive" control={<Radio />} label="Новый инструмент без баланса" />
                        <FormControlLabel value="receiveBalance" control={<Radio />} label="Новый инструмент на балансе" />
                    </RadioGroup>
                </FormControl>
                {operationType === 'receive' ? (
                    <>
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
                            value={instrumentQuantity}
                            onChange={(e) => setInstrumentQuantity(Number(e.target.value))}
                            sx={{ mt: 2 }}
                        />
                        <Autocomplete
                            multiple
                            options={storageCells}
                            getOptionLabel={(option) => option.name}
                            value={newSelectedCells}
                            onChange={(event, newValue) => {
                                setNewSelectedCells(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Ячейки хранения" placeholder="Выберите ячейки" />
                            )}
                            sx={{ mt: 2 }}
                        />
                        {newSelectedCells.map((cell) => (
                            <Box key={cell.id} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body1">
                                    {cell.name}
                                </Typography>
                                <TextField
                                    label="Количество"
                                    variant="outlined"
                                    type="number"
                                    value={quantities[cell.id] ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                        setQuantities((prev) => ({ ...prev, [cell.id]: value }));
                                        validateQuantities(); // Проверяем общее количество после изменения
                                    }}
                                    inputProps={{
                                        min: 0,
                                        max: instrumentQuantity,
                                    }}
                                    error={
                                        quantities[cell.id] !== '' &&
                                        (quantities[cell.id] ?? 0) > instrumentQuantity
                                    }
                                    helperText={
                                        quantities[cell.id] !== '' &&
                                            (quantities[cell.id] ?? 0) > instrumentQuantity
                                            ? `Максимальное количество: ${instrumentQuantity}`
                                            : ''
                                    }
                                />
                            </Box>
                        ))}
                        {quantityError && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {quantityError}
                            </Typography>
                        )}
                        <Autocomplete
                            multiple
                            options={machines}
                            getOptionLabel={(option) => option.name}
                            value={machines.filter((m) => selectedMachines.includes(m.id))}
                            onChange={(event, newValue) => {
                                setSelectedMachines(newValue.map((m) => m.id));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Станки" placeholder="Выберите станки" />
                            )}
                            sx={{ mt: 2 }}
                        />
                        <Input
                            type="file"
                            inputProps={{ accept: 'application/pdf' }}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            sx={{ mt: 2 }}
                        />
                    </>
                ) : (
                    <>
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
                                            label={`Количество для ${operationType === 'receive' ? 'получения' : 'возврата из ремонта'}`}
                                            variant="outlined"
                                            type="number"
                                            value={quantities[cell.storageCellsId] ?? ''}
                                            onChange={(e) => {
                                                const value = e.target.value === '' ? '' : Number(e.target.value);
                                                handleCellSelection(cell.storageCellsId, value);
                                            }}
                                            inputProps={{
                                                min: 0,
                                                max: operationType === 'receive' ? cell.quantity : undefined, // Ограничение только для получения
                                            }}
                                            error={
                                                operationType === 'receive' && // Подсветка ошибки только для получения
                                                quantities[cell.storageCellsId] !== '' &&
                                                (quantities[cell.storageCellsId] ?? 0) > cell.quantity
                                            }
                                            helperText={
                                                operationType === 'receive' && // Сообщение об ошибке только для получения
                                                    quantities[cell.storageCellsId] !== '' &&
                                                    (quantities[cell.storageCellsId] ?? 0) > cell.quantity
                                                    ? `Максимальное количество: ${cell.quantity}`
                                                    : ''
                                            }
                                        />
                                    </Box>
                                ))}
                                {operationType === 'receiveBalance' && (
                                    <>
                                        <Autocomplete
                                            multiple
                                            options={storageCells}
                                            getOptionLabel={(option) => option.name}
                                            value={newSelectedCells}
                                            onChange={(event, newValue) => {
                                                setNewSelectedCells(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Выберите ячейки для размещения" />
                                            )}
                                            sx={{ mt: 2 }}
                                        />
                                        {newSelectedCells.map((cell) => (
                                            <Box key={cell.id} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="body1">
                                                    {cell.name}
                                                </Typography>
                                                <TextField
                                                    label="Количество"
                                                    variant="outlined"
                                                    type="number"
                                                    value={quantities[cell.id] ?? ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value === '' ? '' : Number(e.target.value);
                                                        setQuantities((prev) => ({ ...prev, [cell.id]: value }));
                                                    }}
                                                    inputProps={{
                                                        min: 0,
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button sx={{ mr: 5 }} onClick={() => handleClose()}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {operationType === 'receive' ? 'Сохранить' : 'Сохранить'}
                </Button>
            </DialogActions>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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

export default ToolModal;