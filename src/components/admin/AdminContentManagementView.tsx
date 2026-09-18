import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { Devotion, ChurchEvent, Announcement, StudyText, AudienceType } from '../../types';
import {
  BookOpen,
  HeartHandshake,
  Calendar,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AdminContentManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devoções' | 'eventos' | 'avisos' | 'textos'>('devoções');
  const [modalType, setModalType] = useState<'devoção' | 'evento' | 'aviso' | 'texto' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states for Devoção
  const [devTitle, setDevTitle] = useState('');
  const [devVerse, setDevVerse] = useState('');
  const [devContent, setDevContent] = useState('');
  const [devPrayer, setDevPrayer] = useState('');
  const [devAudience, setDevAudience] = useState<AudienceType>('all');

  // Form states for Evento
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState(new Date().toISOString().split('T')[0]);
  const [evtTime, setEvtTime] = useState('19:30');
  const [evtLocation, setEvtLocation] = useState('Igreja Matriz');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtCongregationId, setEvtCongregationId] = useState('all');

  // Form states for Aviso
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState<AudienceType>('all');

  // Form states for Texto
  const [txtTitle, setTxtTitle] = useState('');
  const [txtCategory, setTxtCategory] = useState('Doutrina Luterana');
  const [txtContent, setTxtContent] = useState('');

  const devotions = dbService.getDevotions();
  const events = dbService.getEvents();
  const announcements = dbService.getAnnouncements();
  const studyTexts = dbService.getStudyTexts();
  const congregations = dbService.getCongregations();

  const handleSaveDevotion = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveDevotion({
      id: 'dev-' + Date.now(),
      title: devTitle,
      bibleVerse: devVerse,
      reflection: devContent,
      prayer: devPrayer,
      author: 'Pastor Everton Figur',
      date: new Date().toISOString().split('T')[0],
      targetAudience: devAudience,
    });
    setFeedback('Devoção publicada com sucesso!');
    setModalType(null);
    setDevTitle('');
    setDevVerse('');
    setDevContent('');
    setDevPrayer('');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveEvent({
      id: 'evt-' + Date.now(),
      title: evtTitle,
      date: evtDate,
      time: evtTime,
      location: evtLocation,
      description: evtDesc,
      congregationId: evtCongregationId,
    });
    setFeedback('Evento cadastrado com sucesso!');
    setModalType(null);
    setEvtTitle('');
    setEvtDesc('');
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveAnnouncement({
      id: 'ann-' + Date.now(),
      title: annTitle,
      content: annContent,
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      author: 'Pastor Everton Figur',
      targetAudience: annAudience,
    });
    setFeedback('Aviso paroquial publicado com sucesso!');
    setModalType(null);
    setAnnTitle('');
    setAnnContent('');
  };

  const handleSaveStudyText = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveStudyText({
      id: 'txt-' + Date.now(),
      title: txtTitle,
      category: txtCategory as any,
      summary: txtContent.slice(0, 100) + '...',
      content: txtContent,
      author: 'Pastor Everton Figur',
      date: new Date().toISOString().split('T')[0],
    });
    setFeedback('Texto de estudo adicionado com sucesso!');
    setModalType(null);
    setTxtTitle('');
    setTxtContent('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display">Gestão de Conteúdos</h2>
            <p className="text-xs text-amber-200">
              Publicação de devoções diárias, agenda de eventos paroquiais, avisos e textos doutrinários.
            </p>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'devoções') setModalType('devoção');
              else if (activeTab === 'eventos') setModalType('evento');
              else if (activeTab === 'avisos') setModalType('aviso');
              else setModalType('texto');
            }}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Novo Item</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('devoções')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'devoções'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Devoções ({devotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eventos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'eventos'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Eventos ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'avisos'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('textos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'textos'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Textos ({studyTexts.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'devoções' && (
        <div className="space-y-3">
          {devotions.map((dev) => (
            <div
              key={dev.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{dev.title}</h4>
                  <span className="text-[10px] text-slate-400">{dev.date}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold">
                    Público: {dev.targetAudience}
                  </span>
                </div>
                <p className="italic text-amber-800 font-serif">{dev.bibleVerse}</p>
                <p className="text-slate-600 line-clamp-2">{dev.reflection}</p>
              </div>

              <button
                onClick={async () => {
                  await dbService.deleteDevotion(dev.id);
                  setFeedback('Devoção excluída.');
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'eventos' && (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{evt.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                    {evt.date} às {evt.time}
                  </span>
                </div>
                <p className="text-slate-500">Local: {evt.location}</p>
                <p className="text-slate-600">{evt.description}</p>
              </div>

              <button
                onClick={async () => {
                  await dbService.deleteEvent(evt.id);
                  setFeedback('Evento excluído.');
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'avisos' && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{ann.title}</h4>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{ann.content}</p>
              </div>

              <button
                onClick={async () => {
                  await dbService.deleteAnnouncement(ann.id);
                  setFeedback('Aviso excluído.');
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'textos' && (
        <div className="space-y-3">
          {studyTexts.map((txt) => (
            <div
              key={txt.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{txt.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {txt.category}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{txt.content}</p>
              </div>

              <button
                onClick={async () => {
                  await dbService.deleteStudyText(txt.id);
                  setFeedback('Texto excluído.');
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display capitalize">
                Publicar Nova {modalType}
              </h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'devoção' && (
              <form onSubmit={handleSaveDevotion} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Título da Devoção *</label>
                  <input
                    type="text"
                    required
                    value={devTitle}
                    onChange={(e) => setDevTitle(e.target.value)}
                    placeholder="Ex: Pela Graça Mediante a Fé"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Versículo Bíblico Base *</label>
                  <input
                    type="text"
                    required
                    value={devVerse}
                    onChange={(e) => setDevVerse(e.target.value)}
                    placeholder="Ex: Efésios 2.8-9 — Porque pela graça sois salvos..."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Reflexão Doutrinária *</label>
                  <textarea
                    rows={4}
                    required
                    value={devContent}
                    onChange={(e) => setDevContent(e.target.value)}
                    placeholder="Texto explicativo para os alunos..."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Oração Final</label>
                  <input
                    type="text"
                    value={devPrayer}
                    onChange={(e) => setDevPrayer(e.target.value)}
                    placeholder="Senhor Deus, fortalece nossa fé..."
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="py-2 px-4 rounded-xl border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-amber-600 text-white font-bold"
                  >
                    Salvar Devoção
                  </button>
                </div>
              </form>
            )}

            {modalType === 'evento' && (
              <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Título do Evento *</label>
                  <input
                    type="text"
                    required
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="Ex: Retiro Paroquial de Confirmandos"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold block mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Horário *</label>
                    <input
                      type="text"
                      required
                      value={evtTime}
                      onChange={(e) => setEvtTime(e.target.value)}
                      placeholder="19:30"
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold block mb-1">Local *</label>
                  <input
                    type="text"
                    required
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    placeholder="CEL São Paulo - Salão Paroquial"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="py-2 px-4 rounded-xl border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-sky-700 text-white font-bold"
                  >
                    Salvar Evento
                  </button>
                </div>
              </form>
            )}

            {modalType === 'aviso' && (
              <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Título do Aviso *</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Ex: Entrega dos relatórios de culto do mês"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Conteúdo do Comunicado *</label>
                  <textarea
                    rows={4}
                    required
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="py-2 px-4 rounded-xl border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-[#1e3a5f] text-white font-bold"
                  >
                    Publicar Aviso
                  </button>
                </div>
              </form>
            )}

            {modalType === 'texto' && (
              <form onSubmit={handleSaveStudyText} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Título do Texto *</label>
                  <input
                    type="text"
                    required
                    value={txtTitle}
                    onChange={(e) => setTxtTitle(e.target.value)}
                    placeholder="Ex: Os Três Usos da Lei de Deus"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={txtCategory}
                    onChange={(e) => setTxtCategory(e.target.value)}
                    placeholder="Doutrina / História da Reforma"
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Conteúdo do Estudo *</label>
                  <textarea
                    rows={5}
                    required
                    value={txtContent}
                    onChange={(e) => setTxtContent(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="py-2 px-4 rounded-xl border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-amber-700 text-white font-bold"
                  >
                    Salvar Texto
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
