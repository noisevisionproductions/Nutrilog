import React, {useEffect, useState} from 'react';
import {MainNav} from "../../types/navigation";
import ExcelUpload from "../../components/navigation/dietitian/ExcelUpload";
import UsersManagement from "../../components/navigation/dietitian/UsersManagement";
import DietManagement from "../../components/diet/DietManagement";
import StatsPanel from "../../components/stats/StatsPanel";
import DietGuide from "../../components/navigation/dietitian/DietGuide";
import Changelog from "../../components/navigation/dietitian/Changelog";
import RecipesPage from "../../components/navigation/dietitian/RecipesPage";
import usePageTitle from "../../hooks/usePageTitle";
import DietitianDashboard from "../../components/navigation/dietitian/DietitianDashboard";
import DietitianSidebar from "../../components/navigation/DietitianSidebar";

const DietitianPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainNav>('dietitianDashboard');

    useEffect(() => {
        const handleTabChange = (event: CustomEvent) => {
            setActiveTab(event.detail as MainNav);
        };

        window.addEventListener('panel-tab-change', handleTabChange as EventListener);

        return () => {
            window.removeEventListener('panel-tab-change', handleTabChange as EventListener);
        };
    }, []);

    const titleMap: Record<MainNav, string> = {
        dietitianDashboard: 'Pulpit',
        upload: 'Tworzenie diety',
        diets: 'Zarządzanie dietami',
        users: 'Klienci',
        stats: 'Statystyki',
        guide: 'Przewodnik',
        changelog: 'Historia zmian',
        landing: 'Strona główna',
        recipes: 'Przepisy'
    };

    usePageTitle(titleMap[activeTab], 'Panel Dietetyka');

    const renderContent = () => {
        switch (activeTab) {
            case 'dietitianDashboard':
                return <DietitianDashboard/>;
            case 'upload':
                return <ExcelUpload onTabChange={setActiveTab}/>;
            case 'diets':
                return <DietManagement/>;
            case 'users':
                return <UsersManagement/>;
            case 'stats':
                return <StatsPanel/>;
            case 'guide':
                return <DietGuide/>;
            case 'changelog':
                return <Changelog/>;
            case 'recipes':
                return <RecipesPage/>;
            default:
                return <DietitianDashboard/>;
        }
    };

    return (
        <DietitianSidebar activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </DietitianSidebar>
    );
};

export default DietitianPanel;