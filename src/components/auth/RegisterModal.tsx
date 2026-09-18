import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { CourseType, ChurchHistoryItem } from '../../types';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  X,
  User,
  Church,
  Calendar,
  Phone,
  Mail,
  Lock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { register } = useAuth();
  const congregations = dbService.getCongregations();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [courseType, setCourseType] = useState<CourseType>('confirmatorio');
  const [congregationId, setCongregationId] = useState<string>(congregations[0]?.id || 'cel-sao-paulo');

  // Personal Info
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address
  const [cep, setCep] = useState('');
  const [state, setState] = useState('RS');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');

  // Baptism
  const [isBaptized, setIsBaptized] = useState(true);
  const [baptismDate, setBaptismDate] = useState('');
  const [baptismChurch, setBaptismChurch] = useState('');
  const [baptismCity, setBaptismCity] = useState('');
  const [baptismState, setBaptismState] = useState('RS');
  const [baptismNotes, setBaptismNotes] = useState('');

  // Faith Profession specific: Church history
  const [churchHistory, setChurchHistory] = useState<ChurchHistoryItem[]>([
    {
      id: 'ch-1',
      churchName: '',
      city: '',
      state: 'RS',
      period: '',
      notes: '',
    },
  ]);

  if (!isOpen) return null;

  const addChurchHistoryItem = () => {
    setChurchHistory([
      ...churchHistory,
      {
        id: 'ch-' + Date.now(),
        churchName: '',
        city: '',
        state: 'RS',
        period: '',
        notes: '',
      },
    ]);
  };

  const removeChurchHistoryItem = (id: string) => {
    if (churchHistory.length === 1) return;
    setChurchHistory(churchHistory.filter((c) => c.id !== id));
  };

  const updateChurchHistoryItem = (id: string, field: keyof ChurchHistoryItem, val: string) => {
    setChurchHistory(
      churchHistory.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!courseType || !congregationId) {
        setError('Selecione o tipo de formação e a congregação.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!name || !email || !password) {
        setError('Preencha ao menos Nome Completo, E-mail e Senha.');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (courseType === 'profissao_fe') {
        setStep(4);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const selectedCongregation = congregations.find((c) => c.id === congregationId);

    const res = await register({
      name,
      email,
      role: 'student',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      birthDate,
      phone,
      cep,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
      courseType,
      congregationId,
      congregationName: selectedCongregation?.name || 'Congregação Paroquial',
      password,
      baptism: {
        isBaptized,
        date: baptismDate,
        church: baptismChurch,
        city: baptismCity,
        state: baptismState,
        notes: baptismNotes,
      },
      churchHistory: courseType === 'profissao_fe' ? churchHistory.filter((c) => c.churchName.trim() !== '') : undefined,
    });

    setLoading(false);
    if (res.success) {
      setSuccessSubmitted(true);
    } else {
      setError(res.message || 'Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <LutherRoseIcon size={38} />
            <div>
              <h2 className="text-lg font-bold font-display">Cadastro de Aluno</h2>
              <p className="text-xs text-amber-200">Paróquia Luterana — Instrução Cristã</p>
            </div>
          </div>

          {!successSubmitted && (
            <div className="mt-4 flex items-center justify-between text-xs font-semibold border-t border-white/15 pt-3">
              <span className={step === 1 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                1. Curso & Congregação
              </span>
              <span>→</span>
              <span className={step === 2 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                2. Dados Pessoais
              </span>
              <span>→</span>
              <span className={step === 3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                3. Batismo
              </span>
              {courseType === 'profissao_fe' && (
                <>
                  <span>→</span>
                  <span className={step === 4 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    4. Igrejas
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Success Screen: Solicitação Enviada */}
        {successSubmitted ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Solicitação Enviada com Sucesso!
            </h3>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-medium leading-relaxed">
              “Sua solicitação foi enviada ao administrador. Aguarde a aprovação do <strong>Pastor Everton Figur</strong>.”
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Assim que o Pastor Everton Figur avaliar e aprovar o seu pedido na congregação selecionada, você terá acesso completo às aulas, vídeos, atividades e presenças nos cultos.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-[#1e3a5f] text-white font-medium text-sm hover:bg-[#162a45] transition"
              >
                Acompanhar Status
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Curso e Congregação */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Tipo de Formação *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCourseType('confirmatorio')}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        courseType === 'confirmatorio'
                          ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        Ensino Confirmatório
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">
                        Para confirmandos (jovens). Duração de 24 meses com acompanhamento de 24 presenças mensais nos cultos.
                      </p>
                      <span className="inline-block mt-3 text-[11px] font-bold text-amber-700">
                        24 meses • 24 cultos
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCourseType('profissao_fe')}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        courseType === 'profissao_fe'
                          ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        Profissão de Fé
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">
                        Para candidatos adultos à recepção e profissão pública de fé na Igreja Evangélica Luterana (sem exigência do módulo de 24 cultos).
                      </p>
                      <span className="inline-block mt-3 text-[11px] font-bold text-amber-700">
                        Modular • Adultos (Foco Doutrinário)
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Escolha a Congregação *
                  </label>
                  <select
                    id="select-congregation"
                    value={congregationId}
                    onChange={(e) => setCongregationId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {congregations.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        {i + 1}. {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Selecione a sua congregação local ou onde assistirá aos cultos e instruções.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Dados Pessoais e Endereço */}
            {step === 2 && (
              <div className="space-y-4">
                <ImageUploadInput
                  label="Foto de Perfil (Câmera ou Galeria)"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  isAvatar={true}
                  helpText="Você pode tirar uma foto agora pelo celular ou selecionar da galeria."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Carlos da Silva"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(55) 99999-9999"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Senha * (mínimo 6 dígitos)
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    Endereço Residencial
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">CEP</label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        placeholder="98400-000"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Estado</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="RS"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Planalto"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Centro"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Rua / Logradouro</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Rua das Flores"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Número</label>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto, Casa, Bloco..."
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dados de Batismo */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Você já é batizado? *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={isBaptized}
                        onChange={() => setIsBaptized(true)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Sim, sou batizado</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isBaptized}
                        onChange={() => setIsBaptized(false)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Não sou batizado</span>
                    </label>
                  </div>
                </div>

                {isBaptized && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Data do Batismo
                      </label>
                      <input
                        type="date"
                        value={baptismDate}
                        onChange={(e) => setBaptismDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Igreja / Congregação do Batismo
                      </label>
                      <input
                        type="text"
                        value={baptismChurch}
                        onChange={(e) => setBaptismChurch(e.target.value)}
                        placeholder="Ex: CEL São Paulo"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cidade onde foi batizado
                      </label>
                      <input
                        type="text"
                        value={baptismCity}
                        onChange={(e) => setBaptismCity(e.target.value)}
                        placeholder="Cidade"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={baptismState}
                        onChange={(e) => setBaptismState(e.target.value)}
                        placeholder="RS"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Observações sobre o batismo (padrinhos, certidão, etc.)
                      </label>
                      <textarea
                        rows={2}
                        value={baptismNotes}
                        onChange={(e) => setBaptismNotes(e.target.value)}
                        placeholder="Detalhes adicionais se houver..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Dados Específicos da Profissão de Fé (Histórico de Igrejas) */}
            {step === 4 && courseType === 'profissao_fe' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                    Histórico de Participação em Igrejas
                  </h4>
                  <p className="text-xs text-amber-800">
                    Cadastre uma ou mais igrejas das quais você já foi membro ou participou anteriormente.
                  </p>
                </div>

                <div className="space-y-3">
                  {churchHistory.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 relative space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-700">
                          Registro #{idx + 1}
                        </span>
                        {churchHistory.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChurchHistoryItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                            Nome da Igreja
                          </label>
                          <input
                            type="text"
                            value={item.churchName}
                            onChange={(e) => updateChurchHistoryItem(item.id, 'churchName', e.target.value)}
                            placeholder="Ex: Paróquia São Lucas"
                            className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={item.city}
                            onChange={(e) => updateChurchHistoryItem(item.id, 'city', e.target.value)}
                            placeholder="Cidade"
                            className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={item.state}
                            onChange={(e) => updateChurchHistoryItem(item.id, 'state', e.target.value)}
                            placeholder="RS"
                            className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                            Período Aproximado
                          </label>
                          <input
                            type="text"
                            value={item.period}
                            onChange={(e) => updateChurchHistoryItem(item.id, 'period', e.target.value)}
                            placeholder="Ex: 2018 a 2022"
                            className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                            Observações
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => updateChurchHistoryItem(item.id, 'notes', e.target.value)}
                            placeholder="Membro, visitante, etc."
                            className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addChurchHistoryItem}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-600/40 text-amber-800 hover:bg-amber-50/50 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Outra Igreja ao Histórico
                  </button>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs text-amber-700 font-semibold hover:underline"
                >
                  Já tenho conta (Entrar)
                </button>
              )}

              {step < (courseType === 'profissao_fe' ? 4 : 3) ? (
                <button
                  id="btn-register-next"
                  type="button"
                  onClick={handleNext}
                  className="py-2.5 px-5 rounded-xl bg-[#1e3a5f] text-white font-semibold text-xs hover:bg-[#162a45] transition flex items-center gap-1.5 shadow-sm"
                >
                  Próximo Passo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-register-submit"
                  type="button"
                  disabled={loading}
                  onClick={courseType === 'profissao_fe' ? handleSubmit : handleNext}
                  className="py-2.5 px-6 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition flex items-center gap-1.5 shadow-md"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitação ao Pastor'}
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
