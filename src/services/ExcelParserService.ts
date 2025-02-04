import {read, utils, WorkBook} from 'xlsx';
import {Timestamp} from "firebase/firestore";
import {DietTemplate, MealType, ParsedDietData, ParsedMeal} from "../types";

export interface ParsedDay {
    date: Timestamp;
    meals: ParsedMeal[];
}

interface ParsedExcelResult {
    meals: ParsedMeal[];
    totalMeals: number;
    shoppingList: string[]
}

export class ExcelParserService {
    private static parseNutritionalValues(value: string | undefined): ParsedMeal['nutritionalValues'] | undefined {
        if (!value) return undefined;

        const values = value.split(',').map(v => parseFloat(v));
        if (values.length !== 4 || values.some(isNaN)) return undefined;

        return {
            calories: values[0] || 0,
            protein: values[1] || 0,
            fat: values[2] || 0,
            carbs: values[3] || 0
        };
    }

    private static extractShoppingItems(jsonData: string[][]): string[] {
        const allItems = new Set<string>;

        for (const row of jsonData) {
            if (row[3]?.trim()) {}
            const items = row[3]
                .split(',')
                .map(item => item.trim().replace(/\.$/, ''))
                .filter(item => item.length > 0);

            items.forEach(item => allItems.add(item));
        }

        return Array.from(allItems);
    }


    static async parseDietExcel(file: File): Promise<ParsedExcelResult> {
        try {
            const data = await file.arrayBuffer();
            const workbook: WorkBook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json<string[]>(worksheet, {
                header: 1,
                raw: false,
                defval: ''
            }) as string[][];

            const shoppingList = this.extractShoppingItems(jsonData);

            const meals: ParsedMeal[] = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row[1]) continue;

                meals.push({
                    name: row[1].trim(),             // Kolumna B: Nazwa
                    instructions: row[2].trim(),      // Kolumna C: Sposób przygotowania
                    ingredients: [], // Kolumna D: Lista składników
                    nutritionalValues: this.parseNutritionalValues(row[4]), // Kolumna E: Wartości odżywcze (opcjonalne)
                    mealType: MealType.BREAKFAST,    // Tymczasowo, zostanie zaktualizowane przez szablon
                    time: ''                         // Tymczasowo, zostanie zaktualizowane przez szablon
                });
            }

            return {
                meals,
                totalMeals: meals.length,
                shoppingList
            };
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            throw new Error('Błąd podczas parsowania pliku Excel');
        }
    }

    static applyTemplate(parsedExcel: ParsedExcelResult, template: DietTemplate): ParsedDietData {
        const days: ParsedDay[] = [];
        const startDate = template.startDate.toDate();
        let mealIndex = 0;

        for (let i = 0; i < template.duration; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayMeals = template.mealTypes.map((mealType, typeIndex) => {
                const meal = parsedExcel.meals[mealIndex % parsedExcel.meals.length];
                mealIndex++;

                return {
                    ...meal,
                    mealType,
                    time: template.mealTimes[`meal_${typeIndex}`]
                };
            });

            days.push({
                date: Timestamp.fromDate(currentDate),
                meals: dayMeals
            });
        }

        return {
            days,
            shoppingList: parsedExcel.shoppingList
        };
    }


    /*  private static parseIngredients(value: string): string[] {
          // Usuń kropki z końca każdego składnika
          const cleanValue = value.split(',')
              .map(item => item.trim().replace(/\.$/, ''))
              .join(',');

          const ingredients: string[] = [];
          const parts = cleanValue.split(',');
          let currentIngredient = '';

          for (const part of parts) {
              const trimmedPart = part.trim();

              // Jeśli obecny składnik jest pusty, zacznij nowy
              if (!currentIngredient) {
                  currentIngredient = trimmedPart;
                  continue;
              }

              // Sprawdź, czy ostatnie 5 znaków obecnego składnika zawiera przecinek
              const lastFiveChars = currentIngredient.slice(-5);
              if (lastFiveChars.includes(',')) {
                  // Jeśli tak, dodaj kolejną część do obecnego składnika
                  currentIngredient += ', ' + trimmedPart;
              } else {
                  // Jeśli nie, zapisz obecny składnik i zacznij nowy
                  ingredients.push(currentIngredient);
                  currentIngredient = trimmedPart;
              }
          }

          // Dodaj ostatni składnik
          if (currentIngredient) {
              ingredients.push(currentIngredient);
          }

          // Filtruj puste składniki i usuń kropki z końca
          return ingredients
              .filter(item => item.length > 0)
              .map(item => item.trim().replace(/\.$/, ''));
      }*/
}