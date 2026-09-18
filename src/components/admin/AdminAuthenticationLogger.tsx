import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { AuditLog } from '../../types';
import { 
  History, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Calendar, 
  Mail, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Clock,
  Smartphone,
  Globe,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const AdminAuthenticationLogger: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [page, setPage] = useState(1);
  const [clearing, setClearing] = useState(false);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLogs = () => {
      const allLogs = dbService.getAuditLogs();
      // Filter specifically for authentication actions
      const authLogs = allLogs.filter(log => 
        log.action === 'login_success' || 
        log.action === 'login_failure' || 
        log.action === 'login'
      );
      setLogs(authLogs);
      setLoading(false);
    };

    fetchLogs();
    
    // Refresh interval if needed, but dbService has onSnapshot for logs
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm('Tem certeza que deseja apagar permanentemente todos os registros de auditoria e autenticação? Esta ação não pode ser desfeita.')) {
      return;
    }

    setClearing(true);
    try {
      await dbService.clearAuditLogs();
      setLogs([]);
      setPage(1);
    } catch (error) {
      console.error('Falha ao limpar logs:', error);
      alert('Erro ao limpar logs. Verifique sua conexão.');
    } finally {
      setClearing(false);
    }
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = 
        log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'success' && (log.action === 'login_success' || log.action === 'login')) ||
        (statusFilter === 'failure' && log.action === 'login_failure');
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusBadge = (action: string) => {
    if (action === 'login_success' || action === 'login') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
          <ShieldCheck className="w-3 h-3" />
          <span>Sucesso</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
        <ShieldAlert className="w-3 h-3" />
        <span>Falha</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
              <History className="w-3.5 h-3.5" />
              <span>Gerenciamento de Segurança</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              Admin Authentication Logger
            </h2>
            <p className="text-xs text-slate-400">
              Histórico detalhado de autenticação com ferramentas de diagnóstico e limpeza.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              disabled={clearing || logs.length === 0}
              className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition flex items-center gap-1.5 border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearing ? 'Limpando...' : 'Limpar Logs'}</span>
            </button>

            <button
              onClick={() => {
                const data = JSON.stringify(logs, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `auth-logger-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por e-mail ou nome..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition text-sm shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Todos</span>
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'success' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sucessos</span>
          </button>
          <button
            onClick={() => setStatusFilter('failure')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'failure' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Falhas</span>
          </button>
        </div>
      </div>

      {/* Log List */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 italic">
            Carregando eventos de autenticação do Firebase...
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-300">
            Nenhum evento registrado com os filtros atuais.
          </div>
        ) : (
          paginatedLogs.map((log) => (
            <div 
              key={log.id} 
              className={`bg-white rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                log.action === 'login_failure' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    log.action === 'login_failure' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {log.userEmail || log.userName}
                      </span>
                      {getStatusBadge(log.action)}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{log.details?.platform || 'Dispositivo'}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{log.details?.userAgent?.split(' ')[0] || 'Browser'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  {log.action === 'login_failure' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-100/50 px-2.5 py-1 rounded-lg border border-red-200">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{log.details?.error || 'Credenciais Inválidas'}</span>
                    </div>
                  )}
                  {log.action === 'login_success' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sessão Iniciada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition shadow-sm ${
                  page === p 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Maintenance Tip */}
      <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Manutenção de Logs</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Recomendamos limpar os logs periodicamente (ex: a cada 6 meses) para manter o carregamento do painel ágil. 
            Antes de limpar, você pode utilizar a ferramenta de **Exportar** para manter um registro histórico offline em seu computador.
          </p>
        </div>
      </div>
    </div>
  );
};
