import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { StudentProfile, CourseType, Grade, WorshipRecord, CatechismAssessment } from '../../types';
import { 
  Award, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users,
  ChevronRight,
  FileText,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export const AdminCertificatesView: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<'all' | CourseType>('all');
  const [loading, setLoading] = useState(true);

  // Stats for the selected student in modal
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [studentWorships, setStudentWorships] = useState<WorshipRecord[]>([]);
  const [studentAssessments, setStudentAssessments] = useState<CatechismAssessment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allStudents = dbService.getAllStudents();
      setStudents(allStudents.filter(s => s.status === 'approved'));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSelectStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setStudentGrades(dbService.getGradesByStudent(student.id));
    setStudentWorships(dbService.getWorshipRecordsByStudent(student.id).filter(w => w.status === 'approved'));
    setStudentAssessments(dbService.getCatechismAssessmentsByStudent(student.id));
  };

  const generateCertificate = (student: StudentProfile) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background decoration
    doc.setDrawColor(30, 58, 95); // #1e3a5f
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Header
    doc.setTextColor(30, 58, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('A Paróquia Planalto da Igreja Evangélica de Confissão Luterana no Brasil', pageWidth / 2, 60, { align: 'center' });
    doc.text('confere o presente certificado a:', pageWidth / 2, 70, { align: 'center' });

    // Student Name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // #f59e0b
    doc.text(student.name.toUpperCase(), pageWidth / 2, 90, { align: 'center' });

    // Body
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    
    const courseName = student.courseType === 'confirmatorio' ? 'ENSINO CONFIRMATÓRIO' : 'PROFISSÃO DE FÉ';
    const text = `Por ter concluído com aproveitamento todas as etapas do curso de ${courseName}, cumprindo os requisitos de estudos bíblicos, doutrina luterana e vida comunitária.`;
    
    const splitText = doc.splitTextToSize(text, pageWidth - 60);
    doc.text(splitText, pageWidth / 2, 110, { align: 'center' });

    // Footer info
    const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(14);
    doc.text(`Planalto, PR - ${date}`, pageWidth / 2, 140, { align: 'center' });

    // Signature lines
    doc.setDrawColor(150, 150, 150);
    doc.line(40, 175, 120, 175);
    doc.line(174, 175, 254, 175);

    doc.setFontSize(12);
    doc.text('Pastor Everton Figur', 80, 182, { align: 'center' });
    doc.text('Responsável pela Congregação', 214, 182, { align: 'center' });

    // Seal or Logo placeholder (Luther Rose circle)
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1);
    doc.circle(pageWidth / 2, 170, 15);
    doc.setFontSize(10);
    doc.text('PEL', pageWidth / 2, 172, { align: 'center' });

    doc.save(`certificado_${student.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || s.courseType === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const getCompletionPercentage = (student: StudentProfile) => {
    // Simple logic for visual display
    const grades = dbService.getGradesByStudent(student.id);
    const activities = dbService.getActivities(student.courseType);
    if (activities.length === 0) return 100;
    return Math.round((grades.length / activities.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
              Área do Pastor / Certificados
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Geração de Certificados
          </h2>
          <p className="text-xs sm:text-sm text-purple-100">
            Emita certificados oficiais de conclusão para os catecúmenos que finalizaram suas jornadas de ensino.
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-xl font-bold leading-none">{students.length}</p>
            <p className="text-[10px] text-purple-200 uppercase font-bold">Alunos Aptos</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aluno apto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-purple-500 outline-hidden text-sm bg-white shadow-xs"
          />
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
          <button
            onClick={() => setCourseFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none ${
              courseFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setCourseFilter('confirmatorio')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none ${
              courseFilter === 'confirmatorio' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Confirmatório
          </button>
          <button
            onClick={() => setCourseFilter('profissao_fe')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none ${
              courseFilter === 'profissao_fe' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Profissão de Fé
          </button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const completion = getCompletionPercentage(student);
          const worshipCount = dbService.getApprovedWorshipCount(student.id);
          
          return (
            <div
              key={student.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm font-display truncate">
                      {student.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      {student.courseType === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Atividades Concluídas</span>
                    <span className="font-bold text-slate-900">{completion}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${completion}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Presenças</p>
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className={`w-3 h-3 ${worshipCount >= 24 ? 'text-emerald-500' : 'text-amber-500'}`} />
                      {worshipCount}/24
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Média</p>
                    <p className="text-xs font-bold text-slate-700">
                      {(studentGrades.reduce((acc, g) => acc + g.percentage, 0) / (studentGrades.length || 1)).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => generateCertificate(student)}
                className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Emitir Certificado</span>
              </button>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500">Nenhum aluno encontrado ou apto.</p>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 space-y-1">
          <p className="font-bold">Dica para Emissão:</p>
          <p>
            O certificado utiliza o nome completo cadastrado pelo aluno. Certifique-se de que o progresso está correto antes da emissão formal.
          </p>
        </div>
      </div>
    </div>
  );
};
