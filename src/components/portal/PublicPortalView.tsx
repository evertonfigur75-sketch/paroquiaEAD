import React, { useState, useRef, useEffect } from 'react';
import {
  PublicVideo,
  PublicAudio,
  PublicBibleStudy,
  PublicCalendarEvent,
  Congregation,
} from '../../types';
import { dbService } from '../../services/db';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../common/AppLogo';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import {
  Video,
  Headphones,
  BookOpen,
  Calendar,
  Plus,
  Play,
  Pause,
  Upload,
  Link as LinkIcon,
  Search,
  Clock,
  MapPin,
  Church,
  User,
  X,
  Share2,
  Trash2,
  LogIn,
  Volume2,
  VolumeX,
  CheckCircle2,
  CalendarCheck,
  Tag,
  ArrowLeft,
  FileText,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface PublicPortalViewProps {
  onBackToLanding?: () => void;
  onOpenLogin?: (role?: 'admin' | 'student') => void;
  onOpenRegister?: () => void;
  onOpenBible?: (citation?: string) => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  onBackToLanding,
  onOpenLogin,
  onOpenRegister,
  onOpenBible,
}) => {
  const { settings } = useAppSettings();
  const { currentUser, isAdmin } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'videos' | 'audios' | 'studies' | 'calendar'>('videos');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Data States
  const [videos, setVideos] = useState<PublicVideo[]>([]);
  const [audios, setAudios] = useState<PublicAudio[]>([]);
  const [studies, setStudies] = useState<PublicBibleStudy[]>([]);
  const [events, setEvents] = useState<PublicCalendarEvent[]>([]);
  const [congregations, setCongregations] = useState<Congregation[]>([]);

  // Congregation filter for the calendar
  const [calendarCongregationFilter, setCalendarCongregationFilter] = useState<string>('all');

  // Modals for Adding Content
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddAudioModal, setShowAddAudioModal] = useState(false);
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Player / Detail View Modals
  const [playingVideo, setPlayingVideo] = useState<PublicVideo | null>(null);
  const [readingStudy, setReadingStudy] = useState<PublicBibleStudy | null>(null);

  // Audio Player State
  const [currentAudio, setCurrentAudio] = useState<PublicAudio | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setVideos(dbService.getPublicVideos());
    setAudios(dbService.getPublicAudios());
    setStudies(dbService.getPublicBibleStudies());
    setEvents(dbService.getPublicEvents());
    setCongregations(dbService.getCongregations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  // Audio Player Handlers
  const handlePlayAudio = (audio: PublicAudio) => {
    if (currentAudio?.id === audio.id) {
      if (isPlayingAudio) {
        audioRef.current?.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current?.play().catch(e => console.warn('Audio play error:', e));
        setIsPlayingAudio(true);
      }
    } else {
      setCurrentAudio(audio);
      setIsPlayingAudio(true);
      if (audioRef.current) {
        audioRef.current.src = audio.audioUrl;
        audioRef.current.play().catch(e => console.warn('Audio play error:', e));
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setAudioProgress(val);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper for YouTube embed
  const getEmbedVideo = (url: string) => {
    if (!url) return { type: 'direct', src: '' };
    const trimmed = url.trim();
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      };
    }
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      };
    }
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return {
        type: 'drive',
        src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      };
    }
    return { type: 'direct', src: trimmed };
  };

  // Deletion Handlers
  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este vídeo do portal público?')) {
      await dbService.deletePublicVideo(id);
      loadData();
      showToast('Vídeo removido com sucesso.');
    }
  };

  const handleDeleteAudio = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este áudio do portal público?')) {
      if (currentAudio?.id === id) {
        audioRef.current?.pause();
        setCurrentAudio(null);
        setIsPlayingAudio(false);
      }
      await dbService.deletePublicAudio(id);
      loadData();
      showToast('Áudio removido com sucesso.');
    }
  };

  const handleDeleteStudy = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este estudo bíblico do portal público?')) {
      await dbService.deletePublicBibleStudy(id);
      loadData();
      showToast('Estudo bíblico removido.');
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover este evento do calendário público?')) {
      await dbService.deletePublicEvent(id);
      loadData();
      showToast('Evento removido do calendário.');
    }
  };

  // Filtered lists
  const filteredVideos = videos.filter((v) => {
    const matchSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || v.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredAudios = audios.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredStudies = studies.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.biblicalPassage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredEvents = events.filter((ev) => {
    const matchSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.congregationName && ev.congregationName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCat = categoryFilter === 'all' || ev.category === categoryFilter;

    let matchCongregation = true;
    if (calendarCongregationFilter !== 'all') {
      if (calendarCongregationFilter === 'paroquial') {
        matchCongregation = ev.congregationId === 'all' || !ev.congregationId;
      } else {
        const targetCong = congregations.find((c) => c.id === calendarCongregationFilter);
        matchCongregation =
          ev.congregationId === calendarCongregationFilter ||
          (!!targetCong && (
            ev.location.toLowerCase().includes(targetCong.name.toLowerCase()) ||
            ev.location.toLowerCase().includes(targetCong.city.toLowerCase()) ||
            (!!ev.congregationName && ev.congregationName.toLowerCase().includes(targetCong.name.toLowerCase()))
          ));
      }
    }

    return matchSearch && matchCat && matchCongregation;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => setIsPlayingAudio(false)}
        onPause={() => setIsPlayingAudio(false)}
        onPlay={() => setIsPlayingAudio(true)}
      />

      {/* Top Navbar */}
      <header
        className="text-white sticky top-0 z-40 shadow-md transition-colors"
        style={{ backgroundColor: settings.primaryColor || '#1e3a5f' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white transition flex items-center gap-1 text-xs font-semibold"
                title="Voltar à Página Inicial"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <AppLogo size={36} className="shadow-xs" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold font-display tracking-wide uppercase leading-tight truncate max-w-xs sm:max-w-md">
                    {settings.appName || 'Portal Paroquial Luterano'}
                  </h1>
                  <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Acesso Aberto
                  </span>
                </div>
                <p
                  className="text-[11px] font-medium hidden sm:block truncate max-w-xs sm:max-w-md"
                  style={{ color: settings.accentColor || '#f59e0b' }}
                >
                  {settings.parishName || 'Paróquia Evangélica Luterana São Paulo'} • Membros & Comunidade
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBible && (
              <button
                onClick={() => onOpenBible()}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5 cursor-pointer border border-amber-400/30 shadow-2xs"
                title="Abrir Painel da Bíblia Sagrada & Citações"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Bíblia Sagrada</span>
                <span className="sm:hidden">Bíblia</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-200 hidden md:inline">
                  Logado como <strong className="text-white">{currentUser.name}</strong>
                </span>
                {onBackToLanding && (
                  <button
                    onClick={onBackToLanding}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    Voltar ao Painel
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {onOpenRegister && (
                  <button
                    onClick={onOpenRegister}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition hidden sm:inline-flex items-center gap-1"
                  >
                    <span>Criar Cadastro</span>
                  </button>
                )}
                {onOpenLogin && (
                  <button
                    onClick={() => onOpenLogin('admin')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    style={{
                      backgroundColor: settings.accentColor || '#f59e0b',
                      color: '#0f172a',
                    }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Área Restrita (Login)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner for Members */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-6 px-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Portal da Comunidade Paroquial • Sem necessidade de login</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Espaço Aberto aos Membros, Famílias e Visitantes
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Acesse vídeos dos cultos, ouça sermões gravados e hinos, aprofunde-se nos estudos bíblicos luteranos e confira a agenda com as datas de cultos em todas as congregações da paróquia.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 bg-white/5 border border-white/10 p-3 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Pastor Titular:</span>
                <strong className="text-white">{settings.pastorName || 'Pastor Everton Figur'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-300">WhatsApp Paroquial:</span>
                <strong className="text-amber-300">{settings.pastorPhone || '(46) 99971-0792'}</strong>
              </div>
            </div>
          </div>

          {/* Search bar & Tabs */}
          <div className="pt-2 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border-t border-white/10">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => {
                  setActiveTab('videos');
                  setCategoryFilter('all');
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Vídeos & Mensagens ({videos.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('audios');
                  setCategoryFilter('all');
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'audios'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Sermões em Áudio ({audios.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('studies');
                  setCategoryFilter('all');
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'studies'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Estudos Bíblicos ({studies.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('calendar');
                  setCategoryFilter('all');
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendário Paroquial ({events.length})</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, tema..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-amber-400 focus:bg-white/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 space-y-6 pb-28">
        {/* Toast Feedback */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: VÍDEOS & MENSAGENS */}
        {/* ========================================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-600" />
                  <span>Vídeos, Cultos Gravados e Mensagens em Vídeo</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Assista a mensagens gravadas, cultos e pregações em vídeo para sua edificação espiritual.
                </p>
              </div>

              <button
                onClick={() => setShowAddVideoModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1e3a5f] hover:bg-[#162a45] text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Subir Link de Vídeo / Mensagem</span>
              </button>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum vídeo encontrado</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery
                    ? 'Nenhum resultado corresponde à busca. Tente palavras diferentes.'
                    : 'Suba o primeiro link de vídeo do YouTube ou Google Drive para disponibilizar à comunidade.'}
                </p>
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Vídeo Agora</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setPlayingVideo(video)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                        <img
                          src={
                            video.thumbnailUrl ||
                            'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80'
                          }
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold">
                          {video.category || 'Mensagem'}
                        </span>
                      </div>

                      {/* Video Details */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm font-display leading-snug group-hover:text-amber-700 transition">
                          {video.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{video.speaker || 'Pastor Everton Figur'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span>{video.date}</span>
                        {(isAdmin || currentUser) && (
                          <button
                            onClick={(e) => handleDeleteVideo(video.id, e)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition"
                            title="Remover vídeo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ÁUDIOS & SERMÕES GRAVADOS (UPLOAD DE ÁUDIO) */}
        {/* ========================================================================= */}
        {activeTab === 'audios' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-amber-600" />
                  <span>Sermões em Áudio, Meditações e Hinos Gravados</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ouça diretamente no celular ou computador. Espaço para ouvir e subir novos áudios de pregações.
                </p>
              </div>

              <button
                onClick={() => setShowAddAudioModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1e3a5f] hover:bg-[#162a45] text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload de Áudio / Nova Mensagem</span>
              </button>
            </div>

            {filteredAudios.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Headphones className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum áudio encontrado</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Faça o upload do primeiro sermão gravado em MP3 ou insira um link de áudio.
                </p>
                <button
                  onClick={() => setShowAddAudioModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Áudio Agora</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAudios.map((audio) => {
                  const isCurrent = currentAudio?.id === audio.id;
                  return (
                    <div
                      key={audio.id}
                      className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => handlePlayAudio(audio)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition active:scale-95 shadow-sm ${
                            isCurrent && isPlayingAudio
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-[#1e3a5f] text-white hover:bg-[#162a45]'
                          }`}
                        >
                          {isCurrent && isPlayingAudio ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {audio.category || 'Sermão'}
                            </span>
                            {audio.durationMinutes && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {audio.durationMinutes} min
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 font-display leading-snug">
                            {audio.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                            {audio.description}
                          </p>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                            <span>Pregador: <strong className="text-slate-700">{audio.speaker}</strong></span>
                            <span>•</span>
                            <span>{audio.date}</span>
                            {audio.fileSize && <span>({audio.fileSize})</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handlePlayAudio(audio)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isCurrent && isPlayingAudio
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isCurrent && isPlayingAudio ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Ouvir</span>
                            </>
                          )}
                        </button>

                        {(isAdmin || currentUser) && (
                          <button
                            onClick={(e) => handleDeleteAudio(audio.id, e)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            title="Remover áudio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ESTUDOS BÍBLICOS */}
        {/* ========================================================================= */}
        {activeTab === 'studies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Estudos Bíblicos e Teologia Luterana</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Artigos fundamentados na Sagrada Escritura, Catecismo Menor e confissões luteranas.
                </p>
              </div>

              <button
                onClick={() => setShowAddStudyModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1e3a5f] hover:bg-[#162a45] text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Publicar Novo Estudo Bíblico</span>
              </button>
            </div>

            {filteredStudies.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum estudo encontrado</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Publique o primeiro estudo bíblico com passagens das Escrituras e comentários.
                </p>
                <button
                  onClick={() => setShowAddStudyModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Estudo Agora</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudies.map((study) => (
                  <div
                    key={study.id}
                    onClick={() => setReadingStudy(study)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {study.category || 'Teologia'}
                        </span>
                        <span className="text-[11px] text-slate-400">{study.date}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 font-display leading-snug">
                        {study.title}
                      </h4>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Passagem: <strong className="text-amber-800">{study.biblicalPassage}</strong></span>
                        </div>
                        {onOpenBible && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBible(study.biblicalPassage);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Consultar esta passagem na Bíblia"
                          >
                            <BookOpen className="w-3 h-3 text-amber-700" />
                            <span>Ver Bíblia</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {study.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate">Autor: <strong className="text-slate-700">{study.author}</strong></span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700 hover:underline">Ler Completo &rarr;</span>
                        {(isAdmin || currentUser) && (
                          <button
                            onClick={(e) => handleDeleteStudy(study.id, e)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition"
                            title="Remover estudo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CALENDÁRIO PAROQUIAL */}
        {/* ========================================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span>Calendário Paroquial & Horários de Culto</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Datas e horários dos cultos, Santa Ceia e estudos nas congregações da paróquia.
                </p>
              </div>

              <button
                onClick={() => setShowAddEventModal(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1e3a5f] hover:bg-[#162a45] text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Adicionar Horário de Culto / Evento</span>
              </button>
            </div>

            {/* SELETOR INTERATIVO DE CONGREGAÇÃO */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Church className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                    Escolher Congregação:
                  </span>
                  {calendarCongregationFilter !== 'all' && (
                    <button
                      onClick={() => setCalendarCongregationFilter('all')}
                      className="text-[11px] font-bold text-amber-700 hover:underline ml-1 cursor-pointer"
                    >
                      (Limpar Filtro)
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Exibindo <strong>{filteredEvents.length}</strong> {filteredEvents.length === 1 ? 'culto/evento' : 'cultos e eventos'}
                </span>
              </div>

              {/* Botões / Chips de Escolha de Congregação */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCalendarCongregationFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    calendarCongregationFilter === 'all'
                      ? 'bg-[#1e3a5f] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Todas as Congregações</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      calendarCongregationFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {events.length}
                  </span>
                </button>

                {congregations.map((cong) => {
                  const count = events.filter(
                    (ev) =>
                      ev.congregationId === cong.id ||
                      ev.location.toLowerCase().includes(cong.name.toLowerCase()) ||
                      ev.location.toLowerCase().includes(cong.city.toLowerCase()) ||
                      (ev.congregationName && ev.congregationName.toLowerCase().includes(cong.name.toLowerCase()))
                  ).length;

                  const isSelected = calendarCongregationFilter === cong.id;

                  return (
                    <button
                      key={cong.id}
                      onClick={() => setCalendarCongregationFilter(cong.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Church className="w-3.5 h-3.5" />
                      <span>{cong.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setCalendarCongregationFilter('paroquial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    calendarCongregationFilter === 'paroquial'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>Eventos Gerais da Paróquia</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      calendarCongregationFilter === 'paroquial' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {events.filter((e) => e.congregationId === 'all' || !e.congregationId).length}
                  </span>
                </button>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">
                  {calendarCongregationFilter !== 'all'
                    ? 'Nenhum culto agendado para esta congregação'
                    : 'Nenhum evento agendado'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {calendarCongregationFilter !== 'all'
                    ? 'Você pode adicionar horários de culto dominicais, vespertinos ou Santa Ceia para esta congregação.'
                    : 'Adicione as datas e horários dos cultos nas congregações da paróquia.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cadastrar Horário de Culto Agora</span>
                  </button>
                  {calendarCongregationFilter !== 'all' && (
                    <button
                      onClick={() => setCalendarCongregationFilter('all')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Ver Todas as Congregações
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((evt) => {
                  const [year, month, day] = evt.date.split('-');
                  const monthNames = [
                    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
                  ];
                  const formattedMonth = month ? monthNames[parseInt(month, 10) - 1] : '';

                  const getBadge = (cat: string) => {
                    switch (cat) {
                      case 'culto':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      case 'estudo':
                        return 'bg-sky-100 text-sky-800 border-sky-200';
                      case 'juventude':
                        return 'bg-purple-100 text-purple-800 border-purple-200';
                      case 'festa':
                        return 'bg-amber-100 text-amber-800 border-amber-200';
                      default:
                        return 'bg-slate-100 text-slate-700 border-slate-200';
                    }
                  };

                  return (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Date badge */}
                        <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-amber-300">
                            {formattedMonth}
                          </span>
                          <span className="text-lg font-black leading-none">{day}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadge(
                                evt.category
                              )}`}
                            >
                              {evt.category.toUpperCase()}
                            </span>

                            {/* Destaque da Congregação */}
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Church className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{evt.congregationName || evt.location}</span>
                            </span>

                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {evt.time}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 font-display leading-snug">
                            {evt.title}
                          </h4>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {evt.description}
                          </p>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="font-medium text-slate-700">{evt.location}</span>
                          </div>
                        </div>
                      </div>

                      {(isAdmin || currentUser) && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={(e) => handleDeleteEvent(evt.id, e)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Remover evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* FLOATING AUDIO PLAYER BAR */}
      {/* ========================================================================= */}
      {currentAudio && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700 shadow-2xl p-3 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            {/* Audio Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto truncate">
              <button
                onClick={() => handlePlayAudio(currentAudio)}
                className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md hover:scale-105 active:scale-95 transition"
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                )}
              </button>

              <div className="truncate">
                <h5 className="text-xs sm:text-sm font-bold truncate text-white leading-tight">
                  {currentAudio.title}
                </h5>
                <p className="text-[11px] text-amber-400 truncate">
                  {currentAudio.speaker} • {currentAudio.category}
                </p>
              </div>
            </div>

            {/* Scrubber / Progress Bar */}
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <span className="text-[10px] text-slate-400 w-8 text-right font-mono">
                {formatTime(audioProgress)}
              </span>
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                value={audioProgress}
                onChange={handleSeekAudio}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 w-8 font-mono">
                {formatTime(audioDuration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.muted = !isAudioMuted;
                    setIsAudioMuted(!isAudioMuted);
                  }
                }}
                className="p-1.5 text-slate-300 hover:text-white transition"
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setCurrentAudio(null);
                  setIsPlayingAudio(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white transition"
                title="Fechar reprodutor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIDEO PLAYER */}
      {/* ========================================================================= */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-700 shadow-2xl space-y-4">
            <div className="p-4 bg-slate-800/80 flex items-center justify-between border-b border-slate-700">
              <div className="truncate pr-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {playingVideo.category || 'Mensagem Paroquial'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {playingVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Frame */}
            <div className="relative aspect-video bg-black">
              {getEmbedVideo(playingVideo.videoUrl).type === 'direct' ? (
                <video
                  src={playingVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={getEmbedVideo(playingVideo.videoUrl).src}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>

            <div className="p-4 pt-0 space-y-2 text-slate-300 text-xs">
              <p className="leading-relaxed">{playingVideo.description}</p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Pregador / Autor: <strong className="text-white">{playingVideo.speaker}</strong></span>
                <span>Data: {playingVideo.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STUDY READER */}
      {/* ========================================================================= */}
      {readingStudy && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {readingStudy.category || 'Estudo Bíblico'}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display leading-tight text-white">
                  {readingStudy.title}
                </h3>
              </div>
              <button
                onClick={() => setReadingStudy(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Texto Bíblico Base: <strong>{readingStudy.biblicalPassage}</strong></span>
                </div>
                {onOpenBible && (
                  <button
                    type="button"
                    onClick={() => onOpenBible(readingStudy.biblicalPassage)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Consultar Passagem na Bíblia</span>
                  </button>
                )}
              </div>

              <div className="prose prose-slate max-w-none text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                {readingStudy.content}
              </div>

              {readingStudy.tags && readingStudy.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {readingStudy.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Autor: <strong>{readingStudy.author}</strong> ({readingStudy.date})</span>
              <button
                onClick={() => setReadingStudy(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBIR LINK DE VÍDEO */}
      {/* ========================================================================= */}
      {showAddVideoModal && (
        <AddVideoModal
          onClose={() => setShowAddVideoModal(false)}
          onAdded={() => {
            setShowAddVideoModal(false);
            loadData();
            showToast('Vídeo adicionado com sucesso ao portal!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD DE ÁUDIO */}
      {/* ========================================================================= */}
      {showAddAudioModal && (
        <AddAudioModal
          onClose={() => setShowAddAudioModal(false)}
          onAdded={() => {
            setShowAddAudioModal(false);
            loadData();
            showToast('Áudio disponibilizado com sucesso no portal!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLICAR ESTUDO BÍBLICO */}
      {/* ========================================================================= */}
      {showAddStudyModal && (
        <AddStudyModal
          onClose={() => setShowAddStudyModal(false)}
          onAdded={() => {
            setShowAddStudyModal(false);
            loadData();
            showToast('Estudo bíblico publicado com sucesso!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR EVENTO NO CALENDÁRIO */}
      {/* ========================================================================= */}
      {showAddEventModal && (
        <AddEventModal
          initialCongregationId={calendarCongregationFilter}
          onClose={() => setShowAddEventModal(false)}
          onAdded={() => {
            setShowAddEventModal(false);
            loadData();
            showToast('Culto / evento adicionado com sucesso à congregação!');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs text-center">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-medium">
            <LutherRoseIcon size={20} />
            <span>{settings.appName || 'Plataforma de Ensino Luterano'}</span>
          </div>
          <p>
            {settings.parishName || 'Paróquia Evangélica Luterana São Paulo'} • {settings.pastorName || 'Pastor Everton Figur'}
          </p>
          <p className="text-slate-500 text-[11px]">
            Portal de livre acesso aos membros da comunidade luterana, jovens e famílias.
          </p>
        </div>
      </footer>
    </div>
  );
};

// =========================================================================
// MODAL DE SUBIR LINK DE VÍDEO
// =========================================================================
interface AddVideoModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ onClose, onAdded }) => {
  const { settings } = useAppSettings();
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [speaker, setSpeaker] = useState(settings.pastorName || 'Pastor Everton Figur');
  const [category, setCategory] = useState('Mensagem de Culto');
  const [congregationName, setCongregationName] = useState(settings.parishName || 'CEL São Paulo – Planalto');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert('Por favor, informe o título e o link do vídeo.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.addPublicVideo({
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        speaker: speaker.trim(),
        category,
        congregationName: congregationName.trim(),
        description: description.trim() || 'Gravação em vídeo disponibilizada para edificação paroquial.',
        date: new Date().toISOString().split('T')[0],
      });
      onAdded();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar vídeo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl animate-scale-up">
        <div className="p-4 bg-[#1e3a5f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold font-display text-sm sm:text-base">Subir Link de Vídeo / Mensagem</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Título do Vídeo / Pregação *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Culto Dominical: A Justificação pela Fé"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Link do Vídeo (YouTube, Google Drive, Vimeo ou MP4) *
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>
            <span className="text-[10px] text-slate-500 block pt-1">
              Suporta links de vídeos do YouTube, Vimeo, Google Drive público ou arquivos de vídeo diretos.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pregador / Autor</label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium bg-white"
              >
                <option value="Mensagem de Culto">Mensagem de Culto</option>
                <option value="Estudo Doutrinário">Estudo Doutrinário</option>
                <option value="Família Cristã">Família Cristã</option>
                <option value="Catecismo">Catecismo</option>
                <option value="Juventude">Juventude</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Congregação / Local</label>
            <input
              type="text"
              value={congregationName}
              onChange={(e) => setCongregationName(e.target.value)}
              placeholder="Ex: CEL São Paulo – Planalto"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Breve Descrição / Resumo</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sobre o que é a mensagem ou pregação..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs active:scale-95 transition"
            >
              {isSubmitting ? 'Salvando...' : 'Publicar Vídeo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL DE UPLOAD DE ÁUDIO
// =========================================================================
interface AddAudioModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddAudioModal: React.FC<AddAudioModalProps> = ({ onClose, onAdded }) => {
  const { settings } = useAppSettings();
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState(settings.pastorName || 'Pastor Everton Figur');
  const [category, setCategory] = useState('Pregação Gravada');
  const [description, setDescription] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [audioUrl, setAudioUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('O arquivo de áudio deve ter no máximo 25MB.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      setAudioUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !audioUrl.trim()) {
      alert('Por favor, selecione um arquivo de áudio ou informe o link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.addPublicAudio({
        title: title.trim(),
        audioUrl: audioUrl.trim(),
        speaker: speaker.trim(),
        category,
        description: description.trim() || 'Áudio gravado da mensagem pastoral para edificação dos membros.',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 15,
        fileSize: fileSize || 'Áudio online',
      });
      onAdded();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar áudio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl animate-scale-up">
        <div className="p-4 bg-[#1e3a5f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold font-display text-sm sm:text-base">Upload de Áudio / Mensagem Gravada</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Toggle between File Upload and URL */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                uploadMode === 'file' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar Arquivo (.mp3, .m4a, .wav)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                uploadMode === 'link' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Inserir Link de Áudio</span>
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition text-center space-y-2 bg-slate-50/60">
              <Headphones className="w-8 h-8 text-amber-600 mx-auto" />
              <div>
                <label className="cursor-pointer text-xs font-bold text-[#1e3a5f] hover:underline">
                  Clique aqui para selecionar o áudio
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500">ou arraste e solte o arquivo (até 25MB)</p>
              </div>
              {fileName && (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-[11px] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{fileName} ({fileSize})</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Link Direto do Áudio *</label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3 ou link Google Drive"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Título do Sermão / Áudio *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Sermão sobre o Salmo 23"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pregador / Voz</label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium bg-white"
              >
                <option value="Pregação Gravada">Pregação Gravada</option>
                <option value="Devocional em Áudio">Devocional em Áudio</option>
                <option value="Hinos & Cânticos">Hinos & Cânticos</option>
                <option value="Estudo em Áudio">Estudo em Áudio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Descrição / Comentários</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumo da mensagem bíblica..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !audioUrl}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold shadow-xs active:scale-95 transition"
            >
              {isSubmitting ? 'Enviando...' : 'Publicar Áudio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL DE PUBLICAR ESTUDO BÍBLICO
// =========================================================================
interface AddStudyModalProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddStudyModal: React.FC<AddStudyModalProps> = ({ onClose, onAdded }) => {
  const { settings } = useAppSettings();
  const [title, setTitle] = useState('');
  const [biblicalPassage, setBiblicalPassage] = useState('');
  const [author, setAuthor] = useState(settings.pastorName || 'Pastor Everton Figur');
  const [category, setCategory] = useState('Teologia Luterana');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !biblicalPassage.trim() || !content.trim()) {
      alert('Por favor, preencha o título, passagem bíblica e o conteúdo do estudo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await dbService.addPublicBibleStudy({
        title: title.trim(),
        biblicalPassage: biblicalPassage.trim(),
        author: author.trim(),
        category,
        content: content.trim(),
        tags,
        date: new Date().toISOString().split('T')[0],
      });
      onAdded();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar estudo bíblico. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
        <div className="p-4 bg-[#1e3a5f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold font-display text-sm sm:text-base">Publicar Estudo Bíblico</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Título do Estudo *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: A Graça Salvadora e o Livre Arbítrio"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Passagem Bíblica Base *</label>
              <input
                type="text"
                required
                value={biblicalPassage}
                onChange={(e) => setBiblicalPassage(e.target.value)}
                placeholder="Ex: Efésios 2.8-10"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium bg-white"
              >
                <option value="Teologia Luterana">Teologia Luterana</option>
                <option value="Sacramentos">Sacramentos</option>
                <option value="Família Cristã">Família Cristã</option>
                <option value="Vida Cristã">Vida Cristã</option>
                <option value="História da Reforma">História da Reforma</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Autor / Responsável</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Conteúdo do Estudo (Texto Completo) *</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva aqui os pontos do estudo, explicações e reflexões bíblicas..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Reforma, Graça, Fé, Batismo"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs active:scale-95 transition"
            >
              {isSubmitting ? 'Salvando...' : 'Publicar Estudo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// MODAL DE ADICIONAR EVENTO / HORÁRIO DE CULTO NO CALENDÁRIO
// =========================================================================
interface AddEventModalProps {
  onClose: () => void;
  onAdded: () => void;
  initialCongregationId?: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  onClose,
  onAdded,
  initialCongregationId,
}) => {
  const { settings } = useAppSettings();
  const congregations = dbService.getCongregations();

  // Determine initial selected congregation
  const getInitialCongId = () => {
    if (initialCongregationId && initialCongregationId !== 'all') {
      return initialCongregationId;
    }
    return congregations.length > 0 ? congregations[0].id : 'cel-sao-paulo';
  };

  const [selectedCongId, setSelectedCongId] = useState<string>(getInitialCongId());
  const [customLocation, setCustomLocation] = useState('');
  const [title, setTitle] = useState('Culto Dominical');
  const [date, setDate] = useState(() => {
    // Default to next Sunday or today if today is Sunday
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<'culto' | 'estudo' | 'reuniao' | 'juventude' | 'festa' | 'geral'>('culto');
  const [description, setDescription] = useState('Culto presencial com celebração da Palavra de Deus. Todos são bem-vindos!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected congregation object
  const selectedCong = congregations.find((c) => c.id === selectedCongId);

  // Quick preset helper
  const applyPreset = (presetTitle: string, presetCategory: any, presetTime: string, presetDesc: string) => {
    setTitle(presetTitle);
    setCategory(presetCategory);
    setTime(presetTime);
    setDescription(presetDesc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalLocation = '';
    let finalCongregationName = '';

    if (selectedCongId === 'paroquial' || selectedCongId === 'all') {
      finalLocation = 'Paróquia Evangélica Luterana (Evento Geral)';
      finalCongregationName = 'Geral da Paróquia';
    } else if (selectedCongId === 'custom') {
      if (!customLocation.trim()) {
        alert('Por favor, digite o nome do local ou comunidade.');
        return;
      }
      finalLocation = customLocation.trim();
      finalCongregationName = customLocation.trim();
    } else if (selectedCong) {
      finalLocation = `${selectedCong.name} – ${selectedCong.city}`;
      finalCongregationName = selectedCong.name;
    } else {
      finalLocation = settings.parishName || 'CEL São Paulo – Planalto';
      finalCongregationName = finalLocation;
    }

    if (!title.trim() || !date.trim()) {
      alert('Por favor, informe o título e a data do culto.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.addPublicEvent({
        title: title.trim(),
        date,
        time,
        location: finalLocation,
        congregationId: selectedCongId === 'custom' ? undefined : selectedCongId,
        congregationName: finalCongregationName,
        category,
        description: description.trim() || 'Culto ou evento da congregação.',
      });
      onAdded();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-200 shadow-2xl animate-scale-up my-6">
        {/* Header */}
        <div className="p-4 bg-[#1e3a5f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-display text-sm sm:text-base">
                Adicionar Horário de Culto / Evento
              </h3>
              <p className="text-[11px] text-slate-300">
                Escolha a congregação e defina a programação
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* SELEÇÃO DA CONGREGAÇÃO */}
          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                <Church className="w-4 h-4 text-amber-700" />
                <span>Escolha a Congregação para este Culto *</span>
              </label>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                Obrigatório
              </span>
            </div>

            <select
              value={selectedCongId}
              onChange={(e) => setSelectedCongId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-amber-300 focus:border-amber-600 bg-white font-bold text-slate-800 text-xs shadow-2xs outline-hidden"
            >
              <optgroup label="Congregações da Paróquia">
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    ⛪ {c.name} — {c.city}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Outros">
                <option value="paroquial">🌐 Toda a Paróquia (Evento Geral / Conjunto)</option>
                <option value="custom">📍 Outro Local / Comunidade Específica</option>
              </optgroup>
            </select>

            {/* Informações da congregação selecionada */}
            {selectedCong && (
              <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-xl flex items-center justify-between flex-wrap gap-1">
                <span>
                  📍 <strong>{selectedCong.city} - {selectedCong.state}</strong>
                </span>
                {selectedCong.pastorName && (
                  <span>
                    Pastoral: <strong>{selectedCong.pastorName}</strong>
                  </span>
                )}
              </div>
            )}

            {/* Campo para local personalizado */}
            {selectedCongId === 'custom' && (
              <div className="pt-1">
                <input
                  type="text"
                  required
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Informe o nome da capela, salão ou endereço..."
                  className="w-full p-2.5 rounded-xl border border-amber-300 focus:border-amber-600 bg-white text-xs font-medium outline-hidden"
                />
              </div>
            )}
          </div>

          {/* MODELOS RÁPIDOS DE CULTO */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Atalhos Rápidos de Horário de Culto:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Culto Dominical com Santa Ceia',
                    'culto',
                    '09:00',
                    'Celebração do Culto Dominical com a Santa Ceia do Senhor. Confissão e absolvição.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition cursor-pointer"
              >
                🍷 Culto c/ Santa Ceia (09:00)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Culto Dominical Matutino',
                    'culto',
                    '09:00',
                    'Culto dominical com pregação do Santo Evangelho e cânticos de louvor.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-[11px] transition cursor-pointer"
              >
                ☀️ Culto Dominical (09:00)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Culto Noturno de Louvor',
                    'culto',
                    '19:00',
                    'Culto à noite com mensagem edificante e oração comunitária.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[11px] transition cursor-pointer"
              >
                🌙 Culto Noturno (19:00)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Estudo Bíblico Paroquial',
                    'estudo',
                    '19:30',
                    'Estudo bíblico temático e momento de edificação doutrinária.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition cursor-pointer"
              >
                📖 Estudo Bíblico (19:30)
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset(
                    'Encontro da Juventude (JELB)',
                    'juventude',
                    '19:00',
                    'Encontro com dinâmicas, louvor e estudo da Palavra com os jovens da congregação.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[11px] transition cursor-pointer"
              >
                🔥 Juventude JELB (19:00)
              </button>
            </div>
          </div>

          {/* TÍTULO DO EVENTO */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Título do Culto ou Atividade *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Culto Festivo de Ação de Graças"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
            />
          </div>

          {/* DATA E HORÁRIO */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Data *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Horário *</label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTime('09:00')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    09:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setTime('10:00')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setTime('19:00')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    19:00
                  </button>
                </div>
              </div>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* TIPO DE EVENTO */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tipo de Evento</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium bg-white"
            >
              <option value="culto">Culto</option>
              <option value="estudo">Estudo Bíblico</option>
              <option value="juventude">Juventude (JELB)</option>
              <option value="festa">Festa / Almoço Comunitário</option>
              <option value="reuniao">Reunião Paroquial</option>
              <option value="geral">Geral</option>
            </select>
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Observações / Detalhes do Culto
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Santa Ceia, bênção especial das famílias, oração pelos enfermos..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-slate-800 outline-hidden font-medium resize-none"
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Adicionar ao Calendário'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
