import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇺🇸', labelKey: 'language.english' },
  { code: 'es', flag: '🇪🇸', labelKey: 'language.spanish' },
  { code: 'fr', flag: '🇫🇷', labelKey: 'language.french' },
  { code: 'de', flag: '🇩🇪', labelKey: 'language.german' },
  { code: 'no', flag: '🇳🇴', labelKey: 'language.norwegian' },
  { code: 'sv', flag: '🇸🇪', labelKey: 'language.swedish' },
  { code: 'da', flag: '🇩🇰', labelKey: 'language.danish' },
] as const;

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((option) => ({
        ...option,
        name: t(option.labelKey),
      })),
    [t]
  );
  
  // Normalize language code (e.g., 'en-US' -> 'en')
  const currentLangCode = currentLang?.split('-')[0] || 'en';
  const currentLanguage = languageOptions.find(lang => lang.code === currentLangCode) || languageOptions[0];

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLang(languageCode);
      window.localStorage.setItem('i18nextLng', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label={t('language.select')}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('language.select')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languageOptions.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="gap-2"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {currentLangCode === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
