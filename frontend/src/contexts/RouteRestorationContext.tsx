import React, {createContext, useContext, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

interface RouteRestorationContextType {
    clearSavedRoute: () => void;
}

const LAST_ROUTE_KEY = 'nutrilog_last_route';

const RouteRestorationContext = createContext<RouteRestorationContextType>({
    clearSavedRoute: () => {
    }
});

export const useRouteRestoration = () => useContext(RouteRestorationContext);

interface RouteRestorationProviderProps {
    children: React.ReactNode;
    disabled?: boolean;
}

export const RouteRestorationProvider: React.FC<RouteRestorationProviderProps> = ({
                                                                                      children,
                                                                                      disabled = false
                                                                                  }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!disabled && location.pathname !== '/') {
            // Nie zapisujemy ścieżek logowania i błędów
            if (!['/login', '/unauthorized', '/error'].includes(location.pathname)) {
                localStorage.setItem(LAST_ROUTE_KEY, JSON.stringify({
                    pathname: location.pathname,
                    search: location.search,
                    hash: location.hash
                }));
            }
        }
    }, [location, disabled]);

    useEffect(() => {
        if (!disabled && location.pathname === '/') {
            const savedRoute = localStorage.getItem(LAST_ROUTE_KEY);

            if (savedRoute) {
                try {
                    const {pathname, search, hash} = JSON.parse(savedRoute);

                    // Sprawdzamy, czy zapisana ścieżka nie jest stroną logowania
                    if (pathname !== '/login' && pathname !== '/unauthorized' && pathname !== '/error') {
                        navigate(pathname + search + hash, {replace: true});
                    }
                } catch (error) {
                    // Jeśli wystąpi błąd, usuwamy uszkodzony zapis
                    localStorage.removeItem(LAST_ROUTE_KEY);
                }
            }
        }
    }, [navigate, location.pathname, disabled]);

    // Metoda do czyszczenia zapisanej ścieżki (przydatna przy wylogowaniu)
    const clearSavedRoute = () => localStorage.removeItem(LAST_ROUTE_KEY);

    return (
        <RouteRestorationContext.Provider value={{clearSavedRoute}}>
            {children}
        </RouteRestorationContext.Provider>
    );
};