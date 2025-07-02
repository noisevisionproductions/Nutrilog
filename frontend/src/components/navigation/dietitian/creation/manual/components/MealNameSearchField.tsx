import React, {useEffect, useRef, useState} from "react";
import {MealSuggestion} from "../../../../../../types/mealSuggestions";
import {useDebounce} from "../../../../../../hooks/useDebounce";
import {MealSuggestionService} from "../../../../../../services/diet/MealSuggestionService";
import {toast} from "../../../../../../utils/toast";
import {Check, ChefHat, Clock, Info, Search, Users, X} from "lucide-react";
import LoadingSpinner from "../../../../../common/LoadingSpinner";
import ColoredNutritionBadges from "../steps/ColoredNutritionBadges";

interface MealNameSearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    onMealSelect?: (suggestion: MealSuggestion) => void;
    placeholder?: string;
    className?: string;
    showSaveOptions?: boolean;
    onSavePreference?: (shouldSave: boolean) => void;
}

const MealNameSearchField: React.FC<MealNameSearchFieldProps> = ({
                                                                     value,
                                                                     onChange,
                                                                     onMealSelect,
                                                                     placeholder = "Wpisz nazwę posiłku...",
                                                                     className = "",
                                                                     showSaveOptions = true,
                                                                     onSavePreference
                                                                 }) => {
    const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [savePreference, setSavePreference] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const debouncedValue = useDebounce(value, 300);

    useEffect(() => {
        if (debouncedValue.trim().length >= 2) {
            searchMeals(debouncedValue.trim()).catch(console.error);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedValue]);

    const searchMeals = async (query: string) => {
        setIsSearching(true);
        try {
            const results = await MealSuggestionService.searchMeals(query, 0);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setSelectedIndex(-1);

            if (showSaveOptions && results.length === 0) {
                setShowSaveDialog(true);
            } else if (showSaveOptions && !results.some(r => r.isExact)) {
                setShowSaveDialog(true);
            } else {
                setShowSaveDialog(false);
            }
        } catch (error) {
            console.error('Błąd wyszukiwania posiłków:', error);
            toast.error('Nie udało się wyszukać posiłków');
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        if (newValue.trim().length < 2) {
            setShowSaveDialog(false);
        }
    };

    const handleSuggestionSelect = (suggestion: MealSuggestion) => {
        onChange(suggestion.name);
        setShowSuggestions(false);
        setShowSaveDialog(false);
        if (onMealSelect) {
            onMealSelect(suggestion);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSavePreferenceChange = (shouldSave: boolean) => {
        setSavePreference(shouldSave);
        if (onSavePreference) {
            onSavePreference(shouldSave);
        }
        setShowSaveDialog(false);
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'RECIPE':
                return <ChefHat className="h-3 w-3 text-blue-600"/>;
            case 'TEMPLATE':
                return <Users className="h-3 w-3 text-green-600"/>;
            default:
                return null;
        }
    };

    const formatLastUsed = (lastUsed?: string) => {
        if (!lastUsed) return '';

        try {
            const date = new Date(lastUsed);
            const now = new Date();
            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            if (diffInDays === 0) return 'dzisiaj';
            if (diffInDays === 1) return 'wczoraj';
            if (diffInDays < 7) return `${diffInDays} dni temu`;
            if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tygodni temu`;
            return `${Math.floor(diffInDays / 30)} miesięcy temu`;
        } catch {
            return '';
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Input field */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {isSearching && (
                    <LoadingSpinner
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    />
                )}
            </div>

            {/* Save preference dialog */}
            {showSaveDialog && value.trim().length >= 2 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-blue-800 font-medium">
                                Nie znaleziono podobnego posiłku
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                                Posiłek "{value}" zostanie zapisany jako nowy szablon do wykorzystania w przyszłości.
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() => handleSavePreferenceChange(true)}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                                        savePreference
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-blue-600 border border-blue-200'
                                    }`}
                                >
                                    <Check className="h-3 w-3"/>
                                    Zapisz szablon
                                </button>
                                <button
                                    onClick={() => handleSavePreferenceChange(false)}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors ${
                                        !savePreference
                                            ? 'bg-gray-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200'
                                    }`}
                                >
                                    <X className="h-3 w-3"/>
                                    Nie zapisuj
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.id}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                                index === selectedIndex ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getSourceIcon(suggestion.source)}
                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                            {suggestion.name}
                                        </h4>
                                        {suggestion.isExact && (
                                            <span
                                                className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                Dokładne
                                            </span>
                                        )}
                                    </div>

                                    {suggestion.instructions && (
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                                            {suggestion.instructions}
                                        </p>
                                    )}

                                    {suggestion.nutritionalValues && (
                                        <div className="mb-2">
                                            <ColoredNutritionBadges
                                                nutritionalValues={suggestion.nutritionalValues}
                                                size="sm"
                                                layout="horizontal"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        {suggestion.usageCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3"/>
                                                {suggestion.usageCount}x użyte
                                            </span>
                                        )}
                                        {suggestion.lastUsed && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3"/>
                                                {formatLastUsed(suggestion.lastUsed)}
                                            </span>
                                        )}
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                            {Math.round(suggestion.similarity * 100)}% podobne
                                        </span>
                                    </div>
                                </div>

                                {suggestion.photos && suggestion.photos.length > 0 && (
                                    <img
                                        src={suggestion.photos[0]}
                                        alt={suggestion.name}
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MealNameSearchField;