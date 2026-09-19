import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { StudentDocumentSection } from './StudentDocumentSection';
import {
  User,
  Church,
  Calendar,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { studentProfile, updateProfile, changePassword } = useAuth();
  if (!studentProfile) return null;

  // Editable fields
  const [phone, setPhone] = useState(studentProfile.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(studentProfile.avatarUrl || '');
  const [cep, setCep] = useState(studentProfile.cep || '');
  const [city, setCity] = useState(studentProfile.city || '');
  const [state, setState] = useState(studentProfile.state || 'PR');
  const [neighborhood, setNeighborhood] = useState(studentProfile.neighborhood || '');
  const [street, setStreet] = useState(studentProfile.street || '');
  const [number, setNumber] = useState(studentProfile.number || '');
  const [complement, setComplement] = useState(studentProfile.complement || '');
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const ok = await updateProfile({
      phone,
      avatarUrl,
      cep,
      city,
      state,
      neighborhood,
      street,
      number,
      complement,
    }, avatarFile);

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('A confirmação de senha não confere.');
        setSaving(false);
        return;
      }
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }

    setSaving(false);
    if (ok) {
      setSuccessMsg('Dados do perfil atualizados com sucesso!');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={
              avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
            }
            alt={studentProfile.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display">{studentProfile.name}</h2>
            <p className="text-xs text-amber-200">{studentProfile.email}</p>
            <p className="text-xs text-slate-300">
              {studentProfile.congregationName} •{' '}
              {studentProfile.courseType === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
            Foto de Perfil
          </h3>
          <ImageUploadInput
            label="Atualizar Foto de Perfil (Câmera ou Galeria)"
            value={avatarUrl}
            onChange={setAvatarUrl}
            onFileSelect={setAvatarFile}
            isAvatar={true}
          />
        </div>

        {/* Informações Pessoais & Contato */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display">
            Contato e Endereço
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(55) 99999-9999"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail (fixo de cadastro)
              </label>
              <input
                type="email"
                disabled
                value={studentProfile.email}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="98400-000"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Estado</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="PR"
                  className="w-20 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rua e Número</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Nº"
                  className="w-24 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apartamento, Bloco, etc."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Documentos Paroquiais */}
        <StudentDocumentSection 
          studentId={studentProfile.id}
          documents={studentProfile.documents || []}
          onDocumentUploaded={() => {}} 
        />

        {/* Alterar Senha */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            Alterar Senha de Acesso
          </h3>
          <p className="text-xs text-slate-500">
            Preencha apenas se desejar cadastrar uma nova senha para a sua conta.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dados Canônicos e Eclesiásticos (Readonly) */}
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Church className="w-4 h-4 text-amber-700" />
            Registros Paroquiais e Batismo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div>
              <span className="font-bold">Congregação Vinculada:</span>
              <p>{studentProfile.congregationName}</p>
            </div>
            <div>
              <span className="font-bold">Batismo Registrado:</span>
              <p>
                {studentProfile.baptism?.isBaptized
                  ? `Sim, em ${studentProfile.baptism.date || 'Data não informada'} (${studentProfile.baptism.church || 'Igreja'})`
                  : 'Não batizado'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold text-xs transition shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
