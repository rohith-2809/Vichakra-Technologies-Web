import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Color Palette (Minimalist SaaS / Brand #0d9488) ────────────────────────
const TEAL       = [13, 148, 136];  // #0d9488
const TEAL_DK    = [10, 110, 100];
const TEAL_LT    = [240, 250, 248]; // Very soft teal/gray
const BLACK      = [30, 30, 30];    // Crisp off-black
const TEXT_DARK  = [70, 70, 70]; 
const TEXT_MUTED = [120, 120, 120];
const BORDER     = [235, 235, 235];

// ─── Image loader (Transparent PNG without forced cropping) ──────────────────
const loadLogo = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────
// We use Rs. directly concatenated to avoid space, matching requested clean style.
// Notice: standard jsPDF core fonts lack the ₹ glyph and render as an artifact, hence Rs.
const money = (v) => `Rs.${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const calcTotal = (data) =>
  (data.items || []).reduce((s, it) => s + it.qty * parseFloat(it.price || 0), 0);

// Removed serial number #
const buildRows = (data) =>
  (data.items || []).map((it) => [
    { content: it.description || '', styles: { textColor: BLACK, fontStyle: 'bold' } },
    { content: String(it.qty), styles: { halign: 'center' } },
    { content: money(it.price), styles: { halign: 'right' } },
    { content: money(it.qty * parseFloat(it.price || 0)), styles: { halign: 'right', fontStyle: 'bold', textColor: BLACK } },
  ]);

// ─── SHARED: Minimalist Header ────────────────────────────────────────────────
const drawHeader = (doc, logo, docTitle, docLabel, docValue, dateLabel, dateValue, extraLabel, extraValue) => {
  const PW = doc.internal.pageSize.width;
  
  // Top thin brand bar
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PW, 4, 'F');

  let curY = 18;
  
  if (logo) {
    // Elegant logo sizing
    doc.addImage(logo, 'PNG', 15, 12, 22, 22, '', 'FAST');
    curY += 2;
  }

  // Company Name - boldly emphasized
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BLACK);
  doc.text('VICHAKRA TECHNOLOGIES', 45, curY + 2);
  
  // Subtitle & Website
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Software Consulting & Development Studio', 45, curY + 7);
  doc.setTextColor(...TEAL);
  doc.text('www.vichakratechnologies.com', 45, curY + 12);

  // Document Title (INVOICE, PROFORMA, QUOTATION)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...TEAL);
  doc.text(docTitle.toUpperCase(), PW - 15, curY + 4, { align: 'right' });

  // Very clean Meta block
  doc.setFontSize(9);
  let metaY = curY + 12;
  const renderMetaRow = (label, value) => {
    if (!label) return;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`${label}:`, PW - 45, metaY);
    doc.setFont('helvetica', 'normal'); // Non-bold for premium airy feel
    doc.setTextColor(...BLACK);
    doc.text(String(value || ''), PW - 15, metaY, { align: 'right' });
    metaY += 5;
  };

  renderMetaRow(docLabel, docValue);
  renderMetaRow(dateLabel, dateValue);
  renderMetaRow(extraLabel, extraValue);

  curY = Math.max(curY + 22, metaY) + 6;

  // Thin clean separator
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(15, curY, PW - 15, curY);

  return curY + 10;
};

// ─── SHARED: Billed-to block ──────────────────────────────────────────────────
const drawBillTo = (doc, data, startY, label = 'Billed To:') => {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(label, 15, startY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);
  doc.text(data.clientName || 'Client Name', 15, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  
  let lineY = startY + 11;
  const textSpace = 4.5;
  
  if (data.phone) {
    doc.text(data.phone, 15, lineY);
    lineY += textSpace;
  }
  if (data.email) {
    doc.text(data.email, 15, lineY);
    lineY += textSpace;
  }
  if (data.address) {
    const lines = doc.splitTextToSize(data.address, 90);
    doc.text(lines, 15, lineY);
    lineY += lines.length * textSpace;
  }

  return lineY + 6;
};

// ─── SHARED: Items table ──────────────────────────────────────────────────────
const drawTable = (doc, data, startY) => {
  autoTable(doc, {
    startY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: buildRows(data),
    theme: 'plain',
    headStyles: {
      fillColor: TEAL_LT, // Soft #0d9488 wash
      textColor: TEAL_DK,
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: TEXT_DARK,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      lineWidth: { bottom: 0.1 },
      lineColor: BORDER, // Extremely subtle borders underneath
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 33, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });
  return doc.lastAutoTable.finalY;
};

// ─── SHARED: Totals block ─────────────────────────────────────────────────────
const drawTotals = (doc, data, afterTableY) => {
  const PW = doc.internal.pageSize.width;
  const gt = calcTotal(data);
  const valX   = PW - 15;
  
  // Directly attach the grand total to the bottom right of the table
  let y = afterTableY;
  
  const boxW = 65; // Covers 'Unit Price' + 'Amount' exactly
  const boxX = PW - 15 - boxW;
  
  // Very soft connected background
  doc.setFillColor(...TEAL_LT);
  doc.rect(boxX, y, boxW, 11, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEAL_DK);
  doc.text('Grand Total:', boxX + 6, y + 7.5);
  
  doc.setFontSize(10.5);
  doc.setTextColor(...BLACK);
  doc.text(money(gt), valX - 6, y + 7.5, { align: 'right' });

  return y + 20; // ample breathing room below
};

// ─── SHARED: Notes section ────────────────────────────────────────────────────
const drawNotes = (doc, data, startY) => {
  const PW = doc.internal.pageSize.width;
  let y = startY + 6;

  const sections = [];
  if (data.scopeOfWork && data.scopeOfWork.trim())           sections.push(['Scope of Work',           data.scopeOfWork]);
  if (data.clientResponsibilities && data.clientResponsibilities.trim())sections.push(['Client Responsibilities', data.clientResponsibilities]);
  if (data.paymentTerms && data.paymentTerms.trim())          sections.push(['Payment Terms', data.paymentTerms]);

  for (const [title, body] of sections) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...BLACK);
    doc.text(title, 15, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_DARK);
    const lines = doc.splitTextToSize(body, PW - 30);
    doc.text(lines, 15, y);
    y += lines.length * 4 + 7;
  }

  return y;
};

// ─── SHARED: Signature ────────────────────────────────────────────────────────
const drawSignature = (doc, startY) => {
  const PW = doc.internal.pageSize.width;
  const PH = doc.internal.pageSize.height;
  
  let y = startY + 15;
  if (y > PH - 40) {
    doc.addPage();
    y = 30; // margin on new page
  }

  const sigX = PW - 65;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(sigX, y, PW - 15, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  doc.text('Authorized Signatory', sigX, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Vichakra Technologies', sigX, y + 10);
};

// ─── SHARED: Footer bar ───────────────────────────────────────────────────────
const drawFooter = (doc) => {
  const PW = doc.internal.pageSize.width;
  const PH = doc.internal.pageSize.height;
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const FY = PH - 14;

    // Slim, elegant line centered over the footer text
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(40, FY - 4, PW - 40, FY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    
    // Centered, clean string
    const footerText = '+91 9959362328    |    billing@vichakratechnologies.com    |    Hyderabad, Telangana, India';
    doc.text(footerText, PW / 2, FY + 2, { align: 'center' });
  }
};

// ─── Proforma note badge ──────────────────────────────────────────────────────
const drawProformaBadge = (doc, PW, y) => {
  doc.setFillColor(...TEAL_LT);
  doc.setDrawColor(200, 225, 222);
  doc.setLineWidth(0.2);
  doc.roundedRect(15, y, PW - 30, 8, 1, 1, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEAL_DK);
  doc.text(
    'This is a Proforma Invoice. Project operations remain paused pending advance payment.',
    PW / 2, y + 5.5, { align: 'center' }
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  1. INVOICE
// ══════════════════════════════════════════════════════════════════════════════
const buildInvoice = async (doc, data, logo) => {
  const contentY = drawHeader(
    doc, logo, 'INVOICE',
    'Invoice No', data.invoiceNo || '—',
    'Date',       fmtDate(data.date),
    null, null
  );

  const afterBill = drawBillTo(doc, data, contentY);
  const tableY    = afterBill + 4; // Tighter space to table
  const afterTable = drawTable(doc, data, tableY);
  const afterTotals = drawTotals(doc, data, afterTable);
  const afterNotes = drawNotes(doc, data, afterTotals);
  drawSignature(doc, afterNotes);
  drawFooter(doc);
  return doc;
};

// ══════════════════════════════════════════════════════════════════════════════
//  2. PROFORMA INVOICE
// ══════════════════════════════════════════════════════════════════════════════
const buildProforma = async (doc, data, logo) => {
  const contentY = drawHeader(
    doc, logo, 'PROFORMA',
    'Proforma No', data.invoiceNo || '—',
    'Date',        fmtDate(data.date),
    null, null
  );

  const PW = doc.internal.pageSize.width;
  drawProformaBadge(doc, PW, contentY);
  
  const afterBillY = contentY + 14;
  const afterBill  = drawBillTo(doc, data, afterBillY);
  const tableY     = afterBill + 4;
  const afterTable = drawTable(doc, data, tableY);
  const afterTotals = drawTotals(doc, data, afterTable);
  const afterNotes  = drawNotes(doc, data, afterTotals);
  drawSignature(doc, afterNotes);
  drawFooter(doc);
  return doc;
};

// ══════════════════════════════════════════════════════════════════════════════
//  3. QUOTATION
// ══════════════════════════════════════════════════════════════════════════════
const buildQuotation = async (doc, data, logo) => {
  const contentY = drawHeader(
    doc, logo, 'QUOTATION',
    'Quote No', data.invoiceNo || '—',
    'Date',      fmtDate(data.date),
    null, null
  );

  const afterBill = drawBillTo(doc, data, contentY, 'Prepared For:');
  const tableY    = afterBill + 4;
  const afterTable  = drawTable(doc, data, tableY);
  const afterTotals = drawTotals(doc, data, afterTable);
  const afterNotes  = drawNotes(doc, data, afterTotals);
  drawSignature(doc, afterNotes);
  drawFooter(doc);
  return doc;
};

// ══════════════════════════════════════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export const generateDocument = async (data) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let logo = null;
  try { logo = await loadLogo('/logo.png'); } catch (_) {}

  switch (data.type) {
    case 'PROFORMA INVOICE': return buildProforma(doc, data, logo);
    case 'QUOTATION':        return buildQuotation(doc, data, logo);
    default:                 return buildInvoice(doc, data, logo);
  }
};


