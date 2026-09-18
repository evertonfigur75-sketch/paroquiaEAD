import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { dbService } from '../../services/db';

interface ChartData {
  name: string;
  completion: number;
  totalStudents: number;
}

export const ModuleCompletionChart: React.FC = () => {
  const allStudents = dbService.getAllStudents().filter(s => s.status === 'approved');
  const allGrades = dbService.getAllGrades();
  const allActivities = dbService.getActivities();
  const congregations = dbService.getCongregations();

  // Calculate stats by congregation
  const data: ChartData[] = congregations.map(cong => {
    const congStudents = allStudents.filter(s => s.congregationId === cong.id);
    if (congStudents.length === 0) return { name: cong.name, completion: 0, totalStudents: 0 };

    let totalPossible = 0;
    let totalCompleted = 0;

    congStudents.forEach(student => {
      const studentCourseActivities = allActivities.filter(a => a.courseId === student.courseType && a.published);
      const studentCompletedActivities = allGrades.filter(g => g.studentId === student.id);
      
      totalPossible += studentCourseActivities.length;
      totalCompleted += studentCompletedActivities.length;
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      name: cong.name,
      completion: completionRate,
      totalStudents: congStudents.length
    };
  }).filter(d => d.totalStudents > 0);

  // Stats by Course Type
  const courseData: ChartData[] = [
    { id: 'confirmatorio', label: 'Ensino Confirmatório' },
    { id: 'profissao_fe', label: 'Profissão de Fé' }
  ].map(course => {
    const courseStudents = allStudents.filter(s => s.courseType === course.id);
    if (courseStudents.length === 0) return { name: course.label, completion: 0, totalStudents: 0 };

    let totalPossible = 0;
    let totalCompleted = 0;

    courseStudents.forEach(student => {
      const studentCourseActivities = allActivities.filter(a => a.courseId === student.courseType && a.published);
      const studentCompletedActivities = allGrades.filter(g => g.studentId === student.id);
      
      totalPossible += studentCourseActivities.length;
      totalCompleted += studentCompletedActivities.length;
    });

    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      name: course.label,
      completion: completionRate,
      totalStudents: courseStudents.length
    };
  });

  const colors = ['#1e3a5f', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display mb-6 flex items-center gap-2">
          <span>Conclusão de Módulos por Congregação</span>
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                unit="%"
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="completion" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display mb-6 flex items-center gap-2">
          <span>Conclusão de Módulos por Nível de Ensino</span>
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={courseData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="completion" radius={[0, 4, 4, 0]} barSize={30}>
                <Cell fill="#1e3a5f" />
                <Cell fill="#f59e0b" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
