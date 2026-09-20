import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { AppHeader } from './components/layout/AppHeader';
import { StudentBottomNav } from './components/layout/StudentBottomNav';
import { LandingHero } from './components/home/LandingHero';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { PendingApprovalNotice } from './components/student/PendingApprovalNotice';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentCourseView } from './components/student/StudentCourseView';
import { StudentWorshipView } from './components/student/StudentWorshipView';
import { StudentCatechismView } from './components/student/StudentCatechismView';
import { StudentGradesView } from './components/student/StudentGradesView';
import { StudentCommunityView } from './components/student/StudentCommunityView';
import { StudentProfileView } from './components/student/StudentProfileView';
import { StudentActivityModal } from './components/student/StudentActivityModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProfileModal } from './components/admin/AdminProfileModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { NotificationToast } from './components/common/NotificationToast';
import { PushNotificationManager } from './components/common/PushNotificationManager';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Bookmark,
  Award,
  HeartHandshake,
  User,
  LogOut,
  Shield,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { DirectMessaging } from './components/common/DirectMessaging';
import { PublicPortalView } from './components/portal/PublicPortalView';
import { BibleAccessPanel } from './components/bible/BibleAccessPanel';
import { BibleFloatingLauncher } from './components/bible/BibleFloatingLauncher';

const AppContent: React.FC = () => {
  const { currentUser, isAdmin, studentProfile, logout, refreshUser } = useAuth();

  // Auth modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<'admin' | 'student'>('admin');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [isPublicPortalOpen, setIsPublicPortalOpen] = useState(false);

  // Bible panel state
  const [isBibleOpen, setIsBibleOpen] = useState<boolean>(false);
  const [bibleCitation, setBibleCitation] = useState<string>('');

  const handleOpenBible = (citation?: string) => {
    if (citation) {
      setBibleCitation(citation);
    }
    setIsBibleOpen(true);
  };

  // Student navigation
  const [studentTab, setStudentTab] = useState<string>('dashboard');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  // If user is not logged in, render either the Public Portal or the Landing Page
  if (!currentUser) {
    return (
      <>
        {isPublicPortalOpen ? (
          <PublicPortalView
            onBackToLanding={() => setIsPublicPortalOpen(false)}
            onOpenLogin={(role = 'admin') => {
              setLoginRole(role);
              setShowLoginModal(true);
            }}
            onOpenRegister={() => setShowRegisterModal(true)}
            onOpenBible={handleOpenBible}
          />
        ) : (
          <LandingHero
            onOpenLogin={(role = 'admin') => {
              setLoginRole(role);
              setShowLoginModal(true);
            }}
            onOpenRegister={() => setShowRegisterModal(true)}
            onOpenPublicPortal={() => setIsPublicPortalOpen(true)}
            onOpenBible={() => handleOpenBible()}
          />
        )}

        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            initialRole={loginRole}
            onClose={() => setShowLoginModal(false)}
            onOpenRegister={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
            onOpenForgot={() => {
              setShowLoginModal(false);
              setShowForgotModal(true);
            }}
            onOpenForgotPassword={() => {
              setShowLoginModal(false);
              setShowForgotModal(true);
            }}
          />
        )}

        {showRegisterModal && (
          <RegisterModal
            isOpen={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            onOpenLogin={() => {
              setShowRegisterModal(false);
              setLoginRole('student');
              setShowLoginModal(true);
            }}
          />
        )}

        {showForgotModal && (
          <ForgotPasswordModal
            isOpen={showForgotModal}
            onClose={() => setShowForgotModal(false)}
            onOpenLogin={() => {
              setShowForgotModal(false);
              setLoginRole('student');
              setShowLoginModal(true);
            }}
          />
        )}

        <BibleAccessPanel
          isOpen={isBibleOpen}
          onClose={() => setIsBibleOpen(false)}
          initialCitation={bibleCitation}
        />
        <BibleFloatingLauncher
          isOpen={isBibleOpen}
          onOpen={() => handleOpenBible()}
        />

        <NotificationToast />
        <OfflineIndicator />
        <PushNotificationManager />
      </>
    );
  }

  // If logged-in user wants to view the public portal
  if (isPublicPortalOpen) {
    return (
      <>
        <PublicPortalView
          onBackToLanding={() => setIsPublicPortalOpen(false)}
          onOpenBible={handleOpenBible}
        />
        <BibleAccessPanel
          isOpen={isBibleOpen}
          onClose={() => setIsBibleOpen(false)}
          initialCitation={bibleCitation}
        />
        <BibleFloatingLauncher
          isOpen={isBibleOpen}
          onOpen={() => handleOpenBible()}
        />
        <NotificationToast />
        <OfflineIndicator />
      </>
    );
  }

  // If logged in as ADMIN (Pastor Everton Figur)
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex flex-col">
        <AppHeader
          title="Plataforma de Ensino Luterano"
          onOpenProfile={() => setShowAdminProfileModal(true)}
          onOpenPublicPortal={() => setIsPublicPortalOpen(true)}
          onOpenBible={() => handleOpenBible()}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
          <AdminDashboard />
        </main>

        {showAdminProfileModal && (
          <AdminProfileModal
            isOpen={showAdminProfileModal}
            onClose={() => setShowAdminProfileModal(false)}
          />
        )}

        <BibleAccessPanel
          isOpen={isBibleOpen}
          onClose={() => setIsBibleOpen(false)}
          initialCitation={bibleCitation}
        />
        <BibleFloatingLauncher
          isOpen={isBibleOpen}
          onOpen={() => handleOpenBible()}
        />

        <NotificationToast />
        <OfflineIndicator />
        <PushNotificationManager />
      </div>
    );
  }

  // Explicit security guard: If user has role admin but their email is NOT the authorized pastor email
  if (currentUser.role === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Acesso Pastoral Restrito
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            O painel de administração é restrito exclusivamente ao endereço de e-mail oficial do Pastor (<strong>evertonfigur75@gmail.com</strong>).
          </p>
          <button
            onClick={logout}
            className="py-2.5 px-6 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
          >
            Sair e Conectar com E-mail Autorizado
          </button>
        </div>
      </div>
    );
  }

  // If logged in as STUDENT
  // Check if pending approval
  if (studentProfile?.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <AppHeader
          title="Plataforma de Ensino Luterano"
          onOpenProfile={() => {}}
          onOpenBible={() => handleOpenBible()}
        />

        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
          <PendingApprovalNotice />
        </main>

        <BibleAccessPanel
          isOpen={isBibleOpen}
          onClose={() => setIsBibleOpen(false)}
          initialCitation={bibleCitation}
        />
        <BibleFloatingLauncher
          isOpen={isBibleOpen}
          onOpen={() => handleOpenBible()}
        />

        <NotificationToast />
        <OfflineIndicator />
        <PushNotificationManager />
      </div>
    );
  }

  // If student was rejected or inactive
  if (studentProfile?.status === 'rejected' || studentProfile?.status === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Acesso Não Disponível
          </h2>
          <p className="text-xs text-slate-600">
            {studentProfile.status === 'rejected'
              ? 'Sua solicitação de inscrição na paróquia foi analisada e não pôde ser aprovada no momento.'
              : 'Sua matrícula encontra-se temporariamente inativa nos registros paroquiais.'}
          </p>
          <button
            onClick={logout}
            className="py-2.5 px-6 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  // Student APPROVED portal
  const isConfirmatorio = studentProfile?.courseType === 'confirmatorio';

  const studentNavItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'curso', label: 'Aulas e Módulos', icon: BookOpen },
    ...(isConfirmatorio ? [{ id: 'cultos', label: '24 Cultos', icon: CalendarCheck }] : []),
    { id: 'catecismo', label: 'Catecismo', icon: Bookmark },
    { id: 'biblia', label: 'Bíblia Sagrada', icon: BookOpen },
    { id: 'notas', label: 'Boletim', icon: Award },
    { id: 'comunidade', label: 'Devoções e Avisos', icon: HeartHandshake },
    { id: 'mensagens', label: 'Dúvidas ao Pastor', icon: MessageSquare },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      <AppHeader
        title="Plataforma de Ensino Luterano"
        onOpenProfile={() => setStudentTab('perfil')}
        onOpenPublicPortal={() => setIsPublicPortalOpen(true)}
        onOpenBible={() => handleOpenBible()}
      />

      {/* Desktop Secondary Navigation Sub-bar */}
      <nav className="hidden sm:block bg-white border-b border-slate-200/80 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = studentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'biblia') {
                    handleOpenBible();
                  } else {
                    setStudentTab(item.id);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24 sm:pb-8">
        {studentTab === 'dashboard' && (
          <StudentDashboard
            onNavigate={(tab) => setStudentTab(tab)}
            onOpenActivity={(id) => setActiveActivityId(id)}
          />
        )}

        {studentTab === 'curso' && (
          <StudentCourseView onOpenActivity={(id) => setActiveActivityId(id)} />
        )}

        {studentTab === 'cultos' && isConfirmatorio && <StudentWorshipView />}

        {studentTab === 'cultos' && !isConfirmatorio && (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-sm my-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">
              Módulo Exclusivo do Ensino Confirmatório
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O acompanhamento dos 24 cultos obrigatórios aplica-se exclusivamente aos jovens do <strong>Ensino Confirmatório (24 meses)</strong>.
              Como participante do curso de <strong>Profissão de Fé</strong>, sua formação consiste nos módulos bíblicos, questionários e no Catecismo Menor.
            </p>
            <button
              onClick={() => setStudentTab('curso')}
              className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#162a45] transition cursor-pointer"
            >
              Ir para Aulas e Módulos
            </button>
          </div>
        )}

        {studentTab === 'catecismo' && <StudentCatechismView />}

        {studentTab === 'notas' && (
          <StudentGradesView onOpenActivity={(id) => setActiveActivityId(id)} />
        )}

        {studentTab === 'comunidade' && <StudentCommunityView />}

        {studentTab === 'mensagens' && studentProfile && (
          <div className="max-w-2xl mx-auto">
            <DirectMessaging 
              currentUser={studentProfile}
              studentId={studentProfile.id}
              recipientId="admin-pastor-everton"
              title="Canal Direto com o Pastor"
            />
          </div>
        )}

        {studentTab === 'perfil' && <StudentProfileView />}

        {studentTab === 'mais' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-display">
              Recursos e Ajustes
            </h3>
            <div className="rounded-3xl bg-white border border-slate-200 p-2 shadow-sm space-y-1">
              <button
                onClick={() => setStudentTab('notas')}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Boletim de Notas e Avaliações</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setStudentTab('comunidade')}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Devoções, Eventos e Avisos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setStudentTab('mensagens')}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span>Enviar Dúvida ao Pastor</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenBible()}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Bíblia Sagrada & Consulta de Citações</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setStudentTab('perfil')}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>Dados Pessoais e Alterar Senha</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={logout}
                className="w-full p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center justify-center gap-2 border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Minha Conta</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Activity Quiz Modal */}
      {activeActivityId && (
        <StudentActivityModal
          activityId={activeActivityId}
          onClose={() => setActiveActivityId(null)}
          onCompleted={() => {
            refreshUser();
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <StudentBottomNav
        currentTab={studentTab}
        isConfirmatorio={isConfirmatorio}
        onSelectTab={(tab) => setStudentTab(tab)}
      />

      <BibleAccessPanel
        isOpen={isBibleOpen}
        onClose={() => setIsBibleOpen(false)}
        initialCitation={bibleCitation}
      />
      <BibleFloatingLauncher
        isOpen={isBibleOpen}
        onOpen={() => handleOpenBible()}
      />

      <NotificationToast />
      <OfflineIndicator />
      <PushNotificationManager />
    </div>
  );
};

export default function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppSettingsProvider>
  );
}
