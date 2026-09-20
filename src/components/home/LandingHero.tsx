import React from 'react';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { AppLogo } from '../common/AppLogo';
import { useAppSettings } from '../../context/AppSettingsContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  LogIn,
  UserPlus,
  Send,
  BookOpen,
  Church,
  CalendarCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Radio,
  Video,
  Headphones,
  Calendar,
} from 'lucide-react';
import { dbService } from '../../services/db';

interface LandingHeroProps {
  onOpenLogin: (role?: 'admin' | 'student') => void;
  onOpenRegister: () => void;
  onOpenPublicPortal?: () => void;
  onOpenBible?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenPublicPortal,
  onOpenBible,
}) => {
  const congregations = dbService.getCongregations();
  const { settings } = useAppSettings();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header
        className="text-white sticky top-0 z-40 shadow-md transition-colors"
        style={{ backgroundColor: settings.primaryColor || '#1e3a5f' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={38} className="shadow-sm" />
            <div>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-wide uppercase leading-tight truncate max-w-xs sm:max-w-md">
                {settings.appName || 'Plataforma de Ensino Luterano'}
              </h1>
              <p
                className="text-[11px] font-medium hidden sm:block truncate max-w-xs sm:max-w-md"
                style={{ color: settings.accentColor || '#f59e0b' }}
              >
                {settings.appSubtitle || 'Ensino Confirmatório e Profissão de Fé'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenBible && (
              <button
                onClick={onOpenBible}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 cursor-pointer border border-amber-400/30 shadow-2xs"
                title="Abrir Painel da Bíblia Sagrada & Citações"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Bíblia Sagrada</span>
                <span className="sm:hidden">Bíblia</span>
              </button>
            )}

            {onOpenPublicPortal && (
              <button
                onClick={onOpenPublicPortal}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                title="Acessar vídeos, áudios, estudos e calendário sem login"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Portal dos Membros (Livre)</span>
                <span className="sm:hidden">Acesso Geral</span>
              </button>
            )}

            <PWAInstallButton compact={true} />
            <button
              id="btn-nav-login"
              onClick={() => onOpenLogin('admin')}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: settings.accentColor || '#f59e0b',
                color: '#0f172a',
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar no Sistema</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8 sm:space-y-12">
        {/* Welcome Card */}
        <div
          className="rounded-3xl text-white p-6 sm:p-10 shadow-xl relative overflow-hidden transition-colors"
          style={{
            background: `linear-gradient(135deg, ${settings.primaryColor || '#1e3a5f'} 0%, #162a45 60%, #0f172a 100%)`,
          }}
        >
          {/* Subtle Luther Crest watermark background */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <LutherRoseIcon size={320} />
          </div>

          <div className="max-w-2xl relative z-10 space-y-4">
            <button
              onClick={() => onOpenLogin('admin')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition text-left cursor-pointer"
              title="Acessar com o Perfil do Pastor Everton Figur"
            >
              <ShieldCheck
                className="w-4 h-4 shrink-0"
                style={{ color: settings.accentColor || '#f59e0b' }}
              />
              <span>Paróquia Luterana • Perfil do Administrador: Pastor Everton Figur</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight leading-snug uppercase">
              {settings.appName || 'PLATAFORMA DE ENSINO LUTERANO'}
            </h1>

            <p
              className="text-base sm:text-lg font-medium"
              style={{ color: settings.accentColor || '#f59e0b' }}
            >
              {settings.appSubtitle || 'Ensino Confirmatório e Profissão de Fé'}
            </p>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-1">
              Ambiente digital dedicado à instrução cristã, estudo da Sagrada Escritura, Catecismo Menor de Martinho Lutero e acompanhamento das presenças nos cultos de nossa paróquia.
            </p>

            {/* 3 Main Action Buttons requested in section 1 */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-hero-login"
                onClick={() => onOpenLogin('admin')}
                className="py-3 px-6 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                style={{
                  backgroundColor: settings.accentColor || '#f59e0b',
                  color: '#0f172a',
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>

              <button
                id="btn-hero-register"
                onClick={onOpenRegister}
                className="py-3 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Criar Cadastro</span>
              </button>

              <button
                id="btn-hero-request"
                onClick={onOpenRegister}
                className="py-3 px-6 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold text-sm transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>Solicitar Participação</span>
              </button>
            </div>

            {/* Acesso Geral dos Membros (Sem Login) */}
            {onOpenPublicPortal && (
              <div className="pt-3">
                <button
                  onClick={onOpenPublicPortal}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-teal-700/90 hover:from-emerald-500 hover:to-teal-600 text-white transition shadow-md flex items-center justify-between gap-4 border border-emerald-400/40 cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white">
                          Acesso Geral da Paróquia (Entrar Sem Login)
                        </span>
                        <span className="bg-white/25 text-emerald-100 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                          Livre
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 font-normal">
                        Vídeos dos cultos, mensagens gravadas em áudio, estudos bíblicos e calendário paroquial
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Highlight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card do Portal Público */}
          <div
            onClick={onOpenPublicPortal}
            className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-sm space-y-2 hover:border-emerald-400 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-base font-display group-hover:text-emerald-700 transition">
                Portal dos Membros
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                Sem Login
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Acesso livre para toda a comunidade: assista aos vídeos, ouça áudios de pregações, leia estudos e veja o calendário.
            </p>
            <span className="text-[11px] font-bold text-emerald-700 block pt-1 group-hover:underline">
              Acessar Conteúdos &rarr;
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">Ensino Confirmatório</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formação de 24 meses para jovens confirmandos com módulos bíblicos, questionários, vídeos e o Catecismo Menor.
            </p>
            <span className="text-[11px] font-bold text-amber-700 block pt-1">
              Acompanhamento de 24 cultos
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Award className="w-5 h-5 text-sky-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">Profissão de Fé</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instrução doutrinária acolhedora para adultos e novos membros da paróquia (sem a exigência do módulo de 24 cultos).
            </p>
            <span className="text-[11px] font-bold text-sky-700 block pt-1">
              Módulos teológicos & Catecismo Menor
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">24 Cultos (Confirmandos)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Envio prático do resumo da pregação e foto pelo celular para validação dos 24 cultos diretamente pelo Pastor Everton Figur.
            </p>
            <span className="text-[11px] font-bold text-emerald-700 block pt-1">
              Exclusivo para Confirmandos
            </span>
          </div>
        </div>

        {/* Congregations List */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Church className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 font-display">
                Congregações da Paróquia Luterana
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {congregations.length} Congregações
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {congregations.map((c, idx) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                  <p className="text-[11px] text-slate-500">{c.city} – {c.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs text-center">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-medium">
            <LutherRoseIcon size={20} />
            <span>Plataforma de Ensino Luterano</span>
          </div>
          <p>
            Paróquia Evangélica Luterana • Administração Pastoral: Pastor Everton Figur
          </p>
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} — Todos os direitos reservados. Instrução cristã para a vida.
          </p>
        </div>
      </footer>
    </div>
  );
};
