import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { Clock, ShieldAlert, LogOut, CheckCircle2, User, Church } from 'lucide-react';

export const PendingApprovalNotice: React.FC = () => {
  const { studentProfile, logout, refreshUser } = useAuth();

  const handleSimulateApproval = () => {
    if (studentProfile?.id) {
      dbService.approveStudent(studentProfile.id);
      refreshUser();
    }
  };

  const isRejected = studentProfile?.status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 text-center">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white p-6 relative">
          <div className="flex justify-center mb-3">
            <LutherRoseIcon size={56} />
          </div>
          <h2 className="text-xl font-bold font-display tracking-wide">
            Plataforma de Ensino Luterano
          </h2>
          <p className="text-xs text-amber-200 mt-1">Paróquia Evangélica Luterana</p>
        </div>

        <div className="p-6 space-y-5">
          {isRejected ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Cadastro Não Aprovado
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sua solicitação de participação na congregação foi recusada pelo administrador.
                {studentProfile?.statusReason && (
                  <span className="block mt-2 font-medium text-red-700 bg-red-50 p-2 rounded-lg">
                    Motivo: {studentProfile.statusReason}
                  </span>
                )}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  Status: Pendente
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Aguardando Aprovação Pastoral
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-sm text-amber-950 font-medium leading-relaxed text-left space-y-2">
                <p>
                  <strong>“Sua solicitação foi enviada ao administrador. Aguarde a aprovação do Pastor Everton Figur.”</strong>
                </p>
                <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span><strong>Aluno:</strong> {studentProfile?.name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Church className="w-3.5 h-3.5 text-amber-700" />
                    <span><strong>Congregação:</strong> {studentProfile?.congregationName}</span>
                  </p>
                  <p>
                    <strong>Formação:</strong> {studentProfile?.courseType === 'confirmatorio' ? 'Ensino Confirmatório (24 meses)' : 'Profissão de Fé'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                O Pastor Everton Figur confere os dados de batismo e congregação antes de liberar o acesso aos módulos e cultos.
              </p>

              {/* Development/Testing Convenience Button */}
              <div className="pt-2">
                <button
                  onClick={handleSimulateApproval}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar Agora (Atalho de Demonstração)</span>
                </button>
                <span className="text-[10px] text-slate-400 block mt-1">
                  (Permite testar o painel do aluno instantaneamente)
                </span>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-center">
            <button
              onClick={logout}
              className="text-xs text-slate-600 hover:text-red-600 font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
