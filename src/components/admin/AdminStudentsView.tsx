import React, { useState } from 'react';
import { dbService } from '../../services/db';
import {
  StudentProfile,
  CourseType,
  RequestStatus,
  WorshipStatus,
  CatechismStatus,
} from '../../types';
import {
  Users,
  Search,
  Filter,
  Church,
  CalendarCheck,
  Award,
  Bookmark,
  Lock,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Shield,
  Save,
} from 'lucide-react';

interface AdminStudentsViewProps {
  initialStudentId?: string | null;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({ initialStudentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCongregation, setSelectedCongregation] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(initialStudentId || null);
  const [studentDetailTab, setStudentDetailTab] = useState<'dados' | 'cultos' | 'notas' | 'catecismo' | 'notas_pastor' | 'documentos'>('dados');

  // Internal pastoral note input
  const [newPastoralNote, setNewPastoralNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const congregations = dbService.getCongregations();
  const allStudents = dbService.getAllStudents();
  const catechismSections = dbService.getCatechismSections();

  // Filtering
  const filteredStudents = allStudents.filter((st) => {
    const matchSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCongregation =
      selectedCongregation === 'all' || st.congregationId === selectedCongregation;
    const matchCourse = selectedCourse === 'all' || st.courseType === selectedCourse;
    const matchStatus = selectedStatus === 'all' || st.status === selectedStatus;
    return matchSearch && matchCongregation && matchCourse && matchStatus;
  });

  const activeStudent = activeStudentId
    ? dbService.getStudentById(activeStudentId)
    : null;

  const studentWorships = activeStudent
    ? dbService.getWorshipRecordsByStudent(activeStudent.id)
    : [];

  const studentGrades = activeStudent
    ? dbService.getGradesByStudent(activeStudent.id)
    : [];

  const studentCatechism = activeStudent
    ? dbService.getCatechismAssessmentsByStudent(activeStudent.id)
    : [];

  // Handlers
  const handleApproveWorship = async (recordId: string) => {
    await dbService.reviewWorshipRecord(recordId, 'approved', 'Presença verificada e aprovada pelo Pastor Everton Figur.');
    setFeedbackMsg('Presença no culto aprovada.');
  };

  const handleRejectWorship = async (recordId: string) => {
    const reason = window.prompt('Informe o motivo da recusa da presença (opcional):') || 'Resumo insuficiente.';
    await dbService.reviewWorshipRecord(recordId, 'rejected', reason);
    setFeedbackMsg('Presença recusada.');
  };

  const handleUpdateCatechism = async (
    sectionId: string,
    status: CatechismStatus,
    score: number,
    notes: string
  ) => {
    if (!activeStudent) return;
    await dbService.updateCatechismAssessment({
      studentId: activeStudent.id,
      sectionId,
      status,
      score,
      notes,
    });
    setFeedbackMsg('Avaliação do Catecismo atualizada com sucesso!');
  };

  const handleAddInternalNote = async () => {
    if (!activeStudent || !newPastoralNote.trim()) return;
    await dbService.addInternalNote(activeStudent.id, {
      author: 'Pastor Everton Figur',
      text: newPastoralNote.trim(),
    });
    setNewPastoralNote('');
    setFeedbackMsg('Observação pastoral interna registrada.');
  };

  const handleChangeStatus = async (status: RequestStatus) => {
    if (!activeStudent) return;
    await dbService.updateStudentStatus(activeStudent.id, status);
    setFeedbackMsg(`Status do aluno alterado para: ${status}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Registro Paroquial de Alunos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Gestão Completa de Alunos
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Acompanhe o rendimento, presenças nos 24 cultos, memorização do Catecismo e registros pastorais confidenciais de cada confirmando e candidato à profissão de fé.
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

      {/* Main split: List vs Student File */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student List with filters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Congregation filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Congregação
              </label>
              <select
                value={selectedCongregation}
                onChange={(e) => setSelectedCongregation(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="all">Todas as congregações</option>
                {congregations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course & Status filter */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="confirmatorio">Confirmatório</option>
                  <option value="profissao_fe">Profissão de Fé</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="approved">Aprovados</option>
                  <option value="pending">Pendentes</option>
                  <option value="rejected">Recusados</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-500 block px-1">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno encontrado' : 'alunos encontrados'}
            </span>

            {filteredStudents.map((st) => {
              const isSelected = activeStudentId === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStudentId(st.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        st.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={st.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold truncate max-w-[150px]">{st.name}</h4>
                      <p className={`text-[10px] truncate max-w-[150px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {st.congregationName}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          isSelected
                            ? 'bg-white/20 text-amber-300'
                            : st.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.courseType === 'confirmatorio' ? 'Confirmatório' : 'Profissão Fé'} • {st.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ficha Individual do Aluno */}
        <div className="lg:col-span-8">
          {activeStudent ? (
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-5 p-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      activeStudent.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={activeStudent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {activeStudent.name}
                    </h3>
                    <p className="text-xs text-slate-500">{activeStudent.email}</p>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      {activeStudent.congregationName} •{' '}
                      {activeStudent.courseType === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}
                    </p>
                  </div>
                </div>

                {/* Status Switcher & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <select
                      value={activeStudent.status}
                      onChange={(e) => handleChangeStatus(e.target.value as RequestStatus)}
                      className="p-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="approved">Aprovado</option>
                      <option value="pending">Pendente</option>
                      <option value="rejected">Recusado</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>

                  <button
                    onClick={async () => {
                      const newPass = window.prompt('Informe a nova senha temporária para o aluno:');
                      if (newPass) {
                        await dbService.changePassword(activeStudent.id, newPass);
                        alert('Senha alterada com sucesso!');
                      }
                    }}
                    className="p-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-[10px] font-bold flex items-center gap-1 transition"
                    title="Redefinir senha do aluno"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Resetar Senha</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm(`TEM CERTEZA que deseja EXCLUIR DEFINITIVAMENTE o aluno ${activeStudent.name}? Todos os registros de presenças e notas serão perdidos.`)) {
                        await dbService.deleteStudent(activeStudent.id);
                        setActiveStudentId(null);
                        setFeedbackMsg(`Aluno ${activeStudent.name} excluído do sistema.`);
                      }
                    }}
                    className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Excluir Aluno</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-3">
                <button
                  onClick={() => setStudentDetailTab('dados')}
                  className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                    studentDetailTab === 'dados'
                      ? 'border-[#1e3a5f] text-[#1e3a5f]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dados Cadastrais</span>
                </button>

                {activeStudent.courseType === 'confirmatorio' && (
                  <button
                    onClick={() => setStudentDetailTab('cultos')}
                    className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                      studentDetailTab === 'cultos'
                        ? 'border-[#1e3a5f] text-[#1e3a5f]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>24 Cultos ({studentWorships.filter((w) => w.status === 'approved').length}/24)</span>
                  </button>
                )}

                <button
                  onClick={() => setStudentDetailTab('notas')}
                  className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                    studentDetailTab === 'notas'
                      ? 'border-[#1e3a5f] text-[#1e3a5f]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Atividades & Notas ({studentGrades.length})</span>
                </button>

                <button
                  onClick={() => setStudentDetailTab('catecismo')}
                  className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                    studentDetailTab === 'catecismo'
                      ? 'border-[#1e3a5f] text-[#1e3a5f]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Catecismo</span>
                </button>

                <button
                  onClick={() => setStudentDetailTab('documentos')}
                  className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                    studentDetailTab === 'documentos'
                      ? 'border-sky-600 text-sky-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Documentos ({activeStudent.documents?.length || 0})</span>
                </button>

                <button
                  onClick={() => setStudentDetailTab('notas_pastor')}
                  className={`pb-2.5 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
                    studentDetailTab === 'notas_pastor'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Anotações do Pastor ({activeStudent.internalNotes?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: Dados Cadastrais */}
              {studentDetailTab === 'dados' && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                    <p><strong>Nascimento:</strong> {activeStudent.birthDate || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {activeStudent.phone || 'Não informado'}</p>
                    <p><strong>E-mail:</strong> {activeStudent.email}</p>
                    <p><strong>Congregação:</strong> {activeStudent.congregationName}</p>
                    <p className="sm:col-span-2">
                      <strong>Endereço:</strong> {activeStudent.street}, {activeStudent.number} {activeStudent.complement || ''} - {activeStudent.neighborhood}, {activeStudent.city} - {activeStudent.state} (CEP: {activeStudent.cep})
                    </p>
                  </div>

                  {/* Batismo */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                    <span className="font-bold block text-amber-950">Dados Canônicos do Batismo:</span>
                    {activeStudent.baptism?.isBaptized ? (
                      <>
                        <p>Batizado em: {activeStudent.baptism.date || 'Data não informada'}</p>
                        <p>Igreja: {activeStudent.baptism.church || 'Não informada'} ({activeStudent.baptism.city} - {activeStudent.baptism.state})</p>
                        {activeStudent.baptism.notes && (
                          <p className="italic text-slate-600 mt-1">“{activeStudent.baptism.notes}”</p>
                        )}
                      </>
                    ) : (
                      <p className="text-amber-800 font-medium">Não foi batizado na infância. Requer preparação batismal.</p>
                    )}
                  </div>

                  {/* Histórico de Igrejas */}
                  {activeStudent.churchHistory && activeStudent.churchHistory.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                      <span className="font-bold block text-slate-900">Histórico em outras Igrejas:</span>
                      {activeStudent.churchHistory.map((ch, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-900">{ch.churchName}</p>
                          <p className="text-slate-500">{ch.city} - {ch.state} • {ch.period}</p>
                          {ch.notes && <p className="italic text-slate-600 mt-0.5">{ch.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Presenças nos 24 Cultos */}
              {studentDetailTab === 'cultos' && activeStudent.courseType === 'confirmatorio' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Controle dos 24 Cultos Obrigatórios</span>
                      <span>O Pastor Everton Figur confere os resumos e fotos para aprovar a frequência mensal.</span>
                    </div>
                    <span className="text-base font-bold text-emerald-800 font-display">
                      {studentWorships.filter((w) => w.status === 'approved').length} / 24
                    </span>
                  </div>

                  <div className="space-y-3">
                    {studentWorships.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum resumo de culto enviado pelo aluno até o momento.</p>
                    ) : (
                      studentWorships.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                                Mês {rec.monthIndex}
                              </span>
                              <span className="text-slate-500">Culto em {rec.worshipDate}</span>
                            </div>
                            <span
                              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                                rec.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rec.status === 'approved' ? 'Aprovado' : rec.status === 'rejected' ? 'Recusado' : 'Aguardando Aprovação'}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">📖 {rec.biblicalReading} {rec.messageTheme ? `• ${rec.messageTheme}` : ''}</p>
                            <p className="text-slate-600 mt-1 leading-relaxed">{rec.messageSummary}</p>
                          </div>

                          {rec.photoUrl && (
                            <div>
                              <span className="font-bold text-slate-600 block mb-1">Foto Comprovante:</span>
                              <img
                                src={rec.photoUrl}
                                alt="Comprovante de culto"
                                className="w-full max-w-sm max-h-48 object-cover rounded-xl border border-slate-200"
                              />
                            </div>
                          )}

                          {rec.status !== 'approved' && (
                            <div className="pt-2 flex justify-end gap-2">
                              <button
                                onClick={() => handleRejectWorship(rec.id)}
                                className="py-1.5 px-3 rounded-lg text-red-700 hover:bg-red-50 font-bold transition"
                              >
                                Recusar Presença
                              </button>
                              <button
                                onClick={() => handleApproveWorship(rec.id)}
                                className="py-1.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition"
                              >
                                Aprovar Presença
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Notas e Atividades */}
              {studentDetailTab === 'notas' && (
                <div className="space-y-3">
                  {studentGrades.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma atividade avaliativa respondida por este aluno.</p>
                  ) : (
                    studentGrades.map((g) => (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900">{g.activityTitle}</h4>
                          <p className="text-slate-400">Entregue em: {new Date(g.submittedAt).toLocaleDateString('pt-BR')}</p>
                          {g.feedback && <p className="italic text-slate-600 mt-0.5">“{g.feedback}”</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-purple-800 font-display">
                            {g.score} / {g.maxScore}
                          </span>
                          <span className="block text-[10px] text-slate-500">{g.percentage}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Catecismo Menor */}
              {studentDetailTab === 'catecismo' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    O Pastor Everton Figur pode lançar o status de memorização, nota e anotações para cada uma das 8 seções do Catecismo Menor:
                  </p>
                  <div className="space-y-3">
                    {catechismSections.map((sec) => {
                      const ass = studentCatechism.find((a) => a.sectionId === sec.id);
                      return (
                        <div
                          key={sec.id}
                          className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              #{sec.number} {sec.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ass?.status === 'Memorizado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ass?.status === 'Em andamento'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {ass?.status || 'Não avaliado'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Status</label>
                              <select
                                defaultValue={ass?.status || 'Não avaliado'}
                                onChange={(e) =>
                                  handleUpdateCatechism(
                                    sec.id,
                                    e.target.value as CatechismStatus,
                                    ass?.score || 10,
                                    ass?.notes || ''
                                  )
                                }
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                              >
                                <option value="Não avaliado">Não avaliado</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Memorizado">Memorizado</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nota (0 a 10)</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                defaultValue={ass?.score || ''}
                                onBlur={(e) =>
                                  handleUpdateCatechism(
                                    sec.id,
                                    ass?.status || 'Em andamento',
                                    Number(e.target.value),
                                    ass?.notes || ''
                                  )
                                }
                                placeholder="Nota"
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Observação</label>
                              <input
                                type="text"
                                defaultValue={ass?.notes || ''}
                                onBlur={(e) =>
                                  handleUpdateCatechism(
                                    sec.id,
                                    ass?.status || 'Em andamento',
                                    ass?.score || 10,
                                    e.target.value
                                  )
                                }
                                placeholder="Ex: Boa memorização"
                                className="w-full p-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: Documentos Paroquiais */}
              {studentDetailTab === 'documentos' && activeStudent && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-xs text-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-[#1e3a5f]">Verificação de Documentos Paroquiais</span>
                      <span>Analise as certidões e documentos enviados pelo aluno para aprovação.</span>
                    </div>
                    <FileText className="w-8 h-8 text-[#1e3a5f]/20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(!activeStudent.documents || activeStudent.documents.length === 0) ? (
                      <div className="sm:col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-xs text-slate-400 italic">Nenhum documento enviado pelo aluno.</p>
                      </div>
                    ) : (
                      activeStudent.documents.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                                <p className="text-[10px] text-slate-500">{doc.fileName} • {doc.fileSize}</p>
                              </div>
                            </div>
                            <a 
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#1e3a5f] hover:text-white transition"
                              title="Visualizar documento"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5 font-bold">
                              {doc.status === 'approved' ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> <span className="text-emerald-700">Aprovado</span></>
                              ) : doc.status === 'rejected' ? (
                                <><XCircle className="w-3.5 h-3.5 text-red-600" /> <span className="text-red-700">Recusado</span></>
                              ) : (
                                <><Clock className="w-3.5 h-3.5 text-amber-600" /> <span className="text-amber-700">Pendente de Análise</span></>
                              )}
                            </div>
                            <span className="text-slate-400">Enviado em {new Date(doc.submittedAt).toLocaleDateString()}</span>
                          </div>

                          {doc.status !== 'approved' && (
                            <div className="pt-2 flex justify-end gap-2">
                              <button
                                onClick={async () => {
                                  const reason = window.prompt('Informe o motivo da recusa ou orientações para reenvio:', doc.pastorNotes || '');
                                  if (reason !== null) {
                                    await dbService.reviewDocument(activeStudent.id, doc.id, 'rejected', reason);
                                    setFeedbackMsg('Documento recusado. O aluno foi notificado para reenvio.');
                                  }
                                }}
                                className="py-1.5 px-3 rounded-lg text-red-700 hover:bg-red-50 text-[10px] font-bold transition"
                              >
                                Recusar / Reenviar
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Confirmar aprovação deste documento?')) {
                                    await dbService.reviewDocument(activeStudent.id, doc.id, 'approved', 'Documento verificado e aprovado pelo Pastor.');
                                    setFeedbackMsg('Documento aprovado com sucesso.');
                                  }
                                }}
                                className="py-1.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition"
                              >
                                Aprovar Documento
                              </button>
                            </div>
                          )}
                          
                          {doc.status === 'approved' && doc.reviewedAt && (
                            <div className="text-[10px] text-emerald-600 italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                               Aprovado em {new Date(doc.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: Anotações Pastorais Confidenciais */}
              {studentDetailTab === 'notas_pastor' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      <strong>Área de Sigilo Pastoral:</strong> Estas observações são estritamente privadas e visíveis apenas ao Pastor Everton Figur.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={newPastoralNote}
                      onChange={(e) => setNewPastoralNote(e.target.value)}
                      placeholder="Registrar anotação pastoral confidencial (acompanhamento familiar, dificuldades espirituais, conversas pessoais)..."
                      className="w-full p-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddInternalNote}
                        className="py-2 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Anotação</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-600 block">
                      Histórico de Registros Pastorais ({activeStudent.internalNotes?.length || 0})
                    </span>
                    {activeStudent.internalNotes && activeStudent.internalNotes.length > 0 ? (
                      activeStudent.internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span className="font-bold text-slate-700">{note.author}</span>
                            <span>{note.date}</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nenhuma anotação cadastrada ainda.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              Selecione um aluno na lista ao lado para visualizar a ficha completa, presenças e notas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
