import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { formatImageUrl } from '../../lib/imageUtils';
import { dbService, DEFAULT_APP_SETTINGS } from '../../services/db';
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
  Palette,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react';
import { FirestoreAdminSetupModal } from './FirestoreAdminSetupModal';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'app_details';
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
}) => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { settings, updateSettings } = useAppSettings();

  const [activeTab, setActiveTab] = useState<'profile' | 'app_details'>(initialTab);

  // Pastor Profile State
  const [name, setName] = useState(currentUser?.name || 'Pastor Everton Figur');
  const [email] = useState(currentUser?.email || 'evertonfigur75@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '(46) 99971-0792');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.avatarUrl ||
      'https://lh3.googleusercontent.com/d/1qpNzrvjmC8qaI5VpYcm3nKoRi7uDzRpy'
  );
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [parishName, setParishName] = useState(
    currentUser?.parishName || settings.parishName || 'Paróquia Evangélica Luterana São Paulo'
  );
  const [churchBody, setChurchBody] = useState(
    currentUser?.churchBody || settings.churchBody || 'Igreja Evangélica Luterana do Brasil'
  );
  const [city, setCity] = useState(currentUser?.city || 'Planalto');
  const [state, setState] = useState(currentUser?.state || 'PR');
  const [district, setDistrict] = useState(currentUser?.district || 'Distrito Parque do Iguaçu');

  // App Settings State
  const [appName, setAppName] = useState(settings.appName || DEFAULT_APP_SETTINGS.appName);
  const [appSubtitle, setAppSubtitle] = useState(
    settings.appSubtitle || DEFAULT_APP_SETTINGS.appSubtitle
  );
  const [logoType, setLogoType] = useState<'luther_rose' | 'custom_upload' | 'url'>(
    settings.logoType || 'custom_upload'
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '/logo.jpg');
  const [primaryColor, setPrimaryColor] = useState(
    settings.primaryColor || DEFAULT_APP_SETTINGS.primaryColor
  );
  const [accentColor, setAccentColor] = useState(
    settings.accentColor || DEFAULT_APP_SETTINGS.accentColor
  );

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showFirestoreSetup, setShowFirestoreSetup] = useState(false);

  if (!isOpen) return null;

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem do logo deve ter no máximo 5MB.');
      return;
    }

    setFeedback({ type: 'success', text: 'Enviando imagem do logo...' });
    try {
      const url = await dbService.uploadPhoto(file, 'ConfiguracoesApp');
      if (url) {
        setLogoUrl(url);
        setLogoType('custom_upload');
        setFeedback({ type: 'success', text: 'Logo carregado com sucesso!' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Falha no upload do logotipo.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // 1. Update Pastor User Profile
      const formattedAvatar = formatImageUrl(avatarUrl);
      const profileOk = await updateProfile(
        {
          name: name.trim(),
          phone: phone.trim(),
          avatarUrl: formattedAvatar,
          parishName: parishName.trim(),
          churchBody: churchBody.trim(),
          city: city.trim(),
          state: state.trim(),
          district: district.trim(),
        },
        avatarFile
      );

      // 2. Update Application Settings
      await updateSettings({
        appName: appName.trim(),
        appSubtitle: appSubtitle.trim(),
        parishName: parishName.trim(),
        churchBody: churchBody.trim(),
        pastorName: name.trim(),
        pastorPhone: phone.trim(),
        pastorAvatarUrl: formattedAvatar,
        logoType,
        logoUrl: logoType === 'luther_rose' ? '' : formatImageUrl(logoUrl.trim()),
        primaryColor,
        accentColor,
      });

      // 3. Update Password if requested
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
      setFeedback({
        type: 'success',
        text: 'Foto, perfil do Pastor e detalhes do aplicativo salvos com sucesso!',
      });
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      setSaving(false);
      setFeedback({ type: 'error', text: 'Erro ao salvar alterações no sistema.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6 flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            id="btn-close-admin-profile"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={formatImageUrl(avatarUrl)}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-800"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold mb-1">
                <Church className="w-3 h-3" />
                <span>Administração & Paróquia</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display truncate">{name}</h2>
              <p className="text-xs text-amber-200 truncate">{parishName}</p>
              <p className="text-[11px] text-slate-300 truncate">{email}</p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Foto & Perfil do Pastor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('app_details')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'app_details'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Detalhes do Aplicativo & Identidade</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
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

          {/* TAB 1: PASTOR PROFILE & PHOTO */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Foto de Perfil Oficial do Pastor
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Envie uma nova foto pelo computador/celular ou cole um link de imagem (inclui links do Google Drive).
                </p>
                <ImageUploadInput
                  value={avatarUrl}
                  onChange={(val) => {
                    setAvatarUrl(val);
                    setAvatarFile(undefined);
                  }}
                  onFileSelect={(file) => {
                    setAvatarFile(file);
                  }}
                  label="Selecionar Foto do Pastor"
                  isAvatar={true}
                />
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nome Completo / Título
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pastor Everton Figur"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    E-mail de Login Oficial
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Parish & Denomination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Paróquia Oficial
                  </label>
                  <input
                    type="text"
                    value={parishName}
                    onChange={(e) => setParishName(e.target.value)}
                    placeholder="Paróquia Evangélica Luterana São Paulo"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Denominação / Igreja
                  </label>
                  <input
                    type="text"
                    value={churchBody}
                    onChange={(e) => setChurchBody(e.target.value)}
                    placeholder="Igreja Evangélica Luterana do Brasil"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone, District, City, State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(46) 99971-0792"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Distrito Parque do Iguaçu"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Planalto"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="PR"
                    maxLength={2}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Password change */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Alterar Senha do Administrador
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ocultar' : 'Exibir'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nova senha (deixe em branco p/ manter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
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
          )}

          {/* TAB 2: APPLICATION DETAILS & BRANDING */}
          {activeTab === 'app_details' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Personalização Geral do Aplicativo
                </h4>
                <p className="text-[11px] text-blue-800">
                  Edite o título, subtítulo e logotipo que aparecem no cabeçalho e na tela inicial de todos os alunos.
                </p>
              </div>

              {/* App Name and Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nome da Aplicação
                  </label>
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Plataforma de Ensino Luterano"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Subtítulo da Aplicação
                  </label>
                  <input
                    type="text"
                    value={appSubtitle}
                    onChange={(e) => setAppSubtitle(e.target.value)}
                    placeholder="Ensino Confirmatório e Profissão de Fé"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Logotipo / Brasão da Plataforma
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLogoType('custom_upload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      logoType === 'custom_upload'
                        ? 'bg-[#1e3a5f] text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Brasão Próprio (Arquivo ou Link)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoType('luther_rose')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      logoType === 'luther_rose'
                        ? 'bg-[#1e3a5f] text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LutherRoseIcon size={16} />
                    <span>Rosa de Lutero Padrão</span>
                  </button>
                </div>

                {logoType !== 'luther_rose' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-3">
                      {logoUrl && (
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs">
                          <img
                            src={formatImageUrl(logoUrl)}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Upload de Arquivo de Logo (PNG, JPG, SVG)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1e3a5f] file:text-white hover:file:bg-[#152842] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ou Link Direto da Imagem
                      </label>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://exemplo.com/brasao.png ou link do Google Drive"
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cor Primária (Cabeçalho)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Cor de Destaque
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowFirestoreSetup(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Status Firestore</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Salvando...' : 'Salvar Tudo'}</span>
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
