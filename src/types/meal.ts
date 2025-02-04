import {NutritionalValues} from "./recipe";

export enum MealType {
    BREAKFAST = 'BREAKFAST',
    SECOND_BREAKFAST = 'SECOND_BREAKFAST',
    LUNCH = 'LUNCH',
    SNACK = 'SNACK',
    DINNER = 'DINNER'
}

export interface DayMeal {
    recipeId: string;
    mealType: MealType;
    time: string;
}

export interface ParsedMeal {
    name: string;
    instructions: string;
    ingredients: string[];
    nutritionalValues?: NutritionalValues;
    mealType: MealType;
    time: string;
}