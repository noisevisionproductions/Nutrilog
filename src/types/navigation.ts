import { LucideIcon } from 'lucide-react';

export type NavItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
};

export type TabName = 'upload' | 'data' | 'users' | 'settings';