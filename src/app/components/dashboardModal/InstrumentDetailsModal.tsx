import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Avatar,
  ListItemAvatar,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Divider,
  Fade,
  Backdrop,
  Stack,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import ExcelJS from 'exceljs';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  p: { xs: 3, sm: 4 },
  maxHeight: '85vh',
  overflowY: 'auto',
};

// Интерфейсы, соответствующие структуре данных с сервера
interface StorageCells {
  id: number;
  name: string;
}

interface ToolCell {
  id: number;
  quantity: number;
  storageCells: StorageCells;
  storageCellsId: number;
}

interface Drawing {
  id: number;
  name: string;
  filePath: string;
}

interface MachineEntry {
  machine: {
    id: number;
    name: string;
  };
}

interface Instrument {
  id: number;
  name: string;
  quantity: number;
  machines: MachineEntry[];
  toolCell: ToolCell[];
  drawing?: Drawing;
}

interface InstrumentDetailsModalProps {
  open: boolean;
  handleClose: () => void;
  instruments: Instrument[];
}

const InstrumentDetailsModal: React.FC<InstrumentDetailsModalProps> = ({
  open,
  handleClose,
  instruments,
}) => {
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [searchMachine, setSearchMachine] = useState('');
  const [searchTool, setSearchTool] = useState('');

  // Извлекаем название машины из массива machines
  const getMachineName = (instrument: Instrument) => {
    return instrument.machines && instrument.machines.length > 0
      ? instrument.machines[0].machine.name
      : '';
  };

  // Фильтрация по названию инструмента и машины
  const filteredInstruments = instruments.filter((instrument) => {
    const machineName = getMachineName(instrument);
    return (
      instrument.name.toLowerCase().includes(searchTool.toLowerCase()) &&
      machineName.toLowerCase().includes(searchMachine.toLowerCase())
    );
  });

  // Кодирование пути к файлу
  const encodeFilePath = (filePath: string) => {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    return `${parts.join('/')}/${encodeURIComponent(fileName || '')}`;
  };

  // Функция для экспорта данных в Excel с использованием ExcelJS
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Инструменты');

    // Определяем колонки и заголовки
    worksheet.columns = [
      { header: 'Инструмент', key: 'instrument', width: 35 },
      { header: 'Общее количество', key: 'quantity', width: 25 },
      { header: 'Станок', key: 'machine', width: 20 },
      { header: 'Ячейки', key: 'cells', width: 38 },
      { header: 'Чертеж', key: 'drawing', width: 10 },
    ];

    // Оформление заголовков: жирный шрифт, цвет фона и выравнивание
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }, // синий фон
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Заполнение данными
    filteredInstruments.forEach((instrument) => {
      worksheet.addRow({
        instrument: instrument.name,
        quantity: instrument.quantity,
        machine: getMachineName(instrument),
        cells: instrument.toolCell
          .map((cell) => `Ячейка ${cell.storageCells.name} (кол-во: ${cell.quantity})`)
          .join('; '),
        drawing: instrument.drawing?.filePath ? 'Да' : 'Нет',
      });
    });

    // Генерация файла и запуск скачивания
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
    <>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 300, sx: { bgcolor: 'rgba(0, 0, 0, 0.4)' } }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.600' }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            <Stack spacing={3}>
              {/* Заголовок модального окна и кнопка экспорта */}
              <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={1}>
                  <Typography
                    variant="h4"
                    sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'primary.main' }}
                  >
                    <InventoryIcon sx={{ mr: 1, fontSize: 40 }} />
                    Инструменты
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Детализированная информация по инструментам
                  </Typography>
                </Stack>
                
              </Stack>
 <Grid container alignItems="left" justifyContent="space-between">
              <Button
                variant="contained"
                color="success"
                onClick={handleExportExcel}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 3,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem', // Уменьшаем размер шрифта
                  whiteSpace: 'nowrap' // Запрещаем перенос текста
                }}
              >
                Экспорт в Excel
              </Button>

            </Grid>

              {/* Фильтры */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Фильтр по станку"
                    variant="outlined"
                    fullWidth
                    value={searchMachine}
                    onChange={(e) => setSearchMachine(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Фильтр по инструменту"
                    variant="outlined"
                    fullWidth
                    value={searchTool}
                    onChange={(e) => setSearchTool(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Список инструментов */}
              {filteredInstruments.length > 0 ? (
                <Stack spacing={3}>
                  {filteredInstruments.map((instrument) => {
                    const machineName = getMachineName(instrument);
                    return (
                      <Paper key={instrument.id} elevation={3} sx={{ borderRadius: 2 }}>
                        <Card variant="outlined" sx={{ border: 'none', boxShadow: 'none' }}>
                          <CardHeader
                            avatar={
                              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                <InventoryIcon fontSize="large" />
                              </Avatar>
                            }
                            title={
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {instrument.name}
                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                  (Общее количество: {instrument.quantity} шт.)
                                </Typography>
                              </Typography>
                            }
                            subheader={
                              <Typography variant="body2" color="text.secondary">
                                {machineName ? `Станок: ${machineName}` : 'Станок не указан'}
                              </Typography>
                            }
                            action={
                              instrument.drawing?.filePath && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<PictureAsPdfIcon />}
                                  onClick={() => setSelectedDrawing(encodeFilePath(instrument.drawing!.filePath))}
                                  sx={{ mr: 2, mt: 1 }}
                                >
                                  Чертеж
                                </Button>
                              )
                            }
                          />
                          <Divider />
                          <CardContent>
                            <List disablePadding>
                              {instrument.toolCell.map((cell) => (
                                <ListItem key={cell.id} sx={{ py: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                      <InventoryIcon />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Ячейка {cell.storageCells.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="body2" color="text.secondary">
                                        Количество: {cell.quantity} шт.
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body1" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                  Нет данных для отображения
                </Typography>
              )}
            </Stack>
          </Box>
        </Fade>
      </Modal>

      {/* Диалог для просмотра чертежа */}
      <Dialog open={!!selectedDrawing} onClose={() => setSelectedDrawing(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Просмотр чертежа
          <IconButton
            onClick={() => setSelectedDrawing(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedDrawing && (
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={selectedDrawing}
                title="Просмотр чертежа"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstrumentDetailsModal;
