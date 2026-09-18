import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { dbService } from '../../services/db';
import { Award, CheckCircle2, BookOpen, AlertCircle, FileText, Printer } from 'lucide-react';
import { generateStudentGradesPDF } from '../../utils/pdfReport';

export const StudentGradesView: React.FC<{ onOpenActivity: (id: string) => void }> = ({ onOpenActivity }) => {
  const { studentProfile } = useAuth();
  const { settings } = useAppSettings();

  if (!studentProfile) return null;

  const grades = dbService.getGradesByStudent(studentProfile.id);
  const activities = dbService.getActivities(studentProfile.courseType);
  const congregation = studentProfile.congregationId ? dbService.getCongregations().find(c => c.id === studentProfile.congregationId) : undefined;

  const handleDownloadPDF = () => {
    generateStudentGradesPDF(studentProfile, grades, settings, congregation);
  };

  const avgGrade =
    grades.length > 0
      ? (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(1)
      : '--';

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-400/20 text-purple-200 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Boletim de Instrução Cristã</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">Minhas Notas e Avaliações</h2>
            <p className="text-xs sm:text-sm text-purple-100">
              Acompanhe o rendimento nas atividades bíblicas, doutrinárias e do Catecismo Menor.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-purple-200">
              <span>Média Geral: <strong className="text-white text-sm">{avgGrade}</strong> / 10</span>
              <span>•</span>
              <span>{grades.length} de {activities.length} atividades realizadas</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={grades.length === 0}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-purple-50 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar Boletim Oficial (PDF)</span>
          </button>
        </div>
      </div>

      {grades.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Você ainda não realizou nenhuma atividade avaliativa. Acesse a aba <strong>Módulos e Aulas</strong> para iniciar suas atividades.
        </div>
      ) : (
        <div className="space-y-3">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{grade.activityTitle}</h4>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      grade.percentage >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {grade.percentage}% de acerto
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Enviado em: {new Date(grade.submittedAt).toLocaleDateString('pt-BR')}
                </p>
                {grade.feedback && (
                  <p className="text-xs text-slate-700 italic mt-1">
                    “{grade.feedback}”
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-800 font-display">
                    {grade.score} <span className="text-xs text-slate-400 font-normal">/ {grade.maxScore}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenActivity(grade.activityId)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                >
                  Ver Respostas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
