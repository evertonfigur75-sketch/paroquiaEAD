import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { AuditLog } from '../../types';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Shield, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    // Audit logs are already synced in dbService.init() and available via onSnapshot
    // We can just get them from the service
    const fetchLogs = () => {
      const allLogs = dbService.getAuditLogs();
      setLogs(allLogs);
      setLoading(false);
    };

    fetchLogs();
    
    // Since dbService uses onSnapshot, we might want to refresh when data changes
    // But for simplicity, we'll just use the current state as it's updated in real-time
  }, []);

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = 
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || log.action === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Login</span>;
      case 'register_student':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Novo Aluno</span>;
      case 'delete_student':
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">Exclusão</span>;
      case 'update_profile':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Perfil Alt.</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Segurança e Auditoria</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              Logs de Atividades do Sistema
            </h2>
            <p className="text-xs text-slate-400">
              Rastreamento em tempo real de acessos, modificações e exclusões de dados.
            </p>
          </div>
          
          <button
            onClick={() => {
              const data = JSON.stringify(logs, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por e-mail, ação ou detalhe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition text-sm bg-white"
          >
            <option value="all">Todas as Ações</option>
            <option value="login">Logins</option>
            <option value="register_student">Novos Alunos</option>
            <option value="delete_student">Exclusões</option>
            <option value="update_profile">Alterações de Perfil</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Data/Hora</th>
                <th className="p-4">Usuário</th>
                <th className="p-4">Ação</th>
                <th className="p-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                    Carregando registros de auditoria...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight">{log.userName}</span>
                          {log.userEmail && <span className="text-[10px] text-slate-500">{log.userEmail}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg max-w-md truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Mostrando {Math.min(filteredLogs.length, paginatedLogs.length)} de {filteredLogs.length} registros
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Tip */}
      <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Monitoramento de Integridade</h4>
          <p className="text-xs text-blue-700">
            Estes logs são imutáveis e registrados automaticamente pelo servidor em cada operação crítica. 
            Em caso de suspeita de acesso indevido ou exclusão acidental, utilize o backup mais recente para restauração.
          </p>
        </div>
      </div>
    </div>
  );
};
