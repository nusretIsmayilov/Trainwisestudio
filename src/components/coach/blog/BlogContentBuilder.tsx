'use client';

import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Type, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BlogContentItem {
  id: string;
  type: 'text' | 'file'; // Simplified types
  mediaType?: 'image' | 'video'; // Distinguish file type
  value: string; // Text content or local file URL
}

interface BlogContentBuilderProps {
  content: BlogContentItem[];
  onContentChange: (newContent: BlogContentItem[]) => void;
}

const BlogContentBuilder: React.FC<BlogContentBuilderProps> = ({ content, onContentChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBlockId = useRef<string | null>(null);

  const updateItem = useCallback((id: string, value: string) => {
    onContentChange(content.map(item => item.id === id ? { ...item, value } : item));
  }, [content, onContentChange]);

  const removeItem = useCallback((id: string) => {
    onContentChange(content.filter(item => item.id !== id));
  }, [content, onContentChange]);

  const addItem = useCallback((type: BlogContentItem['type']) => {
    onContentChange([...content, { id: `c-${Date.now()}`, type, value: '' }]);
  }, [content, onContentChange]);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    const newContent = [...content];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newContent.length) {
      // Swap the elements
      [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
      onContentChange(newContent);
    }
  }, [content, onContentChange]);


  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const id = currentBlockId.current;

    if (file && id) {
      try {
        // Upload to Supabase storage instead of using blob URLs
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: userRes } = await supabase.auth.getUser();
        const userId = userRes.user?.id || 'anonymous';
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const path = `blog_content/${userId}/${Date.now()}-${safeName}`;
        // Use blog-covers bucket for both images and videos (or create blog-videos if needed)
        const bucket = 'blog-covers';

        const { error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          console.error('[BlogContentBuilder] upload error', uploadError);
          // Fallback: use data URL for preview only (won't be saved)
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
            onContentChange(content.map(item =>
              item.id === id ? { ...item, value: dataUrl, mediaType } : item
            ));
          };
          reader.readAsDataURL(file);
          return;
        }

        const { data: publicUrlData } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(path);

        const publicUrl = publicUrlData?.publicUrl;
        if (publicUrl) {
          const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
          onContentChange(content.map(item =>
            item.id === id ? { ...item, value: publicUrl, mediaType } : item
          ));
        }
      } catch (e) {
        console.error('[BlogContentBuilder] unexpected upload error', e);
        // Fallback: use data URL for preview only
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
          onContentChange(content.map(item =>
            item.id === id ? { ...item, value: dataUrl, mediaType } : item
          ));
        };
        reader.readAsDataURL(file);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    currentBlockId.current = null;
  }, [content, onContentChange]);

  const triggerFileExplorer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    currentBlockId.current = id;
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*,video/*';
      fileInputRef.current.click();
    }
  };

  const renderContentBlock = (item: BlogContentItem, index: number) => { // Added index parameter
    const isText = item.type === 'text';
    const isFile = item.type === 'file';
    const mediaType = item.mediaType;
    const placeholderText = isText ? "Start typing your blog paragraph here..." : "Click to select file...";

    return (
      <div
        key={item.id}
        className="relative p-5 rounded-xl border transition-all hover:shadow-lg hover:border-primary/50 bg-card group flex items-start space-x-4"
      >
        {/* Control Column */}
        <div className="flex flex-col items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6">
          {/* Sorting Arrows */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6 text-muted-foreground hover:bg-muted mb-1", index === 0 && 'invisible')}
            onClick={() => moveBlock(index, 'up')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* REMOVED GRIP ICON */}

          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6 text-muted-foreground hover:bg-muted mt-1", index === content.length - 1 && 'invisible')}
            onClick={() => moveBlock(index, 'down')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Delete Button */}
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-2 text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Input Area */}
        <div className="flex-grow space-y-3">
          {isText && (
            <Textarea
              value={item.value}
              onChange={(e) => updateItem(item.id, e.target.value)}
              placeholder={placeholderText}
              className="min-h-[100px] text-base focus:border-primary/50 border-none resize-none shadow-none focus-visible:ring-0 w-full"
            />
          )}

          {isFile && (
            <div className="space-y-2">
              {!item.value ? (
                <div
                  className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={(e) => triggerFileExplorer(e, item.id)}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground mt-1">
                    Click to Upload Image or Video
                  </span>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  {item.mediaType === 'image' && (
                    <img 
                      src={item.value && !item.value.startsWith('blob:') ? item.value : undefined} 
                      alt="Preview" 
                      className="max-h-64 w-full object-contain"
                      onError={(e) => {
                        if (item.value.startsWith('data:')) {
                          // Data URL is fine for preview
                          return;
                        }
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  {item.mediaType === 'video' && (
                    <video 
                      src={item.value && !item.value.startsWith('blob:') ? item.value : undefined} 
                      controls 
                      className="max-h-64 w-full object-contain bg-black"
                      onError={(e) => {
                        if (item.value.startsWith('data:')) {
                          return;
                        }
                        (e.target as HTMLVideoElement).style.display = 'none';
                      }}
                    />
                  )}
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    onClick={(e) => triggerFileExplorer(e, item.id)}
                  >
                    Replace
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold border-b pb-2">Post Content Editor ✍️</h3>

      {/* Hidden Global File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence initial={false}>
        {content.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContentBlock(item, index)} {/* Pass index to render function */}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Content Buttons */}
      <div className="flex justify-center pt-6">
        <div className="flex gap-3 p-3.5 rounded-full border bg-muted/50 shadow-xl">
          <Button variant="secondary" onClick={() => addItem('text')} className="gap-2">
            <Type className="h-4 w-4" /> Add Text
          </Button>
          <Button variant="secondary" onClick={() => addItem('file')} className="gap-2">
            <Upload className="h-4 w-4" /> Add File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogContentBuilder;
