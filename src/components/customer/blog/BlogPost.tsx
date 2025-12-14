import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';

const BlogPost = ({ post, onBack }) => {
  if (!post) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Article not found.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-start mb-6">
        <Button onClick={onBack} variant="ghost" className="pl-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
      </div>

      {/* Main Image */}
      <div className="rounded-xl overflow-hidden mb-8">
        <img
          src={post.imageUrl && !post.imageUrl.startsWith('blob:') ? post.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop'}
          alt={post.title}
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="prose dark:prose-invert max-w-none">
        {/* Article Metadata */}
        <div className="flex items-center space-x-4 mb-4">
          <Badge className="bg-primary-500 text-white hover:bg-primary-600 transition-colors">
            {post.category.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {post.author?.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name || 'Author'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted" />
            )}
            <span>By {post.author?.name || 'Unknown Author'}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {post.title}
        </h1>

        {/* Date and Read Time */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-8 text-sm text-muted-foreground">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {(() => {
            const tryParse = (val: any) => {
              try { return JSON.parse(val); } catch { return null; }
            };
            // Handle cases where content may be JSON string, possibly double-encoded
            let content: any = post.content;
            let parsed = Array.isArray(content) ? content : tryParse(content);
            if (!parsed && typeof content === 'string') {
              const once = tryParse(content);
              const twice = once && typeof once === 'string' ? tryParse(once) : null;
              parsed = Array.isArray(once) ? once : (Array.isArray(twice) ? twice : null);
            }

            if (Array.isArray(parsed)) {
              return parsed.map((item: any, index: number) => (
                <div key={item.id || index} className="space-y-4">
                  {item.type === 'text' && (() => {
                    // item.value might itself be a JSON string (array or object)
                    let paragraphs: any[] | null = null;
                    const parsedVal = tryParse(item.value);
                    if (Array.isArray(parsedVal)) {
                      paragraphs = parsedVal.map(v => (typeof v === 'object' && v !== null && 'value' in v) ? v.value : String(v));
                    } else if (parsedVal && typeof parsedVal === 'object' && 'value' in parsedVal) {
                      paragraphs = [parsedVal.value];
                    }
                    const textToRender = paragraphs ?? [item.value];
                    return (
                      <div className="prose max-w-none">
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

            // As a safety, do not render raw JSON or unparsed content in the full article view
            return null;
          })()}
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPost;
