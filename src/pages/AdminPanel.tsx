import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { TabName } from '../types/navigation';
import ExcelUpload from "../components/upload/ExcelUpload";

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('upload');

    const renderContent = () => {
        switch (activeTab) {
            case 'upload':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Upload Plików Excel</h2>
                        <ExcelUpload />
                    </div>
                );
            case 'data':
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Zarządzanie Danymi</h2>
{/*
                        <DataManagement />
*/}
                    </div>
                );
            case 'users':
                return <h2 className="text-2xl font-bold mb-4">Użytkownicy</h2>;
            case 'settings':
                return <h2 className="text-2xl font-bold mb-4">Ustawienia</h2>;
            default:
                return null;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminPanel;