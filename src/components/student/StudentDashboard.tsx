import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import {
  BookOpen,
  CalendarCheck,
  Award,
  CheckCircle2,
  FileText,
  Video,
  Bookmark,
  Bell,
  Calendar,
  HeartHandshake,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  MessageSquare,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenActivity?: (activityId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenActivity,
}) => {
  const { studentProfile } = useAuth();
  if (!studentProfile) return null;

  const isConfirmatorio = studentProfile.courseType === 'confirmatorio';

  // Fetch student stats
  const grades = dbService.getGradesByStudent(studentProfile.id);
  const worshipRecords = dbService.getWorshipRecordsByStudent(studentProfile.id);
  const approvedWorships = worshipRecords.filter((w) => w.status === 'approved').length;
  const pendingWorships = worshipRecords.filter((w) => w.status === 'pending').length;

  const modules = dbService.getModules(studentProfile.courseType);
  const activities = dbService.getActivities(studentProfile.courseType);
  const catechismAssessments = dbService.getCatechismAssessmentsByStudent(studentProfile.id);
  const memorizedCount = catechismAssessments.filter((c) => c.status === 'Memorizado').length;

  const announcements = dbService.getAnnouncements(studentProfile.courseType);
  const devotions = dbService.getDevotions(studentProfile.courseType);
  const events = dbService.getEvents(studentProfile.congregationId);

  // Calculate average grade
  const avgGrade =
    grades.length > 0
      ? (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(1)
      : '--';

  // Next activity to do
  const submittedActivityIds = new Set(grades.map((g) => g.activityId));
  const nextActivity = activities.find((a) => !submittedActivityIds.has(a.id));

  // Worship percent (target 24)
  const worshipPercentage = Math.min(100, Math.round((approvedWorships / 24) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Student Greeting & Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={
                studentProfile.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
              }
              alt={studentProfile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold" title="Matrícula Ativa">
              ✓
            </span>
          </div>

          <div className="space-y-1 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wide">
              <span>{isConfirmatorio ? 'Ensino Confirmatório (24 meses)' : 'Profissão de Fé'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              Olá, {studentProfile.name.split(' ')[0]}!
            </h2>
            <p className="text-xs text-slate-300">
              {studentProfile.congregationName || 'Paróquia Luterana'}
            </p>
          </div>

          <button
            id="btn-edit-profile-quick"
            onClick={() => onNavigate('perfil')}
            className="self-end sm:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition active:scale-95"
          >
            Meu Perfil
          </button>
        </div>
      </div>

      {/* VISUAL PROGRESS CHART (Section 8) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              Progresso das Atividades
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualização geral da sua jornada no curso
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-emerald-600">
              {Math.round((grades.length / Math.max(1, activities.length)) * 100)}%
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Concluído
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Concluídas', value: grades.length },
                    { name: 'Pendentes', value: Math.max(0, activities.length - grades.length) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-[11px] font-bold text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  Atividades Feitas
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {grades.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Total do Curso
                </div>
                <div className="text-2xl font-bold text-slate-700">
                  {activities.length}
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Mantenha o foco!</p>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Faltam apenas {Math.max(0, activities.length - grades.length)} atividades para você concluir esta etapa do seu aprendizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS (Sections 8 & 35) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Meu Curso */}
        <div
          onClick={() => onNavigate('curso')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Meu Curso
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 truncate">
              {isConfirmatorio ? 'Confirmatório' : 'Profissão de Fé'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {modules.length} módulos disponíveis
            </p>
          </div>
        </div>

        {/* Card 2: Presenças nos Cultos (Exclusive to Confirmandos / 24 months) */}
        {isConfirmatorio ? (
          <div
            onClick={() => onNavigate('cultos')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Presenças
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-emerald-700">
                  {approvedWorships}/24
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  ({worshipPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${worshipPercentage}%` }}
                />
              </div>
              {pendingWorships > 0 && (
                <p className="text-[10px] text-amber-600 font-medium mt-1">
                  {pendingWorships} aguardando aprovação
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('curso')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Meu Progresso
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {grades.length} / {activities.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Atividades concluídas</p>
            </div>
          </div>
        )}

        {/* Card 3: Minha Média */}
        <div
          onClick={() => onNavigate('notas')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Minha Média
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {avgGrade} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {grades.length} {grades.length === 1 ? 'avaliação' : 'avaliações'}
            </p>
          </div>
        </div>

        {/* Card 4: Catecismo Menor */}
        <div
          onClick={() => onNavigate('catecismo')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Catecismo
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {memorizedCount} memorizados
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">8 seções completas</p>
          </div>
        </div>

        {/* Card 5: Dúvidas ao Pastor */}
        <div
          onClick={() => onNavigate('mensagens')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Suporte
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">
              Dúvidas?
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pergunte ao Pastor</p>
          </div>
        </div>
      </div>

      {/* Próxima Atividade & Culto Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Próxima Atividade */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Próxima Atividade
            </h3>
            <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              Avaliativa
            </span>
          </div>

          {nextActivity ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{nextActivity.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{nextActivity.description}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {nextActivity.questions.length} questões • Nota máx: {nextActivity.maxScore}
                </span>
                <button
                  onClick={() => onOpenActivity?.(nextActivity.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                >
                  Responder Agora
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Você concluiu todas as atividades disponíveis até o momento! Parabéns.</span>
            </div>
          )}
        </div>

        {/* Registro do Culto Rápido (para confirmandos) */}
        {isConfirmatorio && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Presença nos Cultos
              </h3>
              <span className="text-[11px] font-bold text-slate-700">
                Meta: 24 cultos
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/70 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Participei de um culto recente
              </h4>
              <p className="text-xs text-slate-600">
                Envie a leitura bíblica, o resumo da mensagem pastoral e uma foto do folheto ou da igreja para comprovação.
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => onNavigate('cultos')}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Registrar Culto</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Novos Avisos & Próximos Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avisos */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              Novos Avisos
            </h3>
            <button
              onClick={() => onNavigate('avisos')}
              className="text-xs text-amber-700 font-semibold hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5">
            {announcements.slice(0, 2).map((ann) => (
              <div
                key={ann.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-600" />
              Próximos Eventos
            </h3>
            <button
              onClick={() => onNavigate('eventos')}
              className="text-xs text-sky-700 font-semibold hover:underline"
            >
              Agenda completa
            </button>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 2).map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>📅 {evt.date} às {evt.time}</span>
                    <span>📍 {evt.location}</span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
