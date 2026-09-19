import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  KeyRound,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  checkFirestoreAdminStatus,
  provisionFirstAdminInFirestore,
  DEFAULT_ADMIN_CONFIG,
  FirestoreAdminCheckResult,
} from '../../services/firestoreAdminHelper';
import { PASTOR_PRIMARY_EMAIL } from '../../lib/adminAuth';

interface FirestoreAdminSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirestoreAdminSetupModal: React.FC<FirestoreAdminSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingProvision, setLoadingProvision] = useState(false);
  const [statusResult, setStatusResult] = useState<FirestoreAdminCheckResult | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sampleJson = JSON.stringify(
    {
      ...DEFAULT_ADMIN_CONFIG,
      createdAt: 'TIMESTAMP_FIREBASE',
      updatedAt: 'TIMESTAMP_FIREBASE',
    },
    null,
    2
  );

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Acesso irrestrito exclusivo do Pastor Everton Figur
    match /{document=**} {
      allow read, write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        request.auth.token.email == '${PASTOR_PRIMARY_EMAIL}'
      );
    }
  }
}`;

  const checkStatus = async () => {
    setLoadingCheck(true);
    setFeedback(null);
    try {
      const result = await checkFirestoreAdminStatus();
      setStatusResult(result);
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Falha ao checar status.' });
    } finally {
      setLoadingCheck(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleProvision = async () => {
    setLoadingProvision(true);
    setFeedback(null);
    try {
      const result = await provisionFirstAdminInFirestore();
      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        await checkStatus();
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Erro inesperado.' });
    } finally {
      setLoadingProvision(false);
    }
  };

  const copyToClipboard = (text: string, type: 'json' | 'rules') => {
    navigator.clipboard.writeText(text);
    if (type === 'json') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Guia de Configuração: Primeiro Administrador
              </h2>
              <p className="text-xs text-slate-300">
                Vinculação pastoral e privilégios no Google Firebase Firestore
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-sm">
          {/* Status Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-600" />
                Status no Cloud Firestore
              </span>
              <button
                type="button"
                onClick={checkStatus}
                disabled={loadingCheck}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCheck ? 'animate-spin' : ''}`} />
                Atualizar Checagem
              </button>
            </div>

            {loadingCheck ? (
              <div className="py-4 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                Consultando coleção "users" no Firestore...
              </div>
            ) : statusResult ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  {statusResult.existsInFirestore ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-xs font-bold ${statusResult.existsInFirestore ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {statusResult.existsInFirestore
                        ? 'Administrador ativo no Firestore'
                        : 'Administrador ainda não gravado no Firestore'}
                    </p>
                    <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">
                      {statusResult.message}
                    </p>
                    {statusResult.docId && (
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Doc ID: <span className="font-semibold text-slate-700">{statusResult.docId}</span> • E-mail: <span className="font-semibold text-slate-700">{statusResult.adminEmail}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quick Provision Button */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Provisionamento Automático em 1 Clique
                </p>
                <p className="text-[11px] text-slate-500">
                  Cria o registro oficial de {PASTOR_PRIMARY_EMAIL} na coleção <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">users</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProvision}
                disabled={loadingProvision}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingProvision ? 'Gravando no Firestore...' : 'Gravar / Sincronizar Admin Agora'}</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Step-by-Step Tutorial */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Como configurar manualmente no Console do Firebase
            </h3>

            {/* Step 1 */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">1</span>
                  Liberar o domínio no Firebase Authentication
                </h4>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                >
                  Abrir Console Firebase
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                No menu <strong>Authentication</strong> &gt; aba <strong>Settings</strong> &gt; <strong>Authorized domains</strong>, adicione:
                <code className="block mt-1 p-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 select-all">
                  catecismoead.kinghost.net
                </code>
              </p>
            </div>

            {/* Step 2 */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">2</span>
                  Criar o documento na coleção "users"
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sampleJson, 'json')}
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedJson ? 'Copiado!' : 'Copiar JSON'}
                </button>
              </div>
              <div className="pl-7 space-y-1.5 text-xs text-slate-600">
                <p>No <strong>Firestore Database</strong>, clique em <strong>Iniciar coleção</strong>:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[12px]">
                  <li>ID da Coleção: <strong className="font-mono text-slate-900">users</strong></li>
                  <li>ID do Documento: <strong className="font-mono text-slate-900">admin-pastor-everton</strong></li>
                </ul>
                <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                  <pre>{sampleJson}</pre>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">3</span>
                  Garantia de Regras de Segurança (firestore.rules)
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(firestoreRulesSnippet, 'rules')}
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                >
                  {copiedRules ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedRules ? 'Copiado!' : 'Copiar Regras'}
                </button>
              </div>
              <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                As regras do projeto já protegem o painel, autorizando leituras e gravações apenas para o e-mail oficial do Pastor:
              </p>
              <div className="pl-7">
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto">
                  <pre>{firestoreRulesSnippet}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Permissão restrita a: <strong className="text-slate-800">{PASTOR_PRIMARY_EMAIL}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
