import {MealType} from "../types/diet";
import {read, utils, WorkBook} from 'xlsx';

interface ParsedMeal {
    time: string,
    mealType: MealType,
    name: string,
    instructions: string,
    nutritionalValues: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
    ingredients: string[];
}

export interface ParsedDay {
    date: string;
    meals: ParsedMeal[];
}

export class ExcelParserService {
    private static getMealType(time: string): MealType {
        const hour = parseInt(time.split(':')[0]);

        if (hour >= 6 && hour < 10) return MealType.BREAKFAST;
        if (hour >= 10 && hour < 12) return MealType.SECOND_BREAKFAST;
        if (hour >= 12 && hour < 16) return MealType.LUNCH;
        if (hour >= 16 && hour < 19) return MealType.SNACK;
        return MealType.DINNER
    }

    private static parseNutritionalValues(value: string): {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } {
        // Format: "450 kcal, 30 g białka, 12 g tłuszczu, 50 g węglowodanów"
        const values = value.split(',').map(v => parseFloat(v));
        return {
            calories: values[0] || 0,
            protein: values[1] || 0,
            fat: values[2] || 0,
            carbs: values[3] || 0
        };
    }

    static async parseDietExcel(file: File): Promise<ParsedDay[]> {
        try {
            const data = await file.arrayBuffer();
            const workbook: WorkBook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json(worksheet, {header: 1});

            const days: ParsedDay[] = [];
            let currentDay: ParsedDay | null = null;

            // Pomijamy wiersz nagłówkowy
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                if (!row[0]) continue;

                const time = row[0];
                const date = time.split(' ')[0];

                // Jeśli to nowy dzień, tworzymy nowy obiekt dnia
                if (!currentDay || currentDay.date !== date) {
                    if (currentDay) days.push(currentDay);
                    currentDay = {
                        date,
                        meals: []
                    };
                }

                if (currentDay) {
                    currentDay.meals.push({
                        time: time.split(' ')[1],
                        mealType: this.getMealType(time.split(' ')[1]),
                        name: row[1],
                        instructions: row[2],
                        nutritionalValues: this.parseNutritionalValues(row[3]),
                        ingredients: row[4]?.split(',').map((i: string) => i.trim()) || []
                    });
                }
            }

            if (currentDay) days.push(currentDay);

            return days;
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            throw new Error('Błąd podczas parsowania pliku Excel');
        }
    }
}