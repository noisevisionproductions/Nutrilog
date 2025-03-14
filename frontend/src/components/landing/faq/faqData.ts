export interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export const faqItems: FAQItem[] = [
    {
        id: 1,
        question: "Jak mogę rozpocząć korzystanie z NutriLog?",
        answer: "Obecnie zbieramy listę zainteresowanych osób, aby dostosować system do potrzeb rynku. Zapisz się do newslettera, a poinformujemy Cię o starcie platformy i damy dostęp do wersji beta z dodatkowymi korzyściami dla pierwszych użytkowników."
    },
    {
        id: 2,
        question: "Czy mogę dostosować system do mojej marki?",
        answer: "Tak, NutriLog będzie oferował możliwość white-label, co oznacza, że możesz dostosować wygląd systemu do swojej marki - włączając logo, kolory i domenę."
    },
    {
        id: 3,
        question: "Czy system będzie działał na urządzeniach mobilnych?",
        answer: "Tak, NutriLog jest projektowany z myślą o responsywności. Zarówno panel dietetyka jak i interfejs klienta będą w pełni funkcjonalne na wszystkich urządzeniach - komputerach, tabletach i telefonach."
    },
    {
        id: 4,
        question: "Jakie wsparcie techniczne będzie dostępne?",
        answer: "Planujemy zapewnić kompleksowe wsparcie techniczne poprzez czat, email oraz bazę wiedzy z tutorialami. Dla większych klientów przewidujemy dedykowane wsparcie i szkolenia."
    },
    {
        id: 5,
        question: "Czy będzie możliwość importu danych z innych systemów?",
        answer: "Tak, planujemy funkcję importu danych klientów i diet z popularnych formatów (CSV, Excel) oraz integracje z najpopularniejszymi systemami do zarządzania dietami."
    },
    {
        id: 6,
        question: "Jak wygląda kwestia bezpieczeństwa danych?",
        answer: "Bezpieczeństwo danych jest naszym priorytetem. System będzie zgodny z RODO, a dane będą szyfrowane i przechowywane na bezpiecznych serwerach w UE. Nie będziemy mieli możliwości wglądu do wrażliwych danych dietetyków i ich klientów."
    }
];