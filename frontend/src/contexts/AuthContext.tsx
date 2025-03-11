import {onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser} from 'firebase/auth';
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from '../config/firebase';
import {User} from '../types/user';
import api from "../config/axios";
import axios from 'axios';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
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
                try {
                    await validateTokenAndSetUserData(user);
                } catch (error) {
                    console.error("Token validation failed:", error);
                    await logout();
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });
    }, []);

    const validateTokenAndSetUserData = async (user: FirebaseUser) => {
        try {
            const token = await user.getIdToken(true);

            const response = await api.post('/auth/validate-token', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUserData(response.data as User);
        } catch (error) {
            console.error("Error validating token:", error);
            throw error;
        }
    };

    const refreshUserData = async () => {
        if (!currentUser) return;

        try {
            await validateTokenAndSetUserData(currentUser);
        } catch (error) {
            console.error("Error refreshing user data:", error);
            await logout();
            throw error;
        }
    };

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const token = await credential.user.getIdToken(true);

            const response = await api.post('/auth/login',
                { email },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const userData = response.data as User;
            setUserData(userData);
            return userData;
        } catch (error) {
            console.error('Błąd uwierzytelniania:', error);

            await logout();

            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || 'Błąd uwierzytelniania');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
        } catch (error) {
            console.error('Błąd wylogowania:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userData,
        loading,
        login,
        logout,
        refreshUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};