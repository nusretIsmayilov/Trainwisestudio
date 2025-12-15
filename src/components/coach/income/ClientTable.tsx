'use client';

import React from 'react';
export interface ClientEarningUI {
  id: string;
  name: string;
  totalEarnings: number;
  activeContracts: number;
  lastPaymentDate: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, DollarSign, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClientTableProps { earnings: ClientEarningUI[]; }

const ClientTable: React.FC<ClientTableProps> = ({ earnings }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {t('income.clientIncomeBreakdown')} 🤝
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[150px]"><User className="h-4 w-4 inline mr-1" /> {t('income.client')}</TableHead>
                <TableHead><DollarSign className="h-4 w-4 inline mr-1" /> {t('income.totalEarned')}</TableHead>
                <TableHead>{t('income.contracts')}</TableHead>
                <TableHead><Calendar className="h-4 w-4 inline mr-1" /> {t('income.lastPayout')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((client) => (
                <TableRow key={client.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-semibold">{client.name}</TableCell>
                  <TableCell className="text-green-600 font-medium">${client.totalEarnings.toFixed(2)}</TableCell>
                  <TableCell>{client.activeContracts}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(client.lastPaymentDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientTable;
