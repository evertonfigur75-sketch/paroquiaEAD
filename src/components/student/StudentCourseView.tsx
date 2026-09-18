import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Module, Lesson, VideoLesson, Activity } from '../../types';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Award,
  Video,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface StudentCourseViewProps {
  onOpenActivity: (activityId: string) => void;
}

export const StudentCourseView: React.FC<StudentCourseViewProps> = ({ onOpenActivity }) => {
  const { studentProfile } = useAuth();
  if (!studentProfile) return null;

  const modules = dbService.getModules(studentProfile.courseType);
  const videos = dbService.getVideos(studentProfile.courseType);
  const activities = dbService.getActivities(studentProfile.courseType);
  const grades = dbService.getGradesByStudent(studentProfile.id);

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(modules[0]?.id || null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);

  const toggleModule = (id: string) => {
    setExpandedModuleId(expandedModuleId === id ? null : id);
  };

  const handleOpenVideo = (video: VideoLesson) => {
    setActiveVideo(video);
    // Mark video progress
    dbService.updateVideoProgress(studentProfile.id, video.id, 100, true);
  };

  const getModuleActivities = (moduleId: string) => {
    return activities.filter((a) => a.moduleId === moduleId);
  };

  const getModuleVideos = (moduleId: string) => {
    return videos.filter((v) => v.moduleId === moduleId);
  };

  const getActivityGrade = (activityId: string) => {
    return grades.find((g) => g.activityId === activityId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1e3a5f] to-[#162a45] text-white p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
            {studentProfile.courseType === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display">Módulos de Estudo e Lições</h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Acesse as aulas em texto, vídeo-aulas doutrinárias, leituras bíblicas e questionários avaliativos.
          </p>
        </div>
      </div>

      {/* Modules Accordion */}
      <div className="space-y-4">
        {modules.map((mod, index) => {
          const isExpanded = expandedModuleId === mod.id;
          const modActivities = getModuleActivities(mod.id);
          const modVideos = getModuleVideos(mod.id);

          return (
            <div
              key={mod.id}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition"
            >
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                    {mod.lessons.length} aulas • {modActivities.length} atividades
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Module Contents */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-slate-100 space-y-4">
                  {/* Lessons in Text */}
                  {mod.lessons.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Lições em Texto
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-300 transition cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <BookOpen className="w-4 h-4 text-amber-700 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{lesson.title}</h4>
                                <span className="text-[10px] text-slate-400">
                                  {lesson.durationMinutes || 15} min de leitura
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-amber-700 font-semibold">Ler</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {modVideos.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        Vídeo-aulas
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {modVideos.map((vid) => (
                          <div
                            key={vid.id}
                            onClick={() => handleOpenVideo(vid)}
                            className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-sky-50/50 hover:border-sky-300 transition cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <PlayCircle className="w-4 h-4 text-sky-700 flex-shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{vid.title}</h4>
                                <span className="text-[10px] text-slate-400">
                                  Duração: {vid.durationMinutes} min
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-sky-700 font-semibold">Assistir</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities / Quizzes */}
                  {modActivities.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        Atividades Avaliativas
                      </span>
                      <div className="space-y-2">
                        {modActivities.map((act) => {
                          const grade = getActivityGrade(act.id);
                          return (
                            <div
                              key={act.id}
                              className="p-3.5 rounded-xl border border-slate-200 bg-purple-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                                  {grade && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      Nota: {grade.score} / {act.maxScore}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                              </div>

                              <button
                                onClick={() => onOpenActivity(act.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                  grade
                                    ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                    : 'bg-purple-700 hover:bg-purple-800 text-white shadow-sm'
                                }`}
                              >
                                {grade ? 'Refazer / Ver Respostas' : 'Responder Questionário'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lesson Reader Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Lição Doutrinária
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {selectedLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 italic">
                “Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça.” — 2 Timóteo 3.16
              </div>

              <div className="space-y-3 whitespace-pre-line">
                {selectedLesson.content}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLesson(null)}
                className="py-2.5 px-5 rounded-xl bg-[#1e3a5f] text-white text-xs font-semibold hover:bg-[#162a45] transition"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Lesson Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 shadow-2xl overflow-hidden text-white animate-in fade-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold font-display">{activeVideo.title}</h3>
                <p className="text-[11px] text-slate-400">Vídeo-aula pastoral • Paróquia Luterana</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center relative">
              {activeVideo.videoUrl.includes('youtube.com') || activeVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <PlayCircle className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
                  <p className="text-sm font-medium text-slate-300">
                    Reproduzindo vídeo doutrinário
                  </p>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                  >
                    Abrir link externo <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Progresso de visualização registrado!</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition"
              >
                Fechar Vídeo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
