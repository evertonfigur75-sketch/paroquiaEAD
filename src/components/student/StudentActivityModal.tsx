import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Activity, Grade } from '../../types';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface StudentActivityModalProps {
  activityId: string | null;
  onClose: () => void;
  onCompleted?: () => void;
}

export const StudentActivityModal: React.FC<StudentActivityModalProps> = ({
  activityId,
  onClose,
  onCompleted,
}) => {
  const { studentProfile } = useAuth();
  if (!activityId || !studentProfile) return null;

  const activity = dbService.getActivityById(activityId);
  if (!activity) return null;

  const existingGrade = dbService
    .getGradesByStudent(studentProfile.id)
    .find((g) => g.activityId === activityId);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    existingGrade?.answers || {}
  );
  const [submittedGrade, setSubmittedGrade] = useState<Grade | null>(existingGrade || null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Load draft on mount
  React.useEffect(() => {
    if (!existingGrade) {
      const loadDraft = async () => {
        const draft = await dbService.getActivityDraft(studentProfile.id, activityId);
        if (draft) {
          setSelectedAnswers(draft.answers);
        }
      };
      loadDraft();
    }
  }, [activityId, studentProfile.id, existingGrade]);

  const question = activity.questions[currentQuestionIdx];
  const totalQuestions = activity.questions.length;

  const handleSelectOption = async (optionIdx: number) => {
    if (submittedGrade) return;
    
    const newAnswers = {
      ...selectedAnswers,
      [question.id]: optionIdx,
    };
    
    setSelectedAnswers(newAnswers);
    
    // Save draft
    setIsSavingDraft(true);
    try {
      await dbService.saveActivityDraft({
        id: `${studentProfile.id}_${activity.id}`,
        studentId: studentProfile.id,
        activityId: activity.id,
        answers: newAnswers,
      });
    } catch (e) {
      console.warn('Erro ao salvar rascunho:', e);
    } finally {
      setTimeout(() => setIsSavingDraft(false), 500);
    }
  };

  const handleNext = () => {
    setError(null);
    if (selectedAnswers[question.id] === undefined) {
      setError('Por favor, selecione uma resposta antes de avançar.');
      return;
    }
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setError(null);
    if (selectedAnswers[question.id] === undefined) {
      setError('Por favor, selecione uma resposta para a última questão.');
      return;
    }

    try {
      const grade = await dbService.submitActivityGrade(
        studentProfile.id,
        studentProfile.name,
        activity.id,
        selectedAnswers
      );
      
      // Delete draft after successful submission
      await dbService.deleteActivityDraft(studentProfile.id, activity.id);
      
      setSubmittedGrade(grade);
      onCompleted?.();
    } catch (err: unknown) {
      setError('Erro ao enviar atividade.');
    }
  };

  const handleRetry = () => {
    setSubmittedGrade(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                Questionário Avaliativo
              </span>
              <span className="text-xs text-slate-500">Nota máxima: {activity.maxScore}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              {activity.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Screen if submitted */}
        {submittedGrade ? (
          <div className="space-y-5 text-center py-2 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resultado da Avaliação
              </span>
              <div className="text-3xl font-bold text-slate-900 mt-1 font-display">
                {submittedGrade.score} <span className="text-base text-slate-400 font-normal">/ {activity.maxScore}</span>
              </div>
              <p className="text-xs font-semibold text-purple-700 mt-0.5">
                {submittedGrade.percentage}% de acertos
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed text-left">
              <p className="font-bold text-slate-900 mb-1">Feedback do Sistema:</p>
              <p>{submittedGrade.feedback}</p>
            </div>

            {/* Answer breakdown list */}
            <div className="text-left space-y-2 max-h-48 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-slate-700">Revisão das Questões:</p>
              {activity.questions.map((q, idx) => {
                const isCorrect = submittedGrade.answers[q.id] === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-rose-200 bg-rose-50/60 text-rose-900'
                    }`}
                  >
                    <div>
                      <span className="font-bold">Q{idx + 1}:</span> {q.text}
                      <p className="text-[11px] mt-1 text-slate-600">
                        Correta: {q.options[q.correctAnswer]}
                      </p>
                    </div>
                    <span className="font-bold text-xs">
                      {isCorrect ? '✓ Correto' : '✕ Incorreto'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleRetry}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refazer Questionário</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          /* Question step */
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Questão {currentQuestionIdx + 1} de {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                {isSavingDraft && (
                  <span className="text-[10px] text-slate-400 animate-pulse">Salvando rascunho...</span>
                )}
                <span>{Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100)}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all"
                style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {question.text}
              </h4>
            </div>

            {/* Alternatives */}
            <div className="space-y-2.5">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswers[question.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition flex items-start gap-3 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20 text-purple-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIdx === 0}
                onClick={handlePrev}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Anterior
              </button>

              {currentQuestionIdx < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-2.5 px-5 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 transition flex items-center gap-1.5 shadow-sm"
                >
                  Próxima Questão
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-md"
                >
                  Finalizar e Enviar
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
