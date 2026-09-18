import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { dbService } from '../../services/db';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Activity
} from 'lucide-react';

export const AdminMetricsDashboard: React.FC = () => {
  const allStudents = dbService.getAllStudents();
  const approvedStudents = allStudents.filter(s => s.status === 'approved');
  const allGrades = dbService.getAllGrades();
  const allActivities = dbService.getActivities();
  const auditLogs = dbService.getAuditLogs();

  // 1. Data for Course Progress (Bar Chart)
  const courseProgressData = useMemo(() => {
    const courses = [
      { id: 'confirmatorio', label: 'Confirmatório', color: '#1e3a5f' },
      { id: 'profissao_fe', label: 'Profissão de Fé', color: '#f59e0b' }
    ];

    return courses.map(course => {
      const courseStudents = approvedStudents.filter(s => s.courseType === course.id);
      if (courseStudents.length === 0) return { name: course.label, progresso: 0, color: course.color };

      let totalPossible = 0;
      let totalCompleted = 0;

      courseStudents.forEach(student => {
        const studentActivities = allActivities.filter(a => a.courseId === student.courseType && a.published);
        const studentGrades = allGrades.filter(g => g.studentId === student.id);
        
        totalPossible += studentActivities.length;
        totalCompleted += studentGrades.length;
      });

      return {
        name: course.label,
        progresso: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
        color: course.color
      };
    });
  }, [approvedStudents, allActivities, allGrades]);

  // 2. Data for Student Status (Pie Chart)
  const statusData = useMemo(() => {
    const statusCounts = allStudents.reduce((acc: any, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Aprovados', value: statusCounts['approved'] || 0, color: '#10b981' },
      { name: 'Pendentes', value: statusCounts['pending'] || 0, color: '#f59e0b' },
      { name: 'Rejeitados', value: statusCounts['rejected'] || 0, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [allStudents]);

  // 3. Weekly Engagement (Area Chart) - Logins and Submissions last 7 days
  const engagementData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short' });

      const logins = auditLogs.filter(log => 
        (log.action === 'login_success' || log.action === 'login') && 
        log.timestamp.startsWith(dateStr)
      ).length;

      const submissions = allGrades.filter(grade => 
        grade.submittedAt.startsWith(dateStr)
      ).length;

      days.push({
        date: label,
        logins,
        submissoes: submissions
      });
    }
    return days;
  }, [auditLogs, allGrades]);

  // 4. Top Performing Modules (Bar Chart)
  const modulePerformanceData = useMemo(() => {
    const modules = dbService.getModules();
    const stats = modules.map(m => {
      const moduleGrades = allGrades.filter(g => {
        const activity = allActivities.find(a => a.id === g.activityId);
        return activity?.moduleId === m.id;
      });

      if (moduleGrades.length === 0) return { name: m.title, media: 0, count: 0 };

      const avg = moduleGrades.reduce((acc, g) => acc + g.percentage, 0) / moduleGrades.length;
      return {
        name: m.title.length > 15 ? m.title.substring(0, 15) + '...' : m.title,
        media: Math.round(avg),
        count: moduleGrades.length
      };
    }).filter(d => d.count > 0)
      .sort((a, b) => b.media - a.media)
      .slice(0, 5);

    return stats;
  }, [allGrades, allActivities]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1e3a5f]" />
            Métricas de Desempenho e Engajamento
          </h2>
          <p className="text-sm text-slate-500">
            Visão analítica do progresso dos alunos e atividade no sistema.
          </p>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Alunos</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{allStudents.length}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">
            {approvedStudents.length} ativos na plataforma
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Atividades Feitas</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{allGrades.length}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Média de {(allGrades.length / (approvedStudents.length || 1)).toFixed(1)} por aluno
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logins (7 dias)</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {auditLogs.filter(log => (log.action === 'login_success' || log.action === 'login') && 
              new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Interações recentes registradas
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Média de Notas</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {allGrades.length > 0 ? (allGrades.reduce((acc, g) => acc + g.percentage, 0) / allGrades.length).toFixed(1) : '0'}%
          </div>
          <div className="text-[10px] text-purple-600 font-bold mt-1">
            Desempenho acadêmico global
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement History */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1e3a5f]" />
              Engajamento Semanal
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="logins" name="Logins" stroke="#1e3a5f" fillOpacity={1} fill="url(#colorLogins)" strokeWidth={2} />
                <Area type="monotone" dataKey="submissoes" name="Submissões" stroke="#10b981" fillOpacity={1} fill="url(#colorSubs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Progresso por Curso (%)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseProgressData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="progresso" radius={[0, 4, 4, 0]} barSize={40}>
                  {courseProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Modules Performance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Melhor Desempenho por Módulo
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modulePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="media" name="Média de Notas" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Distribuição de Status
            </h3>
          </div>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Award: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
