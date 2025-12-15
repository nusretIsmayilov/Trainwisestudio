'use client';

import React, { useState } from 'react';
import { Search, Filter, X, Dumbbell, Utensils, Feather } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BlogCategory, CATEGORY_DETAILS } from '@/mockdata/blog/mockBlog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface BlogHeaderProps {
  activeCategory: BlogCategory | null;
  onCategoryChange: (cat: BlogCategory | null) => void;
  onSearch: (term: string) => void;
  itemCount: number;
}

const allCategories: BlogCategory[] = ['fitness', 'nutrition', 'mental health'];

const BlogHeader: React.FC<BlogHeaderProps> = ({ activeCategory, onCategoryChange, onSearch, itemCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const clearCategory = () => {
    onCategoryChange(null);
  };

  const activeCategoryLabel = activeCategory ? CATEGORY_DETAILS[activeCategory].label : 'All Posts ✨';

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-30 pt-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6">
      <h1 className="text-3xl font-extrabold mb-3 text-center md:text-left">{t('blog.title')} ✍️</h1>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('blog.searchPlaceholder', { category: activeCategory ? CATEGORY_DETAILS[activeCategory].label : t('blog.allPosts') })}
            className="w-full pl-10 pr-10 h-11 rounded-xl border-2 shadow-inner bg-card/80 transition-all text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-muted-foreground hover:bg-muted"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("h-11 rounded-xl flex-shrink-0 border-2 px-4 space-x-2", 
                activeCategory ? 'border-primary text-primary hover:bg-primary/10' : 'text-foreground'
              )}
              aria-label="Filter content"
            >
              <Filter className="h-4 w-4" />
              <span className='hidden sm:inline'>{activeCategory ? CATEGORY_DETAILS[activeCategory].emoji : t('blog.filter')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-3 rounded-xl shadow-2xl" align="end">
            <h4 className="font-bold text-base">{t('blog.filterByTopic')} 💡</h4>
            <div className="flex flex-col gap-2">
                <Button
                    variant={!activeCategory ? 'default' : 'ghost'}
                    className='w-full justify-start text-sm'
                    onClick={clearCategory}
                >
{t('blog.allTopics')} 📚
                </Button>
              {allCategories.map((cat) => {
                const { label, icon: Icon } = CATEGORY_DETAILS[cat];
                return (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? 'default' : 'ghost'}
                        className='w-full justify-start text-sm'
                        onClick={() => onCategoryChange(cat)}
                    >
                        <Icon className="h-4 w-4 mr-3" /> {label} {CATEGORY_DETAILS[cat].emoji}
                    </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground">
        <span className="font-medium text-sm text-foreground">{itemCount} {t('blog.posts')}</span>
        <span className='text-lg font-light text-muted-foreground'>|</span>
        <Badge
            className={cn(
                "capitalize px-2 py-0.5 text-xs font-semibold transition-all shadow-sm",
                !activeCategory ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20 cursor-pointer'
            )}
            onClick={activeCategory ? clearCategory : undefined}
        >
            {activeCategoryLabel}
            {activeCategory && <X className="h-3 w-3 ml-2" />}
        </Badge>
      </div>
    </div>
  );
};

export default BlogHeader;
