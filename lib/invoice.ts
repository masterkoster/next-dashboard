import PDFDocument from 'pdfkit';

export interface InvoiceData {
  id: string;
  clubName: string;
  memberName: string;
  memberEmail: string;
  date: string;
  items: InvoiceItemData[];
  totalAmount: number;
}

export interface InvoiceItemData {
  date: string;
  aircraft: string;
  hobbsHours: number;
  hourlyRate: number;
  amount: number;
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).text('INVOICE', { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Invoice #: ${data.id.slice(0, 8).toUpperCase()}`, { align: 'right' });
    doc.text(`Date: ${data.date}`, { align: 'right' });
    
    doc.moveDown(2);

    // Club info
    doc.fontSize(14).text(data.clubName, { bold: true });
    doc.fontSize(10).text('AviationHub');
    doc.moveDown(2);

    // Bill to
    doc.fontSize(12).text('Bill To:', { bold: true });
    doc.fontSize(10).text(data.memberName);
    doc.text(data.memberEmail);
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).text('Date', 50, tableTop, { width: 80 });
    doc.text('Aircraft', 130, tableTop, { width: 100 });
    doc.text('Hobbs', 230, tableTop, { width: 60, align: 'right' });
    doc.text('Rate', 290, tableTop, { width: 60, align: 'right' });
    doc.text('Amount', 350, tableTop, { width: 80, align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(430, tableTop + 15).stroke();

    // Table rows
    let y = tableTop + 25;
    for (const item of data.items) {
      doc.text(item.date, 50, y, { width: 80 });
      doc.text(item.aircraft, 130, y, { width: 100 });
      doc.text(item.hobbsHours.toFixed(1), 230, y, { width: 60, align: 'right' });
      doc.text(`$${item.hourlyRate.toFixed(2)}`, 290, y, { width: 60, align: 'right' });
      doc.text(`$${item.amount.toFixed(2)}`, 350, y, { width: 80, align: 'right' });
      y += 20;
    }

    // Total
    doc.moveTo(50, y).lineTo(430, y).stroke();
    y += 10;
    doc.fontSize(12).text('Total:', 290, y, { width: 60, align: 'right' });
    doc.text(`$${data.totalAmount.toFixed(2)}`, 350, y, { width: 80, align: 'right', bold: true });

    // Footer
    doc.fontSize(8);
    doc.text(
      'Thank you for flying with us!',
      50,
      doc.page.height - 100,
      { align: 'center', width: 400 }
    );
    doc.text(
      'Questions? Contact your club administrator.',
      50,
      doc.page.height - 80,
      { align: 'center', width: 400 }
    );

    doc.end();
  });
}

export function generateSimpleInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td>${item.date}</td>
      <td>${item.aircraft}</td>
      <td style="text-align: right;">${item.hobbsHours.toFixed(1)}</td>
      <td style="text-align: right;">$${item.hourlyRate.toFixed(2)}</td>
      <td style="text-align: right;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: right; margin-bottom: 30px; }
        .invoice-title { font-size: 24px; font-weight: bold; }
        .info { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
        .total { font-size: 18px; font-weight: bold; text-align: right; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-title">INVOICE</div>
        <div>Invoice #: ${data.id.slice(0, 8).toUpperCase()}</div>
        <div>Date: ${data.date}</div>
      </div>
      
      <div class="info">
        <strong>From:</strong> ${data.clubName}<br>
        AviationHub<br><br>
        <strong>Bill To:</strong><br>
        ${data.memberName}<br>
        ${data.memberEmail}
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Aircraft</th>
            <th style="text-align: right;">Hobbs</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total">
        Total: $${data.totalAmount.toFixed(2)}
      </div>

      <div class="footer">
        <p>Thank you for flying with us!</p>
        <p>Questions? Contact your club administrator.</p>
      </div>
    </body>
    </html>
  `;
}
