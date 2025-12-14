'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ProfileFABProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileFAB({ isEditing, isSaving, onEdit, onSave, onCancel }: ProfileFABProps) {
  const handlePrimaryClick = () => {
    if (isSaving) return;
    if (isEditing) {
      onSave();
    } else {
      onEdit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-full shadow-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        onClick={handlePrimaryClick}
        disabled={isSaving}
        className="rounded-full px-6 py-5 shadow-xl flex items-center gap-2 bg-primary hover:bg-primary/90"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            Saving...
          </>
        ) : isEditing ? (
          <>
            <Save className="h-4 w-4 text-primary-foreground" />
            Save Changes
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 text-primary-foreground" />
            Edit Profile
          </>
        )}
      </Button>
    </div>
  );
}
