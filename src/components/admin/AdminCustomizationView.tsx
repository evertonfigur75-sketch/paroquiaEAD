import React, { useState } from 'react';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppSettings } from '../../types';
import { dbService, DEFAULT_APP_SETTINGS } from '../../services/db';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { formatImageUrl } from '../../lib/imageUtils';
import {
  Palette,
  Image,
  Type,
  Upload,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
  Eye,
  Check,
  Building,
  Save,
} from 'lucide-react';

interface PresetPalette {
  name: string;
  category: string;
  primary: string;
  accent: string;
  description: string;
}

const PRESET_PALETTES: PresetPalette[] = [
  {
    name: 'Azul Luterano Clássico',
    category: 'Histórico IELB',
    primary: '#1e3a5f',
    accent: '#f59e0b',
    description: 'A cor tradicional dos hinários, brasões e documentos luteranos.',
  },
  {
    name: 'Azul Real & Celeste',
    category: 'Paroquial Moderno',
    primary: '#1d4ed8',
    accent: '#38bdf8',
    description: 'Visual vivo e contemporâneo para congregações jovens.',
  },
  {
    name: 'Verde Tempo Comum',
    category: 'Litúrgico',
    primary: '#15803d',
    accent: '#eab308',
    description: 'Símbolo de esperança e crescimento na fé e instrução bíblica.',
  },
  {
    name: 'Vinho & Dourado Nobre',
    category: 'Solene',
    primary: '#831843',
    accent: '#fbbf24',
    description: 'Tons calorosos inspirados na herança histórica da Reforma.',
  },
  {
    name: 'Roxo Quaresma & Advento',
    category: 'Litúrgico',
    primary: '#581c87',
    accent: '#f59e0b',
    description: 'Cor eclesiástica do recolhimento, penitência e oração.',
  },
  {
    name: 'Grafite & Âmbar Contemporâneo',
    category: 'Neutro Sofisticado',
    primary: '#1e293b',
    accent: '#d97706',
    description: 'Minimalista e com alto contraste para leitura e estudo prolongado.',
  },
];

export const AdminCustomizationView: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useAppSettings();

  const [appName, setAppName] = useState(settings.appName || DEFAULT_APP_SETTINGS.appName);
  const [appSubtitle, setAppSubtitle] = useState(
    settings.appSubtitle || DEFAULT_APP_SETTINGS.appSubtitle
  );
  const [parishName, setParishName] = useState(
    settings.parishName || DEFAULT_APP_SETTINGS.parishName
  );
  const [churchBody, setChurchBody] = useState(
    settings.churchBody || DEFAULT_APP_SETTINGS.churchBody
  );
  const [pastorName, setPastorName] = useState(
    settings.pastorName || DEFAULT_APP_SETTINGS.pastorName
  );
  const [pastorPhone, setPastorPhone] = useState(
    settings.pastorPhone || DEFAULT_APP_SETTINGS.pastorPhone
  );
  const [pastorAvatarUrl, setPastorAvatarUrl] = useState(
    settings.pastorAvatarUrl || DEFAULT_APP_SETTINGS.pastorAvatarUrl
  );
  const [logoType, setLogoType] = useState<'luther_rose' | 'custom_upload' | 'url'>(
    settings.logoType || 'luther_rose'
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(
    settings.primaryColor || DEFAULT_APP_SETTINGS.primaryColor
  );
  const [accentColor, setAccentColor] = useState(
    settings.accentColor || DEFAULT_APP_SETTINGS.accentColor
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setFeedback('Fazendo upload do logo...');
    try {
      const url = await dbService.uploadPhoto(file, 'ConfiguracoesApp');
      if (url) {
        setLogoUrl(url);
        setLogoType('custom_upload');
        setFeedback('Logo carregado com sucesso!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('Erro no upload.');
    }
  };

  const handleApplyPreset = (preset: PresetPalette) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      alert('O nome do aplicativo não pode ficar vazio.');
      return;
    }

    const updated: AppSettings = {
      appName: appName.trim(),
      appSubtitle: appSubtitle.trim(),
      parishName: parishName.trim(),
      churchBody: churchBody.trim(),
      pastorName: pastorName.trim(),
      pastorPhone: pastorPhone.trim(),
      pastorAvatarUrl: formatImageUrl(pastorAvatarUrl.trim()),
      logoType,
      logoUrl: logoType === 'luther_rose' ? '' : formatImageUrl(logoUrl.trim()),
      primaryColor,
      accentColor,
    };

    await updateSettings(updated);
    setFeedback('Identidade visual, paróquia e branding atualizados com sucesso!');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleResetToDefault = async () => {
    if (confirm('Deseja restaurar as cores, logo e dados originais da plataforma?')) {
      await resetSettings();
      setAppName(DEFAULT_APP_SETTINGS.appName);
      setAppSubtitle(DEFAULT_APP_SETTINGS.appSubtitle);
      setParishName(DEFAULT_APP_SETTINGS.parishName);
      setChurchBody(DEFAULT_APP_SETTINGS.churchBody);
      setPastorName(DEFAULT_APP_SETTINGS.pastorName);
      setPastorPhone(DEFAULT_APP_SETTINGS.pastorPhone);
      setPastorAvatarUrl(DEFAULT_APP_SETTINGS.pastorAvatarUrl);
      setLogoType('luther_rose');
      setLogoUrl('');
      setPrimaryColor(DEFAULT_APP_SETTINGS.primaryColor);
      setAccentColor(DEFAULT_APP_SETTINGS.accentColor);
      setFeedback('Configurações originais restauradas.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className="rounded-3xl text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)`,
        }}
      >
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accentColor}33`,
                color: accentColor,
              }}
            >
              Personalização & Identidade Visual
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Cores, Logotipo & Nome do Aplicativo
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Adapte a plataforma com o nome de sua paróquia ou congregação, faça upload do brasão/logo oficial e escolha a paleta de cores.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* SECTION 1: APP NAME & SUBTITLE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Type className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                1. Nome e Identificação da Paróquia / Aplicativo
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nome Principal da Aplicação *
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Ex: Plataforma de Ensino Luterano ou Paróquia São Marcos"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Exibido na barra de navegação, cabeçalho da página e no título da aba do navegador.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Subtítulo ou Lema Institucional
                </label>
                <input
                  type="text"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  placeholder="Ex: Ensino Confirmatório e Profissão de Fé"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Exibido abaixo do logotipo e na página de boas-vindas dos alunos.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Paróquia Oficial
                  </label>
                  <input
                    type="text"
                    value={parishName}
                    onChange={(e) => setParishName(e.target.value)}
                    placeholder="Paróquia Evangélica Luterana São Paulo"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Denominação / Igreja
                  </label>
                  <input
                    type="text"
                    value={churchBody}
                    onChange={(e) => setChurchBody(e.target.value)}
                    placeholder="Igreja Evangélica Luterana do Brasil"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Pastor Titular / Administrador
                  </label>
                  <input
                    type="text"
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    placeholder="Pastor Everton Figur"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Telefone / WhatsApp Pastoral
                  </label>
                  <input
                    type="text"
                    value={pastorPhone}
                    onChange={(e) => setPastorPhone(e.target.value)}
                    placeholder="(46) 99971-0792"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: APP LOGO */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Image className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                2. Logotipo da Plataforma
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLogoType('luther_rose')}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                    logoType === 'luther_rose'
                      ? 'border-[#1e3a5f] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LutherRoseIcon size={38} />
                  <span className="font-bold text-xs text-slate-800 text-center">
                    Rosa de Lutero
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">
                    Símbolo oficial clássico
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoType('custom_upload')}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                    logoType === 'custom_upload'
                      ? 'border-[#1e3a5f] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 text-center">
                    Upload do Computador
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">
                    PNG, JPG ou SVG próprio
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoType('url')}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                    logoType === 'url'
                      ? 'border-[#1e3a5f] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Building className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 text-center">
                    URL de Imagem
                  </span>
                  <span className="text-[10px] text-slate-400 text-center">
                    Link direto na internet
                  </span>
                </button>
              </div>

              {/* Upload Input Area */}
              {logoType === 'custom_upload' && (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleImageFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                  <p className="font-bold text-slate-700">Clique para escolher a imagem da sua logo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Recomendado: formato quadrado (1:1), fundo transparente (PNG/SVG, máx. 3MB)
                  </p>
                </div>
              )}

              {/* URL Input Area */}
              {logoType === 'url' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Endereço URL da Imagem da Logo:
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.org.br/logo-paroquia.png"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              )}

              {/* Logo Preview & Reset */}
              {(logoType === 'custom_upload' || logoType === 'url') && logoUrl && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-12 h-12 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-xs"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Logotipo carregado com sucesso</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">Ativo na visualização</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl('');
                      setLogoType('luther_rose');
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-bold"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: APP COLORS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                3. Cores da Aplicação
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  Paletas Prontas Recomendadas (Clique para aplicar):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_PALETTES.map((palette) => {
                    const isSelected =
                      primaryColor.toLowerCase() === palette.primary.toLowerCase() &&
                      accentColor.toLowerCase() === palette.accent.toLowerCase();

                    return (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => handleApplyPreset(palette)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-slate-800 bg-slate-50 shadow-xs ring-2 ring-slate-800/10'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{palette.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-600">
                              {palette.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {palette.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: palette.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: palette.accent }}
                          />
                          {isSelected && <Check className="w-4 h-4 text-slate-800 ml-1" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block mb-2">
                  Ou Escolha Cores Personalizadas Exatas:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Color Picker */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Cor Primária</span>
                      <span className="text-[10px] text-slate-500">
                        Cabeçalhos, fundo do menu, botões
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1e3a5f"
                        className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Accent Color Picker */}
                  <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Cor de Destaque</span>
                      <span className="text-[10px] text-slate-500">
                        Badges, estrelas, detalhes dourados
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#f59e0b"
                        className="flex-1 p-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Cancelar / Descartar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-white font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              <span>Salvar e Aplicar Personalização</span>
            </button>
          </div>
        </form>

        {/* Right Preview Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Eye className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Pré-visualização em Tempo Real
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Veja como o cabeçalho, logo, botões e elementos visuais serão exibidos para os alunos e confirmandos:
            </p>

            {/* Mock Header */}
            <div
              className="p-4 rounded-2xl text-white shadow-sm transition-colors space-y-3"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {logoType === 'luther_rose' || !logoUrl ? (
                    <LutherRoseIcon size={32} />
                  ) : (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-xs font-display leading-tight truncate max-w-[170px]">
                      {appName}
                    </h4>
                    <p
                      className="text-[10px] font-semibold opacity-90 truncate max-w-[170px]"
                      style={{ color: accentColor }}
                    >
                      {appSubtitle}
                    </p>
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: accentColor,
                    color: '#0f172a',
                  }}
                >
                  Confirmando
                </span>
              </div>

              {/* Mock Navigation Tabs */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 text-[10px] font-medium">
                <span className="px-2 py-1 rounded-lg bg-white/20 text-white font-bold">
                  Meu Curso
                </span>
                <span className="px-2 py-1 text-white/70">Cultos</span>
                <span className="px-2 py-1 text-white/70">Comunidade</span>
              </div>
            </div>

            {/* Mock Content Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    color: primaryColor,
                  }}
                >
                  Módulo 1: O Credo Apostólico
                </span>
                <span className="text-[10px] text-slate-500">100%</span>
              </div>

              <h5 className="font-bold text-slate-900 text-xs">
                Questionário 1: Deus Criador e Redentor
              </h5>

              <button
                type="button"
                className="w-full py-2 rounded-xl text-white font-bold text-xs transition shadow-2xs"
                style={{ backgroundColor: primaryColor }}
              >
                Responder Questionário
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
              💡 Ao clicar em <strong>"Salvar e Aplicar"</strong>, as cores e a logo se propagam instantaneamente por todo o sistema sem necessidade de recarregar a página.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
