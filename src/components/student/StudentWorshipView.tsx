import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { WorshipRecord, MonthAttendanceStatus } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  BookOpen,
  Calendar,
  AlertCircle,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const StudentWorshipView: React.FC = () => {
  const { studentProfile } = useAuth();
  if (!studentProfile) return null;

  if (studentProfile.courseType !== 'confirmatorio') {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
          <CalendarCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold font-display text-slate-900">
          Módulo Exclusivo do Ensino Confirmatório
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          O registro e acompanhamento dos <strong>24 cultos</strong> é obrigatório apenas para alunos do <strong>Ensino Confirmatório</strong> (jovens na formação de 24 meses).
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Os participantes do curso de <strong>Profissão de Fé</strong> realizam sua caminhada através dos módulos doutrinários, do Catecismo Menor e da comunhão dominical com a congregação, sem a necessidade de submissão mensal de fichas de cultos.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'grid' | 'novo' | 'historico'>('grid');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<WorshipRecord | null>(null);

  // Form states
  const [worshipDate, setWorshipDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [biblicalReading, setBiblicalReading] = useState('');
  const [messageTheme, setMessageTheme] = useState('');
  const [messageSummary, setMessageSummary] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [targetMonthIndex, setTargetMonthIndex] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const worshipRecords = dbService.getWorshipRecordsByStudent(studentProfile.id);
  const approvedCount = worshipRecords.filter((w) => w.status === 'approved').length;
  const pendingCount = worshipRecords.filter((w) => w.status === 'pending').length;
  const percentage = Math.min(100, Math.round((approvedCount / 24) * 100));

  // Build grid of 24 months
  // Year 1: monthIndex 1..12, Year 2: monthIndex 13..24
  const getMonthRecord = (monthIdx: number) => {
    return worshipRecords.find((w) => w.monthIndex === monthIdx);
  };

  const handleSubmitWorship = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!worshipDate || !biblicalReading || !messageSummary) {
      setError('Por favor, preencha a data do culto, leitura bíblica e o resumo da mensagem.');
      return;
    }

    const existingMonthRecord = getMonthRecord(targetMonthIndex);
    if (existingMonthRecord && existingMonthRecord.status === 'approved') {
      setError('A presença deste mês já foi confirmada e aprovada pelo Pastor. Não é possível alterar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.submitWorshipRecord({
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        congregationId: studentProfile.congregationId || 'cong-1',
        congregationName: studentProfile.congregationName || 'CEL Paroquial',
        monthIndex: targetMonthIndex,
        worshipDate,
        scriptureReading: biblicalReading,
        biblicalReading,
        sermonText: messageTheme,
        messageTheme,
        sermonSummary: messageSummary,
        messageSummary,
        photoUrl,
      }, photoFile || undefined);

      setSuccessMsg('Resumo do culto enviado com sucesso! Aguarde a aprovação do Pastor Everton Figur.');
      // Reset form
      setBiblicalReading('');
      setMessageTheme('');
      setMessageSummary('');
      setPhotoUrl('');
      setPhotoFile(null);
      setActiveTab('historico');
    } catch (err) {
      setError('Ocorreu um erro ao enviar o resumo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Frequência Eclesiástica • 24 Meses</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">Cultos e Presenças</h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Acompanhe o registro mensal de presença nos cultos de nossa congregação. Envie o resumo e a foto do culto para aprovação pastoral.
          </p>

          {/* Progress Indicator */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200 mb-1.5">
              <span>Presenças Aprovadas: {approvedCount} de 24</span>
              <span>{percentage}% concluído</span>
            </div>
            <div className="w-full bg-emerald-950/60 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-600/40">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('grid')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 ${
            activeTab === 'grid'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Quadro dos 24 Meses</span>
        </button>

        <button
          onClick={() => setActiveTab('novo')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 ${
            activeTab === 'novo'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Novo Culto</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition border-b-2 flex items-center gap-2 ${
            activeTab === 'historico'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Histórico de Envios ({worshipRecords.length})</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Quadro dos 24 Meses (Ano 1 e Ano 2) */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          {/* ANO 1 (Meses 1 a 12) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Ano 1 — Ensino Confirmatório (Meses 1 a 12)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                12 Cultos Obrigatórios
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTH_NAMES.map((name, idx) => {
                const monthIdx = idx + 1;
                const record = getMonthRecord(monthIdx);
                const isApproved = record?.status === 'approved';
                const isPending = record?.status === 'pending';

                return (
                  <div
                    key={monthIdx}
                    onClick={() => {
                      if (record) setSelectedRecordForDetail(record);
                      else {
                        setTargetMonthIndex(monthIdx);
                        setActiveTab('novo');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition text-center cursor-pointer flex flex-col justify-between min-h-[110px] ${
                      isApproved
                        ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70'
                        : isPending
                        ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Mês {monthIdx}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        {name}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col items-center">
                      {isApproved ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprovado</span>
                        </div>
                      ) : isPending ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Pendente</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-white/70 px-2 py-0.5 rounded-md">
                          Registrar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ANO 2 (Meses 13 a 24) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Ano 2 — Ensino Confirmatório (Meses 13 a 24)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                12 Cultos Obrigatórios
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTH_NAMES.map((name, idx) => {
                const monthIdx = idx + 13;
                const record = getMonthRecord(monthIdx);
                const isApproved = record?.status === 'approved';
                const isPending = record?.status === 'pending';

                return (
                  <div
                    key={monthIdx}
                    onClick={() => {
                      if (record) setSelectedRecordForDetail(record);
                      else {
                        setTargetMonthIndex(monthIdx);
                        setActiveTab('novo');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition text-center cursor-pointer flex flex-col justify-between min-h-[110px] ${
                      isApproved
                        ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70'
                        : isPending
                        ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/70'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Mês {monthIdx}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        {name}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col items-center">
                      {isApproved ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprovado</span>
                        </div>
                      ) : isPending ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Pendente</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-white/70 px-2 py-0.5 rounded-md">
                          Registrar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Formulário de Registro do Culto */}
      {activeTab === 'novo' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 font-display mb-1 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            Registro de Culto Dominical
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Preencha os dados do culto assistido. Após o envio, o Pastor Everton Figur fará a conferência e aprovação de sua presença.
          </p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitWorship} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mês de Referência *
                </label>
                <select
                  value={targetMonthIndex}
                  onChange={(e) => setTargetMonthIndex(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const mNum = i + 1;
                    const yearNum = mNum <= 12 ? 1 : 2;
                    const mName = MONTH_NAMES[(mNum - 1) % 12];
                    return (
                      <option key={mNum} value={mNum}>
                        Mês {mNum} (Ano {yearNum} - {mName})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data em que assistiu ao Culto *
                </label>
                <input
                  type="date"
                  required
                  value={worshipDate}
                  onChange={(e) => setWorshipDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Leitura Bíblica Principal do Culto *
              </label>
              <input
                type="text"
                required
                value={biblicalReading}
                onChange={(e) => setBiblicalReading(e.target.value)}
                placeholder="Ex: João 3.16-21 ou Salmo 23"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tema da Mensagem / Pregador (Opcional)
              </label>
              <input
                type="text"
                value={messageTheme}
                onChange={(e) => setMessageTheme(e.target.value)}
                placeholder="Ex: A Graça que Liberta — Pastor Everton Figur"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resumo da Mensagem / O que aprendeu *
              </label>
              <textarea
                rows={4}
                required
                value={messageSummary}
                onChange={(e) => setMessageSummary(e.target.value)}
                placeholder="Escreva com suas palavras os pontos principais da pregação bíblica e como você aplica à sua vida cristã..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Photo upload: camera or gallery */}
            <div className="pt-2">
              <ImageUploadInput
                label="Fotografia Comprobatória (Câmera ou Galeria)"
                value={photoUrl}
                onChange={setPhotoUrl}
                onFileSelect={setPhotoFile}
                helpText="Tire uma foto no culto, do folheto dominical com data, ou selfie na congregação."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-3 px-6 rounded-xl text-white font-bold text-xs transition shadow-md flex items-center gap-2 ${
                  isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isSubmitting ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarCheck className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'ENVIANDO...' : 'ENVIAR RESUMO DO CULTO'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Histórico de Envios */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          {worshipRecords.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Nenhum culto registrado ainda. Use a aba "Registrar Novo Culto" para enviar sua primeira presença.
            </div>
          ) : (
            <div className="space-y-3">
              {worshipRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                        Mês {rec.monthIndex}
                      </span>
                      <span className="text-xs text-slate-500">
                        Culto em: {rec.worshipDate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status === 'approved'
                          ? 'Aprovado'
                          : rec.status === 'rejected'
                          ? 'Recusado'
                          : 'Aguardando aprovação'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      📖 {rec.biblicalReading} {rec.messageTheme ? `• ${rec.messageTheme}` : ''}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {rec.messageSummary}
                    </p>

                    {rec.pastorNotes && (
                      <div className="mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                        💬 <strong>Pastor Everton Figur:</strong> {rec.pastorNotes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedRecordForDetail(rec)}
                    className="self-end sm:self-center p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition text-xs font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver detalhes</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Detalhes do Culto — Mês {selectedRecordForDetail.monthIndex}
                </h3>
                <p className="text-xs text-slate-500">
                  Data do Culto: {selectedRecordForDetail.worshipDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Status Pastoral:</span>
                <span
                  className={`inline-block mt-0.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedRecordForDetail.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedRecordForDetail.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedRecordForDetail.status === 'approved'
                    ? '✓ Presença Aprovada pelo Pastor Everton'
                    : selectedRecordForDetail.status === 'rejected'
                    ? '✕ Presença Recusada'
                    : '⏳ Aguardando Conferência Pastoral'}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Leitura Bíblica:</span>
                <p className="text-slate-800 text-sm mt-0.5">{selectedRecordForDetail.biblicalReading}</p>
              </div>

              {selectedRecordForDetail.messageTheme && (
                <div>
                  <span className="font-bold text-slate-700 block">Tema da Mensagem:</span>
                  <p className="text-slate-800 mt-0.5">{selectedRecordForDetail.messageTheme}</p>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-700 block">Resumo do Culto:</span>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedRecordForDetail.messageSummary}
                </div>
              </div>

              {selectedRecordForDetail.photoUrl && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Foto Comprobatória:</span>
                  <img
                    src={selectedRecordForDetail.photoUrl}
                    alt="Foto do culto"
                    className="w-full max-h-56 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}

              {selectedRecordForDetail.pastorNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Observações do Pastor Everton Figur:</span>
                  <p>{selectedRecordForDetail.pastorNotes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
