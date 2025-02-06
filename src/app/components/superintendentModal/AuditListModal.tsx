import { useState, useEffect, FC } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Backdrop,
  Fade,
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Типы данных
interface Instrument {
  id: number;
  name: string;
}

interface AuditItem {
  id: number;
  instrument: Instrument;
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
}

interface Audit {
  id: number;
  createdAt: string;
  completedAt: string | null;
  status: string;
  auditItems: AuditItem[];
}

interface AuditModalProps {
  open: boolean;
  handleClose: () => void;
}

// Стили для модального окна
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 700 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

// Стили для заголовка модального окна
const ModalHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  borderTopLeftRadius: theme.spacing(1.5),
  borderTopRightRadius: theme.spacing(1.5),
  textAlign: "center",
}));

// Стили для таблицы
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

// Функция для отображения Chip со статусом
const getStatusChip = (status: string) => {
  if (status === "completed") {
    return <Chip label="Завершено" color="success" size="small" />;
  }
  return <Chip label="В работе" color="warning" size="small" />;
};

// Функция для определения стиля ячейки "Разница" в таблице модального окна
const getDifferenceStyle = (expected: number, actual: number) => {
  if (actual < expected) {
    return { backgroundColor: "rgba(244,67,54,0.15)", color: "red", fontWeight: "bold" }; // недостаток
  } else if (actual > expected) {
    return { backgroundColor: "rgba(76,175,80,0.15)", color: "green", fontWeight: "bold" }; // избыток
  }
  return {}; // если равны
};

// Основной компонент
const AuditModal: FC<AuditModalProps> = ({ open, handleClose }) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  useEffect(() => {
    if (open) {
      axios
        .get<Audit[]>("/api/directionApi/getAudit")
        .then((response) => {
          setAudits(response.data);
        })
        .catch((error) => {
          console.error("Ошибка получения актов сверки:", error);
        });
    }
  }, [open]);

  // Функция экспорта в Excel с помощью ExcelJS и file-saver
  const handleExport = async () => {
    if (!selectedAudit) return;
    const ExcelJS = (await import("exceljs")).default;
    const { saveAs } = await import("file-saver");
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Акт сверки");
  
    // Определяем 4 столбца для всего листа:
    // Первые два столбца будут использоваться для сводной информации,
    // а все четыре — для таблицы деталей.
    worksheet.columns = [
      { header: "", key: "col1", width: 20 },
      { header: "", key: "col2", width: 20 },
      { header: "", key: "col3", width: 15 },
      { header: "", key: "col4", width: 15 },
    ];
  
    // 1. Заголовок в первой строке: объединяем ячейки A1 и B1
    worksheet.mergeCells("A1:B1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Акт сверки № ${selectedAudit.id}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };
  
    // Пустая строка
    worksheet.addRow([]);
  
    // 2. Сводная информация (используем первые два столбца)
    const summaryData = [
      ["Дата начала:", new Date(selectedAudit.createdAt).toLocaleString("ru-RU")],
      [
        "Дата завершения:",
        selectedAudit.completedAt
          ? new Date(selectedAudit.completedAt).toLocaleString("ru-RU")
          : "-",
      ],
      ["Статус:", selectedAudit.status === "completed" ? "Завершено" : "В работе"],
    ];
  
    summaryData.forEach((data) => {
      // Добавляем строку как массив значений; данные попадают в столбцы A и B.
      const row = worksheet.addRow(data);
      // Делаем первую ячейку жирной
      row.getCell(1).font = { bold: true };
  
      // Выравниваем все ячейки строки по левому краю и по центру по вертикали
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      });
  
      // Если текущая строка — со статусом, добавляем подсветку
      if (data[0] === "Статус:") {
        const statusCell = row.getCell(2);
        if (data[1] === "Завершено") {
          // Подсветка для завершённого статуса (зелёный фон)
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFC8E6C9" },
          };
          statusCell.font = { color: { argb: "FF1B5E20" }, bold: true };
        } else {
          // Подсветка для статуса "В работе" (красный фон)
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFCDD2" },
          };
          statusCell.font = { color: { argb: "FFB71C1C" }, bold: true };
        }
      }
    });
  
    // Пустая строка перед таблицей с деталями
    worksheet.addRow([]);
  
    // 3. Заголовок таблицы деталей (используем все 4 столбца)
    const detailsHeaderRow = worksheet.addRow([
      "Инструмент",
      "Ожидаемое",
      "Фактическое",
      "Разница",
    ]);
  
    detailsHeaderRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB0BEC5" },
      };
    });
  
    // 4. Заполнение таблицы данными
    selectedAudit.auditItems.forEach((item) => {
      const row = worksheet.addRow([
        item.instrument.name,
        item.expectedQuantity,
        item.actualQuantity,
        item.discrepancy,
      ]);
  
      const diffCell = row.getCell(4);
      if (item.actualQuantity < item.expectedQuantity) {
        diffCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFCDD2" },
        };
        diffCell.font = { color: { argb: "FFB71C1C" }, bold: true };
      } else if (item.actualQuantity > item.expectedQuantity) {
        diffCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFC8E6C9" },
        };
        diffCell.font = { color: { argb: "FF1B5E20" }, bold: true };
      }
    });
  
    // 5. Сохранение файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `audit_${selectedAudit.id}.xlsx`);
  };
  
  
  

  return (
    <>
      {/* Главное модальное окно со списком актов */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500, sx: { backgroundColor: "rgba(0, 0, 0, 0.6)" } }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            <ModalHeader>
              <Typography variant="h5">Акты сверки</Typography>
            </ModalHeader>
            <Box sx={{ p: 2 }}>
              <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>№ сверки</StyledTableCell>
                      <StyledTableCell>Дата начала</StyledTableCell>
                      <StyledTableCell>Дата завершения</StyledTableCell>
                      <StyledTableCell>Статус</StyledTableCell>
                      <StyledTableCell align="center">Действие</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {audits.map((audit) => (
                      <TableRow key={audit.id} hover>
                        <TableCell>{audit.id}</TableCell>
                        <TableCell>
                          {new Date(audit.createdAt).toLocaleString("ru-RU")}
                        </TableCell>
                        <TableCell>
                          {audit.completedAt
                            ? new Date(audit.completedAt).toLocaleString("ru-RU")
                            : "-"}
                        </TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>
                          {getStatusChip(audit.status)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedAudit(audit)}
                          >
                            Посмотреть
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Второе модальное окно с деталями акта */}
      {selectedAudit && (
        <Modal
          open={Boolean(selectedAudit)}
          onClose={() => setSelectedAudit(null)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500, sx: { backgroundColor: "rgba(0, 0, 0, 0.6)" } }}
        >
          <Fade in={Boolean(selectedAudit)}>
            <Box sx={modalStyle}>
              <ModalHeader>
                <Typography variant="h5">Детали акта #{selectedAudit.id}</Typography>
              </ModalHeader>
              <Box sx={{ p: 2 }}>
                <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Инструмент</StyledTableCell>
                        <StyledTableCell align="right">Ожидаемое</StyledTableCell>
                        <StyledTableCell align="right">Фактическое</StyledTableCell>
                        <StyledTableCell align="right">Разница</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAudit.auditItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.instrument.name}</TableCell>
                          <TableCell align="right">{item.expectedQuantity}</TableCell>
                          <TableCell align="right">{item.actualQuantity}</TableCell>
                          <TableCell
                            align="right"
                            sx={getDifferenceStyle(item.expectedQuantity, item.actualQuantity)}
                          >
                            {item.discrepancy}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Button variant="contained" onClick={() => setSelectedAudit(null)}>
                    Закрыть
                  </Button>
                  <Button variant="outlined" onClick={handleExport}>
                    Экспортировать в Excel
                  </Button>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>
      )}
    </>
  );
};

export default AuditModal;
