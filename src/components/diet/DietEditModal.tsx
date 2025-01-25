import React, {useState, useEffect} from 'react';
import {Diet, Recipe} from '../../types/diet';
import {toast} from 'sonner';
import {X, Trash2} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";
import {doc, updateDoc, deleteDoc, getDoc} from 'firebase/firestore';
import {db} from '../../config/firebase';
import LoadingSpinner from '../common/LoadingSpinner';

interface DietEditModalProps {
    diet: Diet;
    onClose: () => void;
    onUpdate: () => Promise<void>;
}

const DietEditModal: React.FC<DietEditModalProps> = ({
                                                         diet,
                                                         onClose,
                                                         onUpdate
                                                     }) => {
    const [loading, setLoading] = useState(false);
    const [editedDiet, setEditedDiet] = useState<Diet>(diet);
    const [recipes, setRecipes] = useState<{ [key: string]: Recipe }>({});
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                if (!diet.days || diet.days.length === 0) {
                    setIsLoadingRecipes(false);
                    return;
                }

                const recipeIds = new Set(
                    diet.days.flatMap(day =>
                        day.meals?.map(meal => meal.recipeId) || []
                    )
                );

                const recipesData: { [key: string]: Recipe } = {};
                for (const id of recipeIds) {
                    if (!id) continue;

                    const docs = await getDoc(doc(db, 'recipes', id));
                    if (docs.exists()) {
                        recipesData[id] = {id: docs.id, ...docs.data()} as Recipe;
                    }
                }
                setRecipes(recipesData);
            } catch (error) {
                console.error('Error fetching recipes:', error);
                toast.error('Błąd podczas pobierania przepisów');
            } finally {
                setIsLoadingRecipes(false);
            }
        };

        fetchRecipes().catch();
    }, [diet]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const dietRef = doc(db, 'diets', diet.id);
            await updateDoc(dietRef, {
                days: editedDiet.days,
                updatedAt: new Date()
            });
            await onUpdate();
            toast.success('Dieta została zaktualizowana');
            onClose();
        } catch (error) {
            console.error('Error updating diet:', error);
            toast.error('Błąd podczas aktualizacji diety');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            await deleteDoc(doc(db, 'diets', diet.id));
            await onUpdate();
            toast.success('Dieta została usunięta');
            onClose();
        } catch (error) {
            console.error('Error deleting diet:', error);
            toast.error('Błąd podczas usuwania diety');
        } finally {
            setLoading(false);
        }
    };

    const handleMealTimeUpdate = (dayIndex: number, mealIndex: number, newTime: string) => {
        const updatedDiet = {...editedDiet};
        if (updatedDiet.days?.[dayIndex]?.meals?.[mealIndex]) {
            updatedDiet.days[dayIndex].meals[mealIndex].time = newTime;
            setEditedDiet(updatedDiet);
        }
    };

    const handleDateUpdate = (dayIndex: number, newDate: string) => {
        const updatedDiet = {...editedDiet};
        if (updatedDiet.days?.[dayIndex]) {
            updatedDiet.days[dayIndex].date = newDate;
            setEditedDiet(updatedDiet);
        }
    };

    const renderContent = () => {
        if (isLoadingRecipes) {
            return (
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            );
        }

        if (!editedDiet.days || editedDiet.days.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    Brak przypisanych dni do tej diety.
                </div>
            );
        }

        return editedDiet.days.map((day, dayIndex) => (
            <div key={dayIndex} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-lg font-medium">Dzień {dayIndex + 1}</h3>
                    <input
                        type="date"
                        value={day.date}
                        onChange={(e) => handleDateUpdate(dayIndex, e.target.value)}
                        className="border rounded-md px-2 py-1"
                    />
                </div>

                <div className="space-y-4">
                    {day.meals?.map((meal, mealIndex) => (
                        <div key={mealIndex} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <input
                                    type="time"
                                    value={meal.time}
                                    onChange={(e) => handleMealTimeUpdate(dayIndex, mealIndex, e.target.value)}
                                    className="border rounded-md px-2 py-1"
                                />
                                <span className="font-medium">
                                    {recipes[meal.recipeId]?.name || 'Przepis niedostępny'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                <SheetHeader>
                    <div className="flex justify-between items-center border-b pb-4">
                        <SheetTitle>Edycja Diety</SheetTitle>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-6 w-6"/>
                        </button>
                    </div>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {renderContent()}

                    <div className="flex justify-between items-center pt-4 border-t">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                                ${deleteConfirm
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'text-red-600 hover:text-red-700'}`}
                        >
                            <Trash2 className="h-5 w-5"/>
                            {deleteConfirm ? 'Potwierdź usunięcie' : 'Usuń dietę'}
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || !editedDiet.days?.length}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default DietEditModal;