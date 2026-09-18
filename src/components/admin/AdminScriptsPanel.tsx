import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Database, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';

interface ScriptTask {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  color: string;
}

const SCRIPTS: ScriptTask[] = [
  {
    id: 'backup',
    name: 'Backup Geral do Banco de Dados',
    description: 'Realiza um snapshot completo do Firestore e salva no Cloud Storage.',
    icon: <Database className="w-5 h-5" />,
    endpoint: '/api/admin/backups/trigger',
    color: 'blue'
  },
  {
    id: 'reminders',
    name: 'Disparar Lembretes de Atividades',
    description: 'Verifica prazos e envia e-mails/notificações para alunos com tarefas pendentes.',
    icon: <Mail className="w-5 h-5" />,
    endpoint: '/api/admin/reminders/trigger',
    color: 'indigo'
  },
  {
    id: 'notify_all',
    name: 'Enviar Notificação de Sistema',
    description: 'Envia um push genérico para todos os alunos cadastrados.',
    icon: <Activity className="w-5 h-5" />,
    endpoint: '/api/notify',
    color: 'emerald'
  }
];

export const AdminScriptsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const runScript = async (script: ScriptTask) => {
    setRunning(script.id);
    
    try {
      // For push notification, we need a title/body, so we use a prompt
      let body = {};
      if (script.id === 'notify_all') {
        const title = prompt('Título da Notificação:');
        const text = prompt('Mensagem:');
        if (!title || !text) {
          setRunning(null);
          return;
        }
        body = { title, body: text };
      }

      const idToken = await (window as any).firebaseAuth?.currentUser?.getIdToken();
      
      const response = await fetch(script.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({
          ...prev,
          [script.id]: { success: true, message: data.message || 'Script executado com sucesso.' }
        }));
        await dbService.logAction('script_execution', { script: script.id, success: true });
      } else {
        setResults(prev => ({
          ...prev,
          [script.id]: { success: false, message: data.error || 'Falha ao executar script.' }
        }));
        await dbService.logAction('script_execution', { script: script.id, success: false, error: data.error });
      }
    } catch (e: any) {
      setResults(prev => ({
        ...prev,
        [script.id]: { success: false, message: e.message }
      }));
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Console de Comandos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Scripts e Tarefas Automatizadas
          </h2>
          <p className="text-xs text-slate-400">
            Execute rotinas de manutenção, disparos em massa e auditoria de sistema.
          </p>
        </div>
        
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCRIPTS.map((script) => (
          <div 
            key={script.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all group"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110
                  ${script.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                    script.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
                    'bg-emerald-50 text-emerald-600'}`}
                >
                  {script.icon}
                </div>
                
                {results[script.id] && (
                  <div className={`p-1 rounded-full ${results[script.id].success ? 'text-emerald-500' : 'text-red-500'}`}>
                    {results[script.id].success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  {script.name}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {script.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <button
                  onClick={() => runScript(script)}
                  disabled={running !== null}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2
                    ${running === script.id 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-95'}`}
                >
                  {running === script.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Executar Agora</span>
                    </>
                  )}
                </button>
              </div>

              {results[script.id] && (
                <div className={`mt-2 p-2 rounded-lg text-[10px] font-medium leading-tight
                  ${results[script.id].success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                >
                  {results[script.id].message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900">Restrição de Acesso</h4>
          <p className="text-xs text-amber-700">
            A execução destes scripts é restrita ao administrador da plataforma. 
            Todas as execuções são registradas permanentemente no log de auditoria do sistema para fins de segurança.
          </p>
        </div>
      </div>
    </div>
  );
};
