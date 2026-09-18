import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { DirectMessage, User, StudentProfile } from '../../types';
import { dbService } from '../../services/db';
import { 
  Send, 
  User as UserIcon, 
  MessageSquare, 
  Clock, 
  CheckCheck,
  ChevronLeft,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DirectMessagingProps {
  currentUser: User | StudentProfile;
  studentId: string; // The "room" ID
  recipientId: string; // The other person
  onBack?: () => void;
  title?: string;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({
  currentUser,
  studentId,
  recipientId,
  onBack,
  title
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
        } as DirectMessage;
      });
      setMessages(msgs);
      setLoading(false);
      
      // Update local storage dbService as well for consistency
      dbService.setMessages(msgs);

      // Mark incoming messages as read
      const unreadIncoming = msgs.filter(m => m.recipientId === currentUser.id && !m.read);
      if (unreadIncoming.length > 0) {
        unreadIncoming.forEach(async (m) => {
          try {
            await updateDoc(doc(db, 'messages', m.id), { read: true });
          } catch (e) { console.error(e); }
        });
      }
    });

    return () => unsubscribe();
  }, [studentId, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage('');

    await dbService.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId,
      studentId,
      text,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition lg:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-display">
              {title || (currentUser.role === 'admin' ? 'Conversa com Aluno' : 'Dúvidas ao Pastor')}
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Tempo Real
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-slate-50/30"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Carregando...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-8 opacity-40">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                Nenhuma mensagem
              </p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Envie sua primeira dúvida sobre o conteúdo para iniciar a conversa com o Pastor.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div 
                key={m.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative
                  ${isMe ? 'bg-[#1e3a5f] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'}
                `}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className={`
                    mt-1.5 flex items-center gap-1.5 justify-end
                    ${isMe ? 'text-blue-200' : 'text-slate-400'}
                  `}>
                    <span className="text-[9px] font-medium opacity-80">
                      {formatTime(m.createdAt)}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3 h-3 ${m.read ? 'text-sky-300' : 'opacity-40'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-4 border-t border-slate-100 bg-white"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#1e3a5f]/20 transition"
          />
          <button
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center hover:bg-[#162a45] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 text-center">
          O Pastor receberá uma notificação em tempo real da sua mensagem.
        </p>
      </form>
    </div>
  );
};
