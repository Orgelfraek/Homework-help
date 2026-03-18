import React, { useCallback, useState } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File, base64: string) => void;
  className?: string;
}

export function FileUploader({ onFileSelect, className }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onFileSelect(file, base64);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className={cn("w-full", className)}>
      {!preview ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-64 border-4 border-dashed rounded-3xl transition-all cursor-pointer",
            isDragging ? "border-black bg-black/5 scale-[0.98]" : "border-black/20 hover:border-black/40 bg-white"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 mb-4 text-black/40" />
            <p className="mb-2 text-lg font-bold text-black">Drop your worksheet here</p>
            <p className="text-sm text-black/60 italic">or click to browse</p>
          </div>
          <input type="file" className="hidden" onChange={onSelect} accept="image/*" />
        </label>
      ) : (
        <div className="relative w-full rounded-3xl overflow-hidden border-4 border-black group">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-white" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 text-white flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">Worksheet Loaded</span>
          </div>
        </div>
      )}
    </div>
  );
}
