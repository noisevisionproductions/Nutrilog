import {TabName} from "../../types/navigation";
import {FileSpreadsheet, LogOut, Settings, Upload, Users} from "lucide-react";
import NavButton from "./NavButton";
import React from "react";

interface SidebarProps {
    activeTab: TabName;
    onTabChange: (tab: TabName) => void;
    onLogout: () => void;
}

const navigationItems = [
    {id: 'upload', label: 'Upload Excel', icon: Upload},
    {id: 'data', label: 'Zarządzanie Danymi', icon: FileSpreadsheet},
    {id: 'users', label: 'Użytkownicy', icon: Users},
    {id: 'settings', label: 'Ustawienia', icon: Settings},
] as const;

const Sidebar: React.FC<SidebarProps> = ({activeTab, onTabChange, onLogout}) => {
    return (
        <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">Panel Admina</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-4">
                {navigationItems.map((item) => (
                    <NavButton
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.id}
                        onClick={() => onTabChange(item.id as TabName)}
                    />
                ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <NavButton
                    icon={LogOut}
                    label="Wyloguj"
                    isActive={false}
                    onClick={onLogout}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                />
            </div>
        </div>
    );
};

export default Sidebar;