import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, UserCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { toast } from '@/components/ui/sonner';

interface AvatarUploadCompressedProps {
  onChange: (file: File | null) => void;
  preview?: string | null;
}

export const AvatarUploadCompressed = ({ onChange, preview }: AvatarUploadCompressedProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error("Please select an image.");
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return toast.error("Please select an image under 10MB.");
    }

    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      onChange?.(compressedFile);
    } catch (error) {
      toast.error("Error processing your image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-32 h-32 rounded-full bg-emerald-50 border-4 border-white shadow-md cursor-pointer group transition-all hover:scale-105"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Profile preview" className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full">
            <UserCircle className="w-20 h-20 text-emerald-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera className="w-8 h-8 text-white" />
        </div>
        {preview && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isCompressing}
      >
        {isCompressing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {isCompressing ? 'Processing...' : (preview ? 'Change Photo' : 'Upload Photo')}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
