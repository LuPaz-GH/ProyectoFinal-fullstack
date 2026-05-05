import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── EXCEL ────────────────────────────────────────────────────────────────────

export async function exportarExcelEstilizado({
  data,
  columns,
  filename = 'export.xlsx',
  sheetName = 'Datos',
  headerColor = '1a6fc4',
  titulo = ''
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Malfi Veterinaria';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // Fila de título opcional
  if (titulo) {
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = titulo;
    titleCell.font = { bold: true, size: 13, color: { argb: 'FF' + headerColor }, name: 'Calibri' };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    titleCell.border = {
      top: { style: 'medium', color: { argb: 'FF' + headerColor } },
      left: { style: 'medium', color: { argb: 'FF' + headerColor } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'medium', color: { argb: 'FF' + headerColor } }
    };
    worksheet.getRow(1).height = 26;
  }

  const headerRowIndex = titulo ? 2 : 1;

  worksheet.columns = columns.map(col => ({
    header: '',
    key: col.key,
    width: col.width || 18
  }));

  // Fila de encabezados
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 30;
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top:    { style: 'medium', color: { argb: 'FF000000' } },
      left:   { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right:  { style: 'medium', color: { argb: 'FF000000' } }
    };
  });

  // Filas de datos
  data.forEach((item, index) => {
    const rowValues = columns.map(col => item[col.key] ?? '');
    const row = worksheet.addRow(rowValues);
    const isEven = index % 2 === 0;
    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Fila par → lavanda suave | fila impar → celeste-violáceo
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFEFE6FA' : 'FFE6EEFA' }
      };
      cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF2C1654' } };
      cell.alignment = { vertical: 'middle', wrapText: false };
      cell.border = {
        top:    { style: 'thin',   color: { argb: 'FFCDB8E8' } },
        left:   { style: 'medium', color: { argb: 'FFB39DDB' } },
        bottom: { style: 'thin',   color: { argb: 'FFCDB8E8' } },
        right:  { style: 'medium', color: { argb: 'FFB39DDB' } }
      };
      // Alinear números a la derecha
      if (typeof (item[columns[colNumber - 1]?.key]) === 'number') {
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }
    });

    if (index === data.length - 1) {
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = { ...cell.border, bottom: { style: 'medium', color: { argb: 'FFB39DDB' } } };
      });
    }
  });

  // Borde exterior derecho en encabezado (ya cubierto por medium en cada celda)
  worksheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];

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

// ─── PDF ─────────────────────────────────────────────────────────────────────

/**
 * Genera un PDF con tabla estilizada.
 * @param {object} opts
 * @param {string}   opts.titulo          - Título del reporte (obligatorio)
 * @param {string}   [opts.subtitulo]     - Subtítulo / descripción adicional
 * @param {string[]} opts.columnas        - Array de encabezados de columna
 * @param {any[][]}  opts.filas           - Array de filas (cada fila = array de valores)
 * @param {string}   [opts.filename]      - Nombre del archivo
 * @param {string}   [opts.orientation]   - 'landscape' | 'portrait'
 * @param {number[]} [opts.headerColor]   - RGB del header, ej: [44, 62, 80]
 * @param {number[]} [opts.accentColor]   - RGB del acento (línea decorativa), ej: [52, 152, 219]
 */
export function exportarPDFEstilizado({
  titulo,
  subtitulo = '',
  columnas,
  filas,
  filename = 'reporte.pdf',
  orientation = 'landscape',
  headerColor = [44, 62, 80],
  accentColor = [52, 152, 219]
}) {
  const doc = new jsPDF({ orientation });
  const W = doc.internal.pageSize.getWidth();
  const fecha = new Date().toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // ── Banda superior ──────────────────────────────────────────────────────────
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, W, 26, 'F');

  // Franja de acento
  doc.setFillColor(...accentColor);
  doc.rect(0, 26, W, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MALFI VETERINARIA', W / 2, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(titulo, W / 2, 20, { align: 'center' });

  // Fecha alineada a la derecha en el header
  doc.setFontSize(7.5);
  doc.text(fecha, W - 8, 9, { align: 'right' });

  let startY = 36;

  // Subtítulo (fuera del header)
  if (subtitulo) {
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(subtitulo, 10, startY);
    startY += 7;
  }

  // ── Tabla ───────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY,
    head: [columnas],
    body: filas,
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
      lineColor: [255, 255, 255],
      lineWidth: 0.3
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor: [44, 22, 84],
      lineColor: [179, 157, 219],
      lineWidth: 0.25,
      fillColor: [230, 238, 250]   // celeste-violáceo — filas impares
    },
    alternateRowStyles: {
      fillColor: [239, 230, 250]   // lavanda — filas pares
    },
    tableLineColor: headerColor,
    tableLineWidth: 0.5,
    styles: {
      overflow: 'linebreak',
      font: 'helvetica'
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageH = doc.internal.pageSize.getHeight();
      // Franja footer
      doc.setFillColor(...headerColor);
      doc.rect(0, pageH - 10, W, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Pagina ${data.pageNumber} de ${pageCount}   |   Malfi Veterinaria   |   ${fecha}`,
        W / 2,
        pageH - 3.5,
        { align: 'center' }
      );
    }
  });

  doc.save(filename);
}
