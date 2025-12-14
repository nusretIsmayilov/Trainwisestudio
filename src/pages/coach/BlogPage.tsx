'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPost, BlogCategory } from '@/mockdata/blog/mockBlog';
import { useCoachBlog } from '@/hooks/useCoachBlog';
import BlogHeader from '@/components/coach/blog/BlogHeader';
import BlogList from '@/components/coach/blog/BlogList';
import BlogViewer from '@/components/coach/blog/BlogViewer';
import BlogFAB from '@/components/coach/blog/BlogFAB';
import BlogCreatorPage from './BlogCreatorPage';

type BlogView = 'list' | 'creator' | 'viewer';

const BlogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [blogData, setBlogData] = useState<BlogPost[]>([]);
  const { posts, createOrUpdate, remove, refetch } = useCoachBlog();

  useEffect(() => {
    // Map db posts to UI type
    const mapped = (posts || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      introduction: p.introduction || '',
      content: p.content || '',
      category: p.category || 'fitness',
      imageUrl: p.cover_url || undefined,
      createdAt: p.created_at,
      isPublished: p.is_published ?? true,
    })) as BlogPost[];
    setBlogData(mapped);
  }, [posts]);
  const [view, setView] = useState<BlogView>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  const filteredPosts = useMemo(() => {
    return blogData.filter(post => {
      const categoryMatch = !activeCategory || post.category === activeCategory;
      const searchMatch = !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.introduction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [blogData, activeCategory, searchTerm]);

  const handleCategoryChange = useCallback((cat: BlogCategory | null) => {
    setActiveCategory(cat);
    setSearchTerm('');
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleNewPost = () => { 
    setEditingPost(null);
    setView('creator');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setView('creator');
  };

  const handleViewPost = (post: BlogPost) => {
    setViewingPost(post);
    setView('viewer');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingPost(null);
    setViewingPost(null);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await remove(id);
        await refetch();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  const handlePostSubmit = async (newPost: BlogPost) => {
    try {
      // Filter out blob URLs - they won't work in production
      let coverUrl = (newPost as any).imageUrl || (newPost as any).coverUrl || null;
      if (coverUrl && coverUrl.startsWith('blob:')) {
        coverUrl = null;
        console.warn('Blob URL detected and removed from blog post');
      }
      
      await createOrUpdate({
        id: newPost.id?.startsWith('mock') ? undefined : newPost.id,
        title: newPost.title,
        introduction: newPost.introduction,
        content: newPost.content,
        category: newPost.category,
        cover_url: coverUrl,
        isPublished: newPost.isPublished ?? false,
      });
      setView('list');
      await refetch();
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl relative"> 
      <AnimatePresence mode="wait">
        <motion.div key={view} className="w-full">
          {view === 'list' ? (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <BlogHeader
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                onSearch={handleSearch}
                itemCount={filteredPosts.length}
              />
              <BlogList
                filteredPosts={filteredPosts}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onView={handleViewPost}
              />
            </motion.div>
          ) : view === 'creator' ? (
            <BlogCreatorPage
                onBack={handleBackToList}
                onSubmit={handlePostSubmit}
                initialPost={editingPost}
            />
          ) : (
            <BlogViewer
              post={viewingPost!}
              onBack={handleBackToList}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      {view === 'list' && (
        <BlogFAB onActionClick={handleNewPost} />
      )}
    </div>
  );
};

export default BlogPage;
