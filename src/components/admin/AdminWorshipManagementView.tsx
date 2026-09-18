import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { WorshipRecord, WorshipStatus } from '../../types';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Church,
  X,
  MessageSquare,
} from 'lucide-react';

export const AdminWorshipManagementView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [congregationFilter, setCongregationFilter] = useState<string>('all');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<WorshipRecord | null>(null);
  const [pastorNoteInput, setPastorNoteInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const congregations = dbService.getCongregations();
  const allRecords = dbService.getAllWorshipRecords();

  const filteredRecords = allRecords.filter((rec) => {
    const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchCongregation = congregationFilter === 'all' || rec.congregationId === congregationFilter;
    return matchStatus && matchCongregation;
  });

  const handleReview = async (recordId: string, status: WorshipStatus, notes?: string) => {
    await dbService.reviewWorshipRecord(recordId, status, notes);
    setFeedbackMsg(`Presença marcada como: ${status === 'approved' ? 'Aprovada' : 'Recusada'}`);
    setSelectedRecordForDetail(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-950 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Frequência Paroquial aos Cultos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Aprovação Pastoral de Cultos
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100">
            Revise os resumos bíblicos e comprovantes fotográficos enviados pelos confirmandos para validação dos 24 cultos (exclusivo para o Ensino Confirmatório).
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({allRecords.filter((r) => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aprovados ({allRecords.filter((r) => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({allRecords.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Congregação:</span>
          <select
            value={congregationFilter}
            onChange={(e) => setCongregationFilter(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-300 text-xs bg-white"
          >
            <option value="all">Todas as 7 congregações</option>
            {congregations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Worship records list */}
      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
          Nenhum registro de culto encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.studentName}</h4>
                    <p className="text-[11px] text-slate-500">{rec.congregationName}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Mês {rec.monthIndex} • {rec.status === 'approved' ? 'Aprovado' : rec.status === 'rejected' ? 'Recusado' : 'Pendente'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1">
                  <p><strong>Culto em:</strong> {rec.worshipDate}</p>
                  <p><strong>Leitura:</strong> {rec.biblicalReading} {rec.messageTheme ? `• ${rec.messageTheme}` : ''}</p>
                  <p className="text-slate-600 line-clamp-2 mt-1 italic">
                    “{rec.messageSummary}”
                  </p>
                </div>

                {rec.photoUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={rec.photoUrl}
                      alt="Miniatura"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                    />
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      ✓ Foto comprobatória anexada
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedRecordForDetail(rec);
                    setPastorNoteInput(rec.pastorNotes || '');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Completo</span>
                </button>

                {rec.status === 'pending' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReview(rec.id, 'rejected', 'Resumo insuficiente.')}
                      className="px-3 py-1.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold transition"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => handleReview(rec.id, 'approved', 'Presença aprovada pelo Pastor Everton Figur.')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
                    >
                      Aprovar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detailed View */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Conferência do Culto — Mês {selectedRecordForDetail.monthIndex}
                </h3>
                <p className="text-xs text-slate-500">
                  Aluno: <strong>{selectedRecordForDetail.studentName}</strong> ({selectedRecordForDetail.congregationName})
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <p><strong>Data do Culto:</strong> {selectedRecordForDetail.worshipDate}</p>
                <p><strong>Leitura Bíblica:</strong> {selectedRecordForDetail.biblicalReading}</p>
                {selectedRecordForDetail.messageTheme && (
                  <p><strong>Tema da Mensagem:</strong> {selectedRecordForDetail.messageTheme}</p>
                )}
              </div>

              <div>
                <span className="font-bold block text-slate-900 mb-1">Resumo Redigido pelo Aluno:</span>
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                  {selectedRecordForDetail.messageSummary}
                </div>
              </div>

              {selectedRecordForDetail.photoUrl && (
                <div>
                  <span className="font-bold block text-slate-900 mb-1">Foto Comprovante:</span>
                  <img
                    src={selectedRecordForDetail.photoUrl}
                    alt="Foto do culto"
                    className="w-full max-h-56 object-cover rounded-2xl border border-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="font-bold block text-slate-900 mb-1">
                  Observações Pastorais (Feedback visível ao aluno):
                </label>
                <input
                  type="text"
                  value={pastorNoteInput}
                  onChange={(e) => setPastorNoteInput(e.target.value)}
                  placeholder="Ex: Excelente resumo sobre a justificação pela fé!"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(selectedRecordForDetail.id, 'rejected', pastorNoteInput || 'Resumo necessita revisão.')}
                  className="py-2 px-4 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  Recusar
                </button>
                <button
                  onClick={() => handleReview(selectedRecordForDetail.id, 'approved', pastorNoteInput || 'Presença confirmada pelo Pastor Everton Figur.')}
                  className="py-2 px-5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-sm"
                >
                  Aprovar Presença
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
