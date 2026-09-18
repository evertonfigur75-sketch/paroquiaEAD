import React, { useState } from 'react';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { X, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';
import { dbService } from '../../services/db';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newTempPassword, setNewTempPassword] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate secure recovery reset
    const students = dbService.getAllStudents();
    const student = students.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (student) {
      const tempPass = 'fe' + Math.floor(1000 + Math.random() * 9000);
      await dbService.changePassword(student.id, tempPass);
      setNewTempPassword(tempPass);
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden p-6 animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <LutherRoseIcon size={36} />
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Recuperar Senha</h3>
            <p className="text-xs text-slate-500">Plataforma de Ensino Luterano</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instruções Geradas</span>
              </div>
              <p>
                Uma notificação de redefinição foi enviada para <strong>{email}</strong>.
              </p>
              {newTempPassword ? (
                <div className="p-2.5 rounded-lg bg-white border border-emerald-300 mt-2">
                  <p className="text-[11px] text-slate-600">Sua nova senha temporária para acesso:</p>
                  <p className="text-base font-mono font-bold text-slate-900 mt-0.5">{newTempPassword}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Você poderá alterá-la imediatamente na aba <em>Meu Perfil</em>.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-600">
                  Caso o e-mail não seja encontrado, procure o Pastor Everton Figur na secretaria da paróquia.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#162a45] transition"
            >
              Ir para Tela de Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Informe o e-mail cadastrado na plataforma para recuperar o acesso à sua conta.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seu E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Por segurança, alunos confirmandos também podem solicitar a redefinição diretamente ao Pastor Everton Figur durante os cultos ou aulas.
              </span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Voltar ao Login
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#162a45] transition"
              >
                Enviar Recuperação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
