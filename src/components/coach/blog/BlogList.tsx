'use client';

import React from 'react';
import { BlogPost } from '@/mockdata/blog/mockBlog';
import BlogCard from './BlogCard';
import { useTranslation } from 'react-i18next';

interface BlogListProps {
  filteredPosts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onView?: (post: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({ filteredPosts, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  if (filteredPosts.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p className="text-xl font-semibold mb-2">{t("no.blog.posts.found")} 😔</p>
        <p>{t("blog.add.message")}</p>
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
