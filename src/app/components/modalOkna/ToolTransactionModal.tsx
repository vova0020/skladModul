/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import * as React from 'react';
import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import { useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  borderRadius: '10px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const LatheToolMovementModal = ({ open, handleClose }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  // Тип операции: sendToLathe или receiveFromLathe
  const [operationType, setOperationType] = useState('sendToLathe');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [instrument, setInstrument] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // Поле для операции приёма – указание, от кого принят инструмент
  const [issuedTo, setIssuedTo] = useState('');
  const [summaryInstrument, setSummaryInstrument] = useState(null);
  const [storageCells, setStorageCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);

  // Данные из токарки – массив объектов с полем instrument и totalTurner
  const [turnerInstruments, setTurnerInstruments] = useState([]);

  const [instruments, setInstruments] = useState([]);
  const [allInstruments, setAllInstruments] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const instrumentsResponse = await axios.get('/api/adminka/updateInstrument');
      setAllInstruments(instrumentsResponse.data);
      setInstruments(instrumentsResponse.data);

      const storageCellsResponse = await axios.get('/api/adminka/updateCell');
      setStorageCells(storageCellsResponse.data);

      const turnerResponse = await axios.get('/api/turnerApi/getTurner');
      setTurnerInstruments(turnerResponse.data);
      console.log(turnerResponse.data);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const resetForm = () => {
    setOperationType('sendToLathe');
    setInstrument(null);
    setQuantity(1);
    setIssuedTo('');
    setSelectedCells([]);
    setTotalSelected(0);
  };

  // При выборе инструмента выбираем ячейки, где он находится
  useEffect(() => {
    if (instrument && storageCells) {
      const filteredCells = storageCells.filter((cell) =>
        cell.toolCell && cell.toolCell.some((tool) => tool.instrumentId === instrument.id)
      );
      setSelectedCells(filteredCells.map((cell) => ({ id: cell.id, quantity: '' })));
      const foundSummary = summaryInstrument?.find((summary) => summary.instrumentId === instrument.id);
      setSummaryInstrument(foundSummary ? [foundSummary] : []);
    } else {
      setSelectedCells([]);
    }
  }, [instrument, storageCells]);

  // Подсчёт общего количества, указанного по ячейкам
  useEffect(() => {
    const total = selectedCells.reduce((sum, cell) => {
      const qty = cell.quantity === '' ? 0 : parseInt(cell.quantity, 10);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
    setTotalSelected(total);
  }, [selectedCells]);

  const handleCellQuantityChange = (cellId, newValue) => {
    if (newValue === '') {
      setSelectedCells((prev) =>
        prev.map((cell) => (cell.id === cellId ? { ...cell, quantity: '' } : cell))
      );
      return;
    }

    const numericValue = parseInt(newValue, 10);
    if (isNaN(numericValue) || numericValue < 0) return;

    const storageCell = storageCells.find((sc) => sc.id === cellId);
    const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
    const availableInCell = toolCell?.quantity || 0;

    if (numericValue > availableInCell) {
      alert(`Вы не можете ${operationType === 'sendToLathe' ? 'отправить' : 'принять'} больше, чем доступно в ячейке: ${availableInCell}`);
      return;
    }

    setSelectedCells((prev) =>
      prev.map((cell) => (cell.id === cellId ? { ...cell, quantity: numericValue } : cell))
    );
  };

  const handleQuantityChange = (e) => {
    const newValue = e.target.value;
    if (newValue === '') {
      setQuantity('');
      return;
    }

    const newQuantity = parseInt(newValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) return;

    const availableInCells = selectedCells.reduce((sum, cell) => {
      const storageCell = storageCells.find((sc) => sc.id === cell.id);
      const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
      return sum + (toolCell?.quantity || 0);
    }, 0);

    if (newQuantity > availableInCells) {
      alert(`Вы не можете ${operationType === 'sendToLathe' ? 'отправить' : 'принять'} больше, чем доступно в выбранных ячейках: ${availableInCells}`);
      return;
    }

    setQuantity(newQuantity);
  };

  const handleSubmit = async () => {
    const sanitizedCells = selectedCells.map((cell) => ({
      ...cell,
      quantity: cell.quantity === '' ? 0 : cell.quantity,
    }));

    const totalSelectedQty = sanitizedCells.reduce((sum, cell) => sum + cell.quantity, 0);
    const availableInCells = selectedCells.reduce((sum, cell) => {
      const storageCell = storageCells.find((sc) => sc.id === cell.id);
      const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
      return sum + (toolCell?.quantity || 0);
    }, 0);

    if (totalSelectedQty > availableInCells) {
      alert(`Вы не можете ${operationType === 'sendToLathe' ? 'отправить' : 'принять'} больше, чем доступно в ячейках: ${availableInCells}`);
      return;
    }

    if (totalSelectedQty !== quantity) {
      alert(`Общее количество должно быть равно ${quantity}`);
      return;
    }

    const transactionData = {
      instrumentId: instrument.id,
      type: operationType,
      quantity,
      status: null,
      issuedTo: issuedTo,
      userId,
      transactionType: 'machine',
      storageCells: sanitizedCells.filter((cell) => cell.quantity > 0),
    };

    try {
      await axios.post('/api/turnerApi/movingLathe', transactionData);
      alert('Операция успешно выполнена!');
      resetForm();
      handleClose();
    } catch (error) {
      console.error('Ошибка при выполнении операции:', error);
      alert('Ошибка при выполнении операции.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => { handleClose(); resetForm(); }}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold', color: '#1A73E8' }}>
          {operationType === 'sendToLathe' ? 'Отправить инструмент в токарку' : 'Принять инструмент из токарки'}
        </Typography>

        <Grid container spacing={2}>
          {/* Выбор типа операции */}
          <Grid item xs={12}>
            <TextField
              select
              label="Тип операции"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              <MenuItem value="sendToLathe">Отправить в токарку</MenuItem>
              <MenuItem value="receiveFromLathe">Принять из токарки</MenuItem>
            </TextField>
          </Grid>

          {/* Выбор инструмента */}
          <Grid item xs={12}>
            <Autocomplete
              options={instruments}
              getOptionLabel={(option) => option.name}
              value={instrument}
              onChange={(_, newValue) => setInstrument(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Инструмент" fullWidth size={isMobile ? 'small' : 'medium'} />
              )}
            />
          </Grid>

          {/* Количество */}
          <Grid item xs={12}>
            <TextField
              label="Количество"
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* Дополнительное поле для операции приёма */}
          {operationType === 'receiveFromLathe' && (
            <Grid item xs={12}>
              <TextField
                label="От кого принят инструмент"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
          )}

          {/* Выбор ячеек для изъятия/приёма инструмента */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Выберите ячейки для {operationType === 'sendToLathe' ? 'изъятия' : 'приёма'} инструмента
            </Typography>

            {selectedCells.map((cell) => {
              const storageCell = storageCells.find((sc) => sc.id === cell.id);
              const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);

              return (
                <Box key={cell.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label={storageCell?.name}
                    type="number"
                    value={cell.quantity}
                    onChange={(e) => handleCellQuantityChange(cell.id, e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{ mr: 2, flexGrow: 1 }}
                    size={isMobile ? 'small' : 'medium'}
                  />
                  <Typography variant="body2" sx={{ minWidth: '100px' }}>
                    Доступно: {toolCell?.quantity || 0}
                  </Typography>
                </Box>
              );
            })}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {operationType === 'sendToLathe' ? 'Отправить' : 'Принять'}: {totalSelected} из {quantity || 0}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => { handleClose(); resetForm(); }} sx={{ mr: 2 }} size={isMobile ? 'small' : 'medium'}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmit} size={isMobile ? 'small' : 'medium'}>
            {operationType === 'sendToLathe' ? 'Отправить в токарку' : 'Принять из токарки'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LatheToolMovementModal;
