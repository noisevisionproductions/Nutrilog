import {onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser} from 'firebase/auth';
import React, {createContext, useContext, useEffect, useState} from "react";
import {auth} from '../config/firebase';
import {User, UserRole} from '../types/user';
import api from "../config/axios";
import axios from 'axios';
import {useRouteRestoration} from "./RouteRestorationContext";

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userData: User | null;
    userClaims: Record<string, any> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    isAdmin: () => boolean;
    isOwner: () => boolean;
    hasRole: (requiredRole: UserRole) => boolean;
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
    const [userClaims, setUserClaims] = useState<Record<string, any> | null>(null);
    const {clearSavedRoute} = useRouteRestoration();

    useEffect(() => {
        return onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    const tokenResult = await user.getIdTokenResult();
                    setUserClaims(tokenResult.claims);

                    await validateTokenAndSetUserData(user);
                } catch (error) {
                    console.error("Token validation failed:", error);
                    await logout();
                }
            } else {
                setUserData(null);
                setUserClaims(null);
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

            const tokenResult = await user.getIdTokenResult(true);
            setUserClaims(tokenResult.claims);
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
                {email},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const userData = response.data as User;
            setUserData(userData);

            const tokenResult = await credential.user.getIdTokenResult();
            setUserClaims(tokenResult.claims);

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
            clearSavedRoute();
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
            setUserClaims(null);
        } catch (error) {
            console.error('Błąd wylogowania:', error);
            throw error;
        }
    };

    const isOwner = (): boolean => {
        if (userClaims?.owner === true) {
            return true;
        }

        return userData?.role === UserRole.OWNER;
    };

    const isAdmin = (): boolean => {
        if (isOwner()) {
            return true;
        }

        if (userClaims?.admin === true) {
            return true;
        }

        return userData?.role === UserRole.ADMIN;
    };

    const hasRole = (requiredRole: UserRole): boolean => {
        if (!userData) return false;

        const roleHierarchy: Record<UserRole, number> = {
            [UserRole.USER]: 1,
            [UserRole.ADMIN]: 2,
            [UserRole.OWNER]: 3
        };

        const userRole = userData.role as UserRole;
        const userRoleLevel = roleHierarchy[userRole] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        return userRoleLevel >= requiredRoleLevel;
    };

    const value = {
        currentUser,
        userData,
        userClaims,
        loading,
        login,
        logout,
        refreshUserData,
        isAdmin,
        isOwner,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};