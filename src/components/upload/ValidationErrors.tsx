// src/components/validation/ValidationErrors.tsx
import React from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ValidationError {
    row: number;
    column: string;
    message: string;
    type?: 'warning' | 'error';
}

interface ValidationErrorsProps {
    errors: ValidationError[];
    warnings: ValidationError[];
    onClose: () => void;
    onProceed?: () => void;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({
                                                               errors,
                                                               warnings,
                                                               onClose
                                                           }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                    Wyniki walidacji pliku
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {errors.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Błędy:</span>
                    </div>
                    {errors.map((error, index) => (
                        <div key={index} className="ml-7 text-red-600">
                            {error.row > 0 ? `Wiersz ${error.row}: ` : ''}{error.message}
                        </div>
                    ))}
                </div>
            )}

            {warnings.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Ostrzeżenia:</span>
                    </div>
                    {warnings.map((warning, index) => (
                        <div key={index} className="ml-7 text-yellow-600">
                            {warning.row > 0 ? `Wiersz ${warning.row}: ` : ''}{warning.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ValidationErrors;