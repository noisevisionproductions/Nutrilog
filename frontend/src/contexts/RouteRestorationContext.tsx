import React, {createContext, ReactNode, useContext} from "react";
import {useLocation} from "react-router-dom";

interface RouteRestorationContextType {
    clearSavedRoute: () => void;
    saveCurrentRoute: () => void;
    getSavedRoute: () => string | null;
}

const RouteRestorationContext = createContext<RouteRestorationContextType>({
    clearSavedRoute: () => {
    },
    saveCurrentRoute: () => {
    },
    getSavedRoute: () => null
});

export const useRouteRestoration = () => useContext(RouteRestorationContext);

interface RouteRestorationProviderProps {
    children: ReactNode;
}

export const RouteRestorationProvider: React.FC<RouteRestorationProviderProps> = ({children}) => {
    const location = useLocation();
    const ROUTE_STORAGE_KEY = 'dietitianPanel_lastRoute';

    const clearSavedRoute = () => {
        localStorage.removeItem(ROUTE_STORAGE_KEY);
    };

    const saveCurrentRoute = () => {
        if (location.pathname.startsWith('/dashboard')) {
            localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname);
        }
    };

    const getSavedRoute = (): string | null => {
        return localStorage.getItem(ROUTE_STORAGE_KEY);
    };

    const value = {
        clearSavedRoute,
        saveCurrentRoute,
        getSavedRoute
    };

    return (
        <RouteRestorationContext.Provider value={value}>
            {children}
        </RouteRestorationContext.Provider>
    );
};