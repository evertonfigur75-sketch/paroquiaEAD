import React, { useState } from 'react';
import { dbService } from '../../services/db';
import { Activity, Question, Grade } from '../../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  Award,
  BookOpen,
  Eye,
  RotateCcw,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AdminQuizzesView: React.FC<{ initialActivityId?: string }> = ({
  initialActivityId,
}) => {
  const allActivities = dbService.getActivities();
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    initialActivityId || allActivities[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);

  // States for quiz simulator
  const [simAnswers, setSimAnswers] = useState<Record<string, number>>({});
  const [simSubmitted, setSimSubmitted] = useState(false);

  const selectedActivity = dbService.getActivityById(selectedActivityId);
  const questions: Question[] = selectedActivity?.questions || [];
  const grades = dbService
    .getAllGrades()
    .filter((g) => g.activityId === selectedActivityId);

  // Form for adding/editing question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [points, setPoints] = useState(2.5);
  const [explanation, setExplanation] = useState('');

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
    setSimulationMode(false);
    setSimSubmitted(false);
    setSimAnswers({});
    setEditingQuestionId(null);
  };

  const handleStartNewQuestion = () => {
    setEditingQuestionId('new');
    setQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setCorrectIdx(0);
    setPoints(2.5);
    setExplanation('');
  };

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQText(q.question);
    setOpt0(q.options[0] || '');
    setOpt1(q.options[1] || '');
    setOpt2(q.options[2] || '');
    setOpt3(q.options[3] || '');
    setCorrectIdx(q.correctAnswer);
    setPoints(q.points || 2.5);
    setExplanation(q.explanation || '');
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    if (!qText.trim() || !opt0.trim() || !opt1.trim()) {
      alert('Por favor, preencha o enunciado e pelo menos as duas primeiras alternativas.');
      return;
    }

    const options = [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()].filter(
      (opt) => opt.length > 0
    );

    const questionToSave: Question = {
      id: editingQuestionId === 'new' ? 'q-' + Date.now() : editingQuestionId!,
      question: qText.trim(),
      options: options.length >= 2 ? options : [opt0, opt1, opt2 || 'N/A', opt3 || 'N/A'],
      correctAnswer: correctIdx,
      points: Number(points) || 2.5,
      explanation: explanation.trim(),
    };

    let updatedQuestions: Question[] = [];
    if (editingQuestionId === 'new') {
      updatedQuestions = [...questions, questionToSave];
    } else {
      updatedQuestions = questions.map((q) =>
        q.id === editingQuestionId ? questionToSave : q
      );
    }

    const updatedActivity: Activity = {
      ...selectedActivity,
      questions: updatedQuestions,
    };

    await dbService.saveActivity(updatedActivity);
    setEditingQuestionId(null);
    setFeedback('Questão salva com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!selectedActivity) return;
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      const updatedQuestions = questions.filter((q) => q.id !== qId);
      const updatedActivity: Activity = {
        ...selectedActivity,
        questions: updatedQuestions,
      };
      await dbService.saveActivity(updatedActivity);
      setFeedback('Questão removida.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDuplicateQuestion = async (q: Question) => {
    if (!selectedActivity) return;
    const duplicated: Question = {
      ...q,
      id: 'q-' + Date.now(),
      question: q.question + ' (Cópia)',
    };
    const updatedQuestions = [...questions, duplicated];
    await dbService.saveActivity({ ...selectedActivity, questions: updatedQuestions });
    setFeedback('Questão duplicada!');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Simulator actions
  const handleSimOptionSelect = (qId: string, idx: number) => {
    if (simSubmitted) return;
    setSimAnswers({ ...simAnswers, [qId]: idx });
  };

  const handleSimCalculate = () => {
    setSimSubmitted(true);
  };

  const totalPossibleScore = questions.reduce((acc, q) => acc + (q.points || 0), 0);
  let earnedScore = 0;
  if (simSubmitted) {
    questions.forEach((q) => {
      if (simAnswers[q.id] === q.correctAnswer) {
        earnedScore += q.points || 0;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
              Avaliações & Questionários
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Questionários com Múltipla Escolha
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Crie perguntas com 4 alternativas, defina o gabarito oficial com pontuações e adicione explicações bíblicas para os alunos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setSimulationMode(!simulationMode)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer ${
              simulationMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{simulationMode ? 'Sair do Modo Teste' : 'Simular como Aluno'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Activity Selector & Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 w-full sm:max-w-md">
            <label className="text-xs font-bold text-slate-700">Selecione a Atividade / Prova:</label>
            <select
              value={selectedActivityId}
              onChange={(e) => handleSelectActivity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs text-slate-800"
            >
              {allActivities.map((act) => (
                <option key={act.id} value={act.id}>
                  [{act.courseId === 'confirmatorio' ? 'Confirmatório' : 'Profissão de Fé'}]{' '}
                  {act.title} ({act.questions.length} questões)
                </option>
              ))}
            </select>
          </div>

          {selectedActivity && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Total de Questões</span>
                <span className="font-bold text-slate-900 text-sm">{questions.length}</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 block">Pontuação Total</span>
                <span className="font-bold text-amber-900 text-sm">
                  {questions.reduce((a, b) => a + (b.points || 0), 0)} pts
                </span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
                <span className="text-[10px] text-purple-700 block">Respostas de Alunos</span>
                <span className="font-bold text-purple-900 text-sm">{grades.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIMULATION MODE (TESTE PELO PASTOR) */}
      {simulationMode && selectedActivity && (
        <div className="p-6 rounded-3xl bg-purple-50/70 border-2 border-purple-200 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-700" />
              <div>
                <h3 className="font-bold text-purple-950 font-display text-base">
                  Simulador de Teste (Visão do Confirmando)
                </h3>
                <p className="text-xs text-purple-800">
                  Teste as alternativas e confira se as respostas corretas e explicações pastorais estão funcionando perfeitamente.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSimAnswers({});
                setSimSubmitted(false);
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Respostas</span>
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const selectedOpt = simAnswers[q.id];
              const isCorrect = selectedOpt === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      <span className="text-purple-700 mr-1.5 font-display">
                        Questão {qIndex + 1}.
                      </span>
                      {q.question}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      {q.points} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      let btnStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';

                      if (simSubmitted) {
                        if (optIdx === q.correctAnswer) {
                          btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-100 border-red-400 text-red-950';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-purple-700 text-white border-purple-700 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={simSubmitted}
                          onClick={() => handleSimOptionSelect(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {simSubmitted && (
                    <div
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correto! (+{q.points} pontos)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>Incorreto. A resposta certa era a alternativa {String.fromCharCode(65 + q.correctAnswer)}.</span>
                          </>
                        )}
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-700 italic pt-1 border-t border-black/5">
                          💡 Comentário Bíblico: {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-purple-200 pt-4">
            {simSubmitted ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Resultado do Teste:</span>
                <span className="px-3 py-1 rounded-xl bg-purple-700 text-white font-bold text-sm">
                  {earnedScore.toFixed(1)} / {totalPossibleScore.toFixed(1)} pontos (
                  {totalPossibleScore > 0 ? Math.round((earnedScore / totalPossibleScore) * 100) : 0}%)
                </span>
              </div>
            ) : (
              <div className="text-xs text-purple-900 font-medium">
                Selecione as opções acima para testar.
              </div>
            )}

            {!simSubmitted ? (
              <button
                onClick={handleSimCalculate}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Concluir Simulação & Ver Gabarito
              </button>
            ) : (
              <button
                onClick={() => {
                  setSimSubmitted(false);
                  setSimAnswers({});
                }}
                className="px-4 py-2 rounded-xl border border-purple-300 text-purple-900 font-bold text-xs hover:bg-purple-100 cursor-pointer"
              >
                Refazer Teste
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUESTIONS LIST AND BUILDER */}
      {!simulationMode && selectedActivity && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-700" />
              <span>Questões Cadastradas nesta Atividade ({questions.length})</span>
            </h3>

            <button
              onClick={handleStartNewQuestion}
              className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Nova Questão</span>
            </button>
          </div>

          {/* Form for new/editing question */}
          {editingQuestionId && (
            <form
              onSubmit={handleSaveQuestion}
              className="p-6 rounded-3xl bg-white border-2 border-purple-300 shadow-md space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm font-display">
                  {editingQuestionId === 'new' ? 'Nova Pergunta de Múltipla Escolha' : 'Editar Pergunta'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingQuestionId(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">
                  Enunciado da Questão *
                </label>
                <textarea
                  rows={2}
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Ex: Conforme a carta de Paulo aos Romanos, como o ser humano é justificado diante de Deus?"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-purple-600 outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-xs text-slate-700 block">
                  Alternativas de Resposta (Marque o círculo da alternativa correta / gabarito):
                </label>

                {[
                  { label: 'A', value: opt0, setter: setOpt0, idx: 0 },
                  { label: 'B', value: opt1, setter: setOpt1, idx: 1 },
                  { label: 'C', value: opt2, setter: setOpt2, idx: 2 },
                  { label: 'D', value: opt3, setter: setOpt3, idx: 3 },
                ].map((item) => (
                  <div
                    key={item.idx}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition ${
                      correctIdx === item.idx
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer shrink-0 pl-1">
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={correctIdx === item.idx}
                        onChange={() => setCorrectIdx(item.idx)}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                      />
                      <span className="font-bold text-xs text-slate-700">
                        Opção {item.label}:
                      </span>
                    </label>

                    <input
                      type="text"
                      required={item.idx < 2}
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      placeholder={`Texto da alternativa ${item.label}...`}
                      className="flex-1 p-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />

                    {correctIdx === item.idx && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Correta
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">
                    Pontuação Desta Questão
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">
                    Comentário Bíblico / Justificativa Pastoral (Opcional)
                  </label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Ex: Romanos 3.28 ou citação do Catecismo Menor"
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestionId(null)}
                  className="px-4 py-2 rounded-xl border text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Salvar Questão
                </button>
              </div>
            </form>
          )}

          {/* List of existing questions */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      Questão {idx + 1} • {q.points} pontos
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.question}</h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDuplicateQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Duplicar questão"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEditQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-slate-100 transition"
                      title="Editar questão"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Excluir questão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                    💡 <strong>Comentário / Gabarito:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">
                Nenhuma questão de múltipla escolha cadastrada nesta atividade
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clique no botão "Adicionar Nova Questão" para compor a prova e fixar o conteúdo com os alunos.
              </p>
              <button
                onClick={handleStartNewQuestion}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Criar Primeira Questão
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
