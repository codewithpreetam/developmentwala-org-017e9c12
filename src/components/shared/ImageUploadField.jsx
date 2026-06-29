import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadField({ value, onChange, label = 'Upload Image', hint = 'Recommended 1200×630px • JPG/PNG/WebP • Auto-converted to WebP (max 150 KB)' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP formats are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError('');
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 hover:bg-blue-50 disabled:opacity-50"
        >
          {uploading ? (
            <><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm font-medium">Uploading...</span></>
          ) : (
            <><Upload className="w-7 h-7" /><span className="text-sm font-medium">Click to upload</span><span className="text-xs">{hint}</span></>
          )}
        </button>
      )}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}