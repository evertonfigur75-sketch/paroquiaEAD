import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  FileText,
  Church,
  CheckCircle2,
  CalendarCheck,
  Award,
  Cloud,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { driveService } from '../../services/drive';
import { useAuth } from '../../context/AuthContext';
import { convertToCSV, downloadCSV } from '../../utils/csvExport';

interface StorageBackup {
  name: string;
  size: string;
  updated: string;
  id: string;
}

export const AdminReportsView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [selectedReport, setSelectedReport] = useState<'alunos' | 'cultos' | 'notas' | 'backup'>('alunos');
  const [backupJson, setBackupJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [storageBackups, setStorageBackups] = useState<StorageBackup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);

  const students = dbService.getAllStudents();
  const worships = dbService.getAllWorshipRecords();
  const grades = dbService.getAllGrades();
  const congregations = dbService.getCongregations();

  const fetchStorageBackups = async () => {
    if (!isAdmin) return;
    setIsLoadingBackups(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch('/api/admin/backups', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStorageBackups(data);
      }
    } catch (err) {
      console.error('Erro ao buscar backups do storage:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (selectedReport === 'backup') {
      fetchStorageBackups();
    }
  }, [selectedReport]);

  const handleDownloadStorageBackup = async (fileName: string) => {
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch(`/api/admin/backups/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Erro ao baixar backup:', err);
      alert('Erro ao gerar link de download.');
    }
  };

  const handleTriggerManualBackup = async () => {
    setIsTriggeringBackup(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch('/api/admin/backups/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        alert('Backup manual iniciado e processado com sucesso!');
        fetchStorageBackups();
      }
    } catch (err) {
      console.error('Erro ao disparar backup:', err);
      alert('Erro ao disparar backup manual.');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const handleExportCSV = () => {
    let data: any[] = [];
    let headers: { key: string; label: string }[] = [];
    let fileName = '';

    if (selectedReport === 'alunos') {
      data = students;
      headers = [
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'courseType', label: 'Curso' },
        { key: 'congregationName', label: 'Congregação' },
        { key: 'phone', label: 'Telefone' },
        { key: 'status', label: 'Status' },
        { key: 'baptism.isBaptized', label: 'Batizado' },
      ];
      fileName = `alunos-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (selectedReport === 'cultos') {
      data = worships.map(w => ({
        ...w,
        studentName: students.find(s => s.id === w.studentId)?.name || w.studentName
      }));
      headers = [
        { key: 'studentName', label: 'Aluno' },
        { key: 'congregationName', label: 'Congregação' },
        { key: 'monthIndex', label: 'Mês' },
        { key: 'worshipDate', label: 'Data do Culto' },
        { key: 'biblicalReading', label: 'Leitura Bíblica' },
        { key: 'status', label: 'Status' },
      ];
      fileName = `frequencia-cultos-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (selectedReport === 'notas') {
      data = grades.map(g => ({
        ...g,
        studentName: students.find(s => s.id === g.studentId)?.name || g.studentName
      }));
      headers = [
        { key: 'studentName', label: 'Aluno' },
        { key: 'activityTitle', label: 'Atividade' },
        { key: 'score', label: 'Nota' },
        { key: 'maxScore', label: 'Máximo' },
        { key: 'percentage', label: 'Porcentagem (%)' },
        { key: 'submittedAt', label: 'Data de Entrega' },
      ];
      fileName = `notas-atividades-${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (data.length > 0) {
      const csv = convertToCSV(data, headers);
      downloadCSV(csv, fileName);
    } else if (selectedReport !== 'backup') {
      alert('Não há dados para exportar neste relatório.');
    }
  };

  const handleExportBackup = () => {
    const data = dbService.exportBackupJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-ensino-luterano-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const success = dbService.importBackupJson(content);
        if (success) {
          setImportStatus('Backup restaurado com sucesso! Recarregando sistema...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus('Arquivo de backup inválido.');
        }
      } catch (err) {
        setImportStatus('Falha ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportToDrive = async () => {
    if (!isAdmin) return;
    setIsBackingUp(true);
    setImportStatus(null);
    try {
      const data = dbService.exportBackupJson();
      const backupData = JSON.parse(data);
      
      const mainFolderId = await driveService.getOrCreateFolder('Plataforma de Ensino Luterano');
      const backupFolderId = await driveService.getOrCreateFolder('Backups Automáticos', mainFolderId);
      
      const fileName = `backup-ensino-luterano-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      await driveService.backupData(backupData, fileName, backupFolderId);
      
      setImportStatus('Backup enviado com sucesso para a pasta "Backups Automáticos" no seu Google Drive!');
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Erro ao enviar para o Drive: ${err.message || 'Verifique sua conexão.'}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 shadow-xl relative overflow-hidden print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-display">
              Relatórios Paroquiais e Backup
            </h2>
            <p className="text-xs text-amber-200">
              Emissão de listas de alunos, ata de confirmação, boletins de notas e cópia de segurança dos dados.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>

            {selectedReport !== 'backup' && (
              <button
                onClick={handleExportCSV}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 border border-white/20"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar (CSV)</span>
              </button>
            )}

            <button
              onClick={handleExportBackup}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Backup (JSON)</span>
            </button>

            <button
              onClick={handleExportToDrive}
              disabled={isBackingUp}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                isBackingUp 
                  ? 'bg-slate-400 cursor-not-allowed text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isBackingUp ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span>{isBackingUp ? 'Enviando...' : 'Backup para Google Drive'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 print:hidden">
        <button
          onClick={() => setSelectedReport('alunos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            selectedReport === 'alunos'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Lista Geral de Alunos</span>
        </button>

        <button
          onClick={() => setSelectedReport('cultos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            selectedReport === 'cultos'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Frequência dos 24 Cultos</span>
        </button>

        <button
          onClick={() => setSelectedReport('notas')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            selectedReport === 'notas'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Boletim Geral de Notas</span>
        </button>

        <button
          onClick={() => setSelectedReport('backup')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            selectedReport === 'backup'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Segurança & Restauração</span>
        </button>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
        <h1 className="text-xl font-bold font-serif">PARÓQUIA EVANGÉLICA LUTERANA SÃO PAULO</h1>
        <h2 className="text-sm font-semibold">Igreja Evangélica Luterana do Brasil (IELB)</h2>
        <p className="text-xs text-slate-600">Pastor Everton Figur • Distrito Alto Uruguai • Planalto/RS</p>
      </div>

      {/* REPORT 1: Lista Geral de Alunos */}
      {selectedReport === 'alunos' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Relação de Confirmandos e Alunos de Profissão de Fé ({students.length})
            </h3>
            <span className="text-xs text-slate-400">
              Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Nome do Aluno</th>
                  <th className="p-2.5">Formação</th>
                  <th className="p-2.5">Congregação</th>
                  <th className="p-2.5">Telefone</th>
                  <th className="p-2.5">Batismo</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                    <td className="p-2.5">
                      {st.courseType === 'confirmatorio' ? 'Ensino Confirmatório' : 'Profissão de Fé'}
                    </td>
                    <td className="p-2.5">{st.congregationName}</td>
                    <td className="p-2.5">{st.phone || '--'}</td>
                    <td className="p-2.5">
                      {st.baptism?.isBaptized ? 'Sim' : 'Pendente'}
                    </td>
                    <td className="p-2.5">
                      <span className="capitalize font-semibold">{st.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: Cultos */}
      {selectedReport === 'cultos' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Acompanhamento dos 24 Cultos Obrigatórios (Ensino Confirmatório)
              </h3>
              <p className="text-xs text-slate-500">
                Apenas alunos do Ensino Confirmatório (24 meses) possuem a meta dos 24 cultos. O curso de Profissão de Fé não inclui este módulo.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full self-start">
              {students.filter((st) => st.courseType === 'confirmatorio').length} confirmandos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Aluno Confirmando</th>
                  <th className="p-2.5">Congregação</th>
                  <th className="p-2.5">Aprovados</th>
                  <th className="p-2.5">Pendentes</th>
                  <th className="p-2.5">Progresso</th>
                  <th className="p-2.5">Situação Canônica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter((st) => st.courseType === 'confirmatorio')
                  .map((st) => {
                  const studentWorships = worships.filter((w) => w.studentId === st.id);
                  const approvedCount = studentWorships.filter((w) => w.status === 'approved').length;
                  const pendingCount = studentWorships.filter((w) => w.status === 'pending').length;
                  const pct = Math.round((approvedCount / 24) * 100);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                      <td className="p-2.5">{st.congregationName}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{approvedCount} de 24</td>
                      <td className="p-2.5 text-amber-700">{pendingCount}</td>
                      <td className="p-2.5">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden inline-block mr-2 align-middle">
                          <div
                            className="bg-emerald-600 h-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span>{pct}%</span>
                      </td>
                      <td className="p-2.5">
                        {approvedCount >= 24 ? (
                          <span className="text-emerald-700 font-bold">Apto para Confirmação</span>
                        ) : (
                          <span className="text-amber-800">Em cumprimento regular</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Notas */}
      {selectedReport === 'notas' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Desempenho Geral nas Atividades Avaliativas
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="p-2.5">Aluno</th>
                  <th className="p-2.5">Atividades Respondidas</th>
                  <th className="p-2.5">Média Paroquial</th>
                  <th className="p-2.5">Aproveitamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const stGrades = grades.filter((g) => g.studentId === st.id);
                  const avg =
                    stGrades.length > 0
                      ? (stGrades.reduce((acc, g) => acc + g.score, 0) / stGrades.length).toFixed(1)
                      : '--';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                      <td className="p-2.5">{stGrades.length} atividades</td>
                      <td className="p-2.5 font-bold text-purple-900">{avg} / 10</td>
                      <td className="p-2.5">
                        {stGrades.length > 0 ? (
                          Number(avg) >= 7.0 ? (
                            <span className="text-emerald-700 font-semibold">Aprovado</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">Em Recuperação</span>
                          )
                        ) : (
                          <span className="text-slate-400">Sem entregas</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: Backup & Restauração */}
      {selectedReport === 'backup' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Segurança, Backup e Portabilidade de Dados
            </h3>
            <p className="text-xs text-slate-500">
              Gere uma cópia exata de todos os alunos, cultos, presenças, notas e configurações para guardar com segurança ou transferir para outro dispositivo.
            </p>
          </div>

          {importStatus && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-semibold">
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Exportar Cópia de Segurança
              </h4>
              <p className="text-xs text-slate-600">
                Baixe um arquivo estruturado com todos os registros paroquiais em formato JSON localmente.
              </p>
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-4 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold text-xs transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Restaurar Dados de Backup
              </h4>
              <p className="text-xs text-slate-600">
                Selecione um arquivo de backup previamente exportado para restaurar o estado da aplicação.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition">
                <Upload className="w-4 h-4" />
                <span>Carregar Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cloud Snapshots List */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#1e3a5f]" />
                  <span>Snapshots Diários (Firebase Storage)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Cópias de segurança automáticas realizadas diariamente às 03:00.
                </p>
              </div>
              <button
                onClick={handleTriggerManualBackup}
                disabled={isTriggeringBackup}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition flex items-center gap-1.5 border border-slate-200"
              >
                {isTriggeringBackup ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Database className="w-3 h-3" />
                )}
                <span>{isTriggeringBackup ? 'Processando...' : 'Gerar Snapshot Agora'}</span>
              </button>
            </div>

            {isLoadingBackups ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                Buscando backups no servidor...
              </div>
            ) : storageBackups.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Nenhum snapshot automático encontrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {storageBackups.map((backup) => (
                  <div key={backup.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-sky-300 transition group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <button
                        onClick={() => handleDownloadStorageBackup(backup.name)}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                        title="Baixar Snapshot"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={backup.name}>
                        {backup.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{(parseInt(backup.size) / 1024).toFixed(1)} KB</span>
                        <span>{new Date(backup.updated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
