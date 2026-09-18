import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { CatechismSection, CatechismAssessment } from '../../types';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const StudentCatechismView: React.FC = () => {
  const { studentProfile } = useAuth();
  if (!studentProfile) return null;

  const sections = dbService.getCatechismSections();
  const assessments = dbService.getCatechismAssessmentsByStudent(studentProfile.id);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || 'cat-1');
  const [activeTab, setActiveTab] = useState<'reader' | 'memorizacao'>('reader');

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const getAssessment = (sectionId: string): CatechismAssessment | undefined => {
    return assessments.find((a) => a.sectionId === sectionId);
  };

  const memorizedCount = assessments.filter((a) => a.status === 'Memorizado').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Doutrina Luterana Fundamental</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Catecismo Menor do Dr. Martinho Lutero
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            As seis partes principais da doutrina cristã, orações diárias e tábua dos deveres para a instrução na família e na igreja.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-amber-200">
            <span>Memorizados: {memorizedCount} de {sections.length}</span>
            <span>•</span>
            <span>Avaliado pelo Pastor Everton Figur</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('reader')}
          className={`pb-3 font-bold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 ${
            activeTab === 'reader'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Leitura e Estudo</span>
        </button>

        <button
          onClick={() => setActiveTab('memorizacao')}
          className={`pb-3 font-bold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 ${
            activeTab === 'memorizacao'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Controle de Memorização ({memorizedCount}/{sections.length})</span>
        </button>
      </div>

      {/* TAB 1: Reader */}
      {activeTab === 'reader' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Section Selector list */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Seções do Catecismo
            </h4>
            <div className="space-y-1.5">
              {sections.map((sec) => {
                const assessment = getAssessment(sec.id);
                const isSelected = sec.id === selectedSectionId;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-medium transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#1e3a5f] text-white shadow-sm font-bold'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <span className="opacity-70 mr-1.5">#{sec.number}</span>
                      <span>{sec.title}</span>
                    </div>
                    {assessment?.status === 'Memorizado' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Content Display */}
          <div className="md:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Seção {selectedSection.number}
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {selectedSection.title}
                </h3>
              </div>

              {/* Status badge */}
              {getAssessment(selectedSection.id) && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    getAssessment(selectedSection.id)?.status === 'Memorizado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : getAssessment(selectedSection.id)?.status === 'Em andamento'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getAssessment(selectedSection.id)?.status}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-serif">
              {selectedSection.description}
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
              {selectedSection.content}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Memorization Tracker */}
      {activeTab === 'memorizacao' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <div>
              <span className="font-bold block">Acompanhamento Pastoral da Memorização</span>
              <span>
                As avaliações de memorização são atualizadas pelo <strong>Pastor Everton Figur</strong> durante as aulas e arguições orais.
              </span>
            </div>
            <div className="text-right flex-shrink-0 pl-3">
              <span className="text-xl font-bold text-amber-800 font-display">{memorizedCount}</span>
              <span className="text-xs text-amber-700"> / {sections.length} seções</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec) => {
              const assessment = getAssessment(sec.id);
              const isMemorized = assessment?.status === 'Memorizado';
              const isProgress = assessment?.status === 'Em andamento';

              return (
                <div
                  key={sec.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {sec.number}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {sec.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isMemorized
                          ? 'bg-emerald-100 text-emerald-800'
                          : isProgress
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {assessment?.status || 'Não avaliado'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Nota atribuída:</span>
                      <span className="font-bold text-slate-900">
                        {assessment?.score !== undefined ? `${assessment.score} / 10` : '--'}
                      </span>
                    </div>

                    {assessment?.date && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Data da arguição:</span>
                        <span>{assessment.date}</span>
                      </div>
                    )}

                    {assessment?.notes && (
                      <div className="pt-1.5 border-t border-slate-200/60 text-slate-700">
                        <span className="font-semibold block text-[11px] text-amber-900">
                          Observação Pastoral:
                        </span>
                        <p className="italic text-[11px]">“{assessment.notes}”</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
