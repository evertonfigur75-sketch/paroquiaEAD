import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminRequestsView } from './AdminRequestsView';
import { AdminStudentsView } from './AdminStudentsView';
import { AdminWorshipManagementView } from './AdminWorshipManagementView';
import { AdminContentManagementView } from './AdminContentManagementView';
import { AdminReportsView } from './AdminReportsView';
import { AdminActivitiesView } from './AdminActivitiesView';
import { AdminQuizzesView } from './AdminQuizzesView';
import { AdminCalendarView } from './AdminCalendarView';
import { AdminCustomizationView } from './AdminCustomizationView';
import { AdminMessagingView } from './AdminMessagingView';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminAuthenticationLogger } from './AdminAuthenticationLogger';
import { AdminMetricsDashboard } from './AdminMetricsDashboard';
import { AdminFileManager } from './AdminFileManager';
import { AdminCertificatesView } from './AdminCertificatesView';
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Download,
  FileUp,
  HelpCircle,
  Calendar,
  Palette,
  MessageSquare,
  History,
  Terminal,
  ShieldCheck,
  HardDrive,
  Award,
} from 'lucide-react';
import { AdminScriptsPanel } from './AdminScriptsPanel';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('visao_geral');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedActivityForQuiz, setSelectedActivityForQuiz] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const pendingStudentsCount = dbService
    .getAllStudents()
    .filter((s) => s.status === 'pending').length;

  const pendingWorshipsCount = dbService
    .getAllWorshipRecords()
    .filter((w) => w.status === 'pending').length;

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('alunos');
  };

  const handleNavigateToQuizzes = (activityId: string) => {
    setSelectedActivityForQuiz(activityId);
    setActiveTab('questionarios');
  };

  return (
    <div key={refreshKey} className="space-y-6">
      {/* Tab Navigation Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab('visao_geral')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'visao_geral'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitacoes')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'solicitacoes'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Solicitações</span>
            {pendingStudentsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {pendingStudentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('metricas')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'metricas'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab('alunos')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alunos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Alunos</span>
          </button>

          <button
            onClick={() => setActiveTab('atividades')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'atividades'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Atividades & Anexos</span>
          </button>

          <button
            onClick={() => setActiveTab('questionarios')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'questionarios'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questionários</span>
          </button>

          <button
            onClick={() => setActiveTab('mensagens')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mensagens'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mensagens / Dúvidas</span>
          </button>

          <button
            onClick={() => setActiveTab('calendario')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'calendario'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário de Eventos</span>
          </button>

          <button
            onClick={() => setActiveTab('personalizacao')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'personalizacao'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Personalização & Cores</span>
          </button>

          <button
            onClick={() => setActiveTab('cultos')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cultos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Cultos (Confirmatório)</span>
            {pendingWorshipsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingWorshipsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('conteudos')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'conteudos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Devoções & Avisos</span>
          </button>

          <button
            onClick={() => setActiveTab('relatorios')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'relatorios'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Relatórios & Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('certificados')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'certificados'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificados</span>
          </button>

          <button
            onClick={() => setActiveTab('arquivos')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'arquivos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Arquivos Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoria</span>
          </button>

          <button
            onClick={() => setActiveTab('auth_logs')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'auth_logs'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acessos</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scripts'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Scripts de Sistema</span>
          </button>
        </div>
      </div>

      {/* Render active sub-view */}
      {activeTab === 'visao_geral' && (
        <AdminDashboardOverview
          onNavigate={handleNavigate}
          onSelectStudent={handleSelectStudent}
          onDataChanged={handleRefresh}
        />
      )}

      {activeTab === 'solicitacoes' && <AdminRequestsView onRefresh={handleRefresh} />}

      {activeTab === 'metricas' && <AdminMetricsDashboard />}

      {activeTab === 'alunos' && (
        <AdminStudentsView initialStudentId={selectedStudentId} />
      )}

      {activeTab === 'atividades' && (
        <AdminActivitiesView onNavigateToQuizzes={handleNavigateToQuizzes} />
      )}

      {activeTab === 'questionarios' && (
        <AdminQuizzesView initialActivityId={selectedActivityForQuiz} />
      )}

      {activeTab === 'calendario' && <AdminCalendarView />}

      {activeTab === 'mensagens' && <AdminMessagingView />}

      {activeTab === 'personalizacao' && <AdminCustomizationView />}

      {activeTab === 'cultos' && <AdminWorshipManagementView />}

      {activeTab === 'conteudos' && <AdminContentManagementView />}

      {activeTab === 'relatorios' && <AdminReportsView />}
      
      {activeTab === 'certificados' && <AdminCertificatesView />}

      {activeTab === 'arquivos' && <AdminFileManager />}

      {activeTab === 'logs' && <AdminAuditLogs />}

      {activeTab === 'auth_logs' && <AdminAuthenticationLogger />}

      {activeTab === 'scripts' && <AdminScriptsPanel />}
    </div>
  );
};
