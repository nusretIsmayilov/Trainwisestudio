'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FilePlus2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Constants
const SIZE = 64; 
const MARGIN = 24; 

interface BlogFABProps {
  onActionClick: () => void; 
}

export default function BlogFAB({ onActionClick }: BlogFABProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const movedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const translateRef = useRef({ x: 0, y: 0 });

  const [pos, setPos] = useState<{ left: number; top: number } | null>(null); 
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null);

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
    onActionClick();
  };

  if (!pos) return null;

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
        
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            size="icon"
            className="rounded-full w-16 h-16 shadow-2xl z-10 cursor-grab active:cursor-grabbing bg-primary hover:bg-primary/90 transition-colors"
            onPointerDown={onPointerDownMain}
            onClick={onClickMain}
            aria-label="Create new blog post"
          >
            <FilePlus2 className="h-8 w-8 text-primary-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
