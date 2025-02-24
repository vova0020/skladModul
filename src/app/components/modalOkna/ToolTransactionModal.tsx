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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Input from '@mui/material/Input';
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
  const [operationType, setOperationType] = useState('sendToLathe');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // States for sendToLathe
  const [instrument, setInstrument] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [issuedTo, setIssuedTo] = useState('');
  const [storageCells, setStorageCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);

  // States for receiveFromLathe
  const [turnerInstruments, setTurnerInstruments] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedTurnerInstrument, setSelectedTurnerInstrument] = useState(null);
  const [instrumentChanged, setInstrumentChanged] = useState(null);
  const [balanceOption, setBalanceOption] = useState('existingBalance');
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [newInstrumentQuantity, setNewInstrumentQuantity] = useState(0);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [file, setFile] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [allInstruments, setAllInstruments] = useState([]);
  const [availableCells, setAvailableCells] = useState([]);
  const [additionalCells, setAdditionalCells] = useState([]);

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
  useEffect(() => {
  console.log(additionalCells);
  
  }, [additionalCells]);

  const fetchData = async () => {
    try {
      const [instrumentsResponse, storageCellsResponse, turnerResponse, machinesResponse] = await Promise.all([
        axios.get('/api/adminka/updateInstrument'),
        axios.get('/api/adminka/updateCell'),
        axios.get('/api/turnerApi/getTurner'),
        axios.get('/api/adminka/updateStanock') // Новый запрос для станков
      ]);

      setAllInstruments(instrumentsResponse.data);
      setStorageCells(storageCellsResponse.data);
      setTurnerInstruments(turnerResponse.data);
      setMachines(machinesResponse.data); // Сохраняем станки
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
    setSelectedTurnerInstrument(null);
    setInstrumentChanged(null);
    setBalanceOption('existingBalance');
    setNewInstrumentName('');
    setNewInstrumentQuantity(0);
    setSelectedMachines([]);
    setFile(null);
    setQuantityError('');
    setAdditionalCells([]);
    setAvailableCells([]);
    setSelectedMachines([]);
  };

  useEffect(() => {
    if (instrument && storageCells) {
      const cellsWithInstrument = storageCells.filter(cell =>
        cell.toolCell?.some(tool => tool.instrumentId === instrument.id)
      );
      setSelectedCells(cellsWithInstrument.map(cell => ({
        id: cell.id,
        quantity: 0,
        max: cell.toolCell.find(t => t.instrumentId === instrument.id)?.quantity || 0
      })));
    }
  }, [instrument, storageCells]);

  useEffect(() => {
    if (selectedTurnerInstrument) {
      const cells = selectedTurnerInstrument.instrument.toolCell.map(cell => ({
        id: cell.storageCellsId,
        quantity: 0,
        max: cell.quantity,
        storageCell: cell.storageCells
      }));
      setAvailableCells(cells);
      setAdditionalCells([]);
    }
  }, [selectedTurnerInstrument]);

  const handleSendCellChange = (cellId, value) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numericValue)) return;

    setSelectedCells(prev =>
      prev.map(cell =>
        cell.id === cellId ? { ...cell, quantity: numericValue } : cell
      )
    );
  };

  const handleCellChange = (cellId, value) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numericValue)) return;

    setAvailableCells(prev =>
      prev.map(cell =>
        cell.id === cellId ? { ...cell, quantity: numericValue } : cell
      )
    );
  };

  const handleAdditionalCellChange = (cellId, value) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numericValue)) return;

    setAdditionalCells(prev =>
      prev.map(cell =>
        cell.id === cellId ? { ...cell, quantity: numericValue } : cell
      )
    );
  };

  const validateQuantities = () => {
    if (!selectedTurnerInstrument) return false;

    const totalAvailable = availableCells.reduce((sum, cell) => sum + (cell.quantity || 0), 0);
    const totalAdditional = additionalCells.reduce((sum, cell) => sum + (cell.quantity || 0), 0);
    const total = totalAvailable + totalAdditional;

    if (total > selectedTurnerInstrument.totalTurner) {
      setQuantityError(`Максимальное количество для возврата: ${selectedTurnerInstrument.totalTurner}`);
      return false;
    }

    if (balanceOption === 'existingBalance' && instrument) {
      const totalExisting = instrument.toolCell.reduce((sum, cell) => sum + cell.quantity, 0);
      if (total > totalExisting + selectedTurnerInstrument.totalTurner) {
        setQuantityError(`Нельзя превысить общее количество инструмента: ${totalExisting + selectedTurnerInstrument.totalTurner}`);
        return false;
      }
    }

    setQuantityError('');
    return true;
  };

  const handleReturnSubmit = async () => {
    if (!validateQuantities()) return;

    const formData = new FormData();
    formData.append('turnerId', selectedTurnerInstrument.id);
    formData.append('userId', userId);
    formData.append('status', null);
    formData.append('transactionType', 'turner');
    formData.append('turnerInstrumentId', selectedTurnerInstrument.instrumentId);

    let endpoint = '/api/turnerApi/returnUnmodified';
    let requestData = {};

    if (instrumentChanged) {
      formData.append('changeType', balanceOption);

      if (balanceOption === 'existingBalance') {
        if (!instrument) {
          alert('Выберите инструмент из баланса');
          return;
        }

        // Собираем данные ячеек из обоих источников
        const cellsData = [
          ...availableCells.filter(c => c.quantity > 0),
          ...additionalCells.filter(c => c.quantity > 0)
        ].map(c => ({
          id: c.id,
          quantity: c.quantity
        }));

        requestData = {
          existingInstrumentId: instrument.id,
          storageCells: cellsData,
          type: 'instrumentChange'
        };

        // Используем правильный endpoint для изменений
        endpoint = '/api/turnerApi/returnUnmodified';

      } else {
        const cellsData = additionalCells.filter(c => c.quantity > 0).map(c => ({
          id: c.id,
          quantity: c.quantity
        }));

        requestData = {
          name: newInstrumentName,
          quantity: newInstrumentQuantity,
          storageCells: cellsData,
          machineIds: selectedMachines,
          type: 'newInstrument'
        };

        if (file) {
          formData.append('file', file);
        }
        endpoint = '/api/turnerApi/returnChangedInstrument';
      }
    } else {
      const cellsData = [
        ...availableCells.filter(c => c.quantity > 0),
        ...additionalCells.filter(c => c.quantity > 0)
      ].map(c => ({
        id: c.id,
        quantity: c.quantity
      }));

      requestData = {
        storageCells: cellsData,
        type: 'simpleReturn'
      };
    }

    // Добавляем собранные данные в formData
    Object.entries(requestData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.post(endpoint, formData);
      alert('Инструмент успешно возвращен!');
      resetForm();
      handleClose();
    } catch (error) {
      console.error('Ошибка возврата:', error);
      alert('Ошибка при возврате инструмента');
    }
  };

  // Добавим эффект для обновления availableCells при выборе инструмента
  useEffect(() => {
    if (balanceOption === 'existingBalance' && instrument) {
      const cells = instrument.toolCell.map(cell => ({
        id: cell.storageCellsId,
        quantity: 0,
        max: cell.quantity,
        storageCell: cell.storageCells
      }));
      setAvailableCells(cells);
      setAdditionalCells([]);
    }
  }, [instrument, balanceOption]);

  const handleSubmit = async () => {
    if (operationType === 'receiveFromLathe') {
      return handleReturnSubmit();
    }

    const sanitizedCells = selectedCells.map((cell) => ({
      id: cell.id,
      quantity: Math.min(cell.quantity, cell.max)
    }));

    const totalSelectedQty = sanitizedCells.reduce((sum, cell) => sum + cell.quantity, 0);
    const availableInCells = selectedCells.reduce((sum, cell) => {
      const storageCell = storageCells.find((sc) => sc.id === cell.id);
      const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
      return sum + (toolCell?.quantity || 0);
    }, 0);

    if (totalSelectedQty > availableInCells) {
      alert(`Нельзя отправить больше ${availableInCells}`);
      return;
    }

    try {
      await axios.post('/api/turnerApi/movingLathe', {
        instrumentId: instrument.id,
        type: operationType,
        status: null,
        quantity: totalSelectedQty,
        userId,
        transactionType: 'turner',
        storageCells: sanitizedCells.filter((cell) => cell.quantity > 0)
      });
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
        <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold', color: '#1A73E8' }}>
          {operationType === 'sendToLathe' ? 'Операции с токаркой' : 'Возврат из токарки'}
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
              <MenuItem value="sendToLathe">Отправить в токарку</MenuItem>
              <MenuItem value="receiveFromLathe">Принять из токарки</MenuItem>
            </TextField>
          </Grid>

          {operationType === 'sendToLathe' ? (
            <>
              <Grid item xs={12}>
                <Autocomplete
                  options={allInstruments}
                  getOptionLabel={(option) => option.name}
                  value={instrument}
                  onChange={(_, newValue) => setInstrument(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Инструмент"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  )}
                />
              </Grid>

              {instrument && (
                <>
                  {instrument.toolCell.map(cell => (
                    <Grid item xs={12} key={cell.storageCellsId}>
                      <TextField
                        label={`${cell.storageCells.name} (Доступно: ${cell.quantity})`}
                        type="number"
                        fullWidth
                        inputProps={{ max: cell.quantity }}
                        onChange={(e) => handleSendCellChange(cell.storageCellsId, e.target.value)}
                        size={isMobile ? 'small' : 'medium'}
                      />
                    </Grid>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Autocomplete
                  options={turnerInstruments}
                  getOptionLabel={(option) => option.instrument.name}
                  value={selectedTurnerInstrument}
                  onChange={(_, newValue) => setSelectedTurnerInstrument(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Инструмент в токарке"
                      helperText={selectedTurnerInstrument && `Всего доступно: ${selectedTurnerInstrument.totalTurner}`}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>{option.instrument.name}</li>
                  )}
                />
              </Grid>

              {selectedTurnerInstrument && (
                <>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <FormLabel>Инструмент был изменен?</FormLabel>
                      <RadioGroup
                        row
                        value={instrumentChanged}
                        onChange={(e) => setInstrumentChanged(e.target.value === 'true')}
                      >
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          label="Да"
                          sx={{ mr: 3 }}
                        />
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          label="Нет"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {instrumentChanged !== null && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                          Всего доступно для возврата: {selectedTurnerInstrument.totalTurner}
                        </Typography>
                      </Grid>

                      {instrumentChanged ? (
                        <>
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel>Тип инструмента</FormLabel>
                              <RadioGroup
                                row
                                value={balanceOption}
                                onChange={(e) => setBalanceOption(e.target.value)}
                              >
                                <FormControlLabel
                                  value="existingBalance"
                                  control={<Radio />}
                                  label="Есть на балансе"
                                  sx={{ mr: 3 }}
                                />
                                <FormControlLabel
                                  value="newInstrument"
                                  control={<Radio />}
                                  label="Новый инструмент"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {balanceOption === 'existingBalance' ? (
                            <>
                              <Grid item xs={12}>
                                <Autocomplete
                                  options={allInstruments}
                                  getOptionLabel={(option) => option.name}
                                  value={instrument}
                                  onChange={(_, newValue) => setInstrument(newValue)}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Выберите инструмент"
                                      size={isMobile ? 'small' : 'medium'}
                                    />
                                  )}
                                  renderOption={(props, option) => (
                                    <li {...props}>{option.name}</li>
                                  )}
                                />
                              </Grid>
                              {instrument && (
                                instrument.toolCell.map(cell => (
                                  <Grid item xs={12} key={cell.storageCellsId}>
                                    <TextField
                                      label={`${cell.storageCells.name} `}
                                      type="number"
                                      fullWidth
                                      inputProps={{
                                        max: cell.quantity + selectedTurnerInstrument.totalTurner
                                      }}
                                      onChange={(e) => handleCellChange(cell.storageCellsId, e.target.value)}
                                      size={isMobile ? 'small' : 'medium'}
                                    />
                                  </Grid>
                                ))
                              )}
                            </>
                          ) : (
                            <>
                              <Grid item xs={12}>
                                <TextField
                                  label="Название инструмента"
                                  fullWidth
                                  value={newInstrumentName}
                                  onChange={(e) => setNewInstrumentName(e.target.value)}
                                  size={isMobile ? 'small' : 'medium'}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Autocomplete
                                  multiple
                                  options={machines}
                                  getOptionLabel={(option) => option.name}
                                  value={machines.filter(m => selectedMachines.includes(m.id))}
                                  onChange={(_, newValue) => {
                                    setSelectedMachines(newValue.map(m => m.id));
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Станки"
                                      placeholder="Выберите станки"
                                      size={isMobile ? 'small' : 'medium'}
                                    />
                                  )}
                                  sx={{ mt: 2 }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  label="Количество"
                                  type="number"
                                  fullWidth
                                  value={newInstrumentQuantity}
                                  onChange={(e) => setNewInstrumentQuantity(Math.min(
                                    selectedTurnerInstrument.totalTurner,
                                    parseInt(e.target.value) || 0
                                  ))}
                                  inputProps={{
                                    max: selectedTurnerInstrument.totalTurner
                                  }}
                                  size={isMobile ? 'small' : 'medium'}
                                />
                              </Grid>
                            </>
                          )}

                          <Grid item xs={12}>
                            <Autocomplete
                              multiple
                              options={storageCells}
                              getOptionLabel={(option) => option.storageCell?.name}
                              value={additionalCells}
                              onChange={(_, newValue) => setAdditionalCells(newValue.map(c => ({
                                id: c.id,
                                quantity: 0,
                                storageCell: c,
                                name:c.name
                              })))}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Дополнительные ячейки"
                                  helperText="Выберите ячейки для размещения"
                                  size={isMobile ? 'small' : 'medium'}
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props}>{option.name}</li>
                              )}
                            />
                          </Grid>

                          {additionalCells.map(cell => (
                            <Grid item xs={12} key={cell.id}>
                              <TextField
                                label={`${cell.storageCell?.name || 'Новая ячейка'} (Количество)`}
                                type="number"
                                fullWidth
                                value={cell.quantity}
                                onChange={(e) => handleAdditionalCellChange(cell.id, e.target.value)}
                                inputProps={{
                                  max: selectedTurnerInstrument.totalTurner
                                }}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                          ))}
                          <Input
                            type="file"
                            inputProps={{ accept: 'application/pdf' }}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            sx={{ mt: 2 }}
                        />
                        </>
                      ) : (
                        <>
                          {availableCells.map(cell => (
                            <Grid item xs={12} key={cell.id}>
                              <TextField
                                label={`${cell.storageCell.name} `}
                                type="number"
                                fullWidth
                                inputProps={{ max: cell.max }}
                                value={cell.quantity}
                                onChange={(e) => handleCellChange(cell.id, e.target.value)}
                                helperText={`Максимум можно вернуть: ${selectedTurnerInstrument.totalTurner}`}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                          ))}

                          <Grid item xs={12}>
                            <Autocomplete
                              multiple
                              options={storageCells}
                              getOptionLabel={(option) => option.name}
                              value={additionalCells}
                              onChange={(_, newValue) => setAdditionalCells(newValue.map(c => ({
                                id: c.id,
                                quantity: 0,
                                storageCell: c,
                                name:c.name
                              })))}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Дополнительные ячейки"
                                  helperText="Выберите ячейки для размещения"
                                  size={isMobile ? 'small' : 'medium'}
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props}>{option.name}</li>
                              )}
                            />
                          </Grid>

                          {additionalCells.map(cell => (
                            <Grid item xs={12} key={cell.id}>
                              <TextField
                                label={`${cell.storageCell?.name || 'Новая ячейка'} (Количество)`}
                                type="number"
                                fullWidth
                                value={cell.quantity}
                                onChange={(e) => handleAdditionalCellChange(cell.id, e.target.value)}
                                inputProps={{
                                  max: selectedTurnerInstrument.totalTurner
                                }}
                                size={isMobile ? 'small' : 'medium'}
                              />
                            </Grid>
                          ))}
                        </>
                      )}

                      {quantityError && (
                        <Grid item xs={12}>
                          <Typography color="error" variant="body2">
                            {quantityError}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

          <Grid item xs={12}>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => { handleClose(); resetForm(); }}
                sx={{ mr: 2 }}
                size={isMobile ? 'small' : 'medium'}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                size={isMobile ? 'small' : 'medium'}
              >
                {operationType === 'sendToLathe' ? 'Отправить' : 'Подтвердить'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default LatheToolMovementModal;