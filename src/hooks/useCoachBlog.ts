import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTableMutations } from './useMutationQueue';
import { queryKeys } from '@/lib/query-config';

export interface BlogPostRow {
  id: string;
  coach_id: string;
  title: string;
  introduction: string | null;
  content: string | null;
  category: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useCoachBlog = () => {
  const { user } = useAuth();
  const { insert: queueInsert, update: queueUpdate, remove: queueDelete } = useTableMutations('blog_posts');
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('coach_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setPosts((data || []) as BlogPostRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [user?.id]);

  const createOrUpdate = async (payload: Partial<BlogPostRow> & { id?: string; isPublished?: boolean }) => {
    if (!user) throw new Error('Not authenticated');
    
    // Use mutation queue for offline support and scalability
    try {
      if (payload.id) {
        await queueUpdate(
          {
            title: payload.title,
            introduction: payload.introduction ?? null,
            content: payload.content ?? null,
            category: payload.category ?? null,
            cover_url: payload.cover_url ?? null,
            is_published: payload.isPublished ?? false,
          },
          { id: payload.id, coach_id: user.id },
          {
            invalidateQueries: [
              queryKeys.coachBlog(user.id),
              queryKeys.blogPosts(),
            ],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: payload.id,
          coach_id: user.id,
          title: payload.title!,
          introduction: payload.introduction ?? null,
          content: payload.content ?? null,
          category: payload.category ?? null,
          cover_url: payload.cover_url ?? null,
          is_published: payload.isPublished ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as BlogPostRow;
        
        await fetchPosts();
        return optimisticData;
      } else {
        await queueInsert(
          {
            coach_id: user.id,
            title: payload.title!,
            introduction: payload.introduction ?? null,
            content: payload.content ?? null,
            category: payload.category ?? null,
            cover_url: payload.cover_url ?? null,
            is_published: payload.isPublished ?? false,
          },
          {
            invalidateQueries: [
              queryKeys.coachBlog(user.id),
              queryKeys.blogPosts(),
            ],
          }
        );
        
        // Return optimistic data
        const optimisticData = {
          id: `temp_${Date.now()}`,
          coach_id: user.id,
          title: payload.title!,
          introduction: payload.introduction ?? null,
          content: payload.content ?? null,
          category: payload.category ?? null,
          cover_url: payload.cover_url ?? null,
          is_published: payload.isPublished ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as BlogPostRow;
        
        await fetchPosts();
        return optimisticData;
      }
    } catch (queueError) {
      // Fallback to direct Supabase call if queue fails
      console.warn('Queue failed, falling back to direct operation:', queueError);
      if (payload.id) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update({
            title: payload.title,
            introduction: payload.introduction ?? null,
            content: payload.content ?? null,
            category: payload.category ?? null,
            cover_url: payload.cover_url ?? null,
            is_published: payload.isPublished ?? false,
          })
          .eq('id', payload.id)
          .eq('coach_id', user.id)
          .select('*')
          .single();
        if (error) throw error;
        await fetchPosts();
        return data as BlogPostRow;
      }
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          coach_id: user.id,
          title: payload.title,
          introduction: payload.introduction ?? null,
          content: payload.content ?? null,
          category: payload.category ?? null,
          cover_url: payload.cover_url ?? null,
          is_published: payload.isPublished ?? false,
        })
        .select('*')
        .single();
      if (error) throw error;
      await fetchPosts();
      return data as BlogPostRow;
    }
  };

  const remove = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    
    // Use mutation queue for offline support and scalability
    try {
      await queueDelete(
        { id, coach_id: user.id },
        {
          invalidateQueries: [
            queryKeys.coachBlog(user.id),
            queryKeys.blogPosts(),
          ],
        }
      );
      
      await fetchPosts();
      return true;
    } catch (queueError) {
      // Fallback to direct Supabase call if queue fails
      console.warn('Queue failed, falling back to direct delete:', queueError);
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
        .eq('coach_id', user.id);
      if (error) throw error;
      await fetchPosts();
      return true;
    }
  };

  return { posts, loading, error, refetch: fetchPosts, createOrUpdate, remove };
};


