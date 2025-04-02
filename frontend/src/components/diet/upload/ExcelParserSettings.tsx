import React, {useEffect, useState} from "react";
import {InfoIcon} from "lucide-react";
import {ExcelParserSettingsService} from "../../../services/diet/ExcelParserSettingsService";
import {toast} from "../../../utils/toast";

interface ExcelParserSettingsProps {
    skipColumnsCount: number;
    onSkipColumnsCountChange: (value: number) => void;
    className?: string;
}

const ExcelParserSettings: React.FC<ExcelParserSettingsProps> = ({
                                                                     skipColumnsCount,
                                                                     onSkipColumnsCountChange,
                                                                     className = ''
                                                                 }) => {
    const [maxSkipColumnsCount, setMaxSkipColumnsCount] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const settings = await ExcelParserSettingsService.getSettings();
                if (settings) {
                    setMaxSkipColumnsCount(settings.maxSkipColumnsCount);
                    if (skipColumnsCount === 0 && settings.skipColumnsCount !== 0) {
                        onSkipColumnsCountChange(settings.skipColumnsCount);
                    }
                }
            } catch (error) {
                console.error('Error loading parser settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings().catch(console.error);
    }, []);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await ExcelParserSettingsService.updateSkipColumnsCount(skipColumnsCount);
            toast.success('Zapisano ustawienia parsera');
        } catch (error) {
            console.error('Error saving parser settings:', error);
            toast.error('Błąd podczas zapisywania ustawień');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`bg-white p-4 rounded-md shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-base text-gray-700">Ustawienia parsera Excel</h4>

                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving || isLoading}
                    className={`text-xs px-2 py-1 rounded ${
                        isSaving || isLoading
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                    {isSaving ? 'Zapisywanie...' : 'Zapisz jako domyślne'}
                </button>
            </div>

            <div className="flex items-center gap-2 mb-1">
                <label htmlFor="skipColumnsCount" className="text-sm text-gray-600">
                    Liczba pomijanych wierszy:
                </label>
                <input
                    id="skipColumnsCount"
                    type="number"
                    min="0"
                    max={maxSkipColumnsCount}
                    value={skipColumnsCount}
                    onChange={(e) => onSkipColumnsCountChange(parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0"/>
                <p>
                    Określa, ile początkowych wierszy ma zostać pominiętych podczas przetwarzania pliku Excel.
                    Domyślnie pomijany jest 1 wiersz (nagłówkowy). Maksymalna wartość: {maxSkipColumnsCount}.
                </p>
            </div>
        </div>
    );
};

export default ExcelParserSettings;