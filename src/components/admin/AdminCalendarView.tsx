import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { ChurchEvent } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
  Building,
  Tag,
  Share2,
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  culto: {
    label: 'Culto Especial',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
  },
  encontro: {
    label: 'Encontro de Confirmandos',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
  },
  retiro: {
    label: 'Retiro Espiritual',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
  },
  aula: {
    label: 'Aula Extraordinária',
    bg: 'bg-sky-100',
    text: 'text-sky-900',
    border: 'border-sky-300',
  },
  reuniao: {
    label: 'Reunião de Pais',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    border: 'border-rose-300',
  },
  comemoracao: {
    label: 'Data Comemorativa',
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
  },
  outro: {
    label: 'Geral / Comunitário',
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-300',
  },
};

export const AdminCalendarView: React.FC = () => {
  const congregations = dbService.getCongregations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterCongregation, setFilterCongregation] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [congregationId, setCongregationId] = useState<'all' | string>('all');
  const [category, setCategory] = useState<string>('culto');
  const [externalLink, setExternalLink] = useState('');

  const events = dbService.getEvents();

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenNewEvent = (presetDate?: string) => {
    setEditingEvent(null);
    setTitle('');
    const defaultDate =
      presetDate ||
      `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    setDate(defaultDate);
    setTime('09:00');
    setLocation('Igreja Matriz');
    setDescription('');
    setCongregationId('all');
    setCategory('culto');
    setExternalLink('');
    setIsModalOpen(true);
  };

  const handleOpenEditEvent = (evt: ChurchEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time);
    setLocation(evt.location);
    setDescription(evt.description);
    setCongregationId(evt.congregationId);
    setCategory(evt.category || 'culto');
    setExternalLink(evt.externalLink || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Preencha ao menos o título e a data do evento.');
      return;
    }

    const eventId = editingEvent ? editingEvent.id : 'evt-' + Date.now();

    const eventToSave: ChurchEvent = {
      id: eventId,
      title: title.trim(),
      date,
      time: time || '09:00',
      location: location.trim() || 'Igreja Matriz',
      description: description.trim(),
      congregationId,
      category,
      externalLink: externalLink.trim() || undefined,
    };

    dbService.saveEvent(eventToSave);
    setIsModalOpen(false);
    setFeedback(`Evento "${eventToSave.title}" salvo com sucesso no calendário!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeleteEvent = (id: string, evtTitle: string) => {
    if (confirm(`Deseja excluir o evento "${evtTitle}" do calendário?`)) {
      dbService.deleteEvent(id);
      setFeedback(`Evento "${evtTitle}" removido.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Build calendar matrix
  const calendarCells = [];
  // Days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    calendarCells.push({ dayNum, isCurrentMonth: false, dateStr: '' });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNum: d, isCurrentMonth: true, dateStr });
  }
  // Trailing next month days
  const remainingCells = 42 - calendarCells.length;
  for (let n = 1; n <= remainingCells; n++) {
    calendarCells.push({ dayNum: n, isCurrentMonth: false, dateStr: '' });
  }

  // Filtered upcoming events list
  const filteredEvents = events
    .filter((e) => filterCongregation === 'all' || e.congregationId === 'all' || e.congregationId === filterCongregation)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
              Agenda Paroquial & Litúrgica
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Calendário de Eventos da Igreja
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Organize os cultos especiais, encontros de confirmandos, retiros bíblicos, reuniões de pais e aulas extraordinárias visíveis para toda a paróquia.
          </p>
        </div>

        <button
          onClick={() => handleOpenNewEvent()}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Novo Evento</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Grid: Calendar on Left, Upcoming Events on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CALENDAR VIEW (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          {/* Calendar Navigation Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {MONTH_NAMES[month]} de {year}
              </h3>
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                Hoje
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase py-1 border-b border-slate-100">
            {WEEKDAY_NAMES.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[75px] sm:min-h-[90px] p-1.5 rounded-xl bg-slate-50/50 text-slate-300 text-xs text-right"
                  >
                    <span>{cell.dayNum}</span>
                  </div>
                );
              }

              const dayEvents = events.filter((e) => e.date === cell.dateStr);
              const isToday =
                new Date().toISOString().slice(0, 10) === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenNewEvent(cell.dateStr)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1.5 rounded-xl border transition flex flex-col justify-between group cursor-pointer hover:border-[#1e3a5f]/40 hover:bg-blue-50/20 ${
                    isToday
                      ? 'border-amber-400 bg-amber-50/20'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-amber-500 text-slate-950' : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#1e3a5f] text-[10px]">
                      +
                    </span>
                  </div>

                  {/* Day Events Pills */}
                  <div className="space-y-1 overflow-hidden mt-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const style = CATEGORY_STYLES[ev.category || 'outro'] || CATEGORY_STYLES.outro;
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditEvent(ev);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate border ${style.bg} ${style.text} ${style.border}`}
                          title={`${ev.time} - ${ev.title} (${ev.location})`}
                        >
                          {ev.time} {ev.title}
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block text-center">
                        +{dayEvents.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Categorias:</span>
            {Object.entries(CATEGORY_STYLES).map(([key, item]) => (
              <div key={key} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg} border ${item.border}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR: UPCOMING EVENTS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#1e3a5f]" />
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Lista de Eventos Cadastrados
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredEvents.length}
              </span>
            </div>

            {/* Filter by congregation */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Filtrar por Congregação:
              </label>
              <select
                value={filterCongregation}
                onChange={(e) => setFilterCongregation(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="all">Todas as Congregações Paroquiais</option>
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredEvents.map((evt) => {
                const style = CATEGORY_STYLES[evt.category || 'outro'] || CATEGORY_STYLES.outro;
                const cong = congregations.find((c) => c.id === evt.congregationId);

                return (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEvent(evt)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition"
                          title="Editar evento"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 transition"
                          title="Excluir evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{evt.title}</h4>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span className="font-semibold text-slate-700">
                          {evt.date.split('-').reverse().join('/')} às {evt.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{evt.location}</span>
                      </div>
                      {cong && (
                        <div className="flex items-center gap-1 text-[10px] text-sky-700">
                          <Building className="w-3 h-3" />
                          <span>{cong.name}</span>
                        </div>
                      )}
                    </div>

                    {evt.description && (
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 line-clamp-2">
                        {evt.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Nenhum evento registrado com os filtros selecionados.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleOpenNewEvent()}
            className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Evento</span>
          </button>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  Agenda e Liturgia da Paróquia
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingEvent ? 'Editar Evento' : 'Novo Evento no Calendário'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 overflow-y-auto pr-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Culto de Confirmação & Santa Ceia"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a5f] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="culto">Culto Especial</option>
                    <option value="encontro">Encontro de Confirmandos</option>
                    <option value="retiro">Retiro Espiritual</option>
                    <option value="aula">Aula Extraordinária</option>
                    <option value="reuniao">Reunião de Pais</option>
                    <option value="comemoracao">Data Comemorativa</option>
                    <option value="outro">Geral / Comunitário</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Congregação Destino</label>
                  <select
                    value={congregationId}
                    onChange={(e) => setCongregationId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">Todas as Congregações (Paróquia)</option>
                    {congregations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data (Ano-Mês-Dia) *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Local / Endereço</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Templo Matriz - Rua das Acácias, 100"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição / Informações</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes para os alunos e famílias: o que levar, traje, leituras bíblicas preparatórias..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Link Externo ou Transmissão (Opcional)
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://youtube.com/... ou link de reunião"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {editingEvent ? 'Salvar Evento' : 'Publicar no Calendário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
