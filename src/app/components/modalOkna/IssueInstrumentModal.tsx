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
  width: '90%', // На мобильных устройствах занимает 90% ширины экрана
  maxWidth: 600, // Максимальная ширина на больших экранах
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 4 }, // Отступы адаптируются для мобильных устройств
  borderRadius: '10px',
  maxHeight: '90vh', // Ограничиваем высоту модального окна
  overflowY: 'auto', // Добавляем прокрутку по вертикали
};

const IssueInstrumentModal = ({ open, handleClose }) => {
  const [token, setToken] = React.useState<string | null>(null); // Токен пользователя
  const [userId, setUserId] = React.useState<number | null>(null); // Идентификатор пользователя
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Определяем, используется ли мобильное устройство
  const [operationType, setOperationType] = useState('issue'); // 'issue' или 'return'
  const [section, setSection] = useState(null);
  const [machine, setMachine] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [issuedTo, setIssuedTo] = useState('');
  const [instrumentStatus, setInstrumentStatus] = useState('new'); // 'new' или 'used'
  const [summaryInstrument, setSummaryInstrument] = useState(null);
  const [storageCells, setStorageCells] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);

  const [sections, setSections] = useState([]);
  const [machines, setMachines] = useState([]);
  const [instruments, setInstruments] = useState([]);


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
  // Загрузка данных при открытии модального окна
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const sectionsResponse = await axios.get('/api/adminka/updateSector');
      setSections(sectionsResponse.data);

      const machinesResponse = await axios.get('/api/adminka/updateStanock');
      setMachines(machinesResponse.data);

      const instrumentsResponse = await axios.get('/api/adminka/updateInstrument');
      setInstruments(instrumentsResponse.data);

      const storageCellsResponse = await axios.get('/api/adminka/updateCell');
      setStorageCells(storageCellsResponse.data);

      const summaryInstruments = await axios.get('/api/getInstrumentSummary');
      setSummaryInstrument(summaryInstruments.data);
      // console.log(summaryInstruments.data);

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  // Сброс всех полей формы
  const resetForm = () => {
    setOperationType('issue');
    setSection(null);
    setMachine(null);
    setInstrument(null);
    setQuantity(1);
    setIssuedTo('');
    setInstrumentStatus('new');
    setSelectedCells([]);
    setTotalSelected(0);
  };

  // Фильтрация ячеек хранения при выборе инструмента
  useEffect(() => {
    if (instrument && storageCells) {
      const filteredCells = storageCells.filter((cell) =>
        cell.toolCell && cell.toolCell.some((tool) => tool.instrumentId === instrument.id)
      );
      setSelectedCells(filteredCells.map((cell) => ({ id: cell.id, quantity: '' }))); // Разрешаем пустую строку
      const foundSummary = summaryInstrument?.find((summary) => summary.instrumentId === instrument.id);
      setSummaryInstrument(foundSummary ? [foundSummary] : []);
    } else {
      setSelectedCells([]);
    }
  }, [instrument, storageCells]);

  // Обновление общего количества выбранных инструментов
  useEffect(() => {
    const total = selectedCells.reduce((sum, cell) => {
      const quantity = cell.quantity === '' ? 0 : parseInt(cell.quantity, 10);
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0);
    setTotalSelected(total);
  }, [selectedCells]);

  // Обработка изменения количества в ячейке
  const handleCellQuantityChange = (cellId, newValue) => {
    // Если поле пустое, устанавливаем пустую строку
    if (newValue === '') {
      setSelectedCells((prev) =>
        prev.map((cell) => (cell.id === cellId ? { ...cell, quantity: '' } : cell))
      );
      return;
    }

    // Преобразуем в число, если значение не пустое
    const numericValue = parseInt(newValue, 10);
    if (isNaN(numericValue) || numericValue < 0) return;

    // Получаем доступное количество для инструмента в этой ячейке
    const storageCell = storageCells.find((sc) => sc.id === cellId);
    const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);
    const availableInCell = toolCell?.quantity || 0;

    // Ограничение на количество в ячейке
    if (operationType === 'issue' && numericValue > availableInCell) {
      alert(`Вы не можете взять больше, чем доступно в ячейке: ${availableInCell}`);
      return;
    }

    // Ограничение на общее количество для операции "return"
    if (operationType === 'return') {
      const availableBalance = (summaryInstrument[0]?.totalIssued || 0) - (summaryInstrument[0]?.totalReturned || 0);

      // Получаем текущее общее количество для всех ячеек
      const currentTotal = selectedCells.reduce((sum, cell) => {
        if (cell.id === cellId) {
          return sum + (cell.quantity === '' ? 0 : parseInt(cell.quantity, 10));
        } else {
          return sum + (cell.quantity === '' ? 0 : parseInt(cell.quantity, 10));
        }
      }, 0);

      // Вычисляем новое общее количество
      const newTotal = currentTotal - (selectedCells.find((cell) => cell.id === cellId)?.quantity || 0) + numericValue;

      if (newTotal > availableBalance) {
        alert(`Вы не можете ввести количество больше, чем доступно: ${availableBalance}`);
        return;
      }
    }

    setSelectedCells((prev) =>
      prev.map((cell) => (cell.id === cellId ? { ...cell, quantity: numericValue } : cell))
    );
  };

  // Обработка изменения количества в поле "Количество"
  const handleQuantityChange = (e) => {
    const newValue = e.target.value;

    // Если поле пустое, устанавливаем пустую строку
    if (newValue === '') {
      setQuantity('');
      return;
    }

    const newQuantity = parseInt(newValue, 10);

    if (isNaN(newQuantity) || newQuantity < 0) {
      return;
    }

    // Ограничение на общее количество для операции "issue"
    if (operationType === 'issue') {
      // Получаем доступное количество в выбранных ячейках
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

    // Ограничение на количество для операции "return"
    if (operationType === 'return') {
      const availableBalance = (summaryInstrument[0]?.totalIssued || 0) - (summaryInstrument[0]?.totalReturned || 0);

      if (newQuantity > availableBalance) {
        alert(`Вы не можете ввести количество больше, чем доступно: ${availableBalance}`);
        return;
      }
    }

    setQuantity(newQuantity);
  };

  // Отправка данных на сервер
  const handleSubmit = async () => {
    // Преобразуем пустые строки в 0
    const sanitizedCells = selectedCells.map((cell) => ({
      ...cell,
      quantity: cell.quantity === '' ? 0 : cell.quantity,
    }));

    const totalSelected = sanitizedCells.reduce((sum, cell) => sum + cell.quantity, 0);

    // Проверка на доступное количество для операции "issue"
    if (operationType === 'issue') {
      // Получаем доступное количество в выбранных ячейках
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

    // Проверка на доступное количество для операции "return"
    if (operationType === 'return') {
      const availableBalance = (summaryInstrument[0]?.totalIssued || 0) - (summaryInstrument[0]?.totalReturned || 0);
      if (totalSelected > availableBalance) {
        alert(`Вы не можете вернуть больше, чем доступно: ${availableBalance}`);
        return;
      }
    }

    if (totalSelected !== quantity) {
      alert(`Общее количество должно быть равно ${quantity}`);
      return;
    }

    const transactionData = {
      instrumentId: instrument.id,
      type: operationType,
      quantity,
      status: operationType === 'issue' ? instrumentStatus : null, // Добавляем статус инструмента
      issuedTo: issuedTo,
      sectionId: section?.id,
      machineId: machine?.id,
      userId, // Замените на ID текущего пользователя
      transactionType: machine ? 'machine' : 'section',
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
          {operationType === 'issue' ? 'Выдать инструмент' : 'Принять инструмент'}
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
              <MenuItem value="return">Принять инструмент</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={sections}
              getOptionLabel={(option) => option.name}
              value={section}
              onChange={(_, newValue) => setSection(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Участок" fullWidth size={isMobile ? 'small' : 'medium'} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={machines.filter((m) => m.sectionId === section?.id)}
              getOptionLabel={(option) => option.name}
              value={machine}
              onChange={(_, newValue) => setMachine(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Станок" fullWidth size={isMobile ? 'small' : 'medium'} />
              )}
              disabled={!section}
            />
          </Grid>

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

          {operationType === 'return' && (
            <Grid item xs={12}>
              <TextField
                label="От кого принял инструмент"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {operationType === 'issue' ? 'Выберите ячейки для изъятия' : 'Выберите ячейки для возврата'}
            </Typography>

            {operationType === 'issue' ? (
              // Отображение ячеек для изъятия (как раньше)
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
              // Отображение ячеек для возврата
              <>
                {/* Автокомплит для добавления новых ячеек */}
                <Autocomplete
                  multiple
                  options={storageCells.filter(
                    (cell) =>
                      !selectedCells.some((selected) => selected.id === cell.id) && // Исключаем уже выбранные ячейки
                      !cell.toolCell?.some((tool) => tool.instrumentId === instrument?.id) // Исключаем ячейки с инструментом
                  )}
                  getOptionLabel={(option) => option.name}
                  value={[]} // Пустое значение, так как мы только добавляем новые ячейки
                  onChange={(event, newValue) => {
                    // Добавляем новые ячейки в selectedCells
                    const newCells = newValue.map((cell) => ({ id: cell.id, quantity: 0 }));
                    setSelectedCells((prev) => [...prev, ...newCells]);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Добавить ячейки для возврата"
                      placeholder="Выберите ячейки"
                    />
                  )}
                  sx={{ mb: 2 }}
                />

                {/* Список выбранных ячеек */}
                {selectedCells.map((cell) => {
                  const storageCell = storageCells.find((sc) => sc.id === cell.id);
                  const toolCell = storageCell?.toolCell?.find((tool) => tool.instrumentId === instrument?.id);

                  // Проверяем, можно ли удалить ячейку (только если инструмента в ней нет)
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
                            // Удаляем ячейку из selectedCells
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

          {operationType === 'issue' ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Общее количество: {totalSelected} / {quantity}
              </Typography>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Принять: {`${totalSelected} из  ${(summaryInstrument[0]?.totalIssued || 0) - (summaryInstrument[0]?.totalReturned || 0)}  `}
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
            {operationType === 'issue' ? 'Выдать' : 'Принять'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default IssueInstrumentModal;