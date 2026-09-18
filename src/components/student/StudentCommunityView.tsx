import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Devotion, ChurchEvent, Announcement, StudyText } from '../../types';
import {
  HeartHandshake,
  Calendar,
  Bell,
  BookOpen,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { InteractiveCalendar } from '../common/InteractiveCalendar';

export const StudentCommunityView: React.FC<{ initialSection?: 'devocionais' | 'eventos' | 'avisos' | 'textos' }> = ({
  initialSection = 'devocionais',
}) => {
  const { studentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'devocionais' | 'eventos' | 'avisos' | 'textos'>(initialSection);

  const courseType = studentProfile?.courseType || 'confirmatorio';
  const congregationId = studentProfile?.congregationId;

  const devotions = dbService.getDevotions(courseType);
  const events = dbService.getEvents(congregationId);
  const announcements = dbService.getAnnouncements(courseType);
  const studyTexts = dbService.getStudyTexts();

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2">
        <button
          onClick={() => setActiveTab('devocionais')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'devocionais'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Devoções Diárias</span>
        </button>

        <button
          onClick={() => setActiveTab('eventos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'eventos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Eventos da Igreja</span>
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'avisos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos Paroquiais</span>
        </button>

        <button
          onClick={() => setActiveTab('textos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'textos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Textos e Estudos</span>
        </button>
      </div>

      {/* DEVOTIONS */}
      {activeTab === 'devocionais' && (
        <div className="space-y-4">
          {devotions.map((dev) => (
            <div
              key={dev.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Devoção do Dia • {dev.date}
                </span>
                <span className="text-xs text-slate-400">Pastor Everton Figur</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-display">{dev.title}</h3>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs font-serif text-amber-950 italic">
                {dev.verse}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p>{dev.content}</p>
              </div>

              {dev.prayer && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold block text-slate-900">Oração:</span>
                  <p className="italic">“{dev.prayer}”</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EVENTS */}
      {activeTab === 'eventos' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold font-display">Agenda Paroquial</h3>
              <p className="text-[11px] text-sky-100 mt-1 max-w-sm">
                Fique por dentro de todos os cultos, encontros de jovens e datas especiais da nossa comunidade.
              </p>
            </div>
            <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          </div>

          <InteractiveCalendar events={events} />
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-900 leading-relaxed">
              <strong>Nota:</strong> Clique em um dia com marcador colorido para ver os detalhes do evento programado. Os horários e locais podem ser alterados pelo Pastor conforme a necessidade da paróquia.
            </p>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeTab === 'avisos' && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 font-display">{ann.title}</h4>
                <span className="text-[11px] text-slate-400">{ann.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
              <p className="text-[10px] text-amber-700 font-bold">
                Publicado por: {ann.author}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* STUDY TEXTS */}
      {activeTab === 'textos' && (
        <div className="space-y-3">
          {studyTexts.map((text) => (
            <div
              key={text.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {text.category}
                </span>
                <span className="text-[11px] text-slate-400">{text.date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-display">{text.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{text.content}</p>
              <p className="text-[10px] text-slate-500 italic">Autor: {text.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
