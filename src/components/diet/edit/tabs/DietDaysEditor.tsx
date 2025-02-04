import React, {useState} from "react";
import {Diet, DietTemplate, MealType, Recipe, ShoppingList} from "../../../../types";
import {toast} from "sonner";
import {useMealConfiguration} from "../../../../hooks/useMealConfiguration";
import {doc, Timestamp, updateDoc} from "firebase/firestore";
import {getMealTypeLabel} from "../../../../utils/mealTypeUtils";
import {Clock, MinusCircle, PlusCircle} from "lucide-react";
import {dateToString, formatDate} from "../../../../utils/dateFormatters";
import {useConfirmation} from "../../../../hooks/useConfirmation";
import ConfirmationDialog from "../../../common/ConfirmationDialog";
import {db} from "../../../../config/firebase";

interface DietDaysEditorProps {
    diet: Diet;
    recipes: { [key: string]: Recipe };
    shoppingList: ShoppingList | null;
    onUpdate: (updatedDiet: Diet) => Promise<void>;
}

interface TimeChangeData {
    dayIndex: number;
    mealIndex: number;
    newTime: string;
}

interface ConfigurationChangeData {
    updatedDays: Diet['days'];
}

interface DateChangeData {
    newDateStr: string;
}

const DietDaysEditor: React.FC<DietDaysEditorProps> = ({
                                                           diet,
                                                           recipes,
                                                           shoppingList,
                                                           onUpdate
                                                       }) => {
    const [expandedDays, setExpandedDays] = useState<number[]>([0]);
    const [mealConfig, setMealConfig] = useState<DietTemplate>({
        mealsPerDay: diet.days[0].meals.length,
        startDate: diet.days[0].date,
        duration: diet.days.length,
        mealTimes: diet.days[0].meals.reduce((acc, meal, index) => ({
            ...acc,
            [`meal_${index}`]: meal.time
        }), {}),
        mealTypes: diet.days[0].meals.map(meal => meal.mealType)
    });

    const {
        handleMealTypeChange,
        handleMealTimeChange,
        applyMealConfiguration
    } = useMealConfiguration(mealConfig, setMealConfig);

    const {
        isConfirmationOpen: isTimeChangeConfirmationOpen,
        confirmationData: timeChangeData,
        openConfirmation: openTimeChangeConfirmation,
        closeConfirmation: closeTimeChangeConfirmation
    } = useConfirmation<TimeChangeData>();

    const {
        isConfirmationOpen: isConfigurationConfirmationOpen,
        confirmationData: configurationChangeData,
        openConfirmation: openConfigurationConfirmation,
        closeConfirmation: closeConfigurationConfirmation
    } = useConfirmation<ConfigurationChangeData>();

    const {
        isConfirmationOpen: isDateChangeConfirmationOpen,
        confirmationData: dateChangeData,
        openConfirmation: openDateChangeConfirmation,
        closeConfirmation: closeDateChangeConfirmation
    } = useConfirmation<DateChangeData>();

    const handleApplyConfiguration = async () => {
        try {
            const updatedDays = applyMealConfiguration(diet.days);
            openConfigurationConfirmation({updatedDays});
        } catch (error) {
            toast.error('Błąd podczas przygotowywania konfiguracji');
            console.error('Error preparing configuration:', error);
        }
    };

    const handleConfirmConfiguration = async () => {
        if (!configurationChangeData) return;

        try {
            await onUpdate({
                ...diet,
                days: configurationChangeData.updatedDays
            });
            toast.success('Konfiguracja posiłków została zaktualizowana');
            closeConfigurationConfirmation();
        } catch (error) {
            toast.error('Błąd podczas aktualizacji konfiguracji');
            console.error('Error applying configuration:', error);
        }
    };

    const toggleDay = (dayIndex: number) => {
        setExpandedDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(i => i !== dayIndex)
                : [...prev, dayIndex]
        );
    };

    const handleTimeChange = (dayIndex: number, mealIndex: number, newTime: string) => {
        openTimeChangeConfirmation({dayIndex, mealIndex, newTime});
    };

    const handleConfirmTimeChange = async () => {
        if (!timeChangeData) return;

        try {
            const updatedDays = [...diet.days];
            updatedDays[timeChangeData.dayIndex].meals[timeChangeData.mealIndex].time = timeChangeData.newTime;

            await onUpdate({
                ...diet,
                days: updatedDays
            });
            closeTimeChangeConfirmation();
        } catch (error) {
            toast.error('Błąd podczas aktualizacji czasu posiłku');
            console.error('Error changing time:', error);
        }
    };

    const handleStartDateChange = (newDateStr: string) => {
        openDateChangeConfirmation({newDateStr});
    };

    const handleConfirmDateChange = async () => {
        if (!dateChangeData) return;

        try {
            const startDate = new Date(dateChangeData.newDateStr);
            const updatedDays = diet.days.map((day, index) => {
                const newDate = new Date(startDate);
                newDate.setDate(startDate.getDate() + index);
                return {
                    ...day,
                    date: Timestamp.fromDate(newDate)
                };
            });

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + diet.days.length - 1);

            await onUpdate({
                ...diet,
                days: updatedDays
            });

            if (shoppingList?.id) {
                const shoppingListRef = doc(db, 'shopping_lists', shoppingList.id);
                await updateDoc(shoppingListRef, {
                    startDate: Timestamp.fromDate(startDate),
                    endDate: Timestamp.fromDate(endDate)
                });
                toast.success('Daty zostały zaktualizowane w diecie i liście zakupów');
            } else {
                toast.success('Daty zostały zaktualizowane');
            }

            closeDateChangeConfirmation();
        } catch (error) {
            console.error('Error updating dates:', error);
            toast.error('Błąd podczas aktualizacji dat');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                    Konfiguracja posiłków
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({length: mealConfig.mealsPerDay}).map((_, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Typ posiłku {index + 1}
                                </label>
                                <select
                                    value={mealConfig.mealTypes[index]}
                                    onChange={(e) => handleMealTypeChange(index, e.target.value as MealType)}
                                    className="mt-1 w-full rounded-md border-gray-300"
                                >
                                    {Object.values(MealType).map((type) => (
                                        <option key={type} value={type}>
                                            {getMealTypeLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Godzina
                                </label>
                                <input
                                    type="time"
                                    value={mealConfig.mealTimes[`meal_${index}`]}
                                    onChange={(e) => handleMealTimeChange(index, e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleApplyConfiguration}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Zastosuj konfigurację do wszystkich dni
                </button>
            </div>

            {/* Sekcja daty rozpoczęcia */}
            <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                    Data rozpoczęcia diety
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={dateToString(diet.days[0].date)}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                Zmiana daty rozpoczęcia automatycznie zaktualizuje wszystkie kolejne dni dla całej diety jak i listy zakupów przypisanej do niej
            </span>
                    </div>
                </div>
            </div>

            {/* Lista dni */}
            <div className="space-y-4">
                {diet.days.map((day, dayIndex) => (
                    <div
                        key={dayIndex}
                        className="border rounded-lg overflow-hidden"
                    >
                        {/* Nagłówek dnia */}
                        <div
                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                            onClick={() => toggleDay(dayIndex)}
                        >
                            <div className="flex items-center gap-4">
                                <span className="font-medium">Dzień {dayIndex + 1}</span>
                                <span className="text-gray-600">
                                        {formatDate(day.date)}
                                    </span>
                            </div>
                            {expandedDays.includes(dayIndex) ? (
                                <MinusCircle className="h-5 w-5 text-gray-400"/>
                            ) : (
                                <PlusCircle className="h-5 w-5 text-gray-400"/>
                            )}
                        </div>

                        {/* Zawartość dnia */}
                        {expandedDays.includes(dayIndex) && (
                            <div className="p-4 space-y-3">
                                {day.meals.map((meal, mealIndex) => {
                                    const recipe = recipes[meal.recipeId];
                                    return (
                                        <div
                                            key={mealIndex}
                                            className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
                                        >
                                            {/* Czas posiłku */}
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400"/>
                                                <input
                                                    type="time"
                                                    value={meal.time}
                                                    onChange={(e) => handleTimeChange(dayIndex, mealIndex, e.target.value)}
                                                    className="border rounded px-2 py-1"
                                                />
                                            </div>

                                            {/* Informacje o przepisie */}
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {recipe?.name || 'Przepis niedostępny'}
                                                </div>
                                                {recipe?.nutritionalValues && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {recipe.nutritionalValues.calories} kcal |
                                                        B: {recipe.nutritionalValues.protein}g |
                                                        T: {recipe.nutritionalValues.fat}g |
                                                        W: {recipe.nutritionalValues.carbs}g
                                                    </div>
                                                )}
                                            </div>

                                            {/* Typ posiłku */}
                                            <div className="text-sm text-gray-500">
                                                {getMealTypeLabel(meal.mealType)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmationDialog
                isOpen={isTimeChangeConfirmationOpen}
                onClose={closeTimeChangeConfirmation}
                onConfirm={handleConfirmTimeChange}
                title="Potwierdź zmianę czasu"
                description="Czy na pewno chcesz zmienić czas tego posiłku?"
                confirmLabel="Zmień czas"
                variant="warning"
            />

            <ConfirmationDialog
                isOpen={isConfigurationConfirmationOpen}
                onClose={closeConfigurationConfirmation}
                onConfirm={handleConfirmConfiguration}
                title="Potwierdź zmianę konfiguracji"
                description="Czy na pewno chcesz zastosować nową konfigurację posiłków do wszystkich dni? Ta akcja zaktualizuje typy i czasy posiłków dla całej diety."
                confirmLabel="Zastosuj zmiany"
                variant="warning"
            />

            <ConfirmationDialog
                isOpen={isDateChangeConfirmationOpen}
                onClose={closeDateChangeConfirmation}
                onConfirm={handleConfirmDateChange}
                title="Potwierdź zmianę daty"
                description="Czy na pewno chcesz zmienić datę rozpoczęcia diety? Ta akcja zaktualizuje daty wszystkich dni."
                confirmLabel="Zmień datę"
                variant="warning"
            />
        </div>
    );
};

export default DietDaysEditor;