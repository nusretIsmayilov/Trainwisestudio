import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { useTranslation } from 'react-i18next';

const PaymentHistoryTable = () => {
  const { paymentHistory, loading } = usePaymentHistory();
  const { t } = useTranslation();
  return (
    <Card className="shadow-md rounded-2xl p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-semibold">{t('profile.paymentHistory')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-4">{t('profile.loadingPaymentHistory')}</div>
        ) : paymentHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('profile.date')}</TableHead>
                <TableHead>{t('profile.description')}</TableHead>
                <TableHead>{t('profile.amount')}</TableHead>
                <TableHead>{t('profile.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>
                    <span className={`capitalize ${
                      item.status === 'succeeded' ? 'text-green-600' : 
                      item.status === 'failed' ? 'text-red-600' : 
                      item.status === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">{t('profile.noPaymentHistory')}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryTable;
