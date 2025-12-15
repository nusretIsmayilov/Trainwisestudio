export const theme = {
  colors: {
    typography: {
      light: {
        heading: '#111827',
        body: '#374151',
        caption: '#6B7280',
        link: '#0D9488',
      },
      dark: {
        heading: '#F9FAFB',
        body: '#D1D5DB',
        caption: '#9CA3AF',
        link: '#2DD4BF',
      },
    },
    surfaces: {
      light: {
        background: '#FEF9F1',
        card: '#FFFFFF',
        sideNav: '#FFFFFF',
        input: '#F3F4F6',
        border: '#E5E7EB',
      },
      dark: {
        background: '#0B1119',
        card: '#131B24',
        sideNav: '#0F161E',
        input: '#1F2937',
        border: '#374151',
      },
    },
    statuses: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      premium: '#8B5CF6',
    },
    buttons: {
      primary: '#0D9488',
      secondary: '#F97316',
      disabled: '#9CA3AF',
    },
    categories: {
      fitness: '#F97316',
      nutrition: '#10B981',
      mental: '#6366F1',
    },
  },
} as const;

export type Theme = typeof theme;


