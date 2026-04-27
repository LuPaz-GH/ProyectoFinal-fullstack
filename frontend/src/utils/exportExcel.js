import ExcelJS from 'exceljs';

export async function exportarExcelEstilizado({
  data,
  columns,
  filename = 'export.xlsx',
  sheetName = 'Datos',
  headerColor = '1a6fc4'
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Malfi Veterinaria';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 18
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: `FF${headerColor}` }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.eachCell(cell => {
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };
  });

  data.forEach((item, index) => {
    const rowValues = columns.map(col => item[col.key] ?? '');
    const row = worksheet.addRow(rowValues);
    row.height = 20;
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: index % 2 === 0 ? 'FFFFFFFF' : 'FFF2F6FA' }
    };
    row.font = { size: 10, name: 'Calibri' };
    row.alignment = { vertical: 'middle' };
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
      };
    });
  });

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
