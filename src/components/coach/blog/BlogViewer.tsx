'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost, CATEGORY_DETAILS } from '@/mockdata/blog/mockBlog';
import { ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface BlogViewerProps {
  post: BlogPost;
  onBack: () => void;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (id: string) => void;
}

const BlogViewer: React.FC<BlogViewerProps> = ({ post, onBack, onEdit, onDelete }) => {
  const details = CATEGORY_DETAILS[post.category];
  const Icon = details.icon;
  const time = new Date(post.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this blog post?')) {
      onDelete(post.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {details.label}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {time}
              </span>
              <Badge variant={post.isPublished ? "default" : "secondary"}>
                {post.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(post)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {/* Hero Image */}
        {post.imageUrl && !post.imageUrl.startsWith('blob:') && (
          <Card>
            <div className="relative h-64 md:h-80 w-full bg-muted">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover rounded-t-lg" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop';
                }}
              />
            </div>
          </Card>
        )}

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.introduction}
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(() => {
                const tryParse = (val: any) => { try { return JSON.parse(val); } catch { return null; } };
                let parsed = tryParse(post.content);
                if (!parsed && typeof post.content === 'string') {
                  const once = tryParse(post.content);
                  const twice = once && typeof once === 'string' ? tryParse(once) : null;
                  parsed = Array.isArray(once) ? once : (Array.isArray(twice) ? twice : null);
                }

                if (Array.isArray(parsed)) {
                  return parsed.map((item: any, index: number) => (
                    <div key={item.id || index} className="space-y-4">
                      {item.type === 'text' && (() => {
                        const tryParse = (val: any) => { try { return JSON.parse(val); } catch { return null; } };
                        let paragraphs: any[] | null = null;
                        const parsedVal = tryParse(item.value);
                        if (Array.isArray(parsedVal)) {
                          paragraphs = parsedVal.map(v => (typeof v === 'object' && v !== null && 'value' in v) ? v.value : String(v));
                        } else if (parsedVal && typeof parsedVal === 'object' && 'value' in parsedVal) {
                          paragraphs = [parsedVal.value];
                        }
                        const textToRender = paragraphs ?? [item.value];
                        return (
                          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
                            {textToRender.map((t, i) => (
                              <p key={i} className="whitespace-pre-wrap">{t}</p>
                            ))}
                          </div>
                        );
                      })()}
                      {item.type === 'file' && (
                        <div className="space-y-2">
                          {item.mediaType === 'image' && (
                            <img 
                              src={item.value && !item.value.startsWith('blob:') ? item.value : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} 
                              alt="Blog content" 
                              className="max-w-full h-auto rounded-lg shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                          )}
                          {item.mediaType === 'video' && (
                            <video 
                              src={item.value && !item.value.startsWith('blob:') ? item.value : undefined} 
                              controls 
                              className="max-w-full h-auto rounded-lg shadow-md"
                              onError={(e) => {
                                (e.target as HTMLVideoElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ));
                }

                // If it looks like JSON but failed to parse, hide it in the viewer
                if (typeof post.content === 'string') {
                  const trimmed = post.content.trim();
                  const looksJsonArray = trimmed.startsWith('[') && trimmed.endsWith(']');
                  const looksJsonObject = trimmed.startsWith('{') && trimmed.endsWith('}');
                  if (looksJsonArray || looksJsonObject) {
                    return null;
                  }
                }
                return (
                  <div 
                    className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(post.content || 'No content available.') 
                    }}
                  />
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Category:</span>
                <span className="ml-2 text-muted-foreground">{details.label}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  <Badge variant={post.isPublished ? "default" : "secondary"}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default BlogViewer;
