import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Generates a simple branded PDF report with a title/subtitle and a data table,
// then triggers a browser download.
export function downloadPdfReport({ filename, heading, subheading, columns, rows }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' })

  doc.setFontSize(16)
  doc.setTextColor(0, 174, 239)
  doc.text('MJ Prints', 40, 40)

  doc.setFontSize(13)
  doc.setTextColor(20, 20, 20)
  doc.text(heading, 40, 62)

  if (subheading) {
    doc.setFontSize(9.5)
    doc.setTextColor(90, 90, 90)
    doc.text(subheading, 40, 78)
  }

  autoTable(doc, {
    startY: 92,
    head: [columns],
    body: rows,
    styles: { fontSize: 8.5, cellPadding: 6 },
    headStyles: { fillColor: [0, 174, 239], textColor: 255 },
    alternateRowStyles: { fillColor: [246, 248, 250] },
  })

  doc.save(filename)
}
