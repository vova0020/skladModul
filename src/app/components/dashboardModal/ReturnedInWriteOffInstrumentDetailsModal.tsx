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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InventoryIcon from '@mui/icons-material/Inventory';

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

const ReturnedInWriteOffInstrumentDetailsModal: React.FC<WriteOffInstrumentDetailsModalProps> = ({
  open,
  handleClose,
  writeOffInstruments,
}) => {
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);

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
            {/* Заголовок окна */}
            <Typography
              variant="h4"
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'primary.main' }}
            >
              <InventoryIcon sx={{ mr: 1, fontSize: 40 }} />
              Инструменты на списание
            </Typography>

            {/* Список инструментов */}
            {writeOffInstruments.length > 0 ? (
              <Stack spacing={3}>
                {writeOffInstruments.filter((item) => item.totalReturnedInWrittenOff > 0).map((item) => (
                  <Paper key={item.id} elevation={3} sx={{ borderRadius: 2 }}>
                    <Card variant="outlined" sx={{ border: 'none', boxShadow: 'none' }}>
                      <CardHeader
                        avatar={<InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                        title={
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {item.instrumentDetails.name}
                          </Typography>
                        }
                        // subheader={
                        //   <Typography variant="body2" color="text.secondary">
                        //     Количество: {item.instrumentDetails.quantity} шт.
                        //   </Typography>
                        // }
                        action={
                          item.instrumentDetails.drawing && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PictureAsPdfIcon />}
                              onClick={() => setSelectedDrawing(item.instrumentDetails.drawing.filePath)}
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
                          {/* <ListItem>
                            <ListItemText
                              primary="Выдано в цех"
                              secondary={item.totalIssuedCeh}
                            />
                          </ListItem> */}
                          <ListItem>
                            <ListItemText
                              primary={`На складе для списания:  ${item.totalReturnedInWrittenOff}.шт`}
                            //   secondary={item.totalReturnedInWrittenOff}
                            />
                          </ListItem>
                          {/* <ListItem>
                            <ListItemText
                              primary="Списано"
                              secondary={item.totalWrittenOff}
                            />
                          </ListItem> */}
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
      <Dialog
        open={!!selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
        maxWidth="md"
        fullWidth
      >
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

export default ReturnedInWriteOffInstrumentDetailsModal;
