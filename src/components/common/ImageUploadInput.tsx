import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Check } from 'lucide-react';

interface ImageUploadInputProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  onFileSelect?: (file: File) => void;
  required?: boolean;
  helpText?: string;
  isAvatar?: boolean;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  value,
  onChange,
  onFileSelect,
  required = false,
  helpText,
  isAvatar = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10MB.');
      return;
    }

    if (onFileSelect) {
      onFileSelect(file);
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress and resize to max 800px width/height for fast storage
        const canvas = document.createElement('canvas');
        const maxDim = isAvatar ? 300 : 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        }
        setLoading(false);
      };
      img.onerror = () => {
        setError('Falha ao processar a imagem.');
        setLoading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        <div className="relative inline-block group">
          <div
            className={`overflow-hidden border-2 border-amber-500 shadow-md ${
              isAvatar ? 'w-24 h-24 rounded-full' : 'w-full max-w-xs h-40 rounded-xl'
            }`}
          >
            <img
              src={value}
              alt="Prévia selecionada"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 active:scale-95 transition"
            title="Remover foto"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>Foto carregada com sucesso</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {/* Camera direct input */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-98 transition text-xs font-medium shadow-sm"
            >
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Usar Câmera</span>
            </button>

            {/* Gallery / Files input */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-98 transition text-xs font-medium shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <span>Galeria / Arquivos</span>
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {loading && (
            <p className="text-xs text-amber-600 animate-pulse font-medium">
              Otimizando e preparando foto...
            </p>
          )}

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          {helpText && (
            <p className="text-xs text-slate-500">{helpText}</p>
          )}
        </div>
      )}
    </div>
  );
};
