import { useRef } from "react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];

export function FileUpload({ files, onFilesChange, error }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((file) => {
        if (file.size > MAX_FILE_SIZE) return false;
        return ALLOWED_FILE_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext));
      });
      onFilesChange([...files, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Archivos Adjuntos (máx. 5MB)
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4 text-center">
        <input
          type="file"
          accept={ALLOWED_FILE_TYPES.join(",")}
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
          Seleccionar archivos
        </label>
        <p className="text-xs text-gray-500 mt-1">Formatos: {ALLOWED_FILE_TYPES.join(", ")}</p>
      </div>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}