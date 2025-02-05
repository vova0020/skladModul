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

const IssueInstrumentModal = ({ open, handleClose }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [operationType, setOperationType] = useState('issue');
  const [machine, setMachine] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [issuedTo, setIssuedTo] = useState('');
  const [instrumentStatus, setInstrumentStatus] = useState('new');
  const [summaryInstrument, setSummaryInstrument] = useState(null);
  const [storageCells, setStorageCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);

  const [machines, setMachines] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [allInstruments, setAllInstruments] = useState([]);



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

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const machinesResponse = await axios.get('/api/adminka/updateStanock');
      setMachines(machinesResponse.data);

      const instrumentsResponse = await axios.get('/api/adminka/updateInstrument');
      setAllInstruments(instrumentsResponse.data);

      const storageCellsResponse = await axios.get('/api/adminka/updateCell');
      setStorageCells(storageCellsResponse.data);

      const summaryInstruments = await axios.get('/api/getInstrumentSummary');
      setSummaryInstrument(summaryInstruments.data);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const resetForm = () => {
    setOperationType('issue');
    setMachine(null);
    setInstrument(null);
    setQuantity(1);
    setIssuedTo('');
    setInstrumentStatus('new');
    setSelectedCells([]);
    setTotalSelected(0);
  };

  useEffect(() => {
    if (machine) {
      const filteredInstruments = allInstruments.filter((instrument) =>
        instrument.machines.some((m) => m.machineId === machine.id)
      );
      setInstruments(filteredInstruments);
    } else {
      setInstruments(allInstruments); // Возвращаем полный список, если станок не выбран
    }
  }, [machine, allInstruments]);

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

  useEffect(() => {
    const total = selectedCells.reduce((sum, cell) => {
      const quantity = cell.quantity === '' ? 0 : parseInt(cell.quantity, 10);
      return sum + (isNaN(quantity) ? 0 : quantity);
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

    if (operationType === 'issue' && numericValue > availableInCell) {
      alert(`Вы не можете взять больше, чем доступно в ячейке: ${availableInCell}`);
      return;
    }

    if (operationType === 'sendWriteOff' && numericValue > availableInCell) {
      alert(`Вы не можете списать больше, чем доступно в ячейке: ${availableInCell}`);
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
    console.log(newValue);


    if (isNaN(newQuantity) || newQuantity < 0) {
      return;
    }

    if (operationType === 'issue') {
      const availableInCells = selectedCells.reduce((sum, cell) => {
        const storageCell = storageCells.find((sc) => sc.id === cell.id);
        const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
        return sum + (toolCell?.quantity || 0);
      }, 0);

      if (newQuantity > availableInCells) {
        alert(`Вы не можете выдать больше, чем доступно в выбранных ячейках: ${availableInCells}`);
        return;
      }
    }

    if (operationType === 'sendWriteOff') {
      const availableInCells = selectedCells.reduce((sum, cell) => {
        const storageCell = storageCells.find((sc) => sc.id === cell.id);
        const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
        return sum + (toolCell?.quantity || 0);
      }, 0);

      if (newQuantity > availableInCells) {
        alert(`Вы не можете списать больше, чем доступно в выбранных ячейках: ${availableInCells}`);
        return;
      }
    }

    setQuantity(newQuantity);
  };

  const handleSubmit = async () => {
    const sanitizedCells = selectedCells.map((cell) => ({
      ...cell,
      quantity: cell.quantity === '' ? 0 : cell.quantity,
    }));

    const totalSelected = sanitizedCells.reduce((sum, cell) => sum + cell.quantity, 0);

    if (operationType === 'issue') {
      const availableInCells = selectedCells.reduce((sum, cell) => {
        const storageCell = storageCells.find((sc) => sc.id === cell.id);
        const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
        return sum + (toolCell?.quantity || 0);
      }, 0);

      if (totalSelected > availableInCells) {
        alert(`Вы не можете выдать больше, чем доступно в ячейках: ${availableInCells}`);
        return;
      }
    }

    if (operationType === 'sendWriteOff') {
      const availableInCells = selectedCells.reduce((sum, cell) => {
        const storageCell = storageCells.find((sc) => sc.id === cell.id);
        const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
        return sum + (toolCell?.quantity || 0);
      }, 0);

      if (totalSelected > availableInCells) {
        alert(`Вы не можете списать больше, чем доступно в ячейках: ${availableInCells}`);
        return;
      }
    }

    if (totalSelected !== quantity && operationType !== 'returnedInWrittenOff') {
      alert(`Общее количество должно быть равно ${quantity}`);
      return;
    }

    const transactionData = {
      instrumentId: instrument.id,
      type: operationType,
      quantity,
      status: operationType === 'issue' ? instrumentStatus : null,
      issuedTo: issuedTo,
      machineId: machine?.id,
      userId,
      transactionType: 'machine',
      storageCells: sanitizedCells.filter((cell) => cell.quantity > 0),
    };

    try {
      await axios.post('/api/toolMovement', transactionData);
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
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold', color: '#1A73E8' }}>
          {operationType === 'issue' ? 'Выдать инструмент' :
            operationType === 'return' ? 'Возврат с участка на баланс' :
              operationType === 'returnedInWrittenOff' ? 'Возврат неликвид на списание' :
                'Отправить инструмент на списание'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              label="Тип операции"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              fullWidth
              size={isMobile ? 'small' : 'medium'}
            >
              <MenuItem value="issue">Выдать инструмент</MenuItem>
              <MenuItem value="return">Возврат с участка на баланс</MenuItem>
              <MenuItem value="returnedInWrittenOff">Возврат неликвид на списание</MenuItem>
              <MenuItem value="sendWriteOff">Отправить инструмент на списание</MenuItem>
            </TextField>
          </Grid>

          {operationType !== 'sendWriteOff' && (
            <Grid item xs={12}>
              <Autocomplete
                options={machines}
                getOptionLabel={(option) => option.name}
                value={machine}
                onChange={(_, newValue) => setMachine(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Станок" fullWidth size={isMobile ? 'small' : 'medium'} />
                )}
              />
            </Grid>
          )}

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

          {operationType === 'issue' && (
            <>
              <Grid item xs={12}>
                <TextField
                  label="Кому выдается"
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Статус инструмента"
                  value={instrumentStatus}
                  onChange={(e) => setInstrumentStatus(e.target.value)}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                >
                  <MenuItem value="new">Новый</MenuItem>
                  <MenuItem value="used">Использованный</MenuItem>
                </TextField>
              </Grid>
            </>
          )}

          {(operationType === 'return' || operationType === 'returnedInWrittenOff' || operationType === 'sendWriteOff') && (
            <Grid item xs={12}>
              <TextField
                label={operationType === 'return' ? "От кого принял инструмент" :
                  operationType === 'returnedInWrittenOff' ? "От кого принят неликвид" :
                    "От кого принят инструмент на списание"}
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
          )}

          {(operationType !== 'returnedInWrittenOff') && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {operationType === 'issue' ? 'Выберите ячейки для изъятия' :
                  operationType === 'return' ? 'Выберите ячейки для возврата на баланс' :
                    'Выберите ячейки для списания'}
              </Typography>

              {operationType === 'issue' || operationType === 'sendWriteOff' ? (
                selectedCells.map((cell) => {
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
                })
              ) : (
                <>
                  <Autocomplete
                    multiple
                    options={storageCells.filter(
                      (cell) =>
                        !selectedCells.some((selected) => selected.id === cell.id) &&
                        !cell.toolCell?.some((tool) => tool.instrumentId === instrument?.id)
                    )}
                    getOptionLabel={(option) => option.name}
                    value={[]}
                    onChange={(event, newValue) => {
                      const newCells = newValue.map((cell) => ({ id: cell.id, quantity: 0 }));
                      setSelectedCells((prev) => [...prev, ...newCells]);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Добавить ячейки"
                        placeholder="Выберите ячейки"
                      />
                    )}
                    sx={{ mb: 2 }}
                  />

                  {selectedCells.map((cell) => {
                    const storageCell = storageCells.find((sc) => sc.id === cell.id);
                    const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
                    const canDelete = !toolCell;

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
                        <Typography variant="body2" sx={{ minWidth: '100px', mr: 2 }}>
                          Доступно: {toolCell?.quantity || 0}
                        </Typography>
                        {canDelete && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setSelectedCells((prev) => prev.filter((c) => c.id !== cell.id));
                            }}
                          >
                            Удалить
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </>
              )}
            </Grid>
          )}


          {operationType === 'issue' ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Общее количество: {totalSelected} / {quantity}
              </Typography>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {operationType === 'return' ? 'Вернуть на баланс' :
                  operationType === 'sendWriteOff' ? 'Отправить на списание' :
                    'Отправить на списание'} {totalSelected} из {quantity || 0}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => {
            handleClose();
            resetForm();
          }} sx={{ mr: 2 }} size={isMobile ? 'small' : 'medium'}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSubmit} size={isMobile ? 'small' : 'medium'}>
            {operationType === 'issue' ? 'Выдать' :
              operationType === 'return' ? 'Вернуть на баланс' :
                operationType === 'returnedInWrittenOff' ? 'Отправить на списание' :
                  'Отправить на списание'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default IssueInstrumentModal;