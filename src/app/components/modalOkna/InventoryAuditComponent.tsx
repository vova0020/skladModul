/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  IconButton,
  Grid,
  useMediaQuery,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Close, CheckCircle, Save, Info, Refresh } from '@mui/icons-material';
import axios from 'axios';

interface ToolModalProps {
  open: boolean;
  handleClose: (refresh?: boolean) => void;
  userId: number;
}

interface AuditItem {
  auditId: number;
  auditItemId: number;
  instrumentId: number;
  instrumentName: string;
  systemQuantity: number;
  expectedQuantity: number;
  /**
   * Здесь храним как строку, чтобы отличать пустое поле (user ничего не вводил)
   * от "0" (user ввёл именно 0).
   */
  actualQuantity: string;
  notes: string;
  isChanged: boolean;
  cells: Array<{ id: number; name: string; quantity: number }>;
}

interface AuditData {
  id: number;
  status: 'in_progress' | 'completed' | 'draft';
}

const InventoryAuditComponent = ({ userId, open, handleClose }: ToolModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [inventoryAuditData, setInventoryAuditData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [progress, setProgress] = useState(0);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      checkCurrentAudit();
    } else {
      setInventoryAuditData(null);
      setConfirmationDialogOpen(false);
    }
  }, [open]);

  const checkCurrentAudit = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<AuditData>('/api/audit/getInventoryAudit');
      setInventoryAuditData(data);

      if (data?.status !== 'in_progress') {
        setConfirmationDialogOpen(true);
      } else {
        await fetchInstruments();
      }
    } catch (error) {
      showSnackbar('Ошибка при проверке статуса сверки', 'error');
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstruments = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/audit/getInventoryAudit');

      const items = data.auditItems
        .map((auditItem: any) => {
          // Если сервер возвращает actualQuantity = null/undefined,
          // то отображаем это как пустую строку, иначе приводим к строке.
          let actualQuantityValue = auditItem.actualQuantity;
          if (actualQuantityValue == null) {
            actualQuantityValue = '';
          } else {
            actualQuantityValue = String(actualQuantityValue);
          }

          return {
            auditId: auditItem.auditId,
            auditItemId: auditItem.id,
            instrumentId: auditItem.instrument.id,
            instrumentName: auditItem.instrument.name,
            systemQuantity: auditItem.instrument.quantity,
            expectedQuantity: auditItem.expectedQuantity ?? auditItem.instrument.quantity,
            actualQuantity: actualQuantityValue,
            notes: auditItem.notes || '',
            isChanged: false,
            cells: auditItem.instrument.toolCell.map((cell: any) => ({
              id: cell.storageCells.id,
              name: cell.storageCells.name,
              quantity: cell.quantity,
            })),
          };
        })
        .sort((a, b) => a.auditItemId - b.auditItemId);

      setAuditItems(items);
      calculateProgress(items);
    } catch (error) {
      showSnackbar('Ошибка при загрузке инструментов', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (items: AuditItem[]) => {
    // Считаем заполненными только те элементы, у которых actualQuantity не пустая строка
    const filled = items.filter(item => item.actualQuantity !== '').length;
    setProgress(Math.round((filled / items.length) * 100));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStartNewAudit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post('/api/audit/getInventoryAudit', { userId });
      await fetchInstruments();
      setConfirmationDialogOpen(false);
    } catch (error) {
      showSnackbar('Не удалось начать новую сверку', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setConfirmationDialogOpen(false);
    handleClose();
  };

  const handleQuantityChange = (instrumentId: number, value: string) => {
    // Если пользователь стёр всё из поля, храним пустую строку
    // Иначе парсим и не даём уйти ниже 0
    let newValue = value;
    if (value === '') {
      newValue = '';
    } else {
      const parsed = parseInt(value, 10);
      newValue = String(Math.max(0, isNaN(parsed) ? 0 : parsed));
    }

    const newItems = auditItems.map(item =>
      item.instrumentId === instrumentId
        ? {
            ...item,
            actualQuantity: newValue,
            isChanged: true,
          }
        : item
    );

    setAuditItems(newItems);
    calculateProgress(newItems);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const changedItems = auditItems.filter(item => item.isChanged);

      if (changedItems.length === 0) {
        showSnackbar('Нет изменений для сохранения', 'info');
        return;
      }

      // При сохранении (PUT) вы уже передаёте auditItems как есть.
      // Серверу, вероятно, придёт "0" или пустая строка.
      // Важно, чтобы сервер корректно обрабатывал пустую строку как null (или что-то аналогичное).
      await axios.put('/api/audit/draftAudit', changedItems);
      showSnackbar('Черновик сверки сохранен', 'success');
    } catch (error) {
      showSnackbar('Ошибка сохранения черновика', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAudit = async () => {
    try {
      setIsSubmitting(true);
      // Аналогично, при завершении
      await axios.put('/api/audit/completeAudit', { auditItems });
      showSnackbar('Сверка успешно завершена!', 'success');
      handleClose(true);
    } catch (error) {
      showSnackbar('Ошибка завершения сверки', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      fullScreen={isMobile}
      open={open}
      onClose={() => handleClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius,
          background: theme.palette.background.paper,
        },
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : confirmationDialogOpen ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Начать новую сверку?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Текущая сверка не найдена. Хотите начать новую?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={handleConfirmationClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartNewAudit}
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              Начать
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 1, sm: 3 }, position: 'relative' }}>
          <IconButton onClick={() => handleClose()} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>

          <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5" fontWeight="600">
                Инвентаризация №{inventoryAuditData?.id}
              </Typography>
              <Tooltip title="Обновить список">
                <IconButton onClick={fetchInstruments} size="small">
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'right' }}>
              Заполнено: {progress}%
            </Typography>
          </Box>

          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 240px)' : '65vh',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.action.hover,
                borderRadius: 3,
              },
            }}
          >
            <List disablePadding>
              {auditItems.map((item) => (
                <ListItem
                  key={item.instrumentId}
                  sx={{
                    p: 0,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    // Подсветка, если строка заполнена (actualQuantity !== '')
                    bgcolor: item.actualQuantity !== '' ? theme.palette.success.light + '10' : 'transparent',
                  }}
                >
                  <Grid container spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.instrumentName}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ожидаемо:
                        </Typography>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            bgcolor: theme.palette.success.light,
                            borderRadius: 1,
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.expectedQuantity}
                        </Box>
                      </Box>

                      {item.cells.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Распределение:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {item.cells.map((cell) => (
                              <Box
                                key={cell.id}
                                sx={{
                                  px: 1.2,
                                  py: 0.3,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  fontSize: '0.75rem',
                                }}
                              >
                                <span>{cell.name}</span>
                                <span style={{ fontWeight: 600 }}>({cell.quantity})</span>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Фактическое количество"
                        // В value теперь лежит пустая строка, если пользователь ещё не вводил значение
                        value={item.actualQuantity}
                        onChange={(e) => handleQuantityChange(item.instrumentId, e.target.value)}
                        inputProps={{
                          min: 0,
                          style: {
                            textAlign: 'center',
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            padding: isMobile ? '12px 8px' : '16px',
                          },
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontWeight: 500,
                            color:
                              item.actualQuantity !== '' &&
                              Number(item.actualQuantity) === item.systemQuantity
                                ? theme.palette.text.primary
                                : theme.palette.warning.dark,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Примечание"
                        size="small"
                        value={item.notes}
                        multiline
                        maxRows={3}
                        sx={{
                          '& .MuiInputBase-root': {
                            alignItems: 'flex-start',
                          },
                        }}
                        onChange={(e) =>
                          setAuditItems((items) =>
                            items.map((i) =>
                              i.instrumentId === item.instrumentId
                                ? { ...i, notes: e.target.value, isChanged: true }
                                : i
                            )
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
              position: 'sticky',
              bottom: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 1,
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              variant="outlined"
              startIcon={!isMobile && <Save />}
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              fullWidth={isMobile}
            >
              {isMobile ? 'Черновик' : 'Сохранить черновик'}
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={!isMobile && <CheckCircle />}
              onClick={handleCompleteAudit}
              disabled={isSubmitting || progress < 100}
              fullWidth={isMobile}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                '&:disabled': { background: theme.palette.action.disabledBackground },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : isMobile ? (
                <>Готово ({progress}%)</>
              ) : (
                <>Завершить ({progress}%)</>
              )}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          icon={snackbar.severity === 'error' ? <Info /> : undefined}
          sx={{
            boxShadow: theme.shadows[3],
            alignItems: 'center',
            width: '100%',
            maxWidth: isMobile ? '90vw' : '400px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default InventoryAuditComponent;
