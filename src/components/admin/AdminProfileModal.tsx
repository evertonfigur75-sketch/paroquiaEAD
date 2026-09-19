import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  X,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Church,
  Eye,
  EyeOff,
  Database,
} from 'lucide-react';
import { FirestoreAdminSetupModal } from './FirestoreAdminSetupModal';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(currentUser?.name || 'Pastor Everton Figur');
  const [email] = useState(currentUser?.email || 'evertonfigur75@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '(55) 99999-0000');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.avatarUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  );
  const [city, setCity] = useState(currentUser?.city || 'Planalto');
  const [state, setState] = useState(currentUser?.state || 'PR');
  const [district, setDistrict] = useState(currentUser?.district || 'Distrito Parque do Iguaçu');
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showFirestoreSetup, setShowFirestoreSetup] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const ok = await updateProfile({
      name,
      phone,
      avatarUrl,
      city,
      state,
      district,
    }, avatarFile);

    if (newPassword) {
      if (newPassword.length < 6) {
        setSaving(false);
        setFeedback({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setSaving(false);
        setFeedback({ type: 'error', text: 'A confirmação de senha não confere.' });
        return;
      }
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }

    setSaving(false);
    if (ok) {
      setFeedback({ type: 'success', text: 'Perfil do Pastor Everton Figur atualizado com sucesso!' });
    } else {
      setFeedback({ type: 'error', text: 'Erro ao salvar alterações no perfil.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 relative">
          <button
            id="btn-close-admin-profile"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold mb-1">
                <Church className="w-3 h-3" />
                <span>Administrador Paroquial</span>
              </div>
              <h2 className="text-xl font-bold font-display">{name}</h2>
              <p className="text-xs text-amber-200">{email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Foto de Perfil do Pastor
            </label>
            <ImageUploadInput
              value={avatarUrl}
              onChange={setAvatarUrl}
              onFileSelect={setAvatarFile}
              label="Alterar Foto Oficial"
              isAvatar={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nome Completo / Título
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                E-mail de Login
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Distrito
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Distrito Parque do Iguaçu"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cidade Paroquial
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                UF
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Change Password */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Alterar Senha do Administrador
              </h4>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nova senha (deixe em branco p/ manter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowFirestoreSetup(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Status & Helper Firestore</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-98 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Firestore Admin Setup Modal */}
      {showFirestoreSetup && (
        <FirestoreAdminSetupModal
          isOpen={showFirestoreSetup}
          onClose={() => setShowFirestoreSetup(false)}
        />
      )}
    </div>
  );
};
