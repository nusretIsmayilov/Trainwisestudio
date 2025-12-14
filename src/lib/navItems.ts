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
    { name: 'Home', href: '/customer/home', icon: Home, requiresAccess: 'free' },
    { name: 'My Programs', href: '/customer/programs', icon: BookOpen, requiresAccess: 'coach' },
    { name: 'Messages', href: '/customer/messages', icon: MessageSquare, requiresAccess: 'free' }, // Nav always accessible
    { name: 'My Coach', href: '/customer/my-coach', icon: Users, requiresAccess: 'free' },
    { name: 'Blog', href: '/customer/blog', icon: FileText, requiresAccess: 'payment' },
  ];

  // Add Library if user has access
  if (showLibrary) {
    baseItems.splice(2, 0, { name: 'Library', href: '/customer/library', icon: Library, conditional: true, requiresAccess: 'coach' });
  }

  // Always show Progress page - let AccessControl handle access restrictions
  const insertIndex = showLibrary ? 3 : 2; // Insert after Library or after My Programs
  baseItems.splice(insertIndex, 0, { name: 'Progress', href: '/customer/progress', icon: TrendingUp, conditional: true, requiresAccess: 'payment' });

  return baseItems;
};

// Keep the old export for backward compatibility, but it will always show library
export const customerNavItems: NavItem[] = getCustomerNavItems(true);

export const coachNavItems: NavItem[] = [
  { name: 'Home', href: '/coach/home', icon: Home },
  { name: 'Clients', href: '/coach/clients', icon: Users },
  { name: 'Programs', href: '/coach/programs', icon: Calendar },
  { name: 'Library', href: '/coach/library', icon: Library },
  { name: 'Messages', href: '/coach/messages', icon: MessageSquare },
  { name: 'Blog', href: '/coach/blog', icon: FileText },
  { name: 'Income', href: '/coach/income', icon: DollarSign },
];
