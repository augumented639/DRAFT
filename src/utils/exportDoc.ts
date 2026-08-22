import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } from 'docx';
import { jsPDF } from 'jspdf';
import { LegalDocument } from '../types';

// Export as Microsoft Word (.docx)
export async function exportToDocx(doc: LegalDocument): Promise<void> {
  const docChildren: any[] = [];

  // Document Title
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 100 },
      children: [
        new TextRun({
          text: doc.title || 'LEGAL AGREEMENT',
          bold: true,
          size: 32, // 16pt
          font: 'Times New Roman',
          color: '0B192C'
        })
      ]
    })
  );

  // Subtitle / Jurisdiction
  if (doc.jurisdiction) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `Jurisdiction: ${doc.jurisdiction}`,
            italics: true,
            size: 20, // 10pt
            font: 'Times New Roman',
            color: '555555'
          })
        ]
      })
    );
  }

  // Preamble
  if (doc.preamble) {
    docChildren.push(
      new Paragraph({
        spacing: { after: 200, line: 360 },
        children: [
          new TextRun({
            text: doc.preamble,
            size: 24, // 12pt
            font: 'Times New Roman'
          })
        ]
      })
    );
  }

  // Sections
  doc.sections.forEach((sec, idx) => {
    // Section Heading
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: `${sec.clauseNumber ? sec.clauseNumber + '. ' : ''}${sec.heading}`,
            bold: true,
            size: 24,
            font: 'Times New Roman',
            color: '1E293B'
          })
        ]
      })
    );

    // Section Content
    const paragraphs = sec.content.split('\n\n');
    paragraphs.forEach((p) => {
      docChildren.push(
        new Paragraph({
          spacing: { after: 160, line: 320 },
          children: [
            new TextRun({
              text: p.trim(),
              size: 22,
              font: 'Times New Roman'
            })
          ]
        })
      );
    });
  });

  // Signatures Section
  docChildren.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: 'IN WITNESS WHEREOF, the Parties hereto have executed this Agreement as of the date first above written.',
          italics: true,
          size: 22,
          font: 'Times New Roman'
        })
      ]
    })
  );

  const p1 = doc.signatures?.partyOneLabel || doc.draftPlan?.parties?.partyOne?.role || 'FIRST PARTY';
  const p2 = doc.signatures?.partyTwoLabel || doc.draftPlan?.parties?.partyTwo?.role || 'SECOND PARTY';

  docChildren.push(
    new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: `For & on behalf of: ${p1}\n\n\n___________________________________\nAuthorized Signature\nName:\nDate:`,
          size: 22,
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: `For & on behalf of: ${p2}\n\n\n___________________________________\nAuthorized Signature\nName:\nDate:`,
          size: 22,
          font: 'Times New Roman'
        })
      ]
    })
  );

  // Disclaimer footer
  docChildren.push(
    new Paragraph({
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: 'Disclaimer: This document is an AI-assisted draft generated for informational and planning purposes. It does not replace professional legal counsel.',
          size: 16,
          font: 'Times New Roman',
          color: '888888',
          italics: true
        })
      ]
    })
  );

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(wordDoc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(doc.title || 'Legal_Agreement').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export as PDF
export function exportToPdf(doc: LegalDocument): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 54; // 0.75 inch
  const maxLineWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(11, 25, 44);
  const titleLines = pdf.splitTextToSize(doc.title || 'LEGAL AGREEMENT', maxLineWidth);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 20 + 8;

  // Jurisdiction & Date
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Jurisdiction: ${doc.jurisdiction || 'General'} | Generated: ${new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}`, margin, y);
  y += 24;

  // Divider Line
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(1);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Preamble
  if (doc.preamble) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10.5);
    pdf.setTextColor(30, 41, 59);
    const preambleLines = pdf.splitTextToSize(doc.preamble, maxLineWidth);
    checkPageBreak(preambleLines.length * 15);
    pdf.text(preambleLines, margin, y);
    y += preambleLines.length * 15 + 16;
  }

  // Sections
  doc.sections.forEach((sec) => {
    const headingText = `${sec.clauseNumber ? sec.clauseNumber + '. ' : ''}${sec.heading}`;
    checkPageBreak(40);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text(headingText, margin, y);
    y += 18;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    const contentLines = pdf.splitTextToSize(sec.content, maxLineWidth);

    contentLines.forEach((line: string) => {
      checkPageBreak(14);
      pdf.text(line, margin, y);
      y += 14;
    });

    y += 12;
  });

  // Signature Block
  checkPageBreak(120);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text('IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date indicated.', margin, y);
  y += 35;

  const p1 = doc.signatures?.partyOneLabel || doc.draftPlan?.parties?.partyOne?.role || 'FIRST PARTY';
  const p2 = doc.signatures?.partyTwoLabel || doc.draftPlan?.parties?.partyTwo?.role || 'SECOND PARTY';

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(`Party: ${p1}`, margin, y);
  pdf.text(`Party: ${p2}`, margin + 260, y);
  y += 35;

  pdf.setFont('helvetica', 'normal');
  pdf.text('Signature: ______________________', margin, y);
  pdf.text('Signature: ______________________', margin + 260, y);
  y += 20;
  pdf.text('Name / Date: ____________________', margin, y);
  pdf.text('Name / Date: ____________________', margin + 260, y);
  y += 30;

  // Disclaimer in footer
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('JurisDraft AI Disclaimer: Informational draft only; consult a qualified lawyer for legal execution.', margin, pageHeight - 30);

  pdf.save(`${(doc.title || 'Legal_Agreement').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

// Export as plain text
export function exportToTxt(doc: LegalDocument): void {
  let text = `${doc.title}\n`;
  text += `Jurisdiction: ${doc.jurisdiction || 'General'}\n`;
  text += `========================================================\n\n`;

  if (doc.preamble) {
    text += `${doc.preamble}\n\n`;
  }

  doc.sections.forEach((sec) => {
    text += `${sec.clauseNumber ? sec.clauseNumber + '. ' : ''}${sec.heading}\n`;
    text += `--------------------------------------------------------\n`;
    text += `${sec.content}\n\n`;
  });

  text += `IN WITNESS WHEREOF, the parties hereto have signed.\n\n`;
  text += `Party 1: ${doc.signatures?.partyOneLabel || 'FIRST PARTY'}\nSignature: __________________  Date: ______________\n\n`;
  text += `Party 2: ${doc.signatures?.partyTwoLabel || 'SECOND PARTY'}\nSignature: __________________  Date: ______________\n\n`;
  text += `\n[Disclaimer: This document is an AI-assisted legal draft. Consult a licensed attorney.]`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(doc.title || 'Legal_Agreement').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
