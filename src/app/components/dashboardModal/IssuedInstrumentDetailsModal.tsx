/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InventoryIcon from '@mui/icons-material/Inventory';
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

interface Drawing {
  id: number;
  filePath: string;
  name: string;
}
interface InstrumentDetails {
  drawing: Drawing | null;
  id: number;
  name: string;
  quantity: number;
}
export interface WriteOffInstrument {
  id: number;
  instrumentDetails: InstrumentDetails;
  instrumentId: number;
  totalIssuedCeh: number;
  totalReturnedInWrittenOff: number;
  totalWrittenOff: number;
}

interface WriteOffInstrumentDetailsModalProps {
  open: boolean;
  handleClose: () => void;
  writeOffInstruments: WriteOffInstrument[];
}

const IssuedInstrumentDetailsModal: React.FC<WriteOffInstrumentDetailsModalProps> = ({
  open,
  handleClose,
  writeOffInstruments,
}) => {
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
// console.log(writeOffInstruments);

  const encodeFilePath = (filePath: string) => {
    const parts = filePath.split('/');
    const fileName = parts.pop(); // Последний элемент — имя файла
    return `${parts.join('/')}/${encodeURIComponent(fileName || '')}`;
  };

  // Функция для экспорта данных в Excel с оформлением
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Выданные инструменты');

    // Определяем колонки и заголовки с нужной шириной
    worksheet.columns = [
      { header: 'Инструмент', key: 'instrument', width: 35 },
      { header: 'Общее количество', key: 'quantity', width: 25 },
      { header: 'Станок', key: 'machine', width: 20 },
      { header: 'Ячейки', key: 'cells', width: 38 },
      { header: 'Чертеж', key: 'drawing', width: 10 },
    ];

    // Оформление заголовков – зелёный фон и выравнивание
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4CAF50' }, // зелёный фон
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Заполнение данных: для "Станок" оставляем пустым, "Ячейки" заполняем данными по выданным в цех
    writeOffInstruments
      .filter((item) => item.totalIssuedCeh > 0)
      .forEach((item) => {
        worksheet.addRow({
          instrument: item.instrumentDetails.name,
          quantity: item.instrumentDetails.quantity,
          machine: '-', // если данных по станку нет, можно указать дефолтное значение
          cells: `Выдано в цех: ${item.totalIssuedCeh} шт.`,
          drawing: item.instrumentDetails.drawing ? 'Да' : 'Нет',
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
    a.download = 'Выданные_инструменты.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.600' }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          <Stack spacing={3}>
            {/* Заголовок окна с кнопкой экспорта */}
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography
                  variant="h4"
                  sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'primary.main' }}
                >
                  <InventoryIcon sx={{ mr: 1, fontSize: 40 }} />
                  Выданные инструменты в цех
                </Typography>
              </Grid>

            </Grid>
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

            {/* Список инструментов */}
            {writeOffInstruments.length > 0 ? (
              <Stack spacing={3}>
                {writeOffInstruments
                  .filter((item) => item.totalIssuedCeh > 0)
                  .map((item) => (
                    <Paper key={item.id} elevation={3} sx={{ borderRadius: 2 }}>
                      <Card variant="outlined" sx={{ border: 'none', boxShadow: 'none' }}>
                        <CardHeader
                          avatar={<InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                          title={
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {item.instrumentDetails.name}
                            </Typography>
                          }
                          action={
                            item.instrumentDetails.drawing && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() =>
                                  setSelectedDrawing(encodeFilePath(item.instrumentDetails.drawing.filePath))
                                }
                                sx={{ mr: 2, mt: 1 }}
                              >
                                Чертеж
                              </Button>
                            )
                          }
                        />
                        <Divider />
                        <CardContent>
                          <List>
                            <ListItem>
                              <ListItemText primary={`Выдано в цех: ${item.totalIssuedCeh} шт.`} />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Paper>
                  ))}
              </Stack>
            ) : (
              <Typography variant="body1" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                Нет данных для отображения
              </Typography>
            )}
          </Stack>
        </Box>
      </Modal>

      {/* Диалог для просмотра чертежа */}
      <Dialog open={!!selectedDrawing} onClose={() => setSelectedDrawing(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Просмотр чертежа
          <IconButton
            onClick={() => setSelectedDrawing(null)}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
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

export default IssuedInstrumentDetailsModal;
