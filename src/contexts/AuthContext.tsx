import {onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth, db} from '../config/firebase';
import {User, UserRole} from '../types/user';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as User);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
    }, []);

    const login = async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
        if (!userDoc.exists()) {
            throw new Error('Użytkownik nie istnieje w bazie danych');
        }
        const userData = userDoc.data() as User;
        if (userData.role !== UserRole.ADMIN) {
            await logout();
            throw new Error('Brak uprawnień administratora');
        }
        setUserData(userData);
        return userData;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userData,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};