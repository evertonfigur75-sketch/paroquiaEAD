import React, { useState, useRef } from 'react';
import { dbService } from '../../services/db';
import { ParochialDocument } from '../../types';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  FileUp,
  AlertCircle
} from 'lucide-react';

interface StudentDocumentSectionProps {
  studentId: string;
  documents: ParochialDocument[];
  onDocumentUploaded: () => void;
}

export const StudentDocumentSection: React.FC<StudentDocumentSectionProps> = ({ 
  studentId, 
  documents = [], 
  onDocumentUploaded 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ParochialDocument['type']>('certidao_batismo');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo é muito grande. O limite é de 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    const titleMap: Record<ParochialDocument['type'], string> = {
      'certidao_batismo': 'Certidão de Batismo',
      'documento_identidade': 'Documento de Identidade (RG)',
      'comprovante_residencia': 'Comprovante de Residência',
      'outro': 'Outro Documento'
    };

    try {
      const result = await dbService.submitDocument(
        studentId, 
        selectedType, 
        titleMap[selectedType], 
        file
      );
      if (result) {
        onDocumentUploaded();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError('Falha ao enviar documento. Tente novamente.');
      }
    } catch (err) {
      setError('Erro no processo de upload.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: ParochialDocument['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: ParochialDocument['status']) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Recusado / Reenviar';
      default: return 'Em análise';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-display flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1e3a5f]" />
            Documentos Paroquiais Necessários
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Certidões de batismo e outros documentos solicitados pela paróquia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-300 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
          >
            <option value="certidao_batismo">Certidão de Batismo</option>
            <option value="documento_identidade">RG / Identidade</option>
            <option value="comprovante_residencia">Comp. Residência</option>
            <option value="outro">Outro Documento</option>
          </select>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="py-2 px-4 rounded-xl bg-[#1e3a5f] text-white text-[11px] font-bold hover:bg-[#162a45] transition flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".jpg,.jpeg,.png,.pdf"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[10px] text-red-700 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl space-y-2">
          <FileUp className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-400">Nenhum documento enviado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className={`p-4 rounded-2xl border transition group ${
                doc.status === 'rejected' ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                    <p className="text-[10px] text-slate-500">{doc.fileName} • {doc.fileSize}</p>
                  </div>
                </div>
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
                  title="Visualizar documento"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(doc.status)}
                  <span className={`text-[10px] font-bold ${
                    doc.status === 'approved' ? 'text-emerald-700' : 
                    doc.status === 'rejected' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400">
                  Enviado em {new Date(doc.submittedAt).toLocaleDateString()}
                </span>
              </div>

              {doc.status === 'rejected' && doc.pastorNotes && (
                <div className="mt-2 p-2 rounded-lg bg-white border border-red-100 text-[10px] text-red-600 italic">
                  <strong>Observação:</strong> {doc.pastorNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
