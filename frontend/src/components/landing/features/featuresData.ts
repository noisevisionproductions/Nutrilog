import {
    ArrowsPointingInIcon,
    ChartBarIcon,
    DevicePhoneMobileIcon,
    DocumentTextIcon,
    ListBulletIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import * as React from "react";

export interface Feature {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    status?: 'available' | 'coming_soon';
}

export const features: Feature[] = [
    {
        id: 1,
        title: "Import diet z plików Excel",
        description: "Automatycznie przetwarzaj istniejące plany dietetyczne z Excela do formatu cyfrowego bez ręcznego przepisywania.",
        icon: ArrowsPointingInIcon,
        status: 'available'
    },
    {
        id: 2,
        title: "Gotowe listy zakupów",
        description: "System automatycznie generuje listy zakupów na podstawie diet, oszczędzając czas Tobie i Twoim klientom.",
        icon: ListBulletIcon,
        status: 'available'
    },
    {
        id: 3,
        title: "Zarządzanie klientami",
        description: "Przypisuj diety do klientów, śledź ich postępy i zarządzaj danymi w jednym miejscu.",
        icon: UserGroupIcon,
        status: 'available'
    },
    {
        id: 4,
        title: "Aplikacja mobilna dla klientów",
        description: "Twoi klienci mają stały dostęp do swoich diet, przepisów i list zakupów w intuicyjnej aplikacji mobilnej.",
        icon: DevicePhoneMobileIcon,
        status: 'available'
    },
    {
        id: 5,
        title: "Raporty i statystyki",
        description: "Podstawowe statystyki dotyczące klientów i ich diet, pomagające podejmować lepsze decyzje biznesowe.",
        icon: ChartBarIcon,
        status: 'available'
    },
    {
        id: 6,
        title: "Baza wiedzy i szablony",
        description: "Rozwijana baza wiedzy z szablonami diet i materiałami edukacyjnymi dla dietetyków.",
        icon: DocumentTextIcon,
        status: 'available'
    }
];