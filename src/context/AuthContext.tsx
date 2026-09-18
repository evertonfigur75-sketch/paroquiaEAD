import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudentProfile, Role } from '../types';
import { dbService } from '../services/db';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, requestNotificationPermission } from '../lib/firebase';
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

interface AuthContextType {
  currentUser: User | StudentProfile | null;
  studentProfile: StudentProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isPending: boolean;
  isRejected: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }) => Promise<{ success: boolean; message?: string; student?: StudentProfile }>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile> & Partial<User>, avatarFile?: File) => Promise<boolean>;
  changePassword: (newPass: string) => Promise<boolean>;
  refreshUser: () => void;
  googleSignIn: () => Promise<{ success: boolean; message?: string }>;
  googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Sync token with window for driveService
    (window as any).googleAccessToken = googleAccessToken;
  }, [googleAccessToken]);

  const refreshUser = useCallback(() => {
    const user = dbService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    dbService.init().then(() => {
      refreshUser();
      setLoading(false);
    });
  }, [refreshUser]);

  // Register FCM Token
  useEffect(() => {
    if (currentUser && currentUser.role === 'student' && (currentUser as StudentProfile).status === 'approved') {
      const setupFCM = async () => {
        try {
          const token = await requestNotificationPermission();
          if (token) {
            await dbService.saveFCMToken(currentUser.id, token);
          }
        } catch (error) {
          console.error('Falha ao configurar FCM:', error);
        }
      };
      setupFCM();
    }
  }, [currentUser]);

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        await dbService.logAuthAttempt(result.user.email || 'unknown', false, 'Falha ao obter token de acesso do Google.');
        throw new Error('Falha ao obter token de acesso do Google.');
      }

      setGoogleAccessToken(token);
      
      // If the user matches an admin email, automatically log them in as admin
      const adminEmail = 'evertonfigur75@gmail.com';
      if (result.user.email === adminEmail) {
        const adminUser = dbService.getAllUsers().find(u => u.role === 'admin');
        if (adminUser) {
          // Ensure admin exists in Firestore 'users' collection for rules to work
          await dbService.ensureAdminInFirestore(result.user.uid, adminUser);
          
          dbService.setCurrentUser(adminUser);
          await dbService.init();
          setCurrentUser(adminUser);
          await dbService.logAuthAttempt(adminEmail, true);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no Google Sign-In:', error);
      await dbService.logAuthAttempt('google_popup_fail', false, error.message);
      return { success: false, message: error.message };
    }
  };

  const login = async (email: string, pass: string) => {
    const user = await dbService.verifyCredentials(email, pass);
    if (!user) {
      await dbService.logAuthAttempt(email, false, 'Credenciais incorretas');
      return { success: false, message: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
    }
    dbService.setCurrentUser(user);
    await dbService.init(); // Refresh data with new user context
    setCurrentUser(user);
    await dbService.logAuthAttempt(email, true);
    return { success: true };
  };

  const register = async (data: Omit<StudentProfile, 'id' | 'createdAt' | 'passwordHash' | 'salt'> & { password: string }) => {
    // Check if email already registered
    const students = dbService.getAllStudents();
    if (students.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Já existe um cadastro com este e-mail.' };
    }

    try {
      const student = await dbService.registerStudent(data);
      // Auto-set session so user sees their pending status screen
      dbService.setCurrentUser(student);
      await dbService.init(); // Re-init to load context
      setCurrentUser(student);
      return { success: true, student };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar cadastro';
      return { success: false, message };
    }
  };

  const logout = () => {
    dbService.setCurrentUser(null);
    setCurrentUser(null);
    setGoogleAccessToken(null);
    auth.signOut();
  };

  const updateProfile = async (updates: Partial<StudentProfile> & Partial<User>, avatarFile?: File) => {
    if (!currentUser) return false;

    let finalUpdates = { ...updates };

    // If an avatar file is provided, upload to Storage
    if (avatarFile) {
      try {
        const folderName = currentUser.role === 'admin' ? 'FotosPastor' : 'FotosAlunos';
        const url = await dbService.uploadPhoto(avatarFile, folderName);
        if (url) {
          finalUpdates.avatarUrl = url;
        }
      } catch (e) {
        console.error('Falha ao subir foto para o Storage:', e);
      }
    }

    if (currentUser.role === 'admin') {
      const updated = await dbService.updateAdminProfile(currentUser.id, finalUpdates as Partial<User>);
      if (updated) {
        setCurrentUser(updated);
        await dbService.logAction('profile_update', { userId: currentUser.id, role: 'admin' });
        return true;
      }
      return false;
    } else {
      const updated = await dbService.updateStudentProfile(currentUser.id, finalUpdates as Partial<StudentProfile>);
      if (updated) {
        setCurrentUser(updated);
        await dbService.logAction('profile_update', { userId: currentUser.id, role: 'student' });
        return true;
      }
      return false;
    }
  };

  const changePassword = async (newPass: string) => {
    if (!currentUser) return false;
    return await dbService.changePassword(currentUser.id, newPass);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';
  const studentProfile = isStudent ? (currentUser as StudentProfile) : null;
  const isPending = isStudent && studentProfile?.status === 'pending';
  const isRejected = isStudent && studentProfile?.status === 'rejected';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        isAuthenticated: !!currentUser,
        isAdmin,
        isStudent,
        isPending,
        isRejected,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        googleSignIn,
        googleAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
