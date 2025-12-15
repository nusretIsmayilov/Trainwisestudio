'use client';

import React from 'react';
import ProgramsHeader from '@/components/coach/programs/ProgramsHeader';
import ProgramsList from '@/components/coach/programs/ProgramsList';
import ProgramActionButton from '@/components/coach/programs/ProgramActionButton';

const ProgramsPage = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <ProgramsHeader />
      <ProgramsList />
      <ProgramActionButton />
    </div>
  );
};

export default ProgramsPage;
