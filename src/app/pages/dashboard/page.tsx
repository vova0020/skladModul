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

import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useState } from 'react';
import IssueInstrumentModal from '@/app/components/modalOkna/IssueInstrumentModal';

import axios from 'axios';
import WriteOffInstrumentModal from '@/app/components/modalOkna/WriteOffInstrumentModal';
import ReturnInstrumentModal from '@/app/components/modalOkna/ReturnInstrumentModal';
import InventoryAuditComponent from '@/app/components/modalOkna/InventoryAuditComponent';
import { jwtDecode } from 'jwt-decode';
import InstrumentDetailsModal from '@/app/components/dashboardModal/InstrumentDetailsModal';
import IssuedInstrumentDetailsModal from '@/app/components/dashboardModal/IssuedInstrumentDetailsModal';
import ReturnedInWriteOffInstrumentDetailsModal from '@/app/components/dashboardModal/ReturnedInWriteOffInstrumentDetailsModal';
import WrittenOffInstrumentDetailsModal from '@/app/components/dashboardModal/WrittenOffInstrumentDetailsModal';
import withAuth from '@/app/components/withAuth';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ToolTransactionModal from '@/app/components/modalOkna/ToolTransactionModal';

// ---------- Стили кнопок ----------

// Основной цвет: глубокий синий (#1A73E8)
const PrimaryGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1A73E8 30%, #4285F4 90%)',
  padding: '8px',
  color: 'white',
  width: '100%', // На самых маленьких экранах - на всю ширину
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(26, 115, 232, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(26, 115, 232, .4)',
  },
  // Начиная с экрана 'sm' (~600px) — фиксированная ширина 200px
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
}));

// Вторичный цвет: серый (#5F6368)
const SecondaryGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #5F6368 30%, #80868B 90%)',
  padding: '8px',
  color: 'white',
  width: '100%',
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(95, 99, 104, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(95, 99, 104, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
}));

// Цвет ошибки: красный (#EA4335)
const ErrorGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #EA4335 30%, #FBBC05 90%)',
  padding: '8px',
  color: 'white',
  width: '100%',
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(234, 67, 53, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(234, 67, 53, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
}));

// Сверка: зеленый
const СollationGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg,rgb(28, 190, 4) 30%,rgb(116, 224, 8) 90%)',
  padding: '8px',
  color: 'white',
  width: '100%',
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(234, 67, 53, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(234, 67, 53, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
}));

// Токарный участок: желтый
const TokarGradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg,rgb(246, 207, 12) 30%,rgb(180, 192, 106) 90%)',
  padding: '8px',
  color: 'white',
  width: '100%',
  height: '70px',
  borderRadius: '10px',
  boxShadow: '0 3px 5px 2px rgba(234, 67, 53, .3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 7px 3px rgba(234, 67, 53, .4)',
  },
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
}));

function Home() {
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

  const [toolTransactionModal, setToolTransactionModal] = useState(false);
  const handleOpenToolTransactionModal = () => setToolTransactionModal(true);
  const handleCloseToolTransactionModal = () => setToolTransactionModal(false);

  // Модалки для деталей
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [returnedInwriteOffDetailsModalOpen, setReturnedInWriteOffDetailsModalOpen] = useState(false);
  const [issuedDetailsModalOpen, setIssuedDetailsModalOpen] = useState(false);
  const [writeOffDetailsModalOpen, setWriteOffDetailsModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [instruments, setInstruments] = useState([]);
  const [storageSummary, setStorageSummary] = useState([]);

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
      getInstruments(); // Обновляем данные каждые 8 секунд
    }, 8000);
    return () => clearInterval(intervalId);
  }, []);

  const getInstruments = async () => {
    try {
      const response = await axios.get('/api/dashboardApi/getAllInstrument');
      // @ts-ignore
      setInstruments(response.data.sort((a, b) => a.id - b.id));

      const response3 = await axios.get('/api/dashboardApi/getAllSpisanieIsse');
      // @ts-ignore
      setStorageSummary(response3.data.sort((a, b) => a.id - b.id));
    } catch (error) {
      showSnackbar('Ошибка загрузки данных.', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  React.useMemo(() => {
    let totalInstrumentsSumm = 0;
    let reparuedInstrumentsSumm = 0;
    let issuedInstrumentsSumm = 0;
    let writtenOffInstrumentsSumm = 0;

    for (const instrument of instruments) {
      // @ts-ignore
      totalInstrumentsSumm += instrument.quantity;
    }
    for (const storageSumm of storageSummary) {
      // @ts-ignore
      reparuedInstrumentsSumm += storageSumm.totalReturnedInWrittenOff;
      // @ts-ignore
      issuedInstrumentsSumm += storageSumm.totalIssuedCeh;
      // @ts-ignore
      writtenOffInstrumentsSumm += storageSumm.totalWrittenOff;
    }

    setTotalInstruments(totalInstrumentsSumm);
    setreparuedInstruments(reparuedInstrumentsSumm);
    setIssuedInstruments(issuedInstrumentsSumm);
    setWittenOffInstruments(writtenOffInstrumentsSumm);
  }, [instruments, storageSummary]);

  return (
    <div>
      <Navbar />

      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          p: { xs: 2, sm: 3 },
          backgroundColor: '#F5F5F5',
          minHeight: '100vh',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: '#1A73E8',
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Главная страница
        </Typography>

        {/* БЛОК КНОПОК */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 6,
            width: '100%',
            // На мобильных - 100%, начиная с md - 800px
            maxWidth: { xs: '100%', md: '800px' },
            mx: 'auto',
          }}
        >
          <PrimaryGradientButton
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<InventoryIcon />}
          >
            Выдача/возврат инструмента
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

          <TokarGradientButton
            variant="contained"
            onClick={handleOpenToolTransactionModal}
            startIcon={<SettingsSuggestIcon sx={{ fontSize: '5rem' }} />}
          >
            Токарный участок
          </TokarGradientButton>
        </Box>

        {/* КАРТОЧКИ С ПОКАЗАТЕЛЯМИ */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{
            width: '100%',
            // На мобильных 100%, на больших - 1200px
            maxWidth: { xs: '100%', md: '1200px' },
            mx: 'auto',
            p: { xs: 1, sm: 2 },
          }}
        >
          {/* Количество на складе годных */}
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
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  align="center"
                  sx={{
                    color: '#5F6368',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Количество на складе годных
                </Typography>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1A73E8',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {totalInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Количество на складе на списание */}
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
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  align="center"
                  sx={{
                    color: '#5F6368',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Количество на складе на списание
                </Typography>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1A73E8',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {reparuedInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Количество в цеху */}
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
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  align="center"
                  sx={{
                    color: '#5F6368',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Количество в цеху
                </Typography>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#34A853', // зеленый
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {issuedInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Списано */}
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
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  align="center"
                  sx={{
                    color: '#5F6368',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Списано
                </Typography>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#EA4335',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {writtenOffInstruments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Модалки */}
      <IssueInstrumentModal open={modalOpen} handleClose={handleCloseModal} />
      <WriteOffInstrumentModal open={writeOffModalOpen} handleClose={handleCloseWriteOffModal} />
      <ReturnInstrumentModal
        open={returnInstrumentModalOpen}
        handleClose={handleCloseReturnInstrumentModalModal}
      />
      <ToolTransactionModal
        open={toolTransactionModal}
        handleClose={handleCloseToolTransactionModal}
      />
      <InventoryAuditComponent
      // @ts-ignore
        userId={userId}
        open={auditInstrumentModalOpen}
        handleClose={handleCloseAuditInstrumentModalModal}
      />

      {/* Детальные модалки */}
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

export default withAuth(Home, [1, 2]);
