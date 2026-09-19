import React, { useState, useRef } from 'react';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Activity, CourseType, Question } from '../../types';
import {
  FileUp,
  Plus,
  Trash2,
  Edit,
  FileText,
  Download,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
  Eye,
  Calendar,
  Award,
  AlertCircle,
  Upload,
  Cloud,
} from 'lucide-react';

export const AdminActivitiesView: React.FC<{ onNavigateToQuizzes?: (activityId: string) => void }> = ({
  onNavigateToQuizzes,
}) => {
  const { googleAccessToken, googleSignIn } = useAuth();
  const [courseFilter, setCourseFilter] = useState<'all' | CourseType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const driveInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<CourseType>('confirmatorio');
  const [moduleId, setModuleId] = useState('mod-conf-1');
  const [maxScore, setMaxScore] = useState<number>(10);
  const [deadline, setDeadline] = useState('');
  const [published, setPublished] = useState(true);

  // Attachment states
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentSize, setAttachmentSize] = useState('');

  // Questions inside activity
  const [questions, setQuestions] = useState<Question[]>([]);

  const activities = dbService.getActivities(courseFilter === 'all' ? undefined : courseFilter);
  const modulesConfirmatorio = dbService.getModules('confirmatorio');
  const modulesProfissao = dbService.getModules('profissao_fe');
  const currentModules = courseId === 'confirmatorio' ? modulesConfirmatorio : modulesProfissao;

  const handleOpenNew = () => {
    setEditingActivity(null);
    setTitle('');
    setDescription('');
    setCourseId('confirmatorio');
    setModuleId(modulesConfirmatorio[0]?.id || 'mod-conf-1');
    setMaxScore(10);
    setDeadline('');
    setPublished(true);
    setAttachmentName('');
    setAttachmentUrl('');
    setAttachmentSize('');
    setQuestions([
      {
        id: 'q-' + Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 2.5,
        explanation: '',
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setTitle(act.title);
    setDescription(act.description);
    setCourseId(act.courseId);
    setModuleId(act.moduleId);
    setMaxScore(act.maxScore);
    setDeadline(act.deadline || '');
    setPublished(act.published);
    setAttachmentName(act.attachmentName || '');
    setAttachmentUrl(act.attachmentUrl || '');
    setAttachmentSize(act.attachmentSize || '');
    setQuestions(act.questions || []);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, source: 'storage' | 'drive' = 'storage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('O arquivo selecionado deve ter no máximo 25MB.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.round(file.size / 1024) + ' KB';

    setIsUploading(true);
    setFeedback(`Fazendo upload no ${source === 'drive' ? 'Google Drive' : 'Firebase'}...`);
    
    try {
      let url = null;
      if (source === 'drive') {
        if (!googleAccessToken) {
          const result = await googleSignIn();
          if (!result.success) {
            setIsUploading(false);
            setFeedback(null);
            return;
          }
        }
        url = await dbService.uploadToDrive(file, 'MateriaisDidaticos');
      } else {
        url = await dbService.uploadPhoto(file, 'MateriaisEstudo');
      }

      if (url) {
        setAttachmentName(file.name);
        setAttachmentSize(sizeFormatted);
        setAttachmentUrl(url);
        setFeedback('Upload concluído com sucesso!');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert('Falha ao subir arquivo. Tente novamente.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro no upload: ' + (err.message || 'Desconhecido'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Preencha o título da atividade.');
      return;
    }

    const activityId = editingActivity ? editingActivity.id : 'act-' + Date.now();

    const activityToSave: Activity = {
      id: activityId,
      title: title.trim(),
      description: description.trim(),
      courseId,
      moduleId,
      maxScore: Number(maxScore) || 10,
      deadline: deadline || undefined,
      published,
      attachmentName: attachmentName || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentSize: attachmentSize || undefined,
      questions: questions.filter((q) => q.question.trim().length > 0),
    };

    await dbService.saveActivity(activityToSave);
    setIsModalOpen(false);
    setFeedback(`Atividade "${activityToSave.title}" salva com sucesso!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteActivity = async (id: string, actTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir a atividade "${actTitle}"?`)) {
      await dbService.deleteActivity(id);
      setFeedback(`Atividade "${actTitle}" excluída.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (act: Activity) => {
    const updated = { ...act, published: !act.published };
    await dbService.saveActivity(updated);
    setFeedback(`Atividade ${updated.published ? 'publicada' : 'ocultada'} com sucesso.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              Área do Pastor / Administrador
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Upload de Atividades & Materiais
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Cadastre atividades, faça upload de apostilas, exercícios em PDF e materiais de apoio bíblicos para confirmandos e alunos.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-2 self-start sm:self-center cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Atividade</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-600">Filtrar por Curso:</span>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                courseFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({dbService.getActivities().length})
            </button>
            <button
              onClick={() => setCourseFilter('confirmatorio')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                courseFilter === 'confirmatorio'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confirmatório ({dbService.getActivities('confirmatorio').length})
            </button>
            <button
              onClick={() => setCourseFilter('profissao_fe')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                courseFilter === 'profissao_fe'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Profissão de Fé ({dbService.getActivities('profissao_fe').length})
            </button>
          </div>
        </div>

        <div className="text-slate-500 text-[11px] self-end sm:self-center">
          Total de {activities.length} atividade(s) cadastrada(s)
        </div>
      </div>

      {/* Activities Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => {
          const mod =
            act.courseId === 'confirmatorio'
              ? modulesConfirmatorio.find((m) => m.id === act.moduleId)
              : modulesProfissao.find((m) => m.id === act.moduleId);

          return (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        act.courseId === 'confirmatorio'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {act.courseId === 'confirmatorio' ? 'Confirmatório' : 'Profissão de Fé'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act.published ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                    {act.maxScore} pontos
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base font-display leading-snug">
                  {act.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>

                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {mod?.title || 'Módulo ' + act.moduleId}
                  </span>
                  {act.deadline && (
                    <span className="flex items-center gap-1 text-amber-700">
                      <Calendar className="w-3 h-3" />
                      Prazo: {act.deadline}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-semibold text-purple-700">
                    <HelpCircle className="w-3 h-3" />
                    {act.questions.length} questões
                  </span>
                </div>

                {/* Uploaded Material / Attachment Badge */}
                {act.attachmentName && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate text-[11px]">
                          {act.attachmentName}
                        </p>
                        {act.attachmentSize && (
                          <p className="text-[10px] text-slate-400">{act.attachmentSize}</p>
                        )}
                      </div>
                    </div>

                    {act.attachmentUrl && (
                      <a
                        href={act.attachmentUrl}
                        download={act.attachmentName}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                      >
                        <Download className="w-3 h-3 text-slate-600" />
                        <span>Baixar</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                {onNavigateToQuizzes && (
                  <button
                    onClick={() => onNavigateToQuizzes(act.id)}
                    className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Editar Perguntas ({act.questions.length})</span>
                  </button>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => handleTogglePublish(act)}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                      act.published
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={act.published ? 'Ocultar dos alunos' : 'Publicar para alunos'}
                  >
                    {act.published ? 'Ocultar' : 'Publicar'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(act)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100 transition"
                    title="Editar atividade e anexo"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteActivity(act.id, act.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Excluir atividade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <FileUp className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 font-display text-sm">
            Nenhuma atividade cadastrada neste filtro
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Clique no botão acima para cadastrar a primeira atividade e fazer upload do material de estudo em PDF ou documento.
          </p>
        </div>
      )}

      {/* CREATE / EDIT ACTIVITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Gerenciador Paroquial de Atividades
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingActivity ? 'Editar Atividade' : 'Cadastrar Nova Atividade & Upload de Anexo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 overflow-y-auto pr-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título da Atividade *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atividade 3: A Ceia do Senhor e a Graça de Deus"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a5f] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Curso Destinatário *</label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      const newCourse = e.target.value as CourseType;
                      setCourseId(newCourse);
                      const mods = newCourse === 'confirmatorio' ? modulesConfirmatorio : modulesProfissao;
                      setModuleId(mods[0]?.id || '');
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="confirmatorio">Ensino Confirmatório (24 meses)</option>
                    <option value="profissao_fe">Profissão de Fé (Adultos)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Módulo Vinculado *</label>
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {currentModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Descrição & Instruções aos Alunos
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o objetivo da tarefa, capítulos bíblicos a consultar e orientações gerais..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a5f] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pontuação Máxima</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status de Visibilidade</label>
                  <select
                    value={published ? 'true' : 'false'}
                    onChange={(e) => setPublished(e.target.value === 'true')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="true">Publicada (Alunos veem)</option>
                    <option value="false">Rascunho (Oculta)</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD DE ARQUIVO / MATERIAL DE APOIO */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-slate-900">
                      Material de Apoio (PDF, Apostila, Imagem ou Folheto)
                    </span>
                  </div>
                  {attachmentName && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentName('');
                        setAttachmentUrl('');
                        setAttachmentSize('');
                      }}
                      className="text-red-600 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                {attachmentName ? (
                  <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="max-w-[150px] sm:max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{attachmentName}</p>
                        <p className="text-[10px] text-slate-500">
                          {attachmentSize || 'Arquivo anexado com sucesso'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Pronto para envio
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Opção Firebase */}
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer group">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, 'storage')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-2 group-hover:text-[#1e3a5f] transition" />
                      <p className="text-[11px] font-bold text-slate-700">
                        Firebase Storage
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Rápido e direto
                      </p>
                    </div>

                    {/* Opção Google Drive */}
                    <div 
                      className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition cursor-pointer group ${
                        googleAccessToken 
                        ? 'border-blue-300 hover:bg-blue-50' 
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="file"
                        ref={driveInputRef}
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, 'drive')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <Cloud className={`w-5 h-5 mx-auto mb-2 transition ${
                        googleAccessToken ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                      <p className={`text-[11px] font-bold ${
                        googleAccessToken ? 'text-blue-800' : 'text-slate-700'
                      }`}>
                        Google Drive
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        Organizado em pastas
                      </p>
                      {!googleAccessToken && (
                        <div className="absolute top-1 right-1" title="Requer login Google">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="flex items-center gap-2 justify-center py-2 text-[10px] text-slate-500 font-bold italic animate-pulse">
                    <Cloud className="w-3 h-3 animate-bounce" />
                    Realizando upload... aguarde
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold cursor-pointer"
                >
                  {editingActivity ? 'Salvar Alterações' : 'Cadastrar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
