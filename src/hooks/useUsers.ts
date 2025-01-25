import {useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../config/firebase";
import {toast} from "sonner";
import {User} from "../types/user";

export default function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading ] = useState(true);

    useEffect(() => {
        fetchUsers().catch();
    }, []);

    const fetchUsers = async  () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const userData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
                birthDate: doc.data().birthDate?.toMillis?.() || doc.data().birthDate,
            })) as User[];
            setUsers(userData);
        } catch (error) {
            console.error('Error fetchin users:', error);
            toast.error('Błąd podczas pobierania użytkowników');
        } finally {
            setLoading(false);
        }
    };

    return {users, loading, fetchUsers};
}