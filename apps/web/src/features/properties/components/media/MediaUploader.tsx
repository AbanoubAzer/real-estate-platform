import React, { useState, useCallback } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface MediaUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported format (JPG, PNG, WEBP).`);
        return null;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds the 5MB size limit.`);
        return null;
      }
      validFiles.push(file);
    }
    
    setError(null);
    return validFiles;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      if (validFiles) {
        onFilesSelected(validFiles);
      }
    }
  }, [onFilesSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);
      if (validFiles) {
        onFilesSelected(validFiles);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
          ${isDragging ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={handleChange}
        />
        
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-primary">
          <UploadCloud size={32} />
        </div>
        
        <h3 className="text-lg font-bold text-primary mb-2">
          Drag & Drop Images Here
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          Supports JPG, PNG, WEBP up to 5MB. You can select multiple files at once.
        </p>
        
        <button className="bg-primary text-white px-6 py-2 rounded-full font-medium shadow-sm hover:bg-opacity-90 transition-all pointer-events-none">
          Browse Files
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start justify-between text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
