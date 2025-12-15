import { useState, useEffect } from 'react';

export interface CurrencyOption {
  value: string;
  label: string;
  price: string;
  symbol: string;
  country: string;
}

export const useCurrencyDetection = () => {
  const [detectedCurrency, setDetectedCurrency] = useState<string>('usd');
  const [loading, setLoading] = useState(true);

  const currencyOptions: CurrencyOption[] = [
    { value: 'usd', label: 'USD - $49.99/month', price: '$49.99', symbol: '$', country: 'US' },
    { value: 'nok', label: 'NOK - 299 kr/month', price: '299 kr', symbol: 'kr', country: 'NO' },
    { value: 'sek', label: 'SEK - 299 kr/month', price: '299 kr', symbol: 'kr', country: 'SE' },
    { value: 'dkk', label: 'DKK - 199 kr/month', price: '199 kr', symbol: 'kr', country: 'DK' },
    { value: 'eur', label: 'EUR - €39.99/month', price: '€39.99', symbol: '€', country: 'EU' },
    { value: 'gbp', label: 'GBP - £34.99/month', price: '£34.99', symbol: '£', country: 'GB' },
  ];

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setLoading(true);
        
        // Try to get user's location via Supabase Edge Function
        const { config } = await import('@/lib/config');
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${config.api.baseUrl}/geolocation`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'apikey': config.supabase.anonKey,
          },
        });
        const data = await response.json();
        
        const countryCode = data.country_code?.toLowerCase();
        
        // Map country codes to currencies
        const countryToCurrency: Record<string, string> = {
          'us': 'usd',
          'no': 'nok',
          'se': 'sek',
          'dk': 'dkk',
          'de': 'eur',
          'fr': 'eur',
          'it': 'eur',
          'es': 'eur',
          'nl': 'eur',
          'at': 'eur',
          'be': 'eur',
          'fi': 'eur',
          'ie': 'eur',
          'pt': 'eur',
          'gb': 'gbp',
          // Default to USD for other countries
        };

        const detected = countryToCurrency[countryCode] || 'usd';
        setDetectedCurrency(detected);
      } catch (error) {
        console.error('Error detecting currency:', error);
        // Fallback to USD if detection fails
        setDetectedCurrency('usd');
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const getCurrencyOption = (currency: string) => {
    return currencyOptions.find(option => option.value === currency) || currencyOptions[0];
  };

  return {
    detectedCurrency,
    currencyOptions,
    getCurrencyOption,
    loading
  };
};
