import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  limit
} from 'firebase/firestore';
import { DirectMessage, StudentProfile } from '../../types';
import { dbService } from '../../services/db';
import { DirectMessaging } from '../common/DirectMessaging';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Circle, 
  User as UserIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminMessagingView: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMessages, setAllMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all approved students
    const allStudents = dbService.getAllStudents().filter(s => s.status === 'approved');
    setStudents(allStudents);

    // Listen to ALL messages to show unread badges
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      } as DirectMessage));
      setAllMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUnreadCount = (studentId: string) => {
    return allMessages.filter(m => m.studentId === studentId && m.recipientId === currentUser?.id && !m.read).length;
  };

  const getLastMessage = (studentId: string) => {
    return allMessages.find(m => m.studentId === studentId);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.congregationName && s.congregationName.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const lastA = getLastMessage(a.id)?.createdAt || '';
    const lastB = getLastMessage(b.id)?.createdAt || '';
    return new Date(lastB).getTime() - new Date(lastA).getTime();
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Student List Sidebar */}
      <div className={`lg:col-span-4 space-y-4 ${selectedStudentId ? 'hidden lg:block' : 'block'}`}>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
              <Users className="w-4 h-4 text-[#1e3a5f]" />
              Conversas com Alunos
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar aluno ou comunidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border-none text-[11px] focus:ring-2 focus:ring-[#1e3a5f]/20 transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center opacity-40">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Nenhum aluno encontrado
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredStudents.map(student => {
                  const unread = getUnreadCount(student.id);
                  const lastMsg = getLastMessage(student.id);
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full p-4 flex items-center gap-3 transition hover:bg-slate-50 text-left ${
                        isSelected ? 'bg-slate-50 ring-1 ring-inset ring-slate-100' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                            {unread}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold truncate ${unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                            {student.name}
                          </h4>
                          {lastMsg && (
                            <span className="text-[9px] text-slate-400 whitespace-nowrap">
                              {new Date(lastMsg.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {student.congregationName || 'Paróquia'}
                        </p>
                        {lastMsg && (
                          <p className={`text-[10px] truncate mt-0.5 ${unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                            {lastMsg.senderId === currentUser?.id ? 'Você: ' : ''}{lastMsg.text}
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`lg:col-span-8 ${!selectedStudentId ? 'hidden lg:block' : 'block'}`}>
        {selectedStudent ? (
          <DirectMessaging
            currentUser={currentUser!}
            studentId={selectedStudent.id}
            recipientId={selectedStudent.id}
            onBack={() => setSelectedStudentId(null)}
            title={`Conversa com ${selectedStudent.name}`}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Selecione um aluno para conversar
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aqui você poderá sanar as dúvidas enviadas pelos alunos sobre o conteúdo do curso de forma direta e em tempo real.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
