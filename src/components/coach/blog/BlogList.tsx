'use client';

import React from 'react';
import { BlogPost } from '@/mockdata/blog/mockBlog';
import BlogCard from './BlogCard';

interface BlogListProps {
  filteredPosts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onView?: (post: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({ filteredPosts, onEdit, onDelete, onView }) => {
  if (filteredPosts.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-xl font-semibold mb-2">No Blog Posts Found 😔</p>
        <p>Start by creating a new post using the **+** button!</p>
      </div>
    );
  }

  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
      {sortedPosts.map(post => (
        <BlogCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default BlogList;
