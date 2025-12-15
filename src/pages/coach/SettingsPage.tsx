'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/coach/settings/ProfileSettings';
import AccountSettings from '@/components/coach/settings/AccountSettings';
import { mockAccount, CoachAccount } from '@/mockdata/settings/mockSettings';
import { User, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const [account, setAccount] = useState<CoachAccount>(mockAccount);
  const { t } = useTranslation();

  const handleAccountUpdate = useCallback((updatedAccount: CoachAccount) => {
    setAccount(updatedAccount);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold">{t('settings.coachSettings')}</h1>
        <p className="text-muted-foreground text-lg">{t('settings.description')}</p>
        <Separator className="mt-4" />
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1">
          <TabsTrigger value="profile" className="text-base h-full flex items-center gap-2 font-semibold">
            <User className="h-5 w-5" /> {t('settings.publicProfile')}
          </TabsTrigger>
          <TabsTrigger value="account" className="text-base h-full flex items-center gap-2 font-semibold">
            <Lock className="h-5 w-5" /> {t('settings.accountSecurity')}
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="account">
            <AccountSettings account={account} onUpdate={handleAccountUpdate} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
