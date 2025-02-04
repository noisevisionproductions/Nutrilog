import React, {useEffect, useState} from "react";
import {Diet, ShoppingList, ShoppingListV2} from "../../../../types";
import {Calendar, Edit2, Info, ShoppingBag, Trash2} from "lucide-react";
import {formatDate} from "../../../../utils/dateFormatters";
import {useConfirmation} from "../../../../hooks/useConfirmation";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../../../../config/firebase";
import {toast} from "sonner";
import ConfirmationDialog from "../../../common/ConfirmationDialog";

interface DietShoppingListEditorProps {
    diet: Diet;
    shoppingList: ShoppingList | null;
    onUpdate: (updatedDiet: Diet) => Promise<void>;
}

interface EditItemData {
    index: number;
    currentValue: string;
}

const DietShoppingListEditor: React.FC<DietShoppingListEditorProps> = ({
                                                                           shoppingList: initialShoppingList
                                                                       }) => {
    const [shoppingList, setShoppingList] = useState(initialShoppingList)
    const [editingItem, setEditingItem] = useState<EditItemData | null>(null);
    const [editValue, setEditValue] = useState("");

    const {
        isConfirmationOpen: isDeleteConfirmationOpen,
        confirmationData: deleteItemIndex,
        openConfirmation: openDeleteConfirmation,
        closeConfirmation: closeDeleteConfirmation
    } = useConfirmation<number>();

    if (!shoppingList) {
        return (
            <div className="text-center py-8 text-gray-500">
                Brak listy zakupów dla tej diety
            </div>
        );
    }

    useEffect(() => {
        setShoppingList(initialShoppingList);
    }, [initialShoppingList]);

    const handleEditItem = async () => {
        if (!editingItem || !shoppingList?.id) return;

        if (editValue.trim() === (shoppingList.items[editingItem.index] as string).trim()) {
            setEditingItem(null);
            return;
        }

        if (editValue.trim() === '') {
            toast.error('Pozycja nie może być pusta')
            return;
        }

        const isDuplicate = shoppingList.items.some(
            (item, idx) => idx !== editingItem.index &&
                (item as string).trim().toLowerCase() === editValue.trim().toLowerCase()
        );
        if (isDuplicate) {
            toast.error('Taka pozycja już istnieje na liście');
            return;
        }

        try {
            let updatedItems = [...shoppingList.items];
            updatedItems[editingItem.index] = editValue;

            const shoppingListRef = doc(db, 'shopping_lists', shoppingList.id);
            await updateDoc(shoppingListRef, {items: updatedItems});

            setShoppingList(prev => prev ? {
                ...prev,
                items: updatedItems
            } as ShoppingListV2 : null);

            toast.success('Pozycja została zaktualizowana');
            setEditingItem(null);
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Błąd podczas aktualizacji pozycji');
        }
    };

    const handleDeleteItem = async () => {
        if (deleteItemIndex === undefined || !shoppingList?.id) return;

        try {
            const updatedItems = shoppingList.items.filter((_, index) => index !== deleteItemIndex);

            const shoppingListRef = doc(db, 'shopping_lists', shoppingList.id);
            await updateDoc(shoppingListRef, {items: updatedItems});

            setShoppingList(prev => prev ? {
                ...prev,
                items: updatedItems
            } as ShoppingListV2 : null);

            toast.success('Pozycja została usunięta');
            closeDeleteConfirmation();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Błąd podczas usuwania pozycji');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">Lista zakupów</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4"/>
                        {formatDate(shoppingList.startDate)} - {formatDate(shoppingList.endDate)}
                    </div>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm text-blue-700">
                        Okres listy zakupów jest automatycznie synchronizowany z datami diety.
                        Zmiana daty rozpoczęcia diety zaktualizuje również daty listy zakupów.
                    </p>
                </div>

                <div className="space-y-4">
                    {shoppingList.version === 2 ? (
                        // Nowy format (V2)
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shoppingList.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group" // Dodano justify-between i group
                                >
                                    {editingItem?.index === index ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={handleEditItem}
                                            onKeyDown={(e) => e.key === 'Enter' && handleEditItem()}
                                            className="flex-1 border rounded px-2 py-1"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag className="h-4 w-4 text-gray-400"/>
                                                <span>{item}</span>
                                            </div>
                                            <div className="hidden group-hover:flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem({index, currentValue: item});
                                                        setEditValue(item)
                                                    }}
                                                    className="p-1 text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 className="h-4 w-4"/>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmation(index)}
                                                    className="p-1 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Stary format (V1)
                        <div className="space-y-4">
                            {shoppingList.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-lg group"
                                >
                                    <div className="flex items-center justify-between"> {/* Dodano justify-between */}
                                        <div className="flex items-center gap-2 font-medium">
                                            <ShoppingBag className="h-4 w-4 text-gray-400"/>
                                            {item.name}
                                        </div>
                                        <div className="hidden group-hover:flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItem({index, currentValue: item.name});
                                                    setEditValue(item.name)
                                                }}
                                                className="p-1 text-blue-600 hover:text-blue-700"
                                            >
                                                <Edit2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    </div>
                                    {item.recipes && item.recipes.length > 0 && (
                                        <div className="mt-2 ml-6 space-y-1 text-sm text-gray-500">
                                            {item.recipes.map((recipe, recipeIndex) => (
                                                <div key={recipeIndex}>
                                                    Dzień {recipe.dayIndex + 1}: {recipe.recipeName}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isDeleteConfirmationOpen}
                onClose={closeDeleteConfirmation}
                onConfirm={handleDeleteItem}
                title="Potwierdź usunięcie"
                description="Czy na pewno chcesz usunąć tę pozycję z listy zakupów?"
                confirmLabel="Usuń"
                variant="destructive"
            />
        </div>
    );
};

export default DietShoppingListEditor;