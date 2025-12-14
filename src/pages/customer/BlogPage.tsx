import { useState } from 'react';
import useMediaQuery from '@/hooks/use-media-query';
import BlogPost from '@/components/customer/blog/BlogPost';
import FeaturedPost from '@/components/customer/blog/FeaturedPost';
import BlogTimeline from '@/components/customer/blog/BlogTimeline';
import BlogTimelineSheet from '@/components/customer/blog/BlogTimelineSheet';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { History, Lock, Crown, Users, Loader2 } from 'lucide-react';
import { useRealTimeBlog } from '@/hooks/useRealTimeBlog';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BlogPage = () => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)'); // Corresponds to lg breakpoint
    const { posts, loading, error, hasAccess } = useRealTimeBlog();
    const { t } = useTranslation();
    // Map backend shape to UI-friendly post shape expected by components
    const uiPosts = (posts || []).map((p: any) => {
        const buildHtmlFromBlocks = (raw: any): string | null => {
            const tryParse = (val: any) => { try { return JSON.parse(val); } catch { return null; } };
            const toHtml = (blocks: any[]): string => {
                return blocks.map((b) => {
                    if (b.type === 'text') {
                        const textVal = (() => {
                            const pv = tryParse(b.value);
                            if (Array.isArray(pv)) return pv.map((v:any)=> (v && typeof v==='object' && 'value' in v ? v.value : String(v))).join('\n\n');
                            if (pv && typeof pv==='object' && 'value' in pv) return pv.value;
                            return String(b.value ?? '');
                        })();
                        return `<p>${textVal.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`;
                    }
                    if (b.type === 'file') {
                        if (b.mediaType === 'image') return `<img src="${b.value}" alt="" />`;
                        if (b.mediaType === 'video') return `<video src="${b.value}" controls></video>`;
                    }
                    return '';
                }).join('');
            };
            if (Array.isArray(raw)) return toHtml(raw);
            const once = tryParse(raw);
            if (Array.isArray(once)) return toHtml(once);
            const twice = once && typeof once === 'string' ? tryParse(once) : null;
            if (Array.isArray(twice)) return toHtml(twice);
            return null;
        };

        const contentHtml = buildHtmlFromBlocks(p.content);

        const safeFormatDate = (val: any): string => {
            if (!val) return '';
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        const plainTextLength = (() => {
            const html = contentHtml || '';
            const stripped = html.replace(/<[^>]+>/g, '');
            return stripped.length || (typeof p.content === 'string' ? p.content.length : 0) || (p.introduction?.length || 0);
        })();

        const readTimeMins = Math.max(1, p.read_time || Math.ceil(plainTextLength / 500));

        return ({
        id: p.id,
        slug: p.slug || p.id,
        title: p.title,
        excerpt: p.introduction || '',
            content: contentHtml ?? p.content ?? '',
        imageUrl: p.cover_url || '',
        category: p.category || 'general',
        date: safeFormatDate(p.created_at || p.updated_at),
        readTime: `${readTimeMins} min read`,
        author: {
            id: p.author_id || p.coach_id || '',
            name: p.author_name || 'Unknown Author',
            avatarUrl: p.author_avatar || '',
        }
        });
    });
    const navigate = useNavigate();

    const latestPost = uiPosts[0];
    const previousPosts = uiPosts.slice(1);

    const handleReadMore = (slug) => {
        const post = uiPosts.find(p => p.id === slug || p.slug === slug);
        setSelectedPost(post);
        setIsTimelineOpen(false); // Close timeline modal if open
    };

    const handleBack = () => {
        setSelectedPost(null);
    };

    const handleUpgrade = () => {
        navigate('/customer/payment/update-plan');
    };

    const handleFindCoach = () => {
        navigate('/customer/my-coach');
    };

    // Loading state
    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // Access denied state
    if (!hasAccess) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('blog.accessRequired')}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('blog.accessDescription')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                            onClick={handleUpgrade}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <Crown className="w-4 h-4 mr-2" />
                            {t('blog.subscribeNow')}
                        </Button>
                        <Button 
                            onClick={handleFindCoach}
                            variant="outline"
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            {t('blog.findCoach')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 sm:space-y-12">
            <AnimatePresence mode="wait">
                {selectedPost ? (
                    <motion.div
                        key="blog-post-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BlogPost post={selectedPost} onBack={handleBack} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="blog-main-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isDesktop ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-[80vh] min-h-[600px]">
                                <div className="lg:col-span-2">
                                    {latestPost && (
                                      <FeaturedPost post={{
                                        title: latestPost.title,
                                        excerpt: (latestPost as any).introduction || latestPost.excerpt,
                                        imageUrl: (latestPost as any).cover_url || latestPost.imageUrl || 'https://placehold.co/1024x512',
                                        author: { 
                                          name: (latestPost as any).author_name || latestPost.author.name, 
                                          avatarUrl: (latestPost as any).author_avatar || latestPost.author.avatarUrl || 'https://placehold.co/64x64',
                                          id: (latestPost as any).author_id || latestPost.author.id
                                        },
                                        date: (latestPost as any).updated_at ? new Date((latestPost as any).updated_at).toLocaleDateString() : latestPost.date,
                                        readTime: (latestPost as any).read_time ? `${(latestPost as any).read_time} min read` : latestPost.readTime,
                                        slug: latestPost.id || latestPost.slug,
                                        content: latestPost.content,
                                        category: latestPost.category || 'fitness',
                                      }} onReadMore={handleReadMore} />
                                    )}
                                </div>
                                <div className="lg:col-span-1 border-l pl-6 border-gray-200 dark:border-gray-700">
                                    <h2 className="text-2xl font-bold mb-4">{t('blog.thisJustIn')}</h2>
                                    <BlogTimeline posts={previousPosts.map(p => ({
                                      title: p.title,
                                      excerpt: (p as any).introduction || p.excerpt,
                                      imageUrl: (p as any).cover_url || p.imageUrl || 'https://placehold.co/512x256',
                                      author: { 
                                        name: (p as any).author_name || p.author.name, 
                                        avatarUrl: (p as any).author_avatar || p.author.avatarUrl || 'https://placehold.co/32x32',
                                        id: (p as any).author_id || p.author.id
                                      },
                                      date: (p as any).updated_at ? new Date((p as any).updated_at).toLocaleDateString() : p.date,
                                      readTime: (p as any).read_time ? `${(p as any).read_time} min read` : p.readTime,
                                      slug: p.id || p.slug,
                                      content: p.content,
                                      category: p.category || 'fitness',
                                    }))} onReadMore={handleReadMore} />
                                </div>
                            </div>
                        ) : (
                            // Mobile/Tablet View
                            <div className="space-y-8">
                                {latestPost && (
                                  <FeaturedPost post={{
                                    title: latestPost.title,
                                    excerpt: (latestPost as any).introduction || latestPost.excerpt,
                                    imageUrl: (latestPost as any).cover_url || latestPost.imageUrl || 'https://placehold.co/1024x512',
                                    author: { 
                                      name: (latestPost as any).author_name || latestPost.author.name, 
                                      avatarUrl: (latestPost as any).author_avatar || latestPost.author.avatarUrl || 'https://placehold.co/64x64',
                                      id: (latestPost as any).author_id || latestPost.author.id
                                    },
                                    date: (latestPost as any).updated_at ? new Date((latestPost as any).updated_at).toLocaleDateString() : latestPost.date,
                                    readTime: (latestPost as any).read_time ? `${(latestPost as any).read_time} min read` : latestPost.readTime,
                                    slug: latestPost.id || latestPost.slug,
                                    content: latestPost.content,
                                    category: latestPost.category || 'fitness',
                                  }} onReadMore={handleReadMore} />
                                )}
                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold mb-4">{t('blog.thisJustIn')}</h2>
                                    <BlogTimeline posts={previousPosts.map(p => ({
                                      title: p.title,
                                      excerpt: (p as any).introduction || p.excerpt,
                                      imageUrl: (p as any).cover_url || p.imageUrl || 'https://placehold.co/512x256',
                                      author: { 
                                        name: (p as any).author_name || p.author.name, 
                                        avatarUrl: (p as any).author_avatar || p.author.avatarUrl || 'https://placehold.co/32x32',
                                        id: (p as any).author_id || p.author.id
                                      },
                                      date: (p as any).updated_at ? new Date((p as any).updated_at).toLocaleDateString() : p.date,
                                      readTime: (p as any).read_time ? `${(p as any).read_time} min read` : p.readTime,
                                      slug: p.id || p.slug,
                                      content: p.content,
                                      category: p.category || 'fitness',
                                    }))} onReadMore={handleReadMore} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogPage;
