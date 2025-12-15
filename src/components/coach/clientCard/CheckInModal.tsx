// src/components/coach/clientCard/CheckInModal.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { X, Send } from 'lucide-react';
import useMediaQuery from '@/hooks/use-media-query';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { title: string; message: string }) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleSend = () => {
    if (title.trim() && message.trim()) {
      onSend({ title, message });
      setTitle('');
      setMessage('');
      onClose();
    }
  };

  const modalContent = (
    <div className="flex flex-col h-full min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
        <CardTitle className="text-xl md:text-2xl truncate">Send Check-in</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 space-y-4 overflow-y-auto pb-4">
        <Input
          placeholder="Check-in title (e.g., Weekly progress check)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-h-[50px] md:min-h-[60px] w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Textarea
          placeholder="Write your check-in message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 min-h-[180px] resize-none w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Footer / Send button */}
      <div className="mt-4 flex-shrink-0">
        <Button onClick={handleSend} className="w-full flex items-center justify-center" disabled={!title.trim() || !message.trim()}>
          <Send className="h-4 w-4 mr-2" /> Send Check-in
        </Button>
      </div>
    </div>
  );

  // Desktop sliding panel
  if (isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[49] bg-black/50 backdrop-blur-sm transition-opacity"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-card shadow-2xl flex flex-col"
            >
              {modalContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Mobile drawer
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} closeThreshold={0.4}>
      <DrawerContent className="h-screen rounded-t-3xl border-none bg-background flex flex-col p-4">
        {modalContent}
      </DrawerContent>
    </Drawer>
  );
};
