import React from 'react';
import {Route, Routes} from "react-router-dom";
import DietCreationMethod, {DietCreationMethodType} from './DietCreationMethod';
import ExcelUpload from "./excel/ExcelUpload";
import {MainNav} from "../../../../types/navigation";
import {ArrowLeft} from 'lucide-react';
import {useDietitianNavigation} from "../../../../hooks/useDietitianNavigation";

interface DietCreationContainerProps {
    onTabChange: (tab: MainNav) => void;
}

const DietCreationContainer: React.FC<DietCreationContainerProps> = ({onTabChange}) => {
    const {navigateToSubPath} = useDietitianNavigation();

    const handleMethodSelect = (method: DietCreationMethodType) => {
        if (method === 'excel') {
            navigateToSubPath('diet-creation/excel');
        } else if (method === 'manual') {
            navigateToSubPath('diet-creation/manual');
        }
    };

    const handleBackToSelection = () => {
        navigateToSubPath('diet-creation');
    };

    const renderManualCreation = () => {
        return (
            <div className="space-y-6 pb-8">
                <div className="flex items-center space-x-4 mb-6">
                    <button
                        onClick={handleBackToSelection}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Powrót do wyboru metody
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div
                            className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Kreator ręczny w budowie
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Funkcja tworzenia diety ręcznej jest obecnie w fazie rozwoju.
                            W międzyczasie możesz skorzystać z importu z Excel.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigateToSubPath('diet-creation/excel')}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
                            >
                                Przejdź do importu Excel
                            </button>
                            <button
                                onClick={handleBackToSelection}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Powrót do wyboru metody
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Routes>
            {/* Główna strona wyboru metody */}
            <Route
                path=""
                element={<DietCreationMethod onMethodSelect={handleMethodSelect}/>}
            />

            {/* Excel upload */}
            <Route
                path="excel"
                element={
                    <div>
                        <div className="flex items-center space-x-4 mb-6">
                            <button
                                onClick={handleBackToSelection}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2"/>
                                Powrót do wyboru metody
                            </button>
                        </div>
                        <ExcelUpload onTabChange={onTabChange}/>
                    </div>
                }
            />

            {/* Manual creation */}
            <Route
                path="manual"
                element={renderManualCreation()}
            />

            {/* Fallback */}
            <Route
                path="*"
                element={<DietCreationMethod onMethodSelect={handleMethodSelect}/>}
            />
        </Routes>
    );
};

export default DietCreationContainer;