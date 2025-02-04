import {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../config/firebase";
import {ShoppingList, ShoppingListV1, ShoppingListV2} from "../types";

export const useShoppingList = (dietId: string) => {
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchShoppingList = async () => {
            try {
                const q = query(
                    collection(db, 'shopping_lists'),
                    where('dietId', '==', dietId)
                );

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data();

                    if (data.version === 2) {
                        setShoppingList({
                            id: doc.id,
                            ...data
                        } as ShoppingListV2);
                    } else {
                        setShoppingList({
                            id: doc.id,
                            ...data,
                            version: 1
                        } as ShoppingListV1);
                    }
                } else {
                    setShoppingList(null);
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        if (dietId) {
            setLoading(true);
            setError(null);
            fetchShoppingList().catch((err) => {
                console.error('Error in fetchShoppingList:', err);
                setError(err as Error);
                setLoading(false);
            });
        }
    }, [dietId]);

    const isVersion2 = (list: ShoppingList | null): list is ShoppingListV2 => {
        return list?.version === 2;
    };

    return {
        shoppingList,
        loading,
        error,
        isVersion2
    };
};