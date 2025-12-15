'use client';

import React, { useState } from 'react';
import { Search, Filter, X, Zap, Utensils, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LibraryCategory } from '@/mockdata/library/mockLibrary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface LibraryHeaderProps {
  activeCategory: LibraryCategory | null;
  onCategoryChange: (cat: LibraryCategory | null) => void;
  onSearch: (term: string) => void;
  itemCount: number;
  totalItemCount: number;
}

const CATEGORY_MAP: { [key in LibraryCategory]: { label: string; emoji: string; icon: React.ElementType } } = {
  'exercise': { label: 'Fitness 💪', emoji: '💪', icon: Zap },
  'recipe': { label: 'Recipes 🍎', emoji: '🍎', icon: Utensils },
  'mental health': { label: 'Wellness 🧘', emoji: '🧘', icon: Heart },
};
const allCategories: LibraryCategory[] = ['exercise', 'recipe', 'mental health'];

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  activeCategory,
  onCategoryChange,
  onSearch,
  itemCount,
}) => {
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

  const activeCategoryLabel = activeCategory ? CATEGORY_MAP[activeCategory].label : 'All Content ✨';

  return (
    // Reduced horizontal padding on desktop to match LibraryPage.tsx p-6
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-30 pt-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6">
      
      {/* Reduced Title Size: text-4xl -> text-3xl */}
      <h1 className="text-3xl font-extrabold mb-3 text-center md:text-left">{t('library.title')} {activeCategory ? CATEGORY_MAP[activeCategory].emoji : '📚'}</h1>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Main Search Input (Reduced Height: h-14 -> h-11, icon size, text size) */}
        <div className="relative flex-grow">
          {/* Reduced icon size: h-5 w-5 -> h-4 w-4 */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('library.searchPlaceholder', { category: activeCategory ? CATEGORY_MAP[activeCategory].label : t('library.allContent') })}
            // Reduced height: h-14 -> h-11. Reduced font: text-base -> text-sm. Reduced padding: pl-12 -> pl-10
            className="w-full pl-10 pr-10 h-11 rounded-xl border-2 shadow-inner bg-card/80 transition-all text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              // Reduced size: w-10 h-10 -> w-9 h-9
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-muted-foreground hover:bg-muted"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter/Category Button (Reduced Height: h-14 -> h-11, icon size) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              // Reduced height: h-14 -> h-11
              className={cn("h-11 rounded-xl flex-shrink-0 border-2 px-4 space-x-2", 
                activeCategory ? 'border-primary text-primary hover:bg-primary/10' : 'text-foreground'
              )}
              aria-label="Filter content"
            >
              {/* Reduced icon size: h-5 w-5 -> h-4 w-4 */}
              <Filter className="h-4 w-4" />
              <span className='hidden sm:inline'>{activeCategory ? CATEGORY_MAP[activeCategory].emoji : t('library.filter')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-3 rounded-xl shadow-2xl" align="end">
            {/* Reduced font size: text-lg -> text-base */}
            <h4 className="font-bold text-base">{t('library.filterByType')} 💡</h4>
            <div className="flex flex-col gap-2">
                {/* Reduced font size: text-base -> text-sm, icon size: h-5 w-5 -> h-4 w-4 */}
                <Button
                    variant={!activeCategory ? 'default' : 'ghost'}
                    className='w-full justify-start text-sm'
                    onClick={clearCategory}
                >
                    <Zap className="h-4 w-4 mr-3" /> {t('library.allContent')}
                </Button>
              {allCategories.map((cat) => {
                const { label, icon: Icon } = CATEGORY_MAP[cat];
                return (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? 'default' : 'ghost'}
                        className='w-full justify-start text-sm'
                        onClick={() => onCategoryChange(cat)}
                    >
                        <Icon className="h-4 w-4 mr-3" /> {label}
                    </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Display (Reduced Font Sizes) */}
      <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground">
        {/* Reduced font size: text-base -> text-sm */}
        <span className="font-medium text-sm text-foreground">{itemCount} {t('library.items')}</span>
        <span className='text-lg font-light text-muted-foreground'>|</span>
        <Badge
            // Reduced padding and font size
            className={cn(
                "capitalize px-2 py-0.5 text-xs font-semibold transition-all shadow-sm",
                !activeCategory ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20 cursor-pointer'
            )}
            onClick={activeCategory ? clearCategory : undefined}
        >
            {activeCategoryLabel}
            <X className="h-3 w-3 ml-2" />
        </Badge>
      </div>
    </div>
  );
};

export default LibraryHeader;
