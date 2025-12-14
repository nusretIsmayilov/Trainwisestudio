import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, X } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const messageSchema = z.string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(2000, 'Message cannot exceed 2000 characters');

interface MessageInputProps {
  onSend: (message: string) => void;
  onSendFile?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onSendFile,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile && onSendFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Validate message
    const result = messageSchema.safeParse(message);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    
    if (!disabled) {
      onSend(result.data);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-muted rounded-lg">
          <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm truncate flex-1">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="h-5 w-5 sm:h-6 sm:w-6 p-0"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-1 sm:gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={2000}
          className="flex-1 h-9 sm:h-10 text-sm"
        />
        
        {/* File Upload Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <Button 
          type="submit" 
          disabled={(!message.trim() && !selectedFile) || disabled}
          size="sm"
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />
    </div>
  );
};