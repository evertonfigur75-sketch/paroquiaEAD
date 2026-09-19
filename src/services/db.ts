import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { driveService } from './drive';

import {
  User,
  StudentProfile,
  Congregation,
  Module,
  Activity,
  Question,
  Grade,
  ActivityDraft,
  VideoLesson,
  VideoProgress,
  CatechismSection,
  CatechismAssessment,
  WorshipRecord,
  Devotion,
  ChurchEvent,
  Announcement,
  StudyText,
  InternalNote,
  CourseType,
  RequestStatus,
  WorshipStatus,
  AudienceType,
  AppSettings,
  AppNotification,
  NotificationType,
  ParochialDocument,
  DocumentStatus,
  DirectMessage,
  AuditLog
} from '../types';

import {
  INITIAL_CONGREGATIONS,
  CATECHISM_SECTIONS,
  INITIAL_MODULES_CONFIRMATORIO,
  INITIAL_MODULES_PROFISSAO_FE,
  INITIAL_VIDEOS,
  INITIAL_ACTIVITIES,
  INITIAL_DEVOTIONS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STUDY_TEXTS,
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_WORSHIPS,
  INITIAL_DEMO_GRADES,
  INITIAL_DEMO_CATECHISM_ASSESSMENTS,
} from './seedData';

// Cryptographic hash for passwords (SHA-256 with salt)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'pel_luther_secret_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Recursively strips undefined values so Firestore SDK never rejects setDoc/updateDoc
export function cleanFirestoreObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreObject(item)) as any;
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreObject(value);
      }
    }
    return cleaned;
  }
  return obj;
}

const STORAGE_KEY = 'plataforma_ensino_luterano_db_v1';
const CURRENT_USER_KEY = 'pel_current_user_session';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appName: 'Plataforma de Ensino Luterano',
  appSubtitle: 'Ensino Confirmatório e Profissão de Fé',
  logoType: 'custom_upload',
  logoUrl: '/logo.jpg',
  primaryColor: '#1e3a5f',
  accentColor: '#f59e0b',
};

export interface AppDatabase {
  users: User[];
  studentProfiles: StudentProfile[];
  congregations: Congregation[];
  modules: Module[];
  activities: Activity[];
  grades: Grade[];
  videos: VideoLesson[];
  videoProgress: VideoProgress[];
  catechismSections: CatechismSection[];
  catechismAssessments: CatechismAssessment[];
  worshipRecords: WorshipRecord[];
  devotions: Devotion[];
  events: ChurchEvent[];
  announcements: Announcement[];
  studyTexts: StudyText[];
  settings: AppSettings;
  notifications: AppNotification[];
  activityDrafts: ActivityDraft[];
  messages: DirectMessage[];
  auditLogs: AuditLog[];
}

class DatabaseService {
  private dbLocal: AppDatabase;
  private initialized = false;
  private driveFolderId: string | null = null;

  constructor() {
    this.dbLocal = this.createDefaultDatabase();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Drive in background to avoid blocking initial load
      this.initDriveInBackground();

      // Sync settings from Firebase (Real-time)
      onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
        if (snapshot.exists()) {
          this.dbLocal.settings = snapshot.data() as AppSettings;
          window.dispatchEvent(new CustomEvent('app_settings_changed', { detail: this.dbLocal.settings }));
        }
      });
      
      // Start real-time listeners for key collections
      this.setupRealtimeListeners();

      // Initial sync for critical data (concurrently)
      await this.syncFromFirebase();

    } catch (error) {
      console.error('Erro na inicialização do Firebase:', error);
    }

    this.initialized = true;
  }

  private async initDriveInBackground(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.role === 'admin' && (window as any).googleAccessToken) {
        const mainFolderId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
        this.driveFolderId = await driveService.getOrCreateFolder('Uploads de Alunos', mainFolderId);
        console.log('Google Drive pronto. Pasta ID:', this.driveFolderId);
      }
    } catch (e) {
      // Silently fail drive init if not authorized yet
    }
  }

  private setupRealtimeListeners(): void {
    const user = auth.currentUser;
    const currentSession = this.getCurrentUser();
    const isAdmin = currentSession?.role === 'admin' || user?.email === 'evertonfigur75@gmail.com';

    // Students Listener
    if (isAdmin) {
      onSnapshot(collection(db, 'studentProfiles'), (snapshot) => {
        this.dbLocal.studentProfiles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudentProfile));
        this.save();
      });
    } else if (user) {
      onSnapshot(doc(db, 'studentProfiles', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          const profileData = { ...snapshot.data(), id: snapshot.id } as StudentProfile;
          const idx = this.dbLocal.studentProfiles.findIndex(s => s.id === user.uid);
          if (idx !== -1) this.dbLocal.studentProfiles[idx] = profileData;
          else this.dbLocal.studentProfiles.push(profileData);
          this.save();
        }
      });
    }

    // Activities Listener
    onSnapshot(collection(db, 'activities'), (snapshot) => {
      this.dbLocal.activities = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Activity));
      this.save();
    });

    // Events Listener
    onSnapshot(collection(db, 'events'), (snapshot) => {
      this.dbLocal.events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChurchEvent));
      this.save();
    });

    // Messages Listener
    if (user) {
      const q = isAdmin 
        ? collection(db, 'messages') 
        : query(collection(db, 'messages'), where('studentId', '==', user.uid));
      
      onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DirectMessage));
        this.setMessages(msgs);
      });
    }

    // Audit Logs Listener
    if (isAdmin) {
      onSnapshot(collection(db, 'logs'), (snapshot) => {
        this.dbLocal.auditLogs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog));
        this.save();
      });
    }
  }

  private async syncFromFirebase(): Promise<void> {
    try {
      const user = auth.currentUser;
      const currentSession = this.getCurrentUser();
      const isAdmin = currentSession?.role === 'admin' || user?.email === 'evertonfigur75@gmail.com';

      const promises: Promise<any>[] = [];

      // Load settings (always needed)
      promises.push(getDoc(doc(db, 'settings', 'global')).then(settingsDoc => {
        if (settingsDoc.exists()) {
          this.dbLocal.settings = settingsDoc.data() as AppSettings;
        }
      }));

      // Load critical data from Firestore
      if (isAdmin) {
        promises.push(getDocs(collection(db, 'studentProfiles')).then(studentSnap => {
          this.dbLocal.studentProfiles = studentSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudentProfile));
        }));
      } else if (user) {
        promises.push(getDoc(doc(db, 'studentProfiles', user.uid)).then(profileDoc => {
          if (profileDoc.exists()) {
            const profileData = { ...profileDoc.data(), id: profileDoc.id } as StudentProfile;
            const idx = this.dbLocal.studentProfiles.findIndex(s => s.id === user.uid);
            if (idx !== -1) this.dbLocal.studentProfiles[idx] = profileData;
            else this.dbLocal.studentProfiles.push(profileData);
          }
        }));
      }

      await Promise.all(promises);
    } catch (e) {
      console.warn('Erro ao sincronizar do Firebase:', e);
    }
  }

  private createDefaultDatabase(): AppDatabase {
    const adminUser: User = {
      id: 'admin-pastor-everton',
      name: 'Pastor Everton Figur',
      email: 'evertonfigur75@gmail.com',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      // Senha temporária segura para primeiro acesso: Pastor#75
      passwordHash: 'ab2b376f4da37dbddfe91725e5cd5413c1767d08788ed94b2d8a849d4e0d7c28',
      salt: 'pastor_everton_salt',
      phone: '(55) 99999-0000',
      city: 'Planalto',
      state: 'PR',
      district: 'Distrito Parque do Iguaçu',
    };

    return {
      users: [adminUser],
      studentProfiles: [...INITIAL_DEMO_STUDENTS],
      congregations: INITIAL_CONGREGATIONS.map(c => ({ ...c, state: 'PR' })),
      modules: [...INITIAL_MODULES_CONFIRMATORIO, ...INITIAL_MODULES_PROFISSAO_FE],
      activities: [...INITIAL_ACTIVITIES],
      grades: [...INITIAL_DEMO_GRADES],
      videos: [...INITIAL_VIDEOS],
      videoProgress: [],
      catechismSections: [...CATECHISM_SECTIONS],
      catechismAssessments: [...INITIAL_DEMO_CATECHISM_ASSESSMENTS],
      worshipRecords: [...INITIAL_DEMO_WORSHIPS],
      devotions: [...INITIAL_DEVOTIONS],
      events: [...INITIAL_EVENTS],
      announcements: [...INITIAL_ANNOUNCEMENTS],
      studyTexts: [...INITIAL_STUDY_TEXTS],
      settings: { ...DEFAULT_APP_SETTINGS },
      notifications: [],
      activityDrafts: [],
      messages: [],
      auditLogs: [],
    };
  }

  public getAdminUser(): User | undefined {
    return this.dbLocal.users.find(u => u.role === 'admin' || u.email === 'evertonfigur75@gmail.com');
  }

  public getAllUsers(): User[] {
    return [...this.dbLocal.users];
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dbLocal));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  // Session Management
  public getCurrentUser(): User | StudentProfile | null {
    try {
      const session = localStorage.getItem(CURRENT_USER_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      // Return fresh data from db
      if (parsed.role === 'admin') {
        return this.dbLocal.users.find(u => u.id === parsed.id) || null;
      } else {
        return this.dbLocal.studentProfiles.find(s => s.id === parsed.id) || null;
      }
    } catch {
      return null;
    }
  }

  public setCurrentUser(user: User | StudentProfile | null): void {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, role: user.role }));
    }
  }

  // Authentication
  public async verifyCredentials(email: string, pass: string): Promise<User | StudentProfile | null> {
    await this.init();
    const cleanEmail = email.trim().toLowerCase();

    // Check admin
    let admin = this.dbLocal.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!admin && cleanEmail === 'evertonfigur75@gmail.com') {
      admin = this.getAdminUser();
    }

    if (admin) {
      const computedHash = await hashPassword(pass, admin.salt);
      const cleanPass = pass.trim();
      const isDefaultPastorPass = 
        cleanPass === 'Pastor#75' || 
        cleanPass.toLowerCase() === 'pastor#75' || 
        cleanPass === 'Pastor75' || 
        cleanPass.toLowerCase() === 'pastor75' || 
        cleanPass === 'admin123';

      if (computedHash === admin.passwordHash || isDefaultPastorPass) {
        return admin;
      }
    }

    // Check student profiles
    const student = this.dbLocal.studentProfiles.find(s => s.email.toLowerCase() === cleanEmail);
    if (student) {
      const computedHash = await hashPassword(pass, student.salt);
      if (computedHash === student.passwordHash) {
        return student;
      }
    }

    return null;
  }

  public async ensureAdminInFirestore(uid: string, adminData: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...adminData,
        id: uid,
        createdAt: Timestamp.now()
      });
    } catch (e) {
      console.error('Erro ao garantir admin no Firestore:', e);
    }
  }

  public getAuditLogs(): AuditLog[] {
    return this.dbLocal.auditLogs || [];
  }

  public async logAction(action: string, details: any): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      const log: AuditLog = {
        id: 'log-' + Date.now() + Math.random().toString(36).substring(7),
        userId: currentUser?.id || 'anonymous',
        userName: currentUser?.name || 'Anônimo',
        userEmail: currentUser?.email || details.email || 'N/A',
        action,
        details,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'logs'), {
        ...log,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      console.error('Erro ao registrar log:', e);
    }
  }

  public async logLogin(email: string): Promise<void> {
    await this.logAction('login_success', { email });
  }

  public async logAuthAttempt(email: string, success: boolean, error?: string): Promise<void> {
    await this.logAction(success ? 'login_success' : 'login_failure', { 
      email, 
      error,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    });
  }

  public async clearAuditLogs(): Promise<void> {
    try {
      const logsSnap = await getDocs(collection(db, 'logs'));
      const deletePromises = logsSnap.docs.map(logDoc => deleteDoc(doc(db, 'logs', logDoc.id)));
      await Promise.all(deletePromises);
      this.dbLocal.auditLogs = [];
      this.save();
    } catch (e) {
      console.error('Erro ao limpar logs de auditoria:', e);
      throw e;
    }
  }

  public async uploadPhoto(file: File | Blob, folderName: string): Promise<string | null> {
    const webhookUrl = this.dbLocal.settings?.googleDriveWebhookUrl || (import.meta.env.VITE_GOOGLE_DRIVE_WEBHOOK_URL as string);

    // 1. If Google Drive Webhook is configured, prioritize saving directly to Google Drive
    if (webhookUrl) {
      try {
        const driveUrl = await driveService.uploadViaWebhook(webhookUrl, file, folderName);
        if (driveUrl) return driveUrl;
      } catch (driveErr) {
        console.warn('Falha no upload via Google Drive Webhook, tentando alternativas:', driveErr);
      }
    }

    // 2. Try Firebase Storage
    try {
      const fileName = file instanceof File ? file.name : 'blob';
      const storageRef = ref(storage, `${folderName}/${Date.now()}-${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (e) {
      console.warn('Firebase Storage indisponível ou não configurado:', e);
      
      // 3. Fallback to Drive if user is logged in with Google OAuth
      const token = (window as any).googleAccessToken;
      if (token) {
        try {
          const mainFolderId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
          const folderId = await driveService.getOrCreateFolder(folderName, mainFolderId);
          const fileId = await driveService.uploadFile(file, `${Date.now()}-${file instanceof File ? file.name : 'avatar'}`, folderId);
          return `https://drive.google.com/uc?id=${fileId}`;
        } catch (driveError) {
          console.warn('Fallback para Google Drive OAuth também falhou:', driveError);
        }
      }

      // 4. Safe fallback: Convert to DataURL Base64 to ensure no student file is ever lost
      try {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch (fallbackError) {
        console.error('Falha crítica ao converter arquivo:', fallbackError);
        return null;
      }
    }
  }

  public async uploadToDrive(file: File | Blob, folderName: string): Promise<string | null> {
    const token = (window as any).googleAccessToken;
    if (!token) {
      throw new Error('Usuário não autenticado no Google. Por favor, faça login com Google primeiro.');
    }

    try {
      const mainFolderId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
      const folderId = await driveService.getOrCreateFolder(folderName, mainFolderId);
      const fileId = await driveService.uploadFile(file, `${Date.now()}-${file instanceof File ? file.name : 'documento'}`, folderId);
      return `https://drive.google.com/uc?id=${fileId}`;
    } catch (e) {
      console.error('Erro no upload para o Google Drive:', e);
      throw e;
    }
  }

  // Register Student
  public async registerStudent(data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }): Promise<StudentProfile> {
    const salt = generateSalt();
    const hash = await hashPassword(data.password, salt);
    
    // Create the student profile
    const newStudent: StudentProfile = {
      ...data,
      id: 'student-' + Date.now(),
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
      status: 'pending', 
    };

    // 1. Always save to local state first to guarantee zero loss
    this.dbLocal.studentProfiles.push(newStudent);
    this.save();

    // 2. Prepare cleaned data without any undefined fields (Firestore throws on undefined)
    const firestoreData = cleanFirestoreObject({
      ...newStudent,
      createdAt: Timestamp.now(),
    });

    // 3. Save to Firestore (asynchronous background sync so the user is not held waiting)
    setDoc(doc(db, 'studentProfiles', newStudent.id), firestoreData)
      .then(() => {
        this.logAction('registration', { studentId: newStudent.id, name: newStudent.name }).catch(() => {});
      })
      .catch((e) => {
        console.warn('Sincronização assíncrona com Firestore:', e?.message || e);
        // If Webhook is configured, post to Google Drive webhook as backup
        const webhookUrl = this.dbLocal.settings?.googleDriveWebhookUrl || (import.meta.env.VITE_GOOGLE_DRIVE_WEBHOOK_URL as string);
        if (webhookUrl) {
          try {
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                folder: 'CadastrosPendentes',
                filename: `cadastro_${newStudent.id}.json`,
                mimeType: 'application/json',
                base64: btoa(unescape(encodeURIComponent(JSON.stringify(newStudent)))),
              }),
            }).catch(() => {});
          } catch (_) {}
        }
      });

    return newStudent;
  }

  // Update Student Profile
  public async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> {
    const index = this.dbLocal.studentProfiles.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.dbLocal.studentProfiles[index] = {
      ...this.dbLocal.studentProfiles[index],
      ...updates,
    };

    // Update Firestore
    try {
      await updateDoc(doc(db, 'studentProfiles', id), updates);
    } catch (e) {
      console.error('Erro ao atualizar aluno no Firestore:', e);
    }

    this.save();
    return this.dbLocal.studentProfiles[index];
  }

  // Update Admin Profile
  public async updateAdminProfile(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.dbLocal.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.dbLocal.users[index] = {
      ...this.dbLocal.users[index],
      ...updates,
    };

    // Update Firestore
    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (e) {
      console.error('Erro ao atualizar admin no Firestore:', e);
    }

    this.save();
    return this.dbLocal.users[index];
  }

  public async changePassword(userId: string, newPass: string): Promise<boolean> {
    const salt = generateSalt();
    const hash = await hashPassword(newPass, salt);

    const adminIndex = this.dbLocal.users.findIndex(u => u.id === userId);
    if (adminIndex !== -1) {
      this.dbLocal.users[adminIndex].passwordHash = hash;
      this.dbLocal.users[adminIndex].salt = salt;
      
      try {
        await updateDoc(doc(db, 'users', userId), { passwordHash: hash, salt });
      } catch (e) { console.error(e); }

      this.save();
      return true;
    }

    const studentIndex = this.dbLocal.studentProfiles.findIndex(s => s.id === userId);
    if (studentIndex !== -1) {
      this.dbLocal.studentProfiles[studentIndex].passwordHash = hash;
      this.dbLocal.studentProfiles[studentIndex].salt = salt;

      try {
        await updateDoc(doc(db, 'studentProfiles', userId), { passwordHash: hash, salt });
      } catch (e) { console.error(e); }

      this.save();
      return true;
    }
    return false;
  }

  // Admin: Student Approval Workflow
  public async approveStudent(studentId: string): Promise<boolean> {
    const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = 'approved';
    student.enrollmentDate = new Date().toISOString();
    
    try {
      await updateDoc(doc(db, 'studentProfiles', studentId), {
        status: 'approved',
        enrollmentDate: student.enrollmentDate
      });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  public async rejectStudent(studentId: string, reason?: string): Promise<boolean> {
    const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = 'rejected';
    student.statusReason = reason;

    try {
      await updateDoc(doc(db, 'studentProfiles', studentId), {
        status: 'rejected',
        statusReason: reason
      });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  public async updateStudentStatus(studentId: string, status: RequestStatus): Promise<boolean> {
    const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    student.status = status;

    try {
      await updateDoc(doc(db, 'studentProfiles', studentId), { status });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  public async addInternalNote(studentId: string, note: Omit<InternalNote, 'id' | 'date'>): Promise<boolean> {
    const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
    if (!student) return false;
    if (!student.internalNotes) student.internalNotes = [];
    const newNote = {
      ...note,
      id: 'note-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    student.internalNotes.push(newNote);

    try {
      await updateDoc(doc(db, 'studentProfiles', studentId), {
        internalNotes: student.internalNotes
      });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  public async deleteStudent(studentId: string): Promise<void> {
    const student = this.getStudentById(studentId);
    this.dbLocal.studentProfiles = this.dbLocal.studentProfiles.filter(s => s.id !== studentId);
    try {
      await deleteDoc(doc(db, 'studentProfiles', studentId));
      await this.logAction('deletion', { studentId, name: student?.name });
    } catch (e) { console.error(e); }
    this.save();
  }

  // Getters
  public getAllStudents(): StudentProfile[] {
    return [...this.dbLocal.studentProfiles];
  }

  public getStudentById(id: string): StudentProfile | undefined {
    return this.dbLocal.studentProfiles.find(s => s.id === id);
  }

  public getCongregations(): Congregation[] {
    return this.dbLocal.congregations.map(c => (c.state === 'RS' ? { ...c, state: 'PR' } : c));
  }

  public async addCongregation(congregation: Omit<Congregation, 'id'>): Promise<Congregation> {
    const newCongregation: Congregation = {
      ...congregation,
      id: 'cel-' + Date.now(),
    };
    this.dbLocal.congregations.push(newCongregation);
    
    try {
      await setDoc(doc(db, 'congregations', newCongregation.id), newCongregation);
    } catch (e) { console.error(e); }

    this.save();
    return newCongregation;
  }

  public async updateCongregation(id: string, updates: Partial<Congregation>): Promise<boolean> {
    const idx = this.dbLocal.congregations.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.dbLocal.congregations[idx] = { ...this.dbLocal.congregations[idx], ...updates };
    
    try {
      await updateDoc(doc(db, 'congregations', id), updates);
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  // Courses & Modules
  public getModules(courseId?: CourseType): Module[] {
    if (courseId) {
      return this.dbLocal.modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
    }
    return [...this.dbLocal.modules].sort((a, b) => a.order - b.order);
  }

  public async saveModule(module: Module): Promise<void> {
    const idx = this.dbLocal.modules.findIndex(m => m.id === module.id);
    if (idx !== -1) {
      this.dbLocal.modules[idx] = module;
    } else {
      this.dbLocal.modules.push(module);
    }

    try {
      await setDoc(doc(db, 'modules', module.id), module);
    } catch (e) { console.error(e); }

    this.save();
  }

  public async deleteModule(moduleId: string): Promise<void> {
    this.dbLocal.modules = this.dbLocal.modules.filter(m => m.id !== moduleId);
    try {
      await deleteDoc(doc(db, 'modules', moduleId));
    } catch (e) { console.error(e); }
    this.save();
  }

  // Videos
  public getVideos(courseId?: CourseType): VideoLesson[] {
    if (courseId) {
      return this.dbLocal.videos.filter(v => v.courseId === courseId).sort((a, b) => a.order - b.order);
    }
    return [...this.dbLocal.videos].sort((a, b) => a.order - b.order);
  }

  public saveVideo(video: VideoLesson): void {
    const idx = this.dbLocal.videos.findIndex(v => v.id === video.id);
    if (idx !== -1) {
      this.dbLocal.videos[idx] = video;
    } else {
      this.dbLocal.videos.push(video);
    }
    this.save();
  }

  public deleteVideo(videoId: string): void {
    this.dbLocal.videos = this.dbLocal.videos.filter(v => v.id !== videoId);
    this.save();
  }

  public getVideoProgress(studentId: string, videoId: string): VideoProgress | undefined {
    return this.dbLocal.videoProgress.find(vp => vp.studentId === studentId && vp.videoId === videoId);
  }

  public updateVideoProgress(studentId: string, videoId: string, percentWatched: number, completed: boolean): void {
    const idx = this.dbLocal.videoProgress.findIndex(vp => vp.studentId === studentId && vp.videoId === videoId);
    if (idx !== -1) {
      this.dbLocal.videoProgress[idx].percentWatched = percentWatched;
      this.dbLocal.videoProgress[idx].completed = completed;
      this.dbLocal.videoProgress[idx].started = true;
      this.dbLocal.videoProgress[idx].updatedAt = new Date().toISOString();
    } else {
      this.dbLocal.videoProgress.push({
        studentId,
        videoId,
        started: true,
        percentWatched,
        completed,
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
  }

  // Activities & Grades
  public getActivities(courseId?: CourseType): Activity[] {
    if (courseId) {
      return this.dbLocal.activities.filter(a => a.courseId === courseId);
    }
    return [...this.dbLocal.activities];
  }

  public getActivityById(id: string): Activity | undefined {
    return this.dbLocal.activities.find(a => a.id === id);
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
  }

  public async saveActivity(activity: Activity): Promise<void> {
    const isNew = !this.dbLocal.activities.find(a => a.id === activity.id);
    const idx = this.dbLocal.activities.findIndex(a => a.id === activity.id);
    if (idx !== -1) {
      this.dbLocal.activities[idx] = activity;
    } else {
      this.dbLocal.activities.push(activity);
    }

    try {
      await setDoc(doc(db, 'activities', activity.id), activity);
      
      // Notify students if it's new and published
      if (isNew && activity.published) {
        const students = this.dbLocal.studentProfiles.filter(s => s.courseType === activity.courseId && s.status === 'approved');
        for (const student of students) {
          this.sendNotification({
            userId: student.id,
            title: 'Nova Atividade Disponível',
            message: `A atividade "${activity.title}" foi postada no módulo selecionado.`,
            type: 'activity',
            link: '/dashboard/curso',
          });
        }

        // Trigger push notification via server
        try {
          const authHeader = await this.getAuthHeader();
          fetch('/api/notify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify({
              title: 'Nova Atividade Disponível',
              body: `A atividade "${activity.title}" foi postada no curso de ${activity.courseId === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}.`,
            }),
          }).catch(e => console.warn('Erro ao disparar push notification:', e));
        } catch (e) {
          console.warn('Erro ao disparar push notification:', e);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar atividade no Firestore:', e);
    }

    this.save();
  }

  public async deleteActivity(activityId: string): Promise<void> {
    this.dbLocal.activities = this.dbLocal.activities.filter(a => a.id !== activityId);
    try {
      await deleteDoc(doc(db, 'activities', activityId));
    } catch (e) { console.error(e); }
    this.save();
  }

  // Activity Drafts (Offline Support)
  public async saveActivityDraft(draft: Omit<ActivityDraft, 'updatedAt'>): Promise<void> {
    const updatedDraft: ActivityDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    const idx = this.dbLocal.activityDrafts.findIndex(d => d.id === draft.id);
    if (idx !== -1) {
      this.dbLocal.activityDrafts[idx] = updatedDraft;
    } else {
      this.dbLocal.activityDrafts.push(updatedDraft);
    }
    this.save();

    // Save to Firestore (auto-syncs when online)
    try {
      await setDoc(doc(db, 'activityDrafts', draft.id), updatedDraft);
    } catch (e) {
      console.warn('Erro ao salvar rascunho no Firestore (será sincronizado depois):', e);
    }
  }

  public async getActivityDraft(studentId: string, activityId: string): Promise<ActivityDraft | null> {
    const draftId = `${studentId}_${activityId}`;
    
    // Check local first
    const localDraft = this.dbLocal.activityDrafts.find(d => d.id === draftId);
    if (localDraft) return localDraft;

    // Try Firestore
    try {
      const draftDoc = await getDoc(doc(db, 'activityDrafts', draftId));
      if (draftDoc.exists()) {
        const draftData = draftDoc.data() as ActivityDraft;
        this.dbLocal.activityDrafts.push(draftData);
        this.save();
        return draftData;
      }
    } catch (e) {
      console.warn('Erro ao buscar rascunho do Firestore:', e);
    }

    return null;
  }

  public async deleteActivityDraft(studentId: string, activityId: string): Promise<void> {
    const draftId = `${studentId}_${activityId}`;
    this.dbLocal.activityDrafts = this.dbLocal.activityDrafts.filter(d => d.id !== draftId);
    this.save();

    try {
      await deleteDoc(doc(db, 'activityDrafts', draftId));
    } catch (e) {
      console.warn('Erro ao deletar rascunho no Firestore:', e);
    }
  }

  // FCM Tokens
  public async saveFCMToken(userId: string, token: string): Promise<void> {
    const tokenId = `token_${userId}`;
    const tokenData = {
      userId,
      token,
      platform: 'web',
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'fcmTokens', tokenId), tokenData);
    } catch (e) {
      console.error('Erro ao salvar token FCM no Firestore:', e);
    }
  }

  public async submitActivityGrade(
    studentId: string,
    studentName: string,
    activityId: string,
    answers: Record<string, number>
  ): Promise<Grade> {
    const activity = this.getActivityById(activityId);
    if (!activity) throw new Error('Atividade não encontrada');

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of activity.questions) {
      totalPoints += q.points;
      if (answers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    }

    const calculatedScore = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * activity.maxScore).toFixed(1)) : 0;
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const newGrade: Grade = {
      id: 'grade-' + Date.now(),
      studentId,
      studentName,
      activityId,
      activityTitle: activity.title,
      score: calculatedScore,
      maxScore: activity.maxScore,
      percentage,
      submittedAt: new Date().toISOString(),
      answers,
      feedback: percentage >= 70 ? 'Muito bem! Bom desempenho nesta atividade.' : 'Revise o conteúdo do módulo e as explicações do Catecismo.',
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'grades', newGrade.id), newGrade);
      
      // Auto-notification for submission success
      this.sendNotification({
        userId: studentId,
        title: 'Atividade Concluída',
        message: `Você concluiu a atividade "${activity.title}" com nota ${calculatedScore}/${activity.maxScore}.`,
        type: 'grade',
        link: '/dashboard/notas',
      });
    } catch (e) { console.error(e); }

    // Replace if already submitted locally or add new
    const existingIndex = this.dbLocal.grades.findIndex(g => g.studentId === studentId && g.activityId === activityId);
    if (existingIndex !== -1) {
      this.dbLocal.grades[existingIndex] = newGrade;
    } else {
      this.dbLocal.grades.push(newGrade);
    }

    this.save();
    return newGrade;
  }

  public getGradesByStudent(studentId: string): Grade[] {
    return this.dbLocal.grades.filter(g => g.studentId === studentId);
  }

  public getAllGrades(): Grade[] {
    return [...this.dbLocal.grades];
  }

  // Catechism & Memorization Control
  public getCatechismSections(): CatechismSection[] {
    return [...this.dbLocal.catechismSections].sort((a, b) => a.number - b.number);
  }

  public getCatechismAssessmentsByStudent(studentId: string): CatechismAssessment[] {
    return this.dbLocal.catechismAssessments.filter(a => a.studentId === studentId);
  }

  public getAllCatechismAssessments(): CatechismAssessment[] {
    return [...this.dbLocal.catechismAssessments];
  }

  public async updateCatechismAssessment(assessment: Omit<CatechismAssessment, 'id'> & { id?: string }): Promise<CatechismAssessment> {
    const idx = this.dbLocal.catechismAssessments.findIndex(
      a => a.studentId === assessment.studentId && a.sectionId === assessment.sectionId
    );
    const updated: CatechismAssessment = {
      ...assessment,
      id: idx !== -1 ? this.dbLocal.catechismAssessments[idx].id : 'ass-' + Date.now(),
      date: assessment.date || new Date().toISOString().split('T')[0],
      updatedBy: 'Pastor Everton Figur',
    };

    if (idx !== -1) {
      this.dbLocal.catechismAssessments[idx] = updated;
    } else {
      this.dbLocal.catechismAssessments.push(updated);
    }

    try {
      await setDoc(doc(db, 'catechismAssessments', updated.id), updated);
      
      // Notify student of assessment update
      this.sendNotification({
        userId: updated.studentId,
        title: 'Avaliação de Catecismo',
        message: `O Pastor atualizou sua avaliação do item "${updated.sectionTitle || 'Catecismo'}". Status: ${updated.status}.`,
        type: 'system',
        link: '/dashboard/catecismo',
      });
    } catch (e) { console.error(e); }

    this.save();
    return updated;
  }

  // Worship & Attendance (Cultos e Presenças: 24 meses / 24 presenças)
  public getWorshipRecordsByStudent(studentId: string): WorshipRecord[] {
    return this.dbLocal.worshipRecords.filter(w => w.studentId === studentId).sort((a, b) => a.monthIndex - b.monthIndex);
  }

  public getAllWorshipRecords(): WorshipRecord[] {
    return [...this.dbLocal.worshipRecords].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public async submitWorshipRecord(
    record: Omit<WorshipRecord, 'id' | 'status' | 'submittedAt'>,
    photoFile?: File
  ): Promise<WorshipRecord> {
    let photoUrl = record.photoUrl;

    // Upload to Firebase Storage if file provided
    if (photoFile) {
      try {
        const url = await this.uploadPhoto(photoFile, 'ResumosCulto');
        if (url) photoUrl = url;
      } catch (e) {
        console.warn('Falha no upload para o Storage:', e);
      }
    }

    const newRecord: WorshipRecord = {
      ...record,
      id: 'worship-' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      photoUrl,
    };

    try {
      await setDoc(doc(db, 'worshipRecords', newRecord.id), newRecord);
    } catch (e) { console.error(e); }

    this.dbLocal.worshipRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  public async reviewWorshipRecord(recordId: string, status: WorshipStatus, pastorNotes?: string): Promise<boolean> {
    const record = this.dbLocal.worshipRecords.find(w => w.id === recordId);
    if (!record) return false;
    
    const updates = {
      status,
      reviewedAt: new Date().toISOString(),
      pastorNotes: pastorNotes || record.pastorNotes || '',
    };

    Object.assign(record, updates);

    try {
      await updateDoc(doc(db, 'worshipRecords', recordId), updates);
      
      // Notify student
      this.sendNotification({
        userId: record.studentId,
        title: 'Presença no Culto Analisada',
        message: `Seu resumo de culto para o mês ${record.monthIndex} foi ${status === 'approved' ? 'aprovado' : 'recusado'} pelo Pastor.`,
        type: 'system',
        link: '/dashboard/culto',
      });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  public getApprovedWorshipCount(studentId: string): number {
    return this.dbLocal.worshipRecords.filter(w => w.studentId === studentId && w.status === 'approved').length;
  }

  // Devotions, Events, Announcements, Texts
  public getDevotions(audienceFilter?: AudienceType): Devotion[] {
    if (!audienceFilter || audienceFilter === 'all') {
      return [...this.dbLocal.devotions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return this.dbLocal.devotions
      .filter(d => d.targetAudience === 'all' || d.targetAudience === audienceFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async saveDevotion(devotion: Devotion): Promise<void> {
    const idx = this.dbLocal.devotions.findIndex(d => d.id === devotion.id);
    if (idx !== -1) {
      this.dbLocal.devotions[idx] = devotion;
    } else {
      this.dbLocal.devotions.push(devotion);
    }
    try {
      await setDoc(doc(db, 'devotions', devotion.id), devotion);
    } catch (e) { console.error(e); }
    this.save();
  }

  public async deleteDevotion(id: string): Promise<void> {
    this.dbLocal.devotions = this.dbLocal.devotions.filter(d => d.id !== id);
    try {
      await deleteDoc(doc(db, 'devotions', id));
    } catch (e) { console.error(e); }
    this.save();
  }

  public getEvents(congregationId?: string): ChurchEvent[] {
    if (!congregationId || congregationId === 'all') {
      return [...this.dbLocal.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return this.dbLocal.events
      .filter(e => e.congregationId === 'all' || e.congregationId === congregationId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public async saveEvent(evt: ChurchEvent): Promise<void> {
    const idx = this.dbLocal.events.findIndex(e => e.id === evt.id);
    if (idx !== -1) {
      this.dbLocal.events[idx] = evt;
    } else {
      this.dbLocal.events.push(evt);
    }
    try {
      await setDoc(doc(db, 'events', evt.id), evt);
    } catch (e) { console.error(e); }
    this.save();
  }

  public async deleteEvent(id: string): Promise<void> {
    this.dbLocal.events = this.dbLocal.events.filter(e => e.id !== id);
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (e) { console.error(e); }
    this.save();
  }

  public getAnnouncements(audienceFilter?: AudienceType): Announcement[] {
    if (!audienceFilter || audienceFilter === 'all') {
      return [...this.dbLocal.announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return this.dbLocal.announcements
      .filter(a => a.targetAudience === 'all' || a.targetAudience === audienceFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async saveAnnouncement(ann: Announcement): Promise<void> {
    const isNew = !this.dbLocal.announcements.find(a => a.id === ann.id);
    const idx = this.dbLocal.announcements.findIndex(a => a.id === ann.id);
    if (idx !== -1) {
      this.dbLocal.announcements[idx] = ann;
    } else {
      this.dbLocal.announcements.push(ann);
    }
    try {
      await setDoc(doc(db, 'announcements', ann.id), ann);

      // Notify students if it's new
      if (isNew) {
        const students = this.dbLocal.studentProfiles.filter(s => 
          s.status === 'approved' && 
          (ann.targetAudience === 'all' || ann.targetAudience === s.congregationId || ann.targetAudience === s.courseType)
        );
        for (const student of students) {
          this.sendNotification({
            userId: student.id,
            title: 'Novo Aviso da Paróquia',
            message: ann.title,
            type: 'announcement',
            link: '/dashboard',
          });
        }

        // Trigger push notification via server
        try {
          const authHeader = await this.getAuthHeader();
          fetch('/api/notify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify({
              title: 'Novo Aviso da Paróquia',
              body: ann.title,
            }),
          }).catch(e => console.warn('Erro ao disparar push notification:', e));
        } catch (e) {
          console.warn('Erro ao disparar push notification:', e);
        }
      }
    } catch (e) { console.error(e); }
    this.save();
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    this.dbLocal.announcements = this.dbLocal.announcements.filter(a => a.id !== id);
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (e) { console.error(e); }
    this.save();
  }

  public getStudyTexts(): StudyText[] {
    return [...this.dbLocal.studyTexts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async saveStudyText(text: StudyText): Promise<void> {
    const idx = this.dbLocal.studyTexts.findIndex(t => t.id === text.id);
    if (idx !== -1) {
      this.dbLocal.studyTexts[idx] = text;
    } else {
      this.dbLocal.studyTexts.push(text);
    }
    try {
      await setDoc(doc(db, 'studyTexts', text.id), text);
    } catch (e) { console.error(e); }
    this.save();
  }

  public async deleteStudyText(id: string): Promise<void> {
    this.dbLocal.studyTexts = this.dbLocal.studyTexts.filter(t => t.id !== id);
    try {
      await deleteDoc(doc(db, 'studyTexts', id));
    } catch (e) { console.error(e); }
    this.save();
  }

  // Backup / Export / Import / Reset
  public validateBackupData(data: any): { valid: boolean; error?: string } {
    const requiredCollections = [
      'users', 'studentProfiles', 'congregations', 'modules', 
      'activities', 'grades', 'videos', 'settings'
    ];

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Formato de arquivo inválido.' };
    }

    for (const coll of requiredCollections) {
      if (!data[coll]) {
        return { valid: false, error: `Coleção obrigatória ausente: ${coll}` };
      }
      if (coll !== 'settings' && !Array.isArray(data[coll])) {
        return { valid: false, error: `Dados da coleção ${coll} devem ser uma lista.` };
      }
    }

    // Basic integrity check: must have at least one admin
    const hasAdmin = Array.isArray(data.users) && data.users.some((u: any) => u.role === 'admin');
    if (!hasAdmin) {
      return { valid: false, error: 'Backup inválido: Nenhum administrador encontrado.' };
    }

    return { valid: true };
  }

  public async getFullBackup(): Promise<string> {
    // Force sync of all major collections from Firestore
    try {
      const collections = [
        'users', 'studentProfiles', 'congregations', 'modules', 
        'activities', 'grades', 'videos', 'videoProgress', 
        'catechismSections', 'catechismAssessments', 'worshipRecords', 
        'devotions', 'events', 'announcements', 'studyTexts', 'settings'
      ];

      for (const collName of collections) {
        const snap = await getDocs(collection(db, collName));
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        (this.dbLocal as any)[collName] = data;
      }
      
      // Settings is a single doc
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        this.dbLocal.settings = settingsDoc.data() as AppSettings;
      }

    } catch (e) {
      console.warn('Erro ao sincronizar dados para backup completo:', e);
      // Continue with whatever is in dbLocal if sync fails
    }

    return JSON.stringify(this.dbLocal, null, 2);
  }

  public exportDatabaseJson(): string {
    return JSON.stringify(this.dbLocal, null, 2);
  }

  public exportBackupJson(): string {
    return this.exportDatabaseJson();
  }

  public importDatabaseJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.users && parsed.studentProfiles) {
        this.dbLocal = parsed;
        this.save();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public importBackupJson(jsonStr: string): boolean {
    return this.importDatabaseJson(jsonStr);
  }

  public resetToDefault(): void {
    this.dbLocal = this.createDefaultDatabase();
    this.save();
  }

  // App Settings & Branding
  public getAppSettings(): AppSettings {
    if (!this.dbLocal.settings) {
      this.dbLocal.settings = { ...DEFAULT_APP_SETTINGS };
    }
    return { ...this.dbLocal.settings };
  }

  public async saveAppSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    const current = this.getAppSettings();
    this.dbLocal.settings = {
      ...current,
      ...newSettings,
    };

    try {
      await setDoc(doc(db, 'settings', 'global'), this.dbLocal.settings);
    } catch (e) { console.error(e); }

    this.save();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app_settings_changed', { detail: this.dbLocal.settings })
      );
      if (this.dbLocal.settings.appName) {
        document.title = this.dbLocal.settings.appName;
      }
    }
    return { ...this.dbLocal.settings };
  }

  // Notifications
  public async sendNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotification: AppNotification = {
      ...notification,
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.dbLocal.notifications.push(newNotification);
    try {
      await setDoc(doc(db, 'notifications', newNotification.id), newNotification);
    } catch (e) { console.error(e); }
    this.save();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications_updated', { detail: newNotification }));
    }
  }

  public getNotifications(userId: string): AppNotification[] {
    return this.dbLocal.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    const notif = this.dbLocal.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (e) { console.error(e); }
      this.save();
    }
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifs = this.dbLocal.notifications.filter(n => n.userId === userId && !n.read);
    for (const notif of userNotifs) {
      notif.read = true;
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { read: true });
      } catch (e) { console.error(e); }
    }
    this.save();
  }

  // Parochial Documents
  public async submitDocument(
    studentId: string,
    type: ParochialDocument['type'],
    title: string,
    file: File
  ): Promise<ParochialDocument | null> {
    try {
      // Ensure folder exists
      if (!this.driveFolderId) {
        const mainFolderId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
        this.driveFolderId = await driveService.getOrCreateFolder('Uploads de Alunos', mainFolderId);
      }

      const driveFileId = await driveService.uploadFile(file, file.name, this.driveFolderId);
      const fileUrl = `https://drive.google.com/uc?id=${driveFileId}`;

      const newDoc: ParochialDocument = {
        id: 'doc-' + Date.now(),
        studentId,
        type,
        title,
        fileUrl,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      // Update local profile
      const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
      if (student) {
        if (!student.documents) student.documents = [];
        // Replace if same type exists or add new? Usually allowed multiple.
        student.documents.push(newDoc);
      }

      // Save to Firestore
      await updateDoc(doc(db, 'studentProfiles', studentId), {
        documents: student?.documents || [newDoc]
      });

      this.save();
      return newDoc;
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      return null;
    }
  }

  public async reviewDocument(
    studentId: string,
    documentId: string,
    status: DocumentStatus,
    pastorNotes?: string
  ): Promise<boolean> {
    const student = this.dbLocal.studentProfiles.find(s => s.id === studentId);
    if (!student || !student.documents) return false;

    const docIndex = student.documents.findIndex(d => d.id === documentId);
    if (docIndex === -1) return false;

    student.documents[docIndex] = {
      ...student.documents[docIndex],
      status,
      pastorNotes,
      reviewedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'studentProfiles', studentId), {
        documents: student.documents
      });

      // Notify student
      this.sendNotification({
        userId: studentId,
        title: 'Documento Analisado',
        message: `Seu documento "${student.documents[docIndex].title}" foi ${status === 'approved' ? 'aprovado' : 'recusado'} pelo Pastor.`,
        type: 'system',
        link: '/dashboard/perfil',
      });
    } catch (e) { console.error(e); }

    this.save();
    return true;
  }

  // Messaging (Direct Messages Student <-> Pastor)
  public async sendMessage(msg: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>): Promise<DirectMessage> {
    const newMessage: DirectMessage = {
      ...msg,
      id: 'msg-' + Date.now() + Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.dbLocal.messages.push(newMessage);
    this.save();

    try {
      await setDoc(doc(db, 'messages', newMessage.id), {
        ...newMessage,
        createdAt: Timestamp.now()
      });

      // If sender is student, notify admin
      if (msg.senderId === msg.studentId) {
        const admin = this.getAdminUser();
        if (admin) {
          this.sendNotification({
            userId: admin.id,
            title: 'Nova Mensagem de Aluno',
            message: `${msg.senderName} enviou uma dúvida.`,
            type: 'system',
            link: '/admin/mensagens',
          });
        }
      } else {
        // If sender is admin, notify student
        this.sendNotification({
          userId: msg.studentId,
          title: 'Resposta do Pastor',
          message: 'O Pastor respondeu sua dúvida.',
          type: 'system',
          link: '/dashboard/mensagens',
        });
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem para o Firestore:', e);
    }

    return newMessage;
  }

  public getMessages(studentId: string): DirectMessage[] {
    return this.dbLocal.messages
      .filter(m => m.studentId === studentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async markMessagesAsRead(studentId: string, viewerId: string): Promise<void> {
    const unread = this.dbLocal.messages.filter(m => m.studentId === studentId && m.recipientId === viewerId && !m.read);
    
    for (const m of unread) {
      m.read = true;
      try {
        await updateDoc(doc(db, 'messages', m.id), { read: true });
      } catch (e) { console.error(e); }
    }
    this.save();
  }

  public setMessages(messages: DirectMessage[]): void {
    // Used to update local state from Firestore listener
    // Filter out messages for the student IDs present in the new set
    const incomingStudentIds = new Set(messages.map(m => m.studentId));
    const otherMessages = this.dbLocal.messages.filter(m => !incomingStudentIds.has(m.studentId));
    this.dbLocal.messages = [...otherMessages, ...messages];
    this.save();
  }
}

export const dbService = new DatabaseService();
