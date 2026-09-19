import React, { useState, useEffect, useCallback } from 'react';
import { driveService } from '../../services/drive';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderOpen, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  HardDrive, 
  AlertCircle, 
  FileText, 
  FileImage, 
  Loader2, 
  ChevronRight, 
  File,
  Copy,
  Check,
  CloudUpload,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
}

const APPS_SCRIPT_CODE = `// ================================================================
// CÓDIGO GOOGLE APPS SCRIPT PARA O GOOGLE DRIVE DA PARÓQUIA
// Cole este código em: https://script.google.com
// Salva fotos de cultos e arquivos automaticamente no seu Google Drive!
// ================================================================

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderName = data.folder || "ResumosCulto";
    var filename = data.filename || ("culto_" + new Date().getTime() + ".jpg");
    var mimeType = data.mimeType || "image/jpeg";
    var base64Data = data.base64;
    
    // Procura ou cria a pasta raiz no seu Google Drive
    var rootFolders = DriveApp.getFoldersByName("Plataforma de Ensino Luterano");
    var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder("Plataforma de Ensino Luterano");
    
    // Procura ou cria a subpasta (ex: ResumosCulto)
    var subFolders = rootFolder.getFoldersByName(folderName);
    var targetFolder = subFolders.hasNext() ? subFolders.next() : rootFolder.createFolder(folderName);
    
    // Decodifica a imagem/arquivo em base64 e salva no Drive
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, filename);
    var file = targetFolder.createFile(blob);
    
    // Configura permissão para visualização pública da imagem na paróquia
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Gera o link direto de visualização
    var fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: file.getId(),
      url: fileUrl,
      name: filename
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const AdminFileManager: React.FC = () => {
  const { googleAccessToken, googleSignIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'browser' | 'webhook'>('browser');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

  // Webhook configuration state
  const appSettings = dbService.getAppSettings();
  const [webhookUrl, setWebhookUrl] = useState(appSettings?.googleDriveWebhookUrl || '');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  const fetchRootFolder = useCallback(async () => {
    if (!googleAccessToken) return;
    setLoading(true);
    setError(null);
    try {
      const rootId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
      setCurrentFolderId(rootId);
      setBreadcrumbs([{ id: rootId, name: 'Raiz' }]);
      const folderFiles = await driveService.listFiles(rootId);
      setFiles(folderFiles);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao acessar o Google Drive: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [googleAccessToken]);

  const fetchFolderContent = async (folderId: string, folderName: string) => {
    setLoading(true);
    setError(null);
    try {
      const folderFiles = await driveService.listFiles(folderId);
      setFiles(folderFiles);
      setCurrentFolderId(folderId);
      
      const newBreadcrumbs = [...breadcrumbs];
      const existingIdx = newBreadcrumbs.findIndex(b => b.id === folderId);
      if (existingIdx !== -1) {
        setBreadcrumbs(newBreadcrumbs.slice(0, existingIdx + 1));
      } else {
        setBreadcrumbs([...newBreadcrumbs, { id: folderId, name: folderName }]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao abrir pasta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      fetchRootFolder();
    }
  }, [googleAccessToken, fetchRootFolder]);

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Deseja realmente mover "${fileName}" para a lixeira do Google Drive?`)) {
      return;
    }
    try {
      await driveService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir arquivo: ' + err.message);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return <FolderOpen className="w-5 h-5 text-amber-500" />;
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const b = parseInt(bytes);
    if (b > 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
    return Math.round(b / 1024) + ' KB';
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    setSavedSuccess(false);
    try {
      await dbService.saveAppSettings({
        googleDriveWebhookUrl: webhookUrl.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Erro ao salvar URL: ' + err.message);
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('Por favor, cole a URL do Webhook primeiro.');
      return;
    }
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEcQHsI8tQ4AAAAABJRU5ErkJggg==';
      const payload = {
        filename: 'teste-conexao-paroquia.png',
        mimeType: 'image/png',
        folder: 'Testes',
        base64: dummyBase64,
      };

      const res = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' || data.url) {
        setTestResult({
          success: true,
          message: 'Conexão perfeita! O arquivo de teste foi salvo no seu Google Drive com sucesso.',
          url: data.url,
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'O script respondeu com erro.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Falha ao conectar: ' + err.message + '. Verifique se a implantação está acessível para "Qualquer pessoa" (Anyone).',
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'browser'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Navegador de Arquivos (Drive)
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'webhook'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CloudUpload className="w-4 h-4 text-amber-400" />
            Configurar Google Drive (Sem Cartão / 100% Grátis)
            {webhookUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Configurado"></span>
            )}
          </button>
        </div>

        {webhookUrl && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Google Drive Ativo para Uploads
          </div>
        )}
      </div>

      {activeTab === 'webhook' ? (
        /* Webhook Setup Tab */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Como Salvar Todos os Arquivos no seu Google Drive (Sem Cartão e Sem Pagar Nada)
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Através do <strong>Google Apps Script</strong> (ferramenta gratuita e oficial da Google), fotos de cultos e comprovantes enviados pelos confirmandos são gravados diretamente na sua conta Google (15 GB grátis), organizados na pasta <em>Plataforma de Ensino Luterano</em>.
                </p>
              </div>
            </div>

            {/* Passo a Passo Ilustrado */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs">1</div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Acesse o Apps Script</h4>
                <p className="text-xs text-slate-600">
                  Abra <a href="https://script.google.com/home" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">script.google.com</a> no seu navegador logado na sua conta Google.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs">2</div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Cole o Script</h4>
                <p className="text-xs text-slate-600">
                  Clique em <strong>"Novo projeto"</strong>, apague o código que estiver lá e cole o código pronto abaixo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs">3</div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Implantar como Web App</h4>
                <p className="text-xs text-slate-600">
                  Clique no botão azul <strong>"Implantar" ➔ "Nova implantação"</strong>. Em tipo, selecione <strong>"App da Web"</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs">4</div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Permissão e Copiar URL</h4>
                <p className="text-xs text-slate-600">
                  Em <em>"Quem tem acesso"</em> selecione <strong>Qualquer pessoa (Anyone)</strong>. Conclua e copie a URL gerada!
                </p>
              </div>
            </div>

            {/* Código com botão de copiar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Código Pronto do Google Apps Script</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Código Copiado!' : 'Copiar Código'}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                {APPS_SCRIPT_CODE}
              </pre>
            </div>

            {/* Campo para colar a URL */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                URL do seu Webhook do Google Apps Script
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveWebhook}
                  disabled={savingWebhook}
                  className="px-6 py-3 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#162a45] transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {savingWebhook ? 'Salvando...' : 'Salvar URL'}
                </button>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !webhookUrl.trim()}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-sm font-bold transition disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {testingWebhook ? 'Testando...' : 'Testar Envio'}
                </button>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  URL salva com sucesso! O sistema usará seu Google Drive para os uploads.
                </div>
              )}

              {testResult && (
                <div className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testResult.success ? (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{testResult.message}</p>
                    {testResult.url && (
                      <a href={testResult.url} target="_blank" rel="noreferrer" className="text-blue-600 underline block font-semibold">
                        Ver arquivo salvo no seu Google Drive ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Browser Tab */
        <>
          {!googleAccessToken ? (
            <div className="p-8 text-center space-y-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <HardDrive className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 font-display">Navegação ao Vivo no Google Drive</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Para visualizar, renomear ou excluir as pastas do Google Drive diretamente por aqui, conecte sua conta Google.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={googleSignIn}
                  className="px-6 py-3 rounded-2xl bg-[#1e3a5f] text-white font-bold hover:bg-[#162a45] transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Conectar ao Google Drive
                </button>
                <button
                  onClick={() => setActiveTab('webhook')}
                  className="px-6 py-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 transition flex items-center gap-2 cursor-pointer"
                >
                  <CloudUpload className="w-4 h-4 text-amber-600" />
                  Usar Webhook 100% Gratuito (Sem Cartão)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
                    <FolderOpen className="w-6 h-6 text-amber-500" />
                    Gerenciador de Arquivos (Drive)
                  </h2>
                  <p className="text-sm text-slate-500">
                    Visualize e organize materiais didáticos armazenados na sua conta Google.
                  </p>
                </div>
                <button
                  onClick={() => currentFolderId && fetchFolderContent(currentFolderId, breadcrumbs[breadcrumbs.length-1].name)}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Atualizar lista"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                </button>
              </div>

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs font-bold">
                {breadcrumbs.map((b, idx) => (
                  <React.Fragment key={b.id}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                    <button
                      onClick={() => fetchFolderContent(b.id, b.name)}
                      className={`${idx === breadcrumbs.length - 1 ? 'text-[#1e3a5f]' : 'text-slate-500 hover:text-slate-700'} cursor-pointer`}
                    >
                      {b.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>

              {/* Search and Stats */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar nos arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#1e3a5f] outline-hidden text-sm bg-white shadow-xs"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {filteredFiles.length} item(ns) nesta pasta
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* File List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-700">Nome</th>
                        <th className="px-6 py-4 font-bold text-slate-700 hidden sm:table-cell">Tamanho</th>
                        <th className="px-6 py-4 font-bold text-slate-700 hidden md:table-cell">Modificado</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50 transition group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                <button 
                                  onClick={() => fetchFolderContent(file.id, file.name)}
                                  className="flex items-center gap-3 font-bold text-slate-800 hover:text-[#1e3a5f] transition cursor-pointer"
                                >
                                  {getFileIcon(file.mimeType)}
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 text-slate-600">
                                  {getFileIcon(file.mimeType)}
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
                            {file.mimeType === 'application/vnd.google-apps.folder' ? '--' : formatSize(file.size)}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 hidden md:table-cell">
                            {file.createdTime ? new Date(file.createdTime).toLocaleDateString('pt-BR') : '--'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                  title="Abrir no Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDelete(file.id, file.name)}
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Excluir do Drive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredFiles.length === 0 && !loading && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                            {searchTerm ? 'Nenhum arquivo encontrado para esta busca.' : 'Esta pasta está vazia.'}
                          </td>
                        </tr>
                      )}

                      {loading && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <Loader2 className="w-8 h-8 text-[#1e3a5f] animate-spin mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
