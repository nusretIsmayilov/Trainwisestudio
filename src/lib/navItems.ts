// src/lib/navItems.ts
import {
  Home,
  BookOpen,
  Library,
  TrendingUp,
  Users,
  Settings,
  Calendar,
  FileText,
  DollarSign,
  MessageSquare
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  conditional?: boolean; // For items that should be conditionally shown
  requiresAccess?: 'coach' | 'payment' | 'free'; // Access requirement indicator
}

export const getCustomerNavItems = (showLibrary: boolean = true, showProgress: boolean = true): NavItem[] => {
  const baseItems: NavItem[] = [
    { name: 'nav.home', href: '/customer/home', icon: Home, requiresAccess: 'free' },
    { name: 'nav.my.programs', href: '/customer/programs', icon: BookOpen, requiresAccess: 'coach' },
    { name: 'messages.title', href: '/customer/messages', icon: MessageSquare, requiresAccess: 'free' }, // Nav always accessible
    { name: 'mycoach.myCoach', href: '/customer/my-coach', icon: Users, requiresAccess: 'free' },
    { name: 'nav.blog', href: '/customer/blog', icon: FileText, requiresAccess: 'payment' },
  ];

  // Add Library if user has access
  if (showLibrary) {
    baseItems.splice(2, 0, { name: 'nav.library', href: '/customer/library', icon: Library, conditional: true, requiresAccess: 'coach' });
  }

  // Always show Progress page - let AccessControl handle access restrictions
  const insertIndex = showLibrary ? 3 : 2; // Insert after Library or after My Programs
  baseItems.splice(insertIndex, 0, { name: 'nav.progress', href: '/customer/progress', icon: TrendingUp, conditional: true, requiresAccess: 'payment' });

  return baseItems;
};

// Keep the old export for backward compatibility, but it will always show library
export const customerNavItems: NavItem[] = getCustomerNavItems(true);

export const coachNavItems: NavItem[] = [
  { name: 'nav.home', href: '/coach/home', icon: Home },
  { name: 'nav.clients', href: '/coach/clients', icon: Users },
  { name: 'nav.programs', href: '/coach/programs', icon: Calendar },
  { name: 'nav.library', href: '/coach/library', icon: Library },
  { name: 'messages.title', href: '/coach/messages', icon: MessageSquare },
  { name: 'nav.blog', href: '/coach/blog', icon: FileText },
  { name: 'nav.income', href: '/coach/income', icon: DollarSign },
];
