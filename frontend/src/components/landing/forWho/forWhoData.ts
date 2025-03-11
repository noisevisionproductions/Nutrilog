import {
    UserIcon,
    BuildingOfficeIcon,
    AcademicCapIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import React from "react";

export interface UserType {
    id: number;
    title: string;
    description: string;
    benefits: string[];
    icon: React.ElementType;
    primary?: boolean;
}

export const userTypes: UserType[] = [
    {
        id: 1,
        title: "Indywidualni dietetycy",
        description: "Prowadzisz własną praktykę dietetyczną i szukasz narzędzia do efektywnej pracy z klientami?",
        icon: UserIcon,
        benefits: [
            "Automatyzacja rutynowych zadań",
            "Profesjonalny wizerunek",
            "Łatwe zarządzanie dietami",
            "Więcej czasu na pracę z klientami",
            "Monitorowanie postępów klientów"
        ],
        primary: true
    },
    {
        id: 2,
        title: "Gabinety i kliniki",
        description: "Zarządzasz zespołem dietetyków i potrzebujesz systemu do koordynacji ich pracy?",
        icon: BuildingOfficeIcon,
        benefits: [
            "Zarządzanie zespołem dietetyków",
            "Centralna baza klientów",
            "Raportowanie i analityka",
            "Współdzielenie materiałów",
            "Spójny system pracy"
        ],
        primary: true
    },
    {
        id: 3,
        title: "Sieci dietetyczne",
        description: "Prowadzisz sieć gabinetów lub franczyzę i potrzebujesz skalowalnego rozwiązania?",
        icon: AcademicCapIcon,
        benefits: [
            "White label rozwiązanie",
            "Zarządzanie wieloma lokalizacjami",
            "Zaawansowana analityka",
            "Integracje z systemami",
            "Dostosowanie do marki"
        ],
        primary: true
    },
    {
        id: 4,
        title: "Klienci dietetyków",
        description: "Pracujesz z dietetykiem i potrzebujesz wygodnego dostępu do swoich planów żywieniowych?",
        icon: UserGroupIcon,
        benefits: [
            "Wygodny dostęp do diety w aplikacji mobilnej",
            "Gotowe listy zakupów na każdy dzień",
            "Monitorowanie postępów",
            "Łatwa komunikacja z dietetykiem",
            "Dostęp do przepisów i materiałów edukacyjnych"
        ]
    }
];