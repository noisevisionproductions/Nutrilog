import {Timestamp} from 'firebase/firestore';

// Kolekcja przepisów (recipes collection)
export interface Recipe {
    id: string;
    name: string;           // Nazwa przepisu
    instructions: string;   // Sposób przygotowania
    nutritionalValues: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

// Kolekcja diet (diets collection)
export interface Diet {
    id: string;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    days: Day[];
    metadata: {
        totalDays: number;
        fileName: string;
        fileUrl: string;
    }
}

// Struktura dnia z posiłkami
export interface Day {
    date: string;           // Format: "YYYY-MM-DD"
    meals: DayMeal[];      // Lista posiłków w danym dniu
}

// Posiłek w kontekście dnia
export interface DayMeal {
    recipeId: string;      // Referencja do przepisu
    mealType: MealType;    // Typ posiłku określony na podstawie godziny
    time: string;          // Godzina posiłku
    ingredients: string[]; // Lista zakupów dla konkretnego posiłku
}

export enum MealType {
    BREAKFAST = 'BREAKFAST',
    SECOND_BREAKFAST = 'SECOND_BREAKFAST',
    LUNCH = 'LUNCH',
    SNACK = 'SNACK',
    DINNER = 'DINNER'
}