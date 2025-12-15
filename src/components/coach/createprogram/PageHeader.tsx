// src/components/coach/createprogram/PageHeader.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  onSave: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, onSave }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <h1 className="text-4xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button size="sm" onClick={onSave} className="gap-2 text-sm">
          <Check className="h-4 w-4" /> Save Program
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
