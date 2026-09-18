export type Role = 'admin' | 'student';

export type CourseType = 'confirmatorio' | 'profissao_fe';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export type CatechismMemorizationStatus = 'Não avaliado' | 'Em andamento' | 'Memorizado';
export type CatechismStatus = CatechismMemorizationStatus;

export interface MonthAttendanceStatus {
  monthIndex: number;
  monthName: string;
  yearNumber: 1 | 2;
  hasRecord: boolean;
  status?: WorshipStatus;
  record?: WorshipRecord;
}

export type WorshipStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export type AudienceType = 'all' | 'confirmatorio' | 'profissao_fe' | string; // string can be congregationId

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  phone?: string;
  birthDate?: string;
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  complement?: string;
  courseType?: CourseType;
  congregationId?: string;
  congregationName?: string;
  status?: RequestStatus;
  statusReason?: string;
  passwordHash: string;
  salt: string;
}

export interface ChurchHistoryItem {
  id: string;
  churchName: string;
  city: string;
  state: string;
  period: string;
  notes?: string;
}

export interface BaptismData {
  isBaptized: boolean;
  date?: string;
  church?: string;
  city?: string;
  state?: string;
  notes?: string;
}

export interface InternalNote {
  id: string;
  date: string;
  authorName?: string;
  author?: string;
  category?: 'Administrativa' | 'Formação' | 'Catecismo' | 'Presença' | string;
  content?: string;
  text?: string;
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface ParochialDocument {
  id: string;
  studentId: string;
  type: 'certidao_batismo' | 'documento_identidade' | 'comprovante_residencia' | 'outro';
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  status: DocumentStatus;
  submittedAt: string;
  reviewedAt?: string;
  pastorNotes?: string;
}

export interface StudentProfile extends User {
  baptism: BaptismData;
  churchHistory?: ChurchHistoryItem[]; // Specific to Profissão de Fé
  internalNotes?: InternalNote[]; // Private to Pastor
  enrollmentDate?: string;
  documents?: ParochialDocument[];
}

export interface Congregation {
  id: string;
  name: string;
  city: string;
  state: string;
  pastorName?: string;
  active: boolean;
}

export interface Question {
  id: string;
  question: string;
  text?: string;
  options: [string, string, string, string] | string[];
  correctAnswer: number; // 0, 1, 2, 3
  points: number; // e.g. 2.5 or 1
  explanation?: string;
}

export interface Activity {
  id: string;
  courseId: CourseType;
  moduleId: string;
  title: string;
  description: string;
  maxScore: number;
  deadline?: string;
  questions: Question[];
  published: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  answers: Record<string, number>;
  feedback?: string;
}

export interface ActivityDraft {
  id: string; // studentId + '_' + activityId
  studentId: string;
  activityId: string;
  answers: Record<string, number>;
  updatedAt: string;
}

export interface VideoLesson {
  id: string;
  courseId: CourseType;
  moduleId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationMinutes: number;
  order: number;
  published: boolean;
}

export interface VideoProgress {
  videoId: string;
  studentId: string;
  started: boolean;
  percentWatched: number;
  completed: boolean;
  updatedAt: string;
}

export interface LessonItem {
  id: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'audio' | 'activity';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  duration?: string;
  durationMinutes?: number;
  order: number;
}
export type Lesson = LessonItem;

export interface Module {
  id: string;
  courseId: CourseType;
  title: string;
  description: string;
  order: number;
  lessons: LessonItem[];
  published: boolean;
}

export interface CatechismSection {
  id: string;
  number: number;
  title: string;
  description: string;
  content: string;
  explanation: string;
  biblicalReferences?: string;
}

export interface CatechismAssessment {
  id: string;
  studentId: string;
  sectionId: string;
  sectionTitle?: string;
  status: CatechismMemorizationStatus;
  date?: string;
  grade?: number; // 0 - 10
  score?: number;
  observation?: string;
  notes?: string;
  updatedBy?: string;
}

export interface WorshipRecord {
  id: string;
  studentId: string;
  studentName: string;
  congregationId: string;
  congregationName: string;
  worshipDate: string; // YYYY-MM-DD
  monthIndex: number; // 1 to 24 (Year 1: 1-12, Year 2: 13-24)
  scriptureReading: string; // Leitura bíblica principal
  biblicalReading?: string;
  sermonText: string; // Texto / base da mensagem
  messageTheme?: string;
  sermonSummary: string; // Resumo da mensagem
  messageSummary?: string;
  photoUrl?: string; // Foto do culto ou folheto
  status: WorshipStatus;
  submittedAt: string;
  reviewedAt?: string;
  pastorNotes?: string;
}

export interface Devotion {
  id: string;
  title: string;
  bibleVerse: string;
  verse?: string;
  reflection: string;
  content?: string;
  prayer: string;
  author: string;
  date: string;
  imageUrl?: string;
  audioUrl?: string;
  targetAudience: AudienceType;
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  description: string;
  imageUrl?: string;
  congregationId: 'all' | string;
  category?: 'culto' | 'encontro' | 'retiro' | 'aula' | 'reuniao' | 'outro' | string;
  externalLink?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'alta';
  targetAudience: AudienceType;
  date: string;
  author: string;
}

export interface StudyText {
  id: string;
  title: string;
  category: 'Estudo Bíblico' | 'Doutrina Luterana' | 'História da Reforma' | 'Liturgia' | 'Vida Cristã';
  author: string;
  summary: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  date: string;
}

export interface AppSettings {
  appName: string;
  appSubtitle: string;
  logoType: 'luther_rose' | 'custom_upload' | 'url';
  logoUrl?: string;
  primaryColor: string; // Hex color code e.g. #1e3a5f
  accentColor: string; // Hex color code e.g. #f59e0b
}

export type NotificationType = 'activity' | 'grade' | 'announcement' | 'system';

export interface AppNotification {
  id: string;
  userId: string; // Recipient
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string; // Optional internal link
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  studentId: string; // The "room" identifier
  text: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  action: string;
  details: any;
  timestamp: string;
}

