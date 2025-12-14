'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell, Utensils, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryCategory } from '@/mockdata/library/mockLibrary';

// Constants
const SIZE = 64; 
const MARGIN = 24; 
const ACTION_MARGIN = 16; 
const ACTION_WIDTH = 200; // Keep this wide enough for the content

// Updated Actions for better fit and consistency (shortened text slightly)
const ACTIONS: { label: string; icon: React.ElementType; category: LibraryCategory }[] = [
  { label: 'Create Fitness 💪', icon: Dumbbell, category: 'exercise' },
  { label: 'Create Recipe 🍎', icon: Utensils, category: 'recipe' },
  { label: 'Create Wellness 🧘', icon: Feather, category: 'mental health' },
];

interface LibraryFABProps {
  onActionClick: (category: LibraryCategory) => void;
}

export default function LibraryFAB({ onActionClick }: LibraryFABProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const movedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const translateRef = useRef({ x: 0, y: 0 });

  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null); 
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

  // Init position & resize handler
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updatePosition = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setViewport({ w: vw, h: vh });
      setPos({ left: vw - SIZE - MARGIN, top: vh - SIZE - MARGIN });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Drag logic (omitted for brevity, assume previous version is here)
  const onPointerDownMain = (e: React.PointerEvent) => {
    if (!pos) return;
    draggingRef.current = true;
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, left: pos.left, top: pos.top };
    translateRef.current = { x: 0, y: 0 };
    
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const onPointerMove = (ev: PointerEvent) => {
      if (!draggingRef.current) return;
      movedRef.current = Math.hypot(ev.clientX - startRef.current.x, ev.clientY - startRef.current.y) > 3;

      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rawLeft = startRef.current.left + dx;
      const rawTop = startRef.current.top + dy;
      const clampedLeft = Math.min(Math.max(MARGIN, rawLeft), vw - SIZE - MARGIN);
      const clampedTop = Math.min(Math.max(MARGIN, rawTop), vh - SIZE - MARGIN);

      translateRef.current = { x: clampedLeft - startRef.current.left, y: clampedTop - startRef.current.top };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (innerRef.current) {
          innerRef.current.style.transform = `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0)`;
        }
      });
    };

    const onPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      setPos((prev) => {
        if (!prev) return prev;
        const newLeft = prev.left + translateRef.current.x;
        const newTop = prev.top + translateRef.current.y;
        if (innerRef.current) innerRef.current.style.transform = 'none';
        return { left: newLeft, top: newTop };
      });

      setTimeout(() => (movedRef.current = false), 50);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const onClickMain = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
      return;
    }
    setIsOpen((s) => !s);
  };

  const handleAction = (category: LibraryCategory) => {
    setIsOpen(false);
    onActionClick(category);
  };

  if (!pos) return null;

  const bubbleAlignment = 'right';
  const actionContainerX = -(ACTION_WIDTH - SIZE);
  const labelTranslate = ACTION_WIDTH; 

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        right: MARGIN, 
        bottom: MARGIN, 
        width: SIZE,
        height: SIZE,
        touchAction: 'none',
        zIndex: 999,
      }}
    >
      <div 
        ref={innerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative', 
          transform: `translate3d(${pos.left - (window.innerWidth - SIZE - MARGIN)}px, ${pos.top - (window.innerHeight - SIZE - MARGIN)}px, 0)`,
          transition: draggingRef.current ? 'none' : 'transform 100ms ease-out',
        }}>
        
        {/* Actions */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute flex flex-col gap-3 select-none"
              style={{
                bottom: SIZE + ACTION_MARGIN,
                [bubbleAlignment]: 0, 
                transform: `translateX(${actionContainerX}px)`,
                maxWidth: ACTION_WIDTH,
                minWidth: ACTION_WIDTH,
              }}
            >
              {ACTIONS.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.category}
                    initial={{ opacity: 0, x: labelTranslate }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: labelTranslate }}
                    transition={{ duration: 0.2, delay: (ACTIONS.length - 1 - index) * 0.05 }} 
                    className="flex items-center justify-end"
                  >
                    {/* KEY FIX: Added whitespace-nowrap */}
                    <span className="text-sm bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-xl border border-border/50 font-medium text-foreground whitespace-nowrap">
                      {action.label}
                    </span>
                    <Button
                      size="icon"
                      className="rounded-full w-12 h-12 shadow-xl ml-3 bg-primary hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(action.category);
                      }}
                      aria-label={action.label}
                    >
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            size="icon"
            className="rounded-full w-16 h-16 shadow-2xl z-10 cursor-grab active:cursor-grabbing bg-primary hover:bg-primary/90 transition-colors"
            onPointerDown={onPointerDownMain}
            onClick={onClickMain}
            aria-label="Library creation actions"
          >
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
              <Plus className="h-8 w-8 text-primary-foreground" />
            </motion.div>
          </Button>
        </div>
      </div>
    </div>
  );
}
