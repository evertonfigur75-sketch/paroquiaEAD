import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Copy,
  Check,
  Share2,
  X,
  Bookmark,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Sliders,
  Maximize2,
  Minimize2,
  Church,
  ArrowRight,
  BookMarked,
  Info,
} from 'lucide-react';
import { bibleService } from '../../services/bibleService';
import {
  BIBLE_BOOKS,
  BIBLE_VERSIONS,
  LUTHERAN_CURATED_PASSAGES,
  BibleBook,
  BibleVerse,
  BibleVersionOption,
} from '../../services/bibleData';

interface BibleAccessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialCitation?: string;
}

export const BibleAccessPanel: React.FC<BibleAccessPanelProps> = ({
  isOpen,
  onClose,
  initialCitation = '',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'browse' | 'lutheran' | 'youversion'>('search');
  const [searchQuery, setSearchQuery] = useState(initialCitation || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Version
  const [selectedVersion, setSelectedVersion] = useState<BibleVersionOption>(BIBLE_VERSIONS[0]); // NVI default

  // Font size state
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Book browser state
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'AT' | 'NT'>('NT');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find((b) => b.id === 'JHN') || BIBLE_BOOKS[0]; // João by default
  });
  const [selectedChapter, setSelectedChapter] = useState<number>(1);

  // Online search state
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResult, setOnlineResult] = useState<{
    reference: string;
    text: string;
    version: string;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // When initialCitation changes or modal opens
  useEffect(() => {
    if (initialCitation) {
      setSearchQuery(initialCitation);
      handleSearch(initialCitation);
    }
  }, [initialCitation, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Local filtered verses
  const localResults = useMemo(() => {
    return bibleService.searchLocal(searchQuery);
  }, [searchQuery]);

  // Search citation handler (local + online API fallback)
  const handleSearch = async (termToSearch: string) => {
    const term = termToSearch.trim();
    if (!term) {
      setOnlineResult(null);
      setSearchError(null);
      return;
    }

    setSearchError(null);

    // If local results already match well, we display them immediately
    const parsed = bibleService.parseCitation(term);
    if (parsed.book) {
      setSelectedBook(parsed.book);
      if (parsed.chapter) {
        setSelectedChapter(parsed.chapter);
      }
    }

    // Attempt live online fetch for comprehensive coverage (e.g. any verse in all 66 books)
    setIsSearchingOnline(true);
    try {
      const data = await bibleService.fetchLiveCitation(term);
      if (data && data.text) {
        setOnlineResult({
          reference: data.reference,
          text: data.text.trim(),
          version: data.translation_name || 'Almeida (Tradução em Português)',
        });
      } else {
        setOnlineResult(null);
      }
    } catch {
      setOnlineResult(null);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleCopy = (citation: string, text: string, id: string) => {
    const fullText = `"${text.trim()}"\n— ${citation} (${selectedVersion.code})`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShare = (citation: string, text: string) => {
    const fullText = `"${text.trim()}"\n— ${citation} (${selectedVersion.code})`;
    if (navigator.share) {
      navigator.share({
        title: citation,
        text: fullText,
        url: bibleService.getBibleComUrl(selectedBook.usfm, selectedChapter, selectedVersion.code),
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(fullText);
      alert('Citação copiada para a área de transferência!');
    }
  };

  // Filtered books for browser tab
  const filteredBooks = useMemo(() => {
    if (testamentFilter === 'ALL') return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter((b) => b.testament === testamentFilter);
  }, [testamentFilter]);

  // Generate YouVersion URL for current book & chapter
  const currentYouVersionUrl = useMemo(() => {
    return bibleService.getBibleComUrl(selectedBook.usfm, selectedChapter, selectedVersion.code);
  }, [selectedBook, selectedChapter, selectedVersion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Header */}
        <header className="bg-[#1e3a5f] text-white px-4 py-3.5 sm:px-6 flex items-center justify-between border-b border-black/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display tracking-tight leading-tight">
                  Bíblia Sagrada & Consulta de Citações
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {selectedVersion.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pesquise passagens, consulte versículos e estude sem sair da plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version Selector */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/15">
              {BIBLE_VERSIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersion(v)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    selectedVersion.id === v.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title={v.name}
                >
                  {v.code}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Fechar painel da Bíblia (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Navigation Sub-bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Pesquisar Citação</span>
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Navegador de Livros (66)</span>
            </button>

            <button
              onClick={() => setActiveTab('lutheran')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'lutheran'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Church className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilares Luteranos</span>
            </button>

            <button
              onClick={() => setActiveTab('youversion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'youversion'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
              <span>YouVersion / Bible.com</span>
            </button>
          </div>

          {/* Font sizing */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <span className="mr-1">Texto:</span>
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'sm' ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'base' ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded cursor-pointer ${fontSize === 'lg' ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'}`}
            >
              A+
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* ========================================================================= */}
          {/* ABA 1: PESQUISAR CITAÇÃO BÍBLICA */}
          {/* ========================================================================= */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchQuery);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite uma citação (ex: João 3:16, Salmo 23, Rm 8:28, Efésios 2:8-9 ou 'graça')..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] outline-hidden text-xs sm:text-sm font-medium bg-slate-50/50"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setOnlineResult(null);
                        }}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingOnline}
                    className="px-4 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    {isSearchingOnline ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-amber-400" />
                        <span>Buscar Citação</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Citation Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-slate-500">Exemplos rápidos:</span>
                  {[
                    'João 3:16',
                    'Romanos 8:28',
                    'Salmo 23',
                    'Efésios 2:8-9',
                    'Salmo 46',
                    '1 Coríntios 13:4-7',
                    'João 14:6',
                    'Mateus 28:19-20',
                    'Gênesis 1:1',
                  ].map((cite) => (
                    <button
                      key={cite}
                      onClick={() => {
                        setSearchQuery(cite);
                        handleSearch(cite);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      {cite}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Result if found via API */}
              {onlineResult && (
                <div className="bg-amber-50/70 border border-amber-300 p-4 sm:p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h3 className="font-bold font-display text-slate-900 text-sm sm:text-base">
                        {onlineResult.reference}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        {onlineResult.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(onlineResult.reference, onlineResult.text, 'online')}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/70 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedId === 'online' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-700" />
                            <span>Copiar Citação</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleShare(onlineResult.reference, onlineResult.text)}
                        className="p-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/70 text-slate-700 transition cursor-pointer"
                        title="Compartilhar"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={bibleService.getBibleComUrl(selectedBook.usfm, selectedChapter, selectedVersion.code)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <span>Bible.com</span>
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                      </a>
                    </div>
                  </div>

                  <blockquote
                    className={`italic text-slate-800 leading-relaxed font-serif ${
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    }`}
                  >
                    "{onlineResult.text}"
                  </blockquote>
                </div>
              )}

              {/* Local Curated Verses Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span>
                    Passagens correspondentes no acervo da paróquia:{' '}
                    <strong>{localResults.length}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Versão atual selecionada: <strong>{selectedVersion.name}</strong>
                  </span>
                </div>

                {localResults.length === 0 && !onlineResult ? (
                  <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">Nenhum versículo encontrado para esta busca</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Tente digitar uma citação completa (ex: <strong>João 3:16</strong>, <strong>Salmo 23</strong>, <strong>Romanos 8:28</strong>) ou navegue pelos 66 livros da Bíblia na aba ao lado.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="px-4 py-2 bg-[#1e3a5f] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                      <span>Abrir Navegador de Livros</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {localResults.map((v, idx) => {
                      const id = `${v.bookId}-${v.chapter}-${v.verse}-${idx}`;
                      const citation = `${v.book} ${v.chapter}:${v.verse}`;
                      const isCopied = copiedId === id;

                      return (
                        <div
                          key={id}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 font-display text-sm sm:text-base">
                                  {citation}
                                </span>
                                {v.theme && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    {v.theme}
                                  </span>
                                )}
                              </div>
                              {v.lutheranNote && (
                                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg mt-1.5 flex items-center gap-1.5">
                                  <Church className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{v.lutheranNote}</span>
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleCopy(citation, v.text, id)}
                                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  isCopied
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                                title="Copiar citação com texto"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleShare(citation, v.text)}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
                                title="Compartilhar passagem"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={bibleService.getBibleComUrl(v.bookId, v.chapter, selectedVersion.code)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-xl bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] transition cursor-pointer"
                                title="Abrir capítulo no YouVersion / Bible.com"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>

                          <blockquote
                            className={`text-slate-800 italic leading-relaxed font-serif border-l-2 border-amber-400 pl-3.5 py-0.5 ${
                              fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                            }`}
                          >
                            "{v.text}"
                          </blockquote>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                            <span>Bíblia Sagrada ({selectedVersion.code})</span>
                            <button
                              onClick={() => {
                                const targetBook = BIBLE_BOOKS.find((b) => b.usfm === v.bookId);
                                if (targetBook) {
                                  setSelectedBook(targetBook);
                                  setSelectedChapter(v.chapter);
                                  setActiveTab('browse');
                                }
                              }}
                              className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Ver livro de {v.book}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: NAVEGADOR DE LIVROS DA BÍBLIA (66 LIVROS) */}
          {/* ========================================================================= */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              {/* Filter Testamento */}
              <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Seção Bíblica:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setTestamentFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        testamentFilter === 'ALL'
                          ? 'bg-[#1e3a5f] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todos (66)
                    </button>
                    <button
                      onClick={() => setTestamentFilter('AT')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        testamentFilter === 'AT'
                          ? 'bg-[#1e3a5f] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Antigo Testamento (39)
                    </button>
                    <button
                      onClick={() => setTestamentFilter('NT')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        testamentFilter === 'NT'
                          ? 'bg-[#1e3a5f] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Novo Testamento (27)
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Livro selecionado: <strong className="text-slate-900">{selectedBook.name}</strong> ({selectedBook.chapters} caps.)
                </div>
              </div>

              {/* Books Grid */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Escolha o Livro:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredBooks.map((b) => {
                    const isSelected = selectedBook.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBook(b);
                          setSelectedChapter(1);
                        }}
                        className={`p-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e3a5f] text-white shadow-xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100'
                        }`}
                      >
                        <span className="text-xs truncate">{b.name}</span>
                        <span
                          className={`text-[10px] px-1 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'text-slate-400'
                          }`}
                        >
                          {b.abbrev}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chapters Grid for selected book */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Capítulos de {selectedBook.name} (Total: {selectedBook.chapters}):</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Capítulo atual: <strong>{selectedChapter}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => {
                    const isChSelected = selectedChapter === ch;
                    return (
                      <button
                        key={ch}
                        onClick={() => setSelectedChapter(ch)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          isChSelected
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Chapter Actions & Links */}
              <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                    <span>{selectedBook.name} — Capítulo {selectedChapter}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {selectedVersion.code}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Consulte versículos específicos deste capítulo ou abra a leitura contínua no YouVersion.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSearchQuery(`${selectedBook.name} ${selectedChapter}`);
                      setActiveTab('search');
                      handleSearch(`${selectedBook.name} ${selectedChapter}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pesquisar Neste Capítulo</span>
                  </button>

                  <a
                    href={currentYouVersionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Ler no Bible.com / YouVersion</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: PILARES DA FÉ LUTERANA */}
          {/* ========================================================================= */}
          {activeTab === 'lutheran' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Church className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Fundamentos Bíblicos da Reforma Luterana & Catecismo
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Textos das Sagradas Escrituras que sustentam a doutrina luterana: os Cinco Solas, os Sacramentos (Santo Batismo e Santa Ceia) e as orações do Catecismo Menor de Martinho Lutero.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LUTHERAN_CURATED_PASSAGES.map((v, idx) => {
                  const citation = `${v.book} ${v.chapter}:${v.verse}`;
                  const id = `lutheran-${idx}`;
                  const isCopied = copiedId === id;

                  return (
                    <div
                      key={id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-xs space-y-2.5 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 font-display text-sm">
                            {citation}
                          </span>
                          {v.theme && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {v.theme}
                            </span>
                          )}
                        </div>

                        {v.lutheranNote && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                            {v.lutheranNote}
                          </p>
                        )}

                        <blockquote
                          className={`italic text-slate-800 leading-relaxed font-serif pl-2 border-l-2 border-[#1e3a5f] ${
                            fontSize === 'sm' ? 'text-xs' : 'text-xs'
                          }`}
                        >
                          "{v.text}"
                        </blockquote>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Bíblia Sagrada</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(citation, v.text, id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>

                          <a
                            href={bibleService.getBibleComUrl(v.bookId, v.chapter, selectedVersion.code)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Ver no Bible.com"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ABA 4: YOUVERSION / BIBLE.COM INTEGRADO */}
          {/* ========================================================================= */}
          {activeTab === 'youversion' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        Integração YouVersion / Bible.com
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Acesso direto à maior plataforma de leitura bíblica do mundo (YouVersion / Life.Church). Você pode consultar capítulos completos em diversas versões e planos de leitura.
                    </p>
                  </div>

                  <a
                    href={currentYouVersionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>Abrir Bible.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Direct Link Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Link Direto do Capítulo Atual:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentYouVersionUrl}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-mono select-all outline-hidden"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentYouVersionUrl);
                        setCopiedId('youversion-link');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedId === 'youversion-link' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Versões Bíblicas no YouVersion */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Versões Disponíveis para Consulta:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {BIBLE_VERSIONS.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVersion(v)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          selectedVersion.id === v.id
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs">{v.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Código YouVersion: #{v.bibleComId}
                          </div>
                        </div>
                        {selectedVersion.id === v.id && (
                          <Check className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct quick jump cards */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">
                    Acessos Rápidos Populares:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'João 1 (O Verbo)', usfm: 'JHN', ch: 1 },
                      { name: 'João 3 (Nicodemos)', usfm: 'JHN', ch: 3 },
                      { name: 'Romanos 8 (Vida no Espírito)', usfm: 'ROM', ch: 8 },
                      { name: 'Salmo 23 (O Bom Pastor)', usfm: 'PSA', ch: 23 },
                      { name: 'Salmo 46 (Castelo Forte)', usfm: 'PSA', ch: 46 },
                      { name: 'Efésios 2 (Pela Graça)', usfm: 'EPH', ch: 2 },
                      { name: 'Mateus 5 (Sermão do Monte)', usfm: 'MAT', ch: 5 },
                      { name: '1 Coríntios 13 (Amor)', usfm: '1CO', ch: 13 },
                    ].map((card) => (
                      <a
                        key={card.name}
                        href={bibleService.getBibleComUrl(card.usfm, card.ch, selectedVersion.code)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium transition flex items-center justify-between"
                      >
                        <span className="truncate">{card.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Church className="w-4 h-4 text-amber-600" />
            <span>
              Paróquia Evangélica Luterana • Estudo das Sagradas Escrituras
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              Pressione <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono text-slate-600">Esc</kbd> para fechar
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
