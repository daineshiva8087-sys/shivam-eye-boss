import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BUSINESS_INFO } from "./supabase";

interface QuotationItem {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface QuotationData {
  quotationNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  totalAmount: number;
  notes?: string;
}

export function generateQuotationPDF(data: QuotationData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [14, 165, 233]; // Primary blue
  const darkColor: [number, number, number] = [30, 41, 59]; // Dark slate
  const grayColor: [number, number, number] = [100, 116, 139]; // Slate gray

  // Header with business info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(BUSINESS_INFO.name, 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(BUSINESS_INFO.address, 14, 28);
  doc.text(`Mobile: ${BUSINESS_INFO.phone} | Email: ${BUSINESS_INFO.email}`, 14, 35);
  
  // Quotation title
  doc.setTextColor(...darkColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - 14, 20, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`#${data.quotationNumber}`, pageWidth - 14, 28, { align: "right" });
  doc.text(`Date: ${data.date}`, pageWidth - 14, 35, { align: "right" });

  // Customer details
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 58);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayColor);
  doc.text(data.customerName, 14, 66);
  doc.text(`Phone: ${data.customerPhone}`, 14, 73);
  if (data.customerEmail) {
    doc.text(`Email: ${data.customerEmail}`, 14, 80);
  }
  if (data.customerAddress) {
    const addressLines = doc.splitTextToSize(data.customerAddress, 80);
    doc.text(addressLines, 14, data.customerEmail ? 87 : 80);
  }

  // Items table
  const tableStartY = data.customerAddress ? 100 : (data.customerEmail ? 95 : 88);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Item Description", "Qty", "Unit Price (₹)", "Discount", "Total (₹)"]],
    body: data.items.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.quantity.toString(),
      item.unitPrice.toLocaleString("en-IN"),
      item.discount > 0 ? `${item.discount}%` : "-",
      item.total.toLocaleString("en-IN"),
    ]),
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Summary section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text("Subtotal:", pageWidth - 70, finalY);
  doc.setTextColor(...darkColor);
  doc.text(`₹${data.subtotal.toLocaleString("en-IN")}`, pageWidth - 14, finalY, { align: "right" });
  
  // Discount
  if (data.discountAmount > 0) {
    doc.setTextColor(...grayColor);
    doc.text(`Discount (${data.discountPercentage}%):`, pageWidth - 70, finalY + 7);
    doc.setTextColor(239, 68, 68); // Red for discount
    doc.text(`-₹${data.discountAmount.toLocaleString("en-IN")}`, pageWidth - 14, finalY + 7, { align: "right" });
  }
  
  // Total
  const totalY = data.discountAmount > 0 ? finalY + 17 : finalY + 10;
  doc.setFillColor(...primaryColor);
  doc.rect(pageWidth - 80, totalY - 5, 66, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", pageWidth - 75, totalY + 3);
  doc.text(`₹${data.totalAmount.toLocaleString("en-IN")}`, pageWidth - 14, totalY + 3, { align: "right" });

  // Notes
  if (data.notes) {
    const notesY = totalY + 25;
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, notesY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(notesLines, 14, notesY + 7);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, footerY + 5, { align: "center" });

  return doc;
}

export function shareViaWhatsApp(pdfBlob: Blob, quotationNumber: string, customerPhone: string) {
  // Create a shareable message
  const message = encodeURIComponent(
    `Hi! Here is your quotation #${quotationNumber} from ${BUSINESS_INFO.name}.\n\nFor any queries, contact us at ${BUSINESS_INFO.phone}`
  );
  
  // Clean phone number and add country code if not present
  let phone = customerPhone.replace(/\D/g, "");
  if (!phone.startsWith("91") && phone.length === 10) {
    phone = "91" + phone;
  }
  
  // Open WhatsApp with pre-filled message
  // Note: WhatsApp Web/Mobile doesn't support file sharing via URL, so we open with message only
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
  window.open(whatsappUrl, "_blank");
  
  // Also trigger download so user can share the file manually
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Quotation-${quotationNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
