'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  ChevronDown,
  Filter,
  X,
  Play,
  Clock,
  Pencil,
  Tag,
  LayoutGrid,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Program, ProgramStatus, ProgramCategory } from '@/types/program';

interface ProgramsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeStatus: ProgramStatus | 'all';
  setActiveStatus: (status: ProgramStatus | 'all') => void;
  activeCategory: ProgramCategory | 'all';
  setActiveCategory: (category: ProgramCategory | 'all') => void;
}

// Options
const statusOptions = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'active', label: 'Active', icon: Play },
  { value: 'scheduled', label: 'Scheduled', icon: Clock },
  { value: 'draft', label: 'Draft', icon: Pencil },
  { value: 'normal', label: 'Normal', icon: PlusCircle },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'mental health', label: 'Mental Health' },
];

const ProgramsFilters: React.FC<ProgramsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  activeStatus,
  setActiveStatus,
  activeCategory,
  setActiveCategory, // ✅ added here
}) => {
  const getStatusLabel = (value: ProgramStatus | 'all') => {
    return statusOptions.find(opt => opt.value === value)?.label || '';
  };

  const getCategoryLabel = (value: ProgramCategory | 'all') => {
    return categoryOptions.find(opt => opt.value === value)?.label || '';
  };

  const handleClearFilter = (type: 'status' | 'category') => {
    if (type === 'status') {
      setActiveStatus('all');
    }
    if (type === 'category') {
      setActiveCategory('all');
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveStatus('all');
    setActiveCategory('all');
  };

  const isFiltered = searchQuery || activeStatus !== 'all' || activeCategory !== 'all';

  return (
    <motion.div
      className="flex flex-col gap-4 p-4 rounded-xl border-2 shadow-sm bg-background/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search programs..."
            className="w-full pl-12 pr-4 py-3 text-base rounded-full border-2 focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 rounded-full px-6 py-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setActiveStatus(option.value as typeof activeStatus)}
                className={cn(
                  'flex items-center gap-2',
                  activeStatus === option.value && 'bg-accent text-accent-foreground'
                )}
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categoryOptions.map(option => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setActiveCategory(option.value as typeof activeCategory)}
                className={cn(
                  'flex items-center gap-2',
                  activeCategory === option.value && 'bg-accent text-accent-foreground'
                )}
              >
                <Tag className="h-4 w-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Button */}
        <AnimatePresence>
          {isFiltered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                onClick={resetAllFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {activeStatus !== 'all' && (
            <motion.div
              key="status-chip"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full flex items-center gap-1"
                onClick={() => handleClearFilter('status')}
              >
                <span className="font-medium">{getStatusLabel(activeStatus)}</span>
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          )}

          {activeCategory !== 'all' && (
            <motion.div
              key="category-chip"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full flex items-center gap-1"
                onClick={() => handleClearFilter('category')}
              >
                <span className="font-medium">{getCategoryLabel(activeCategory)}</span>
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProgramsFilters;
