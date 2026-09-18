import React, { useState } from 'react';
import { ChurchEvent } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ExternalLink,
  Tag
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  culto: {
    label: 'Culto',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  encontro: {
    label: 'Encontro',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    dot: 'bg-emerald-500',
  },
  retiro: {
    label: 'Retiro',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    dot: 'bg-purple-500',
  },
  aula: {
    label: 'Aula',
    bg: 'bg-sky-100',
    text: 'text-sky-900',
    dot: 'bg-sky-500',
  },
  reuniao: {
    label: 'Reunião',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    dot: 'bg-rose-500',
  },
  comemoracao: {
    label: 'Comemoração',
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    dot: 'bg-indigo-500',
  },
  outro: {
    label: 'Geral',
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    dot: 'bg-slate-500',
  },
};

interface InteractiveCalendarProps {
  events: ChurchEvent[];
  onSelectDay?: (dateStr: string) => void;
  isAdmin?: boolean;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({ 
  events,
  onSelectDay,
  isAdmin = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Build calendar matrix
  const calendarCells = [];
  // Days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({ dayNum: prevMonthDays - i, isCurrentMonth: false, dateStr: '' });
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

  const selectedDayEvents = events.filter(e => e.date === selectedDate);
  const hasEventsOnDate = (dateStr: string) => events.some(e => e.date === dateStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              {MONTH_NAMES[month]} {year}
            </h3>
            <button
              onClick={handleGoToday}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition"
            >
              Hoje
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase pb-2">
          {WEEKDAY_NAMES.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const isSelected = selectedDate === cell.dateStr;
            const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;
            const hasEvent = cell.isCurrentMonth && hasEventsOnDate(cell.dateStr);
            const dayEvents = events.filter(e => e.date === cell.dateStr);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    setSelectedDate(cell.dateStr);
                    onSelectDay?.(cell.dateStr);
                  }
                }}
                className={`
                  relative min-h-[60px] sm:min-h-[80px] p-1.5 rounded-xl border transition-all cursor-pointer
                  ${!cell.isCurrentMonth ? 'bg-slate-50/50 text-slate-300 border-transparent pointer-events-none' : ''}
                  ${cell.isCurrentMonth && isSelected ? 'border-amber-500 bg-amber-50/20 ring-1 ring-amber-500/20' : 'border-slate-100 bg-white hover:border-slate-300'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`
                    text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-amber-500 text-slate-900' : isSelected ? 'text-amber-700' : 'text-slate-600'}
                  `}>
                    {cell.dayNum}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-0.5">
                  {cell.isCurrentMonth && dayEvents.slice(0, 3).map((e, i) => {
                    const style = CATEGORY_STYLES[e.category || 'outro'] || CATEGORY_STYLES.outro;
                    return (
                      <div 
                        key={e.id} 
                        className={`w-full h-1.5 rounded-full ${style.dot} opacity-80`}
                        title={e.title}
                      />
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] font-bold text-slate-400 pl-0.5">+{dayEvents.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          {Object.entries(CATEGORY_STYLES).slice(0, 6).map(([key, item]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
              <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Events Detail Section */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-xs font-display">
                Agenda: {selectedDate.split('-').reverse().join('/')}
              </h4>
            </div>
            {isAdmin && (
              <button className="text-[10px] font-bold text-amber-700 hover:underline">
                Adicionar
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1 scrollbar-hide">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map(evt => {
                const style = CATEGORY_STYLES[evt.category || 'outro'] || CATEGORY_STYLES.outro;
                return (
                  <div 
                    key={evt.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 hover:border-slate-200 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.time}
                      </span>
                    </div>
                    
                    <h5 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition">
                      {evt.title}
                    </h5>

                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 text-[10px] text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-tight">{evt.location}</span>
                      </div>
                      
                      {evt.description && (
                        <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200/50 pt-1 mt-1">
                          {evt.description}
                        </p>
                      )}
                    </div>

                    {evt.externalLink && (
                      <a 
                        href={evt.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 hover:text-sky-900 pt-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Acessar Link / Transmissão
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-40">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Nenhum evento nesta data
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              * Eventos marcados como "Geral" podem sofrer alterações. Em caso de dúvidas, contate a secretaria paroquial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
