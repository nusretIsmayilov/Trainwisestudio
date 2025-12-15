import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image, Video, FileText, Mic, X, Upload } from 'lucide-react';
import { ContentStep } from '@/mockdata/library/mockLibrary';

interface ContentUploadSectionProps {
  content: ContentStep[];
  onContentChange: (newContent: ContentStep[]) => void;
  allowedTypes: ('image' | 'video' | 'soundfile' | 'step')[];
}

const ContentUploadSection: React.FC<ContentUploadSectionProps> = ({ content, onContentChange, allowedTypes }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exists = (type: string) => content.some(c => c.type === type);

  const toggleContent = (type: ContentStep['type'], initialValue: string = '') => {
    if (exists(type)) {
      onContentChange(content.filter(c => c.type !== type));
    } else {
      onContentChange([...content, { id: `c-${Date.now()}`, type, value: initialValue }]);
    }
  };

  const updateContentValue = (id: string, value: string) => {
    onContentChange(content.map(c => c.id === id ? { ...c, value } : c));
  };

  const handleFileUpload = (type: 'image' | 'video' | 'soundfile', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Find existing content of this type or create new
        const existingContent = content.find(c => c.type === type);
        if (existingContent) {
          updateContentValue(existingContent.id, result);
        } else {
          onContentChange([...content, { id: `c-${Date.now()}`, type, value: result }]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = (type: 'image' | 'video' | 'soundfile') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleFileUpload(type, file);
        }
      };
      fileInputRef.current.click();
    }
  };
  
  const stepContent = content.filter(c => c.type === 'step').sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID to keep creation order
  const otherContent = content.filter(c => c.type !== 'step');

  const addStep = () => {
      onContentChange([...content, { id: `step-${Date.now()}`, type: 'step', value: '' }]);
  };
  
  const removeStep = (id: string) => {
      onContentChange(content.filter(c => c.id !== id));
  };
  
  return (
    <div className="space-y-4 rounded-xl border p-4 bg-muted/10">
      <h3 className="text-xl font-bold mb-4">Media & Instructions 🎬</h3>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*"
      />
      
      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 border-b pb-4">
        {allowedTypes.includes('image') && !exists('image') && (
            <Button variant="outline" onClick={() => triggerFileUpload('image')}>
                <Upload className="h-4 w-4 mr-2" /> Upload Image
            </Button>
        )}
        {allowedTypes.includes('video') && !exists('video') && (
            <Button variant="outline" onClick={() => triggerFileUpload('video')}>
                <Upload className="h-4 w-4 mr-2" /> Upload Video
            </Button>
        )}
        {allowedTypes.includes('soundfile') && !exists('soundfile') && (
            <Button variant="outline" onClick={() => triggerFileUpload('soundfile')}>
                <Upload className="h-4 w-4 mr-2" /> Upload Audio
            </Button>
        )}
        {(allowedTypes.includes('step') && stepContent.length === 0) && (
             <Button variant="outline" onClick={addStep}>
                <FileText className="h-4 w-4 mr-2" /> Add Step-by-Step
            </Button>
        )}
      </div>
      
      {/* Active Media Inputs */}
      {otherContent.map(c => (
        <div key={c.id} className="space-y-2 mb-4 border-l-4 border-primary/50 pl-3 pt-1">
          <div className="flex items-center justify-between">
            <Label htmlFor={c.id} className="capitalize font-semibold text-primary">
              {c.type === 'image' ? 'Uploaded Image' : c.type === 'video' ? 'Uploaded Video' : 'Uploaded Audio'}
            </Label>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toggleContent(c.type)}>
                <X className='h-4 w-4 mr-1' /> Remove
            </Button>
          </div>
          {c.type === 'image' && c.value && (
            <div className="space-y-2">
              <img src={c.value} alt="Uploaded" className="max-w-xs max-h-32 object-cover rounded" />
              <Button variant="outline" size="sm" onClick={() => triggerFileUpload('image')}>
                <Upload className="h-4 w-4 mr-2" /> Replace Image
              </Button>
            </div>
          )}
          {c.type === 'video' && c.value && (
            <div className="space-y-2">
              <video src={c.value} controls className="max-w-xs max-h-32 rounded" />
              <Button variant="outline" size="sm" onClick={() => triggerFileUpload('video')}>
                <Upload className="h-4 w-4 mr-2" /> Replace Video
              </Button>
            </div>
          )}
          {c.type === 'soundfile' && c.value && (
            <div className="space-y-2">
              <audio src={c.value} controls className="w-full" />
              <Button variant="outline" size="sm" onClick={() => triggerFileUpload('soundfile')}>
                <Upload className="h-4 w-4 mr-2" /> Replace Audio
              </Button>
            </div>
          )}
        </div>
      ))}
      
      {/* Step-by-Step Section (FIXED: Visually prominent, numbered steps) */}
      {stepContent.length > 0 && allowedTypes.includes('step') && (
          <div className="space-y-5 border-t pt-5">
              <h4 className="text-xl font-bold flex justify-between items-center text-primary">
                  Step by step instructions 👣
                  <Button variant="default" onClick={addStep}>+ Add Step</Button>
              </h4>
              {stepContent.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 bg-card rounded-lg shadow-inner border">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold mt-1">{index + 1}</div>
                      <Textarea 
                          value={step.value} 
                          onChange={(e) => updateContentValue(step.id, e.target.value)} 
                          placeholder={`Step ${index + 1} description (e.g., Hold for 30 seconds)`}
                          className="flex-grow min-h-[60px]"
                      />
                      <Button variant="ghost" size="icon" className="flex-shrink-0 mt-1 text-destructive hover:bg-destructive/10" onClick={() => removeStep(step.id)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ContentUploadSection;
