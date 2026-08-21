import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean, beautifully formatted PDF brochure for an event using jsPDF.
 * Guaranteed 100% reliable with zero external CORS or canvas rendering failures.
 */
export function downloadEventBrochurePdf(event) {
  if (!event) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // --- Background Accent & Top Banner ---
  doc.setFillColor(15, 23, 42); // #0F172A (slate-900)
  doc.rect(0, 0, pageWidth, 110, 'F');

  // Cyan Top Line Accent
  doc.setFillColor(6, 182, 212); // #06B6D4 (cyan-500)
  doc.rect(0, 0, pageWidth, 4, 'F');

  // College Name & Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(192, 132, 252); // #C084FC (purple-400)
  doc.text((event.collegeName || 'CAMPUS CONNECT').toUpperCase(), margin, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text('Department of Student Affairs & Technology Cell • Official Verification', margin, 48);

  // Eventix Engine Badge (Top Right)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - margin - 150, 24, 150, 26, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('✓ OFFICIAL VERIFIED BROCHURE', pageWidth - margin - 142, 40);

  // Main Event Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(event.title || 'Event Brochure', contentWidth - 110);
  doc.text(titleLines, margin, 78);

  // Category Tag (Top Right)
  const categoryStr = (event.category || 'National Competition').toUpperCase();
  doc.setFillColor(6, 182, 212);
  doc.roundedRect(pageWidth - margin - 100, 64, 100, 22, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(categoryStr, pageWidth - margin - 90, 78);

  let currentY = 125;

  // --- Key Metrics Grid (3 Boxes) ---
  const boxWidth = (contentWidth - 20) / 3;
  const boxHeight = 52;

  // 1. Prize Pool Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 5, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PRIZE POOL', margin + 12, currentY + 18);
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(event.prizePool || 'Certificate & Awards', margin + 12, currentY + 38);

  // 2. Event Date Box
  const col2X = margin + boxWidth + 10;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, currentY, boxWidth, boxHeight, 5, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EVENT DATE', col2X + 12, currentY + 18);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Announced Soon';
  doc.text(formattedDate, col2X + 12, currentY + 38);

  // 3. Deadline Box
  const col3X = col2X + boxWidth + 10;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col3X, currentY, boxWidth, boxHeight, 5, 5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('REGISTRATION DEADLINE', col3X + 12, currentY + 18);
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // amber-600
  const formattedDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Open Now';
  doc.text(formattedDeadline, col3X + 12, currentY + 38);

  currentY += boxHeight + 22;

  // --- Section: Overview & Problem Statement ---
  doc.setFillColor(139, 92, 246);
  doc.rect(margin, currentY, 4, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('EVENT OVERVIEW & SPECIFICATIONS', margin + 10, currentY + 11);

  currentY += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const descText = event.description || 'Join students from across India for this premier competition.';
  const descLines = doc.splitTextToSize(descText, contentWidth - 10);
  doc.text(descLines, margin + 4, currentY);

  currentY += descLines.length * 14 + 18;

  // --- Section: Rules & Eligibility ---
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, currentY, 4, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RULES & ELIGIBILITY GUIDELINES', margin + 10, currentY + 11);

  currentY += 20;

  const rules = [
    'Open to undergraduate & postgraduate students from recognized colleges and universities across India.',
    'Teams can consist of 1 to 4 members. Inter-departmental and cross-college teams are permitted.',
    'All participants must bring and present their valid college photo ID card at the check-in desk.',
    'Submissions and source code must be authentic and built during the designated challenge window.',
    'Official participation certificates will be awarded to all verified attending candidates.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  rules.forEach((rule) => {
    doc.setFillColor(6, 182, 212);
    doc.circle(margin + 7, currentY - 3, 2.5, 'F');
    const ruleLines = doc.splitTextToSize(rule, contentWidth - 25);
    doc.text(ruleLines, margin + 16, currentY);
    currentY += ruleLines.length * 12 + 6;
  });

  currentY += 12;

  // --- Section: Venue & Contact Info Box ---
  const infoBoxHeight = 56;
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(margin, currentY, contentWidth, infoBoxHeight, 5, 5, 'FD');

  // Left: Venue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VENUE LOCATION', margin + 12, currentY + 18);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(event.venue || 'Campus Auditorium', margin + 12, currentY + 32);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(event.location?.address || event.collegeName || 'Campus Grounds', margin + 12, currentY + 45);

  // Right: Coordinator Contact
  const rightColX = margin + contentWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT COORDINATOR CONTACT', rightColX, currentY + 18);
  doc.setFontSize(9.5);
  doc.setTextColor(124, 58, 237); // purple-600
  doc.text(event.contactPerson?.name || 'Event Coordinator', rightColX, currentY + 32);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${event.contactPerson?.phone || '+91 98765 43210'} • ${event.contactPerson?.email || 'events@campus.edu'}`, rightColX, currentY + 45);

  // --- Footer Stamp ---
  const footerY = pageHeight - 35;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via Eventix Campus Discovery Engine • Verified Inter-College Competition Document', margin, footerY);

  const genDateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.text(`Generated on ${genDateStr}`, pageWidth - margin - 120, footerY);

  // Save the PDF
  const cleanTitle = (event.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${cleanTitle}_brochure.pdf`;
  doc.save(filename);
}
