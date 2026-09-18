import React, { useState, useEffect, useCallback } from 'react';
import { driveService } from '../../services/drive';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderOpen, 
  File, 
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
  MoreVertical,
  Download
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

export const AdminFileManager: React.FC = () => {
  const { googleAccessToken, googleSignIn } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);

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
      
      // Update breadcrumbs
      const newBreadcrumbs = [...breadcrumbs];
      const existingIdx = newBreadcrumbs.findIndex(b => b.id === folderId);
      if (existingIdx !== -1) {
        setBreadcrumbs(newBreadcrumbs.slice(0, existingIdx + 1));
      } else {
        setBreadcrumbs([...newBreadcrumbs, { id: folderId, name: folderName }]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar pasta: ' + err.message);
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
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}" do Google Drive?`)) return;
    
    setLoading(true);
    try {
      await driveService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setLoading(false);
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

  if (!googleAccessToken) {
    return (
      <div className="p-8 text-center space-y-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <HardDrive className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 font-display">Sincronização com Google Drive</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Para gerenciar os arquivos da paróquia no Google Drive, você precisa autenticar sua conta Google.
          </p>
        </div>
        <button
          onClick={googleSignIn}
          className="px-6 py-3 rounded-2xl bg-[#1e3a5f] text-white font-bold hover:bg-[#162a45] transition shadow-md flex items-center gap-2 mx-auto cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          Conectar ao Google Drive
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-500" />
            Gerenciador de Arquivos (Drive)
          </h2>
          <p className="text-sm text-slate-500">
            Visualize e organize materiais didáticos armazenados na conta Google.
          </p>
        </div>
        <button
          onClick={() => currentFolderId && fetchFolderContent(currentFolderId, breadcrumbs[breadcrumbs.length-1].name)}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
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
              className={`${idx === breadcrumbs.length - 1 ? 'text-[#1e3a5f]' : 'text-slate-500 hover:text-slate-700'}`}
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

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-bold">Informação importante:</p>
          <p>
            Arquivos excluídos aqui serão movidos para a lixeira do seu Google Drive. 
            Arquivos carregados via "Atividades" serão organizados automaticamente nas pastas correspondentes.
          </p>
        </div>
      </div>
    </div>
  );
};
