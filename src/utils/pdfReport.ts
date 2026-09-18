import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Grade, StudentProfile, AppSettings, Congregation } from '../types';

export const generateStudentGradesPDF = (
  student: StudentProfile,
  grades: Grade[],
  settings: AppSettings,
  congregation?: Congregation
) => {
  const doc = new jsPDF();
  const primaryColor = settings.primaryColor || '#1e3a5f';
  const accentColor = settings.accentColor || '#f59e0b';
  
  // 1. Header with "Timbre"
  // Draw a top border/line
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1.5);
  doc.line(20, 25, 190, 25);
  
  // App/Parish Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor);
  doc.text(settings.appName || 'Plataforma de Ensino Luterano', 20, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(settings.appSubtitle || 'Educação Cristã Paroquial', 20, 23);

  // Right side header info (Congregation)
  if (congregation) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(congregation.name, 190, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`${congregation.city} - ${congregation.state}`, 190, 20, { align: 'right' });
  }

  // 2. Title of the Document
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('BOLETIM DE DESEMPENHO DO ALUNO', 105, 45, { align: 'center' });
  
  doc.setDrawColor(accentColor);
  doc.setLineWidth(0.5);
  doc.line(70, 48, 140, 48);

  // 3. Student Info
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  
  const infoY = 60;
  doc.setFont('helvetica', 'bold');
  doc.text('ALUNO(A):', 20, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name.toUpperCase(), 50, infoY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('CURSO:', 20, infoY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(student.courseType === 'confirmatorio' ? 'ENSINO CONFIRMATÓRIO (24 MESES)' : 'PROFISSÃO DE FÉ', 50, infoY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('DATA DE EMISSÃO:', 20, infoY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), 65, infoY + 14);

  // 4. Grades Table
  const tableData = grades.map((g) => [
    g.activityTitle,
    new Date(g.submittedAt).toLocaleDateString('pt-BR'),
    `${g.percentage}%`,
    `${g.score} / ${g.maxScore}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Atividade / Avaliação', 'Data', '% Acerto', 'Nota']],
    body: tableData,
    headStyles: { 
      fillColor: primaryColor as any, 
      textColor: [255, 255, 255], 
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 10,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: { 
      fillColor: [245, 247, 250] 
    },
    margin: { left: 20, right: 20 },
    theme: 'grid'
  });

  // 5. Summary and Signature
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  const avgGrade = (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(1);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text(`MÉDIA GERAL FINAL: ${avgGrade} / 10`, 20, finalY);

  // Signature lines
  const sigY = finalY + 40;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  
  doc.line(30, sigY, 90, sigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Assinatura do Aluno', 60, sigY + 5, { align: 'center' });

  doc.line(120, sigY, 180, sigY);
  doc.text('Responsável / Pastor', 150, sigY + 5, { align: 'center' });

  // 6. Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Este documento é um registro de desempenho gerado pela plataforma IELB Ensino.', 105, 285, { align: 'center' });

  // Save the PDF
  doc.save(`Boletim_${student.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
};
