import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentPlan } from '@/hooks/usePaymentPlan';

export interface BlogPost {
  id: string;
  title: string;
  introduction: string;
  content: string;
  cover_url?: string;
  category: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  read_time: number;
  slug: string;
}

export const useRealTimeBlog = () => {
  const { user, profile } = useAuth();
  const { planStatus } = usePaymentPlan();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user has access (payment plan or coach)
        const hasAccess = planStatus.hasActivePlan || !!profile?.coach_id;

        if (!hasAccess) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Fetch published blog posts first (without join)
        // Probe schema: fetch one row to infer column names without failing on filters
        const probe = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (probe.error) {
          console.error('[useRealTimeBlog] probe error', probe.error);
          throw probe.error;
        }

        const sample = (probe.data || [])[0] || {} as any;
        const hasIsPublished = Object.prototype.hasOwnProperty.call(sample, 'is_published');
        const hasStatus = Object.prototype.hasOwnProperty.call(sample, 'status');
        const hasUpdatedAt = Object.prototype.hasOwnProperty.call(sample, 'updated_at');

        console.debug('[useRealTimeBlog] probe columns', {
          keys: Object.keys(sample || {}),
          hasIsPublished,
          hasStatus,
          hasUpdatedAt,
        });

        // Build main query dynamically based on available columns
        let query = supabase
          .from('blog_posts')
          .select('id, title, introduction, content, cover_url, category, coach_id, created_at, updated_at');

        if (hasIsPublished) {
          query = query.eq('is_published', true);
        } else if (hasStatus) {
          query = query.eq('status', 'published');
        }

        query = query.order(hasUpdatedAt ? 'updated_at' : 'created_at', { ascending: false });

        const { data: blogData, error: blogError } = await query;

        if (blogError) {
          console.error('[useRealTimeBlog] blog_posts query error', blogError);
          throw blogError;
        }

        const rows = blogData || [];
        console.debug('[useRealTimeBlog] blog_posts rows count', rows.length);

        // Fetch author profiles in a second query
        const authorIds = Array.from(new Set(rows.map((p: any) => p.coach_id).filter(Boolean)));
        let profilesById: Record<string, { full_name?: string; avatar_url?: string }> = {};

        if (authorIds.length > 0) {
          console.debug('[useRealTimeBlog] Fetching author profiles', { count: authorIds.length });
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', authorIds);
          if (profilesError) {
            console.error('[useRealTimeBlog] profiles query error', profilesError);
          }
          if (!profilesError && profilesData) {
            profilesById = (profilesData as any[]).reduce((acc, p) => {
              acc[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
              return acc;
            }, {} as Record<string, { full_name?: string; avatar_url?: string }>);
          }
        }

        // Transform the data to include author information
        const transformedPosts: BlogPost[] = rows.map((post: any) => {
          const author = profilesById[post.coach_id] || {};
          const readTime = Math.ceil((post.content?.length || 0) / 500);
          
          // Filter out blob URLs - they don't work in production
          let coverUrl = post.cover_url;
          if (coverUrl && coverUrl.startsWith('blob:')) {
            coverUrl = undefined;
          }

          return {
            id: post.id,
            title: post.title,
            introduction: post.introduction,
            content: post.content,
            cover_url: coverUrl,
            category: post.category,
            author_id: post.coach_id,
            author_name: author.full_name || 'Unknown Author',
            author_avatar: author.avatar_url,
            created_at: post.created_at,
            updated_at: post.updated_at || post.created_at,
            read_time: readTime,
            slug: post.id,
          };
        });

        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [user, profile?.coach_id, planStatus.hasActivePlan]);

  return { posts, loading, error, hasAccess: planStatus.hasActivePlan || !!profile?.coach_id };
};
