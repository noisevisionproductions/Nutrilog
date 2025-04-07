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
    },
    {
        id: 7,
        question: "Czym NutriLog wyróżnia się na tle konkurencji?",
        answer: "NutriLog wyróżnia się wykorzystaniem najnowocześniejszych technologii zarówno w panelu dietetyka, jak i aplikacji dla klientów. Cały system jest zoptymalizowany pod kątem wydajności, co zapewnia płynne działanie bez zawieszania się czy crashów, nawet przy dużym obciążeniu. Dzięki starannie zaprojektowanej architekturze i rygorystycznym testom, oferujemy niezawodne narzędzie, które pozwala dietetykom skupić się na pracy z klientami, a nie na problemach technicznych."
    },
    {
        id: 8,
        question: "Dlaczego start platformy tak późno?",
        answer: "NutriLog jest w zaawansowanej fazie rozwoju. Skupiamy się na jakości i konsultacjach z ekspertami, aby stworzyć naprawdę użyteczne narzędzie dla dietetyków. Naszym celem jest stworzenie funkcjonalnej, skalowalnej platformy, która rzeczywiście rozwiązuje problemy branży. Zapraszamy do udziału w procesie rozwoju poprzez ankiety z newslettera lub bezpośredni kontakt z nami."
    }
];