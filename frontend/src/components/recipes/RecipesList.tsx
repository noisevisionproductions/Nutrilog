import {useEffect, useState, forwardRef, useImperativeHandle} from "react";
import {Recipe} from "../../types";
import {RecipeService} from "../../services/RecipeService";
import {toast} from "../../utils/toast";
import LoadingSpinner from "../common/LoadingSpinner";
import {FloatingActionButtonGroup, FloatingActionButton} from "../common/FloatingActionButton";
import RecipeCard from "./RecipeCard";
import debounce from 'lodash/debounce';

interface RecipesListProps {
    onRecipeSelect: (recipeId: string) => void;
    initialSearchQuery?: string;
    initialFilterWithImages?: boolean;
    initialFilterWithoutImages?: boolean;
    initialSortBy?: 'newest' | 'oldest' | 'name' | 'calories';
    onRecipesCountUpdate?: (count: number, isSearching: boolean) => void;
}

export interface RecipesListRef {
    refreshRecipes: () => void;
}

const RecipesList = forwardRef<RecipesListRef, RecipesListProps>(({
                                                                      onRecipeSelect,
                                                                      initialSearchQuery = '',
                                                                      initialFilterWithImages = false,
                                                                      initialFilterWithoutImages = false,
                                                                      initialSortBy = 'newest',
                                                                      onRecipesCountUpdate
                                                                  }, ref) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [filterWithImages, setFilterWithImages] = useState(initialFilterWithImages);
    const [filterWithoutImages, setFilterWithoutImages] = useState(initialFilterWithoutImages);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'calories'>(initialSortBy);
    const [isSearching, setIsSearching] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePages, setHasMorePages] = useState(true);
    const pageSize = 50;

    // Effect to handle changes from parent component
    useEffect(() => {
        setSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    useEffect(() => {
        setFilterWithImages(initialFilterWithImages);
    }, [initialFilterWithImages]);

    useEffect(() => {
        setFilterWithoutImages(initialFilterWithoutImages);
    }, [initialFilterWithoutImages]);

    useEffect(() => {
        setSortBy(initialSortBy);
    }, [initialSortBy]);

    useEffect(() => {
        if (onRecipesCountUpdate) {
            onRecipesCountUpdate(filteredRecipes.length, isSearching);
        }
    }, [filteredRecipes.length, isSearching, onRecipesCountUpdate]);

    useImperativeHandle(ref, () => ({
        refreshRecipes: () => {
            const savedSearchQuery = searchQuery;
            const savedFilterWithImages = filterWithImages;
            const savedFilterWithoutImages = filterWithoutImages;
            const savedSortBy = sortBy;

            fetchInitialRecipes()
                .then(() => {
                    setSearchQuery(savedSearchQuery);
                    setFilterWithImages(savedFilterWithImages);
                    setFilterWithoutImages(savedFilterWithoutImages);
                    setSortBy(savedSortBy);
                })
                .catch(console.error);
        }
    }));

    useEffect(() => {
        fetchInitialRecipes().catch(console.error);
    }, []);

    // Debounce funkcja wyszukiwania, aby nie wywoływać API za często
    const debouncedSearch = debounce(async (query: string) => {
        if (query.trim() && (query.trim().length >= 3 || /^\d+$/.test(query.trim()))) {
            try {
                setIsSearching(true);
                const results = await RecipeService.searchRecipes(query.trim());
                setFilteredRecipes(results);
            } catch (error) {
                console.error('Błąd podczas wyszukiwania przepisów:', error);
            } finally {
                setIsSearching(false);
            }
        } else {
            applyFilters();
        }
    }, 500);

    useEffect(() => {
        if (searchQuery.trim()) {
            const searchPromise = debouncedSearch(searchQuery);

            // Obsługa Promise, jeśli jest zwracany
            if (searchPromise) {
                searchPromise.catch(error => {
                    console.error('Nieoczekiwany błąd w debouncedSearch:', error);
                });
            }
        } else {
            applyFilters();
        }

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            applyFilters();
        }
    }, [recipes, filterWithImages, filterWithoutImages, sortBy]);

    const applyFilters = () => {
        let results = [...recipes];

        // Filtrowanie
        if (filterWithImages) {
            results = results.filter(recipe => recipe.photos && recipe.photos.length > 0);
        }

        if (filterWithoutImages) {
            results = results.filter(recipe => !recipe.photos || recipe.photos.length === 0);
        }

        // Sortowanie
        results = [...results].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt.seconds * 1000).getTime() - new Date(a.createdAt.seconds * 1000).getTime();
                case 'oldest':
                    return new Date(a.createdAt.seconds * 1000).getTime() - new Date(b.createdAt.seconds * 1000).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'calories':
                    const aCalories = a.nutritionalValues?.calories || 0;
                    const bCalories = b.nutritionalValues?.calories || 0;
                    return bCalories - aCalories;
                default:
                    return 0;
            }
        });

        setFilteredRecipes(results);
    };

    const fetchInitialRecipes = async () => {
        try {
            setLoading(true);
            setRecipes([]);
            setCurrentPage(0);

            const response = await RecipeService.getRecipesPage(0, pageSize);
            setRecipes(response.content || []);
            setHasMorePages(response.page < response.totalPages - 1);
        } catch (error) {
            console.error('Błąd podczas pobierania przepisów:', error);
            toast.error('Nie udało się pobrać listy przepisów');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreRecipes = async () => {
        if (loadingMore || !hasMorePages) return;

        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;

            const response = await RecipeService.getRecipesPage(nextPage, pageSize);

            setRecipes(prevRecipes => {
                const existingIds = new Set(prevRecipes.map(recipe => recipe.id));
                const newUniqueRecipes = response.content.filter(recipe => !existingIds.has(recipe.id));
                return [...prevRecipes, ...newUniqueRecipes];
            });

            setCurrentPage(nextPage);
            setHasMorePages(response.page < response.totalPages - 1);
        } catch (error) {
            console.error('Błąd podczas ładowania kolejnych przepisów:', error);
            toast.error('Nie udało się załadować więcej przepisów');
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner/>
            </div>
        );
    }

    // Sprawdzamy, czy powinniśmy pokazać przycisk "Załaduj więcej"
    const showLoadMoreButton = hasMorePages && !(searchQuery || filterWithImages || filterWithoutImages);

    return (
        <div className="h-full flex flex-col">

            {/* Lista przepisów */}
            <div className="flex-grow overflow-auto relative">
                {filteredRecipes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-lg font-medium text-slate-700">Brak przepisów do wyświetlenia</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            Nie znaleziono żadnych przepisów spełniających kryteria. Spróbuj zmienić filtry lub odśwież
                            listę.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={onRecipeSelect}
                            />
                        ))}
                    </div>
                )}

                {/* Przycisk "Załaduj więcej" - teraz jako pływający guzik */}
                {showLoadMoreButton && (
                    <FloatingActionButtonGroup position="bottom-right">
                        <FloatingActionButton
                            label="Załaduj więcej"
                            onClick={loadMoreRecipes}
                            disabled={loadingMore}
                            isLoading={loadingMore}
                            loadingLabel="Ładowanie..."
                            loadingIcon={<LoadingSpinner size="sm"/>}
                            variant="primary"
                        />
                    </FloatingActionButtonGroup>
                )}
            </div>
        </div>
    );
});

export default RecipesList;