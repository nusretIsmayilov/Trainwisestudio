'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryItem, LibraryCategory } from '@/mockdata/library/mockLibrary';
import LibraryHeader from '@/components/coach/library/LibraryHeader';
import LibraryList from '@/components/coach/library/LibraryList';
import LibraryCreatorPage from './LibraryCreatorPage';
import LibraryViewer from '@/components/coach/library/LibraryViewer';
import LibraryFAB from '@/components/coach/library/LibraryFAB';
import { useCoachLibrary } from '@/hooks/useCoachLibrary';

type LibraryView = 'list' | 'creator' | 'viewer';

const LibraryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { items, refetch, removeItem } = useCoachLibrary();
  const [libraryData, setLibraryData] = useState<LibraryItem[]>([]);

  useEffect(() => {
    // Map DB rows to UI LibraryItem shape; keep details in item-specific fields if present
    const mapped = (items || []).map((row: any) => {
      const base = {
        id: row.id,
        category: row.category as LibraryCategory,
        name: row.name,
        introduction: row.introduction || '',
        isCustom: true,
      } as any;
      const details = row.details || {};
      if (row.category === 'exercise') {
        return { ...base, muscleGroup: details.muscleGroup || '', howTo: details.howTo || [] } as LibraryItem;
      }
      if (row.category === 'recipe') {
        return { ...base, allergies: details.allergies || '', ingredients: details.ingredients || [], stepByStep: details.stepByStep || [] } as LibraryItem;
      }
      return { ...base, content: details.content || [] } as LibraryItem; // mental health
    });
    setLibraryData(mapped);
  }, [items]);
  const [view, setView] = useState<LibraryView>('list');
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<LibraryItem | null>(null);

  // ... (Filtering Logic remains the same)
  const filteredItems = useMemo(() => {
    return libraryData.filter(item => {
      const categoryMatch = !activeCategory || item.category === activeCategory;
      const searchMatch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.introduction.toLowerCase().includes(searchTerm.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [libraryData, activeCategory, searchTerm]);

  // ... (Handlers remain the same)
  const handleCategoryChange = useCallback((cat: LibraryCategory | null) => {
    setActiveCategory(cat);
    setSearchTerm('');
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleNewItem = (category: LibraryCategory) => {
    setEditingItem(null);
    setActiveCategory(category);
    setView('creator');
  };

  const handleEditItem = (item: LibraryItem) => {
    setEditingItem(item);
    setActiveCategory(item.category);
    setView('creator');
  };

  const handleViewItem = (item: LibraryItem) => {
    setViewingItem(item);
    setView('viewer');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingItem(null);
    setViewingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this content?')) {
      await removeItem(id);
      await refetch();
    }
  };

  const handleItemSubmit = async (_newItem: LibraryItem) => {
    // Submission handled inside creator page via hook; this page only switches back
    await refetch();
    setView('list');
  };

  return (
    // ✨ FIX: Reduced max-width from default full-container to max-w-6xl 
    // and reduced desktop padding (p-6 instead of p-8) for a tighter feel.
    <div className="container mx-auto p-4 md:p-6 **max-w-6xl** relative"> 
      <AnimatePresence mode="wait">
        <motion.div key={view} className="w-full">
          {view === 'list' ? (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <LibraryHeader
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                onSearch={handleSearch}
                itemCount={filteredItems.length}
                totalItemCount={libraryData.length}
              />
              <LibraryList
                filteredItems={filteredItems}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onView={handleViewItem}
              />
            </motion.div>
          ) : view === 'creator' ? (
            <LibraryCreatorPage
              onBack={handleBackToList}
              onSubmit={handleItemSubmit}
              initialItem={editingItem ?? undefined}
              activeCategory={activeCategory || 'exercise'}
            />
          ) : (
            <LibraryViewer
              item={viewingItem!}
              onBack={handleBackToList}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button (FAB) in the corner */}
      {view === 'list' && (
        <LibraryFAB onActionClick={handleNewItem} />
      )}
    </div>
  );
};

export default LibraryPage;
