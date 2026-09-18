import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { StudentProfile } from '../../types';
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck,
  BookOpen,
  Award,
  Filter,
  Church,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  BarChart3,
  TrendingUp,
  BookmarkCheck,
  X,
  FileUp,
  HelpCircle,
  Calendar,
  Palette,
  Database,
  Download,
  Save,
  MessageSquare,
  History,
  Terminal,
  HardDrive,
  Activity as ActivityIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModuleCompletionChart } from './ModuleCompletionChart';

interface AdminDashboardOverviewProps {
  onNavigate: (tab: string, filter?: string) => void;
  onSelectStudent?: (studentId: string) => void;
  onDataChanged?: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigate,
  onSelectStudent,
  onDataChanged,
}) => {
  const { currentUser } = useAuth();
  const [selectedCongregation, setSelectedCongregation] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectModalStudent, setRejectModalStudent] = useState<StudentProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalStudent, setDetailModalStudent] = useState<StudentProfile | null>(null);

  const congregations = dbService.getCongregations();
  const allStudents = dbService.getAllStudents();
  const allWorships = dbService.getAllWorshipRecords();
  const allGrades = dbService.getAllGrades();

  // Filter students if congregation selected
  const students =
    selectedCongregation === 'all'
      ? allStudents
      : allStudents.filter((s) => s.congregationId === selectedCongregation);

  const pendingStudents = students.filter((s) => s.status === 'pending');
  const approvedStudents = students.filter((s) => s.status === 'approved');
  const confirmatorioStudents = students.filter((s) => s.courseType === 'confirmatorio');
  const profissaoFeStudents = students.filter((s) => s.courseType === 'profissao_fe');

  const worships =
    selectedCongregation === 'all'
      ? allWorships
      : allWorships.filter((w) => w.congregationId === selectedCongregation);

  const pendingWorships = worships.filter((w) => w.status === 'pending');
  const approvedWorships = worships.filter((w) => w.status === 'approved');

  // Basic Statistics Calculations
  const averageGrade =
    allGrades.length > 0
      ? (allGrades.reduce((acc, g) => acc + (g.percentage || 0), 0) / allGrades.length).toFixed(1)
      : '0.0';

  // Congregation Distribution Stats
  const congregationStats = congregations.map((cong) => {
    const congStudents = allStudents.filter((s) => s.congregationId === cong.id);
    const approvedInCong = congStudents.filter((s) => s.status === 'approved').length;
    const pendingInCong = congStudents.filter((s) => s.status === 'pending').length;
    return {
      ...cong,
      totalCount: congStudents.length,
      approvedCount: approvedInCong,
      pendingCount: pendingInCong,
      percent: allStudents.length > 0 ? Math.round((congStudents.length / allStudents.length) * 100) : 0,
    };
  });

  // Worship Attendance Stats (Exclusive to Confirmandos - 24 months)
  const approvedConfirmandos = approvedStudents.filter((s) => s.courseType === 'confirmatorio');
  const totalWorshipsPossible = approvedConfirmandos.length * 24;
  const worshipCompletionRate =
    totalWorshipsPossible > 0
      ? Math.min(100, Math.round((approvedWorships.length / totalWorshipsPossible) * 100))
      : 0;

  // Catechism Memorization Stats
  const allAssessments = dbService.getAllCatechismAssessments();
  const memorizedCount = allAssessments.filter((a) => a.status === 'Memorizado').length;
  const inProgressCount = allAssessments.filter((a) => a.status === 'Em andamento').length;

  const handleApprove = async (student: StudentProfile) => {
    await dbService.approveStudent(student.id);
    setFeedbackMsg({
      type: 'success',
      text: `Inscrição de ${student.name} aprovada com sucesso! O acesso do aluno foi liberado.`,
    });
    onDataChanged?.();
  };

  const handleConfirmReject = async () => {
    if (!rejectModalStudent) return;
    await dbService.rejectStudent(rejectModalStudent.id, rejectReason || 'Solicitação não aprovada pela paróquia.');
    setFeedbackMsg({
      type: 'error',
      text: `A inscrição de ${rejectModalStudent.name} foi recusada com justificativa pastoral registrada.`,
    });
    setRejectModalStudent(null);
    setRejectReason('');
    onDataChanged?.();
  };

  const handleBackup = async () => {
    try {
      setFeedbackMsg({ type: 'success', text: 'Sincronizando dados e validando integridade... Aguarde.' });
      const backupJson = await dbService.getFullBackup();
      const parsedData = JSON.parse(backupJson);
      
      // Validação de integridade
      const validation = dbService.validateBackupData(parsedData);
      if (!validation.valid) {
        setFeedbackMsg({ type: 'error', text: `Falha na integridade: ${validation.error}` });
        return;
      }
      
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_pel_verificado_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setFeedbackMsg({ type: 'success', text: 'Backup verificado e baixado com sucesso!' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (e) {
      console.error(e);
      setFeedbackMsg({ type: 'error', text: 'Erro crítico ao gerar backup. Tente novamente.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Pastor Greeting Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Painel Geral do Administrador</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              Pastor Everton Figur
            </h2>
            <p className="text-xs text-amber-200">
              Paróquia Evangélica Luterana • Ensino Confirmatório & Profissão de Fé
            </p>
          </div>

          {/* Congregation quick filter */}
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/15 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filtrar por Congregação
              </label>
              <select
                value={selectedCongregation}
                onChange={(e) => setSelectedCongregation(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl bg-slate-900/90 text-white text-xs border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">Todas as 7 Congregações ({allStudents.length} alunos)</option>
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs transition ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Alerts if Pending Items Exist */}
      {(pendingStudents.length > 0 || pendingWorships.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingStudents.length > 0 && (
            <div
              onClick={() => {
                const element = document.getElementById('pending-requests-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('solicitacoes');
                }
              }}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">
                    {pendingStudents.length} {pendingStudents.length === 1 ? 'Solicitação Pendente' : 'Solicitações Pendentes'}
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Novos alunos aguardando análise e homologação pastoral abaixo.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-700" />
            </div>
          )}

          {pendingWorships.length > 0 && (
            <div
              onClick={() => onNavigate('cultos')}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between cursor-pointer hover:bg-emerald-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {pendingWorships.length} {pendingWorships.length === 1 ? 'Culto para Homologar' : 'Cultos para Homologar'}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Comprovantes e resumos dominicais enviados pelos confirmandos.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-700" />
            </div>
          )}
        </div>
      )}

      {/* 1. CARDS DE RESUMO (SUMMARY CARDS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-display flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#1e3a5f]" />
            <span>Indicadores Resumo da Paróquia</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {selectedCongregation === 'all'
              ? 'Todos os polos paroquiais'
              : congregations.find((c) => c.id === selectedCongregation)?.name}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Alunos */}
          <div
            onClick={() => onNavigate('alunos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Alunos
              </span>
              <Users className="w-4 h-4 text-[#1e3a5f]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {students.length}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
              <span>{approvedStudents.length} ativos</span>
              {pendingStudents.length > 0 && (
                <span className="text-amber-600">({pendingStudents.length} pend.)</span>
              )}
            </div>
          </div>

          {/* Solicitações Pendentes */}
          <div
            onClick={() => {
              const element = document.getElementById('pending-requests-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                onNavigate('solicitacoes');
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Solicitações
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600 font-display">
              {pendingStudents.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Aguardam autorização</p>
          </div>

          {/* Confirmatório */}
          <div
            onClick={() => onNavigate('alunos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Confirmatório
              </span>
              <BookOpen className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {confirmatorioStudents.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Jovens (2 anos)</p>
          </div>

          {/* Profissão de Fé */}
          <div
            onClick={() => onNavigate('alunos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Profissão Fé
              </span>
              <Award className="w-4 h-4 text-sky-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {profissaoFeStudents.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Adultos / Membros</p>
          </div>

          {/* Cultos Fila */}
          <div
            onClick={() => onNavigate('cultos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Cultos Fila
              </span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-display">
              {pendingWorships.length}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {approvedWorships.length} aprovados
            </p>
          </div>

          {/* Média de Avaliações */}
          <div
            onClick={() => onNavigate('conteudos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Média Geral
              </span>
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800 font-display">
              {averageGrade}%
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {allGrades.length} testes feitos
            </p>
          </div>
        </div>
      </div>

      {/* QUICK MANAGEMENT ACCESS: ATIVIDADES, QUESTIONÁRIOS, CALENDÁRIO & BRANDING */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-display flex items-center gap-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#1e3a5f]" />
            <span>Ferramentas de Gestão Pastoral & Paroquial</span>
          </h3>
          <button 
            onClick={async () => {
              if (window.confirm('Deseja realizar um backup manual de segurança agora? Os dados serão salvos no Firebase Storage e Google Drive.')) {
                try {
                  const idToken = await currentUser?.getIdToken();
                  
                  setFeedbackMsg({ type: 'success', text: 'Iniciando backup manual em segundo plano...' });
                  
                  // Trigger Firestore Snapshot
                  const snapshotPromise = fetch('/api/admin/backups/trigger', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${idToken}` }
                  });

                  // Trigger Drive Backup (via local client since it needs Drive auth)
                  // Note: handleExportToDrive is in ReportsView, but we can call it if we extract it or just rely on server backup
                  
                  await snapshotPromise;
                  setFeedbackMsg({ type: 'success', text: 'Backup de segurança (Cloud Snapshot) concluído com sucesso!' });
                } catch (err) {
                  setFeedbackMsg({ type: 'error', text: 'Erro ao processar backup manual.' });
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#1e3a5f] hover:text-white text-slate-600 text-[10px] font-bold transition border border-slate-200"
          >
            <Database className="w-3 h-3" />
            <span>Backup Manual Agora</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Atividades & Upload */}
          <div
            onClick={() => onNavigate('atividades')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#1e3a5f] hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center font-bold group-hover:scale-105 transition">
                <FileUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {dbService.getActivities().length} cadastradas
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Upload de Atividades
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Envie apostilas, PDFs e exercícios com instruções e prazos.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1e3a5f] flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Gerenciar atividades</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Questionários Múltipla Escolha */}
          <div
            onClick={() => onNavigate('questionarios')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-600 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                Interativo
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Questionários Múltipla Escolha
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Monte testes com gabarito oficial, pontuação e simulador.
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Editar perguntas</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Calendário de Eventos */}
          <div
            onClick={() => onNavigate('calendario')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-600 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                {dbService.getEvents().length} eventos
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Calendário de Eventos
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Agende cultos especiais, encontros de confirmandos e retiros.
              </p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Abrir calendário</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Métricas de Desempenho */}
          <div
            onClick={() => onNavigate('metricas')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#1e3a5f] hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-50 text-[#1e3a5f] flex items-center justify-center font-bold group-hover:scale-105 transition">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Analytics
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Métricas de Desempenho
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Gráficos de engajamento, progresso e estatísticas de conclusão.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1e3a5f] flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Ver dashboards</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Canal de Dúvidas / Mensagens */}
          <div
            onClick={() => onNavigate('mensagens')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-600 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                Suporte Direto
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Dúvidas dos Alunos
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Responda perguntas e interaja com os alunos em tempo real.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Abrir canal de mensagens</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Gerenciador de Arquivos Drive */}
          <div
            onClick={() => onNavigate('arquivos')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Google Drive
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Arquivos do Google Drive
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Gerencie materiais didáticos, organize pastas e exclua arquivos do Drive.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Gerenciar arquivos</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Backup de Segurança */}
          <div
            onClick={handleBackup}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Segurança
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Backup de Segurança
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Baixe uma cópia completa de todos os dados dos catecúmenos para segurança local.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <Download className="w-3 h-3 group-hover:translate-y-0.5 transition" />
              <span>Realizar Backup agora</span>
            </span>
          </div>

          {/* Auditoria e Logs de Sistema */}
          <div
            onClick={() => onNavigate('logs')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-800 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <History className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Audit Log
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Auditoria e Logs
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Histórico de acessos, cadastros, exclusões e modificações.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Ver registros</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Monitor de Acessos e Falhas */}
          <div
            onClick={() => onNavigate('auth_logs')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-600 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                Security
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Monitor de Acessos
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Diagnostique falhas de login e tentativas de acesso de alunos.
              </p>
            </div>
            <span className="text-[11px] font-bold text-red-700 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Verificar problemas</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Personalização: Cor, Logo e Nome */}
          <div
            onClick={() => onNavigate('personalizacao')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-600 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Identidade Visual
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Cores, Logo & Nome
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Modifique a paleta de cores, faça upload do brasão e renomeie o app.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Personalizar visual</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>

          {/* Scripts de Sistema */}
          <div
            onClick={() => onNavigate('scripts')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-900 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold group-hover:scale-105 transition">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Developer Console
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Scripts de Sistema
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                Execute rotinas de manutenção, disparos e auditoria.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1 pt-1 border-t border-slate-100">
              <span>Abrir terminal</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. LISTAGEM DE SOLICITAÇÕES PENDENTES */}
      <div id="pending-requests-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Solicitações Pendentes de Inscrição</span>
            </h3>
            {pendingStudents.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                {pendingStudents.length} aguardando
              </span>
            )}
          </div>
          {pendingStudents.length > 0 && (
            <button
              onClick={() => onNavigate('solicitacoes')}
              className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>Gerenciar na fila completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {pendingStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Todas as inscrições estão em dia
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não há novos pedidos de inscrição aguardando análise pastoral para o filtro selecionado. Novos cadastros aparecerão instantaneamente aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingStudents.map((student) => (
              <div
                key={student.id}
                className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs hover:border-amber-300 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          student.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={student.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{student.name}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              student.courseType === 'confirmatorio'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {student.courseType === 'confirmatorio' ? 'Confirmatório' : 'Profissão de Fé'}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Church className="w-3 h-3 text-slate-400" />
                            {student.congregationName || 'Paróquia'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailModalStudent(student)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Ver ficha cadastral completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Detalhes de Batismo e Contato */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Batizado(a):</span>
                      <span className="font-semibold text-slate-800">
                        {student.baptism?.isBaptized ? (
                          <span className="text-emerald-700">
                            Sim ({student.baptism.church || 'Igreja informada'})
                          </span>
                        ) : (
                          <span className="text-amber-700">Não (Requer Batismo)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Contato:</span>
                      <span className="font-semibold text-slate-700">
                        {student.phone || student.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Localidade:</span>
                      <span className="font-semibold text-slate-700">
                        {student.city ? `${student.city} - ${student.state || 'RS'}` : 'Paróquia'}
                      </span>
                    </div>

                    {student.churchHistory && student.churchHistory.length > 0 && (
                      <div className="text-[11px] pt-1 border-t border-slate-200/60 text-slate-600">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                          Histórico Eclesiástico:
                        </span>
                        <p className="italic line-clamp-1">
                          {student.churchHistory[0].churchName} ({student.churchHistory[0].city})
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Decisão Pastoral */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleApprove(student)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar Matrícula</span>
                  </button>

                  <button
                    onClick={() => setRejectModalStudent(student)}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition flex items-center justify-center gap-1"
                    title="Recusar inscrição"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. ESTATÍSTICAS BÁSICAS E DESEMPENHO PAROQUIAL */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1e3a5f]" />
          <span>Estatísticas e Distribuição Paroquial</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribuição por Congregação */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-[#1e3a5f]" />
                  <span>Distribuição por Congregação</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Total de alunos matriculados nas 7 comunidades da paróquia
                </p>
              </div>
              <span className="text-xs font-bold text-[#1e3a5f]">
                {allStudents.length} Alunos Totais
              </span>
            </div>

            <div className="space-y-3">
              {congregationStats.map((cong) => (
                <div key={cong.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{cong.name}</span>
                      <span className="text-[10px] text-slate-400">({cong.city})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold text-slate-700">{cong.totalCount} alunos</span>
                      <span className="text-slate-400">({cong.percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1e3a5f] to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cong.percent, cong.totalCount > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas de Formação & Cultos */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>Metas e Engajamento</span>
            </h4>

            {/* Presença nos 24 Cultos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Cumprimento dos 24 Cultos (Confirmatório)</span>
                <span className="font-bold text-emerald-700">{worshipCompletionRate}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${worshipCompletionRate}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {approvedWorships.length} cultos aprovados de {totalWorshipsPossible} esperados para os confirmandos ativos ({approvedConfirmandos.length} alunos).
              </p>
            </div>

            {/* Proporção de Cursos */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Proporção por Curso</span>
                <span className="text-[11px] text-slate-500">
                  {confirmatorioStudents.length} Conf. / {profissaoFeStudents.length} Prof.
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-amber-600"
                  style={{
                    width: `${
                      students.length > 0 ? (confirmatorioStudents.length / students.length) * 100 : 50
                    }%`,
                  }}
                  title="Confirmatório"
                />
                <div
                  className="h-full bg-sky-600"
                  style={{
                    width: `${
                      students.length > 0 ? (profissaoFeStudents.length / students.length) * 100 : 50
                    }%`,
                  }}
                  title="Profissão de Fé"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  Confirmatório ({confirmatorioStudents.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                  Profissão de Fé ({profissaoFeStudents.length})
                </span>
              </div>
            </div>

            {/* Catecismo Menor */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Catecismo Menor</span>
                <span className="text-[11px] font-bold text-amber-700">
                  {memorizedCount} partes memorizadas
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {inProgressCount} seções com estudo em andamento entre os alunos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. GRÁFICOS DE DESEMPENHO (RECHARTS) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#1e3a5f]" />
          <span>Análise de Conclusão de Módulos</span>
        </h3>
        <ModuleCompletionChart />
      </div>

      {/* Recentes Alunos e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alunos Recentes */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1e3a5f]" />
              <span>Alunos Recentes na Paróquia</span>
            </h3>
            <button
              onClick={() => onNavigate('alunos')}
              className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Ver todos ({students.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {students.slice(0, 5).map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectStudent?.(st.id)}
                className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      st.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={st.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          st.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {st.status === 'approved'
                          ? 'Aprovado'
                          : st.status === 'pending'
                          ? 'Pendente'
                          : st.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {st.congregationName} •{' '}
                      {st.courseType === 'confirmatorio' ? 'Confirmatório' : 'Profissão de Fé'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Abrir ficha</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu de Ações Rápidas do Pastor */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
            Ações Rápidas
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('solicitacoes')}
              className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition flex items-center justify-between text-xs font-bold text-amber-950"
            >
              <span>Gerenciar Solicitações</span>
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center">
                {pendingStudents.length}
              </span>
            </button>

            <button
              onClick={() => onNavigate('cultos')}
              className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition flex items-center justify-between text-xs font-bold text-emerald-950"
            >
              <span>Revisar Presenças de Cultos</span>
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                {pendingWorships.length}
              </span>
            </button>

            <button
              onClick={() => onNavigate('conteudos')}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between text-xs font-semibold text-slate-800"
            >
              <span>Novo Aviso ou Devoção</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('relatorios')}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between text-xs font-semibold text-slate-800"
            >
              <span>Relatórios e Backup do Sistema</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Recusa */}
      {rejectModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Recusar Inscrição
              </h3>
              <button
                onClick={() => setRejectModalStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a recusar a inscrição de{' '}
              <strong className="text-slate-900">{rejectModalStudent.name}</strong>. Informe a orientação pastoral ou motivo:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo / Justificativa Pastoral:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex.: Necessário conversar com os pais pessoalmente antes do início do curso..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes Rápidos do Candidato */}
      {detailModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    detailModalStudent.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={detailModalStudent.name}
                  className="w-12 h-12 rounded-2xl object-cover border"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {detailModalStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500">{detailModalStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalStudent(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Curso:</span>
                  <span className="font-semibold text-slate-900">
                    {detailModalStudent.courseType === 'confirmatorio'
                      ? 'Ensino Confirmatório'
                      : 'Profissão de Fé'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Congregação:</span>
                  <span className="font-semibold text-slate-900">
                    {detailModalStudent.congregationName || 'Paróquia'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Telefone:</span>
                  <span>{detailModalStudent.phone || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Nascimento:</span>
                  <span>{detailModalStudent.birthDate || 'Não informado'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Registro de Batismo:
                </span>
                <p>
                  <strong>Status:</strong>{' '}
                  {detailModalStudent.baptism?.isBaptized ? 'Já é batizado(a)' : 'Não batizado(a)'}
                </p>
                {detailModalStudent.baptism?.church && (
                  <p>
                    <strong>Igreja do Batismo:</strong> {detailModalStudent.baptism.church}
                  </p>
                )}
                {detailModalStudent.baptism?.date && (
                  <p>
                    <strong>Data:</strong> {detailModalStudent.baptism.date}
                  </p>
                )}
                {detailModalStudent.baptism?.city && (
                  <p>
                    <strong>Cidade:</strong> {detailModalStudent.baptism.city}
                  </p>
                )}
                {detailModalStudent.baptism?.notes && (
                  <p className="italic text-slate-500">
                    “{detailModalStudent.baptism.notes}”
                  </p>
                )}
              </div>

              {detailModalStudent.street && (
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Endereço Residencial:
                  </span>
                  <p>
                    {detailModalStudent.street}, {detailModalStudent.number}{' '}
                    {detailModalStudent.complement ? `(${detailModalStudent.complement})` : ''} -{' '}
                    {detailModalStudent.neighborhood}, {detailModalStudent.city} - {detailModalStudent.state}
                  </p>
                  {detailModalStudent.cep && (
                    <p className="text-slate-500">CEP: {detailModalStudent.cep}</p>
                  )}
                </div>
              )}

              {detailModalStudent.churchHistory && detailModalStudent.churchHistory.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Histórico Religioso / Outras Igrejas:
                  </span>
                  {detailModalStudent.churchHistory.map((ch, idx) => (
                    <div key={ch.id || idx} className="p-2 bg-white rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-800">{ch.churchName}</p>
                      <p className="text-slate-500">{ch.city} - {ch.state} • {ch.period}</p>
                      {ch.notes && <p className="italic text-slate-600 mt-0.5">{ch.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setDetailModalStudent(null);
                  handleApprove(detailModalStudent);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprovar Matrícula</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
