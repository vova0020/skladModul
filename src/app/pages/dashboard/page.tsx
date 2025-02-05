'use client';
/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Navbar from '@/app/components/navbar';
import { styled } from '@mui/system';

// Иконки для кнопок
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useState } from 'react';
import IssueInstrumentModal from '@/app/components/modalOkna/IssueInstrumentModal';
import { Instrument } from '@prisma/client';
import axios from 'axios';
import WriteOffInstrumentModal from '@/app/components/modalOkna/WriteOffInstrumentModal';
import ReturnInstrumentModal from '@/app/components/modalOkna/ReturnInstrumentModal';
import InventoryAuditComponent from '@/app/components/modalOkna/InventoryAuditComponent';
import { jwtDecode } from 'jwt-decode';
import InstrumentDetailsModal from '@/app/components/dashboardModal/InstrumentDetailsModal';

import IssuedInstrumentDetailsModal from '@/app/components/dashboardModal/IssuedInstrumentDetailsModal';
import ReturnedInWriteOffInstrumentDetailsModal from '@/app/components/dashboardModal/ReturnedInWriteOffInstrumentDetailsModal';
import WrittenOffInstrumentDetailsModal from '@/app/components/dashboardModal/WrittenOffInstrumentDetailsModal';



// Основной цвет: глубокий синий (#1A73E8)
const PrimaryGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1A73E8 30%, #4285F4 90%)',
  padding: '8px',
  color: 'white',
  width: '100%', // На мобильных устройствах кнопки занимают всю ширину
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(26, 115, 232, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(26, 115, 232, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px', // На планшетах и ПК фиксированная ширина
  },
}));

// Вторичный цвет: серый (#5F6368)
const SecondaryGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5F6368 30%, #80868B 90%)',
  padding: '8px',
  color: 'white',
  width: '100%', // На мобильных устройствах кнопки занимают всю ширину
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(95, 99, 104, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(95, 99, 104, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px', // На планшетах и ПК фиксированная ширина
  },
}));

// Цвет ошибки: красный (#EA4335)
const ErrorGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #EA4335 30%, #FBBC05 90%)',
  padding: '8px',
  color: 'white',
  width: '100%', // На мобильных устройствах кнопки занимают всю ширину
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(234, 67, 53, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(234, 67, 53, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px', // На планшетах и ПК фиксированная ширина
  },
}));

// Цвет сверки: зеленый (#EA4335)
const СollationGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg,rgb(28, 190, 4) 30%,rgb(116, 224, 8) 90%)',
  padding: '8px',
  color: 'white',
  width: '100%', // На мобильных устройствах кнопки занимают всю ширину
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(234, 67, 53, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(234, 67, 53, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px', // На планшетах и ПК фиксированная ширина
  },
}));

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);

  const handleOpenWriteOffModal = () => setWriteOffModalOpen(true);
  const handleCloseWriteOffModal = () => setWriteOffModalOpen(false);

  const [returnInstrumentModalOpen, setReturnInstrumentModalOpen] = useState(false);

  const handleOpenReturnInstrumentModalModal = () => setReturnInstrumentModalOpen(true);
  const handleCloseReturnInstrumentModalModal = () => setReturnInstrumentModalOpen(false);

  const [auditInstrumentModalOpen, setAuditInstrumentModalOpen] = useState(false);

  const handleOpenAuditInstrumentModalModal = () => setAuditInstrumentModalOpen(true);
  const handleCloseAuditInstrumentModalModal = () => setAuditInstrumentModalOpen(false);

  // В компоненте Home добавим состояние для модального окна
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [returnedInwriteOffDetailsModalOpen, setReturnedInWriteOffDetailsModalOpen] = useState(false);
  const [issuedDetailsModalOpen, setIssuedDetailsModalOpen] = useState(false);
  const [writeOffDetailsModalOpen, setWriteOffDetailsModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [instruments, setInstruments] = useState([]);
  const [storageSummary, setStorageSummary] = useState([]);

  // Посчитанные данные для отображения
  const [totalInstruments, setTotalInstruments] = useState(0);
  const [reparuedInstruments, setreparuedInstruments] = useState(0);
  const [issuedInstruments, setIssuedInstruments] = useState(0);
  const [writtenOffInstruments, setWittenOffInstruments] = useState(0);
  const [token, setToken] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<number | null>(null);

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
    getInstruments();
  }, []);

  React.useMemo(() => {
    const intervalId = setInterval(() => {
      getInstruments(); // Обновляем данные
    }, 8000); // Обновляем каждые 8 секунд

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);

  const getInstruments = async () => {
    try {
      const response = await axios.get('/api/dashboardApi/getAllInstrument');
      setInstruments(response.data.sort((a: Instrument, b: Instrument) => a.id - b.id));
      // console.log(response.data)
      const response3 = await axios.get('/api/dashboardApi/getAllSpisanieIsse');
      setStorageSummary(response3.data.sort((a, b) => a.id - b.id));
      console.log(response3.data);


    } catch (error) {
      showSnackbar('Ошибка загрузки данных.', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };


  React.useMemo(() => {
    let totalInstrumentsSumm = 0
    let reparuedInstrumentsSumm = 0
    let issuedInstrumentsSumm = 0
    let writtenOffInstrumentsSumm = 0
    for (const instrument of instruments) {
      totalInstrumentsSumm = totalInstrumentsSumm + instrument.quantity
    }
    for (const storageSumm of storageSummary) {
      reparuedInstrumentsSumm = reparuedInstrumentsSumm + storageSumm.totalReturnedInWrittenOff
      issuedInstrumentsSumm = issuedInstrumentsSumm + storageSumm.totalIssuedCeh
      writtenOffInstrumentsSumm = writtenOffInstrumentsSumm + storageSumm.totalWrittenOff
    }

    setTotalInstruments(totalInstrumentsSumm)
    setreparuedInstruments(reparuedInstrumentsSumm)
    setIssuedInstruments(issuedInstrumentsSumm)
    setWittenOffInstruments(writtenOffInstrumentsSumm)

  }, [instruments, storageSummary]);


  return (
    <div>
      <Navbar />

      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#1A73E8', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Главная страница
        </Typography>

        {/* Кнопки для операций */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, // На мобильных устройствах вертикально, на планшетах и ПК горизонтально
            justifyContent: 'center',
            gap: 2,
            mb: 6,
            width: '100%',
            maxWidth: '800px',
            mx: 'auto', // Центрирование кнопок
          }}
        >
          <PrimaryGradientButton
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<InventoryIcon />}
          >
            Выдать/принять инструмент
          </PrimaryGradientButton>

          <SecondaryGradientButton
            variant="contained"
            onClick={handleOpenReturnInstrumentModalModal}
            startIcon={<AddCircleOutlineIcon />}
          >
            Поступление нового инструмента
          </SecondaryGradientButton>

          <ErrorGradientButton
            variant="contained"
            onClick={handleOpenWriteOffModal}
            startIcon={<DeleteOutlineIcon />}
          >
            Списать инструмент
          </ErrorGradientButton>
          <СollationGradientButton
            variant="contained"
            onClick={handleOpenAuditInstrumentModalModal}
            startIcon={<FactCheckIcon />}
          >
            Сверка
          </СollationGradientButton>
        </Box>

        {/* Карточки с показателями */}
        <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 1, sm: 2 } }}>
          {/* Карточка: Общее количество инструментов */}
          {/* // Обновим карточку "Количество на складе годных": */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                },
              }}
              onClick={() => setDetailsModalOpen(true)}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom align="center" sx={{ color: '#5F6368', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Количество на складе годных
                </Typography>
                <Typography variant="h4" color="primary" align="center" sx={{ fontWeight: 'bold', color: '#1A73E8', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {totalInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>


          {/* Карточка: Выдано инструментов */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
              onClick={() => setReturnedInWriteOffDetailsModalOpen(true)}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom align="center" sx={{ color: '#5F6368', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Количество на складе на списание
                </Typography>
                <Typography variant="h4" color="secondary" align="center" sx={{ fontWeight: 'bold', color: '#1A73E8', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {reparuedInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Карточка: Возвращено инструментов */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
              onClick={() => setIssuedDetailsModalOpen(true)}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom align="center" sx={{ color: '#5F6368', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Количество в цеху
                </Typography>
                <Typography variant="h4" color="success.main" align="center" sx={{ fontWeight: 'bold', color: '#34A853', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {issuedInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Карточка: Списано инструментов */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
              }}
              onClick={() => setWriteOffDetailsModalOpen(true)}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom align="center" sx={{ color: '#5F6368', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Списано
                </Typography>
                <Typography variant="h4" color="error.main" align="center" sx={{ fontWeight: 'bold', color: '#EA4335', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {writtenOffInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>


      <IssueInstrumentModal open={modalOpen} handleClose={handleCloseModal} />
      <WriteOffInstrumentModal open={writeOffModalOpen} handleClose={handleCloseWriteOffModal} />
      <ReturnInstrumentModal open={returnInstrumentModalOpen} handleClose={handleCloseReturnInstrumentModalModal} />
      <InventoryAuditComponent userId={userId} open={auditInstrumentModalOpen} handleClose={handleCloseAuditInstrumentModalModal} />
      {/* // В конце компонента добавим модальное окно: */}
      <InstrumentDetailsModal
        open={detailsModalOpen}
        handleClose={() => setDetailsModalOpen(false)}
        instruments={instruments}
      />
       <ReturnedInWriteOffInstrumentDetailsModal
        open={returnedInwriteOffDetailsModalOpen}
        handleClose={() => setReturnedInWriteOffDetailsModalOpen(false)}
        writeOffInstruments={storageSummary}
      />
       <IssuedInstrumentDetailsModal
        open={issuedDetailsModalOpen}
        handleClose={() => setIssuedDetailsModalOpen(false)}
        writeOffInstruments={storageSummary}
      />
       <WrittenOffInstrumentDetailsModal
        open={writeOffDetailsModalOpen}
        handleClose={() => setWriteOffDetailsModalOpen(false)}
        writeOffInstruments={storageSummary}
      />
    </div>
  );
}