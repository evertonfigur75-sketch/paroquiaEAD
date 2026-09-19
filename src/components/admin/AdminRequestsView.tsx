import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { StudentProfile } from '../../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Church,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminRequestsView: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentProfile | null>(null);
  const [rejectModalStudent, setRejectModalStudent] = useState<StudentProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const students = dbService.getAllStudents();
  const pendingRequests = students.filter((s) => s.status === 'pending');

  const handleApprove = async (studentId: string) => {
    await dbService.approveStudent(studentId);
    setFeedbackMsg('Aluno aprovado com sucesso! Matrícula liberada para o curso e cultos.');
    onRefresh?.();
  };

  const handleConfirmReject = async () => {
    if (!rejectModalStudent) return;
    await dbService.rejectStudent(rejectModalStudent.id, rejectReason || 'Solicitação recusada pelo Pastor.');
    setRejectModalStudent(null);
    setRejectReason('');
    setFeedbackMsg('Solicitação recusada.');
    onRefresh?.();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Fila de Análise Pastoral</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Solicitações de Entrada de Alunos
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            Confira as informações pessoais, dados do batismo e histórico de igrejas antes de conceder acesso ao ambiente de ensino da paróquia.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 font-display">
            Nenhuma solicitação pendente no momento
          </h3>
          <p className="text-xs text-slate-500">
            Todos os pedidos de inscrição foram revisados pelo Pastor Everton Figur.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRequests.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        st.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={st.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                      <p className="text-xs text-slate-500">{st.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                    {st.courseType === 'confirmatorio' ? 'Confirmatório' : 'Profissão de Fé'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 text-xs space-y-1.5 text-slate-700">
                  <p className="flex items-center gap-1.5">
                    <Church className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span><strong>Congregação:</strong> {st.congregationName}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span><strong>Telefone:</strong> {st.phone || 'Não informado'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span><strong>Cidade:</strong> {st.city || 'Planalto'} - {st.state || 'PR'}</span>
                  </p>
                  <p className="pt-1 border-t border-slate-200/60 text-slate-600">
                    <strong>Batismo:</strong>{' '}
                    {st.baptism?.isBaptized
                      ? `Batizado em ${st.baptism.date || ''} (${st.baptism.church || 'Igreja'})`
                      : 'Não é batizado ainda'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDetail(st)}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalhes</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalStudent(st)}
                    className="px-3 py-2 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(st.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedStudentForDetail.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={selectedStudentForDetail.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-400"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {selectedStudentForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedStudentForDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl">
                <div>
                  <span className="font-bold block text-slate-900">Tipo de Formação:</span>
                  <span>
                    {selectedStudentForDetail.courseType === 'confirmatorio'
                      ? 'Ensino Confirmatório (24 meses)'
                      : 'Profissão de Fé'}
                  </span>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Congregação:</span>
                  <span>{selectedStudentForDetail.congregationName}</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Data de Nascimento:</span>
                  <span>{selectedStudentForDetail.birthDate || 'Não informada'}</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-900">Telefone:</span>
                  <span>{selectedStudentForDetail.phone || 'Não informado'}</span>
                </div>
              </div>

              {/* Endereço */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-bold block text-slate-900">Endereço Residencial:</span>
                <p>
                  {selectedStudentForDetail.street}, {selectedStudentForDetail.number}{' '}
                  {selectedStudentForDetail.complement ? `(${selectedStudentForDetail.complement})` : ''} -{' '}
                  {selectedStudentForDetail.neighborhood}, {selectedStudentForDetail.city} - {selectedStudentForDetail.state}
                </p>
                <p className="text-slate-500">CEP: {selectedStudentForDetail.cep}</p>
              </div>

              {/* Batismo */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="font-bold block text-slate-900">Dados do Batismo:</span>
                {selectedStudentForDetail.baptism?.isBaptized ? (
                  <>
                    <p>Batizado em: {selectedStudentForDetail.baptism.date || 'Data não informada'}</p>
                    <p>Igreja: {selectedStudentForDetail.baptism.church || 'Não informada'} ({selectedStudentForDetail.baptism.city} - {selectedStudentForDetail.baptism.state})</p>
                    {selectedStudentForDetail.baptism.notes && (
                      <p className="italic text-slate-500">“{selectedStudentForDetail.baptism.notes}”</p>
                    )}
                  </>
                ) : (
                  <p className="text-amber-700 font-medium">Não é batizado. Necessita batismo preparatório.</p>
                )}
              </div>

              {/* Histórico de Igrejas (se Profissão de Fé) */}
              {selectedStudentForDetail.churchHistory && selectedStudentForDetail.churchHistory.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
                  <span className="font-bold block text-slate-900">Histórico de Outras Igrejas:</span>
                  {selectedStudentForDetail.churchHistory.map((item, i) => (
                    <div key={item.id || i} className="p-2 bg-white rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-800">{item.churchName}</p>
                      <p className="text-slate-500">{item.city} - {item.state} • Período: {item.period}</p>
                      {item.notes && <p className="italic text-slate-600 mt-0.5">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedStudentForDetail.id);
                  setSelectedStudentForDetail(null);
                }}
                className="py-2 px-5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow-sm"
              >
                Aprovar Aluno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Recusar Solicitação de {rejectModalStudent.name}
            </h3>
            <p className="text-xs text-slate-600">
              Informe o motivo da recusa para o registro interno e para que o aluno saiba como proceder:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Não reside na região de abrangência da paróquia ou dados de contato incorretos..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalStudent(null)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="py-2 px-4 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
