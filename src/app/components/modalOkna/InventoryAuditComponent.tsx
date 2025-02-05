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
  userId: number
}

interface AuditItem {
  instrumentId: number;
  instrumentName: string;
  systemQuantity: number;
  actualQuantity: number;
  notes: string;
  isChanged: boolean;
}

interface AuditData {
  id: number;
  status: 'in_progress' | 'completed' | 'draft';
}

const InventoryAuditComponent = ({userId, open, handleClose }: ToolModalProps) => {
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
      
      const items = data.auditItems.map((auditItems: any) => ({
        auditId: auditItems.auditId,
        auditItemId: auditItems.id,
        instrumentId: auditItems.instrument.id,
        instrumentName: auditItems.instrument.name,
        systemQuantity: auditItems.instrument.quantity,
        actualQuantity: auditItems.actualQuantity,
        notes: auditItems.notes || '',
        isChanged: false,
      }));

      

      // Сортировка по возрастанию id
      items.sort((a, b) => a.auditItemId - b.auditItemId);

      setAuditItems(items);
      calculateProgress(items);
    } catch (error) {
      showSnackbar('Ошибка при загрузке инструментов', 'error');
    } finally {
      setIsLoading(false);
    }
};


  useEffect(()=>{
    console.log(inventoryAuditData);  
    
  },[inventoryAuditData])

  const calculateProgress = (items: AuditItem[]) => {
    const filled = items.filter(item => item.actualQuantity > 0).length;
    setProgress(Math.round((filled / items.length) * 100));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStartNewAudit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post('/api/audit/getInventoryAudit', {userId});
      const { data } = await axios.get('/api/audit/getInventoryAudit');
      setInventoryAuditData(data);

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
    const newItems = auditItems.map(item =>
      item.instrumentId === instrumentId
        ? {
            ...item,
            actualQuantity: Math.max(0, parseInt(value) || 0),
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
            return; // Прерываем выполнение функции
        }

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
      await axios.put('/api/audit/completeAudit', { auditItems });
      showSnackbar('Сверка успешно завершена!', 'success');
      handleClose(true);
    } catch (error) {
      showSnackbar('Ошибка завершения сверки', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscrepancy = (item: AuditItem) => item.actualQuantity - item.systemQuantity;

  return (
    <Dialog
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
            <Button
              variant="outlined"
              onClick={handleConfirmationClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartNewAudit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              Начать
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
          <IconButton
            onClick={() => handleClose()}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <Close />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Инвентаризация инструментов № {inventoryAuditData?.id}
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
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />

          <Box sx={{
            maxHeight: isMobile ? '60vh' : '70vh',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.action.hover,
              borderRadius: 4
            }
          }}>
            <List disablePadding>
              {auditItems.map((item) => (
                <ListItem
                  key={item.instrumentId}
                  sx={{
                    p: 0,
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: item.actualQuantity !=0 ? theme.palette.success.light + '10' : 'transparent'
                  }}
                >
                  <Grid container spacing={2} sx={{ p: 2 }}>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {item.instrumentName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Фактическое количество"
                        value={item.actualQuantity === 0 ? '' : item.actualQuantity}
                        onChange={(e) => handleQuantityChange(item.instrumentId, e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        label="Примечание"
                        size="small"
                        value={item.notes}
                        onChange={(e) =>
                          setAuditItems(items =>
                            items.map(i =>
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

          <Box sx={{
            mt: 3,
            display: 'flex',
            gap: 2,
            flexDirection: isMobile ? 'column' : 'row',
            '& button': { flex: 1 },
            position: 'sticky',
            bottom: 0,
            backgroundColor: theme.palette.background.paper,
            zIndex: 1,
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Сохранить черновик
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleCompleteAudit}
              disabled={isSubmitting || progress < 100}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                '&:disabled': { background: theme.palette.action.disabledBackground }
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                `Завершить (${progress}%)`
              )}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          icon={snackbar.severity === 'error' ? <Info /> : undefined}
          sx={{
            boxShadow: theme.shadows[3],
            alignItems: 'center'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default InventoryAuditComponent;