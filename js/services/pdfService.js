import { generateOrderNumber } from '../utils/helpers.js';
import { SHIPPING_METHODS } from '../utils/constants.js';

const { jsPDF } = window.jspdf;

export const pdfService = {
  generateOrderPDF(cart, order, cartSubtotal, pickupDiscount, currentShippingFee, cartTotal) {
    const doc = new jsPDF();
    const now = new Date();
    const orderNum = generateOrderNumber();

    // 頁頭
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PetFood Mart', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Order Receipt', 14, 30);
    doc.text(`Date: ${now.toLocaleDateString('en-MY')} ${now.toLocaleTimeString()}`, 110, 18);
    doc.text(`Order No: #${orderNum}`, 110, 28);

    doc.setTextColor(50, 50, 50);
    let y = 55;

    // 配送信息
    if ([SHIPPING_METHODS.DELIVERY, SHIPPING_METHODS.CUSTOM].includes(order.shippingMethod)) {
      doc.setFillColor(255, 247, 237);
      doc.rect(10, y - 5, 190, 32, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Delivery Information', 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${order.name}`, 14, y);
      y += 7;
      doc.text(`Phone: ${order.phone}`, 14, y);
      y += 7;
      doc.text(`Address: ${order.address}`, 14, y);
      y += 12;
    }

    // 商品表格
    const tableData = cart.map(item => [
      item.name,
      `RM ${item.finalPrice}`,
      `x${item.quantity}`,
      `RM ${(parseFloat(item.finalPrice) * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: y,
      head: [['Product Name', 'Unit Price', 'Qty', 'Total']],
      body: tableData,
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 247, 237] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 90 }, 3: { halign: 'right' } }
    });

    let finalY = doc.lastAutoTable.finalY + 12;

    // 結算框
    doc.setFillColor(249, 249, 249);
    const boxHeight = order.shippingMethod === SHIPPING_METHODS.PICKUP ? 36 : 30;
    doc.rect(120, finalY - 5, 80, boxHeight, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Subtotal:`, 124, finalY);
    doc.text(`RM ${cartSubtotal.toFixed(2)}`, 196, finalY, { align: 'right' });
    finalY += 8;

    if (order.shippingMethod === SHIPPING_METHODS.PICKUP) {
      doc.setTextColor(22, 163, 74);
      doc.text(`Self Pickup (-3%):`, 124, finalY);
      doc.text(`-RM ${pickupDiscount.toFixed(2)}`, 196, finalY, { align: 'right' });
      doc.setTextColor(80, 80, 80);
      finalY += 8;
    } else {
      doc.text(`Shipping Fee:`, 124, finalY);
      doc.text(`RM ${currentShippingFee.toFixed(2)}`, 196, finalY, { align: 'right' });
      finalY += 8;
    }

    doc.setDrawColor(249, 115, 22);
    doc.line(124, finalY, 196, finalY);
    finalY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(249, 115, 22);
    doc.text('TOTAL:', 124, finalY);
    doc.text(`RM ${cartTotal.toFixed(2)}`, 196, finalY, { align: 'right' });

    // 頁腳
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text('Thank you for shopping at PetFood Mart! 🐾', 105, 285, { align: 'center' });

    doc.save(`PetFoodMart-Order-${orderNum}.pdf`);
  }
};