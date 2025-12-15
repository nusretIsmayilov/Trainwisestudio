// src/components/coach/programs/ProgramsHeader.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ProgramsHeader = () => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold">{t('programs.title')}</h1>
      <p className="text-muted-foreground max-w-lg">
        {t('programs.description')}
      </p>
    </motion.div>
  );
};

export default ProgramsHeader;
