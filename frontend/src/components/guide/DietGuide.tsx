import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/Tabs";
import {AlertTriangle, Clock, FileSpreadsheet, ListChecks} from "lucide-react";
import ExcelGuide from "./ExcelGuide";
import RulesGuide from "./RulesGuide";
import ScheduleGuide from "./ScheduleGuide";
import WarningSystemGuide from "./WarningSystemGuide";

const DietGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState('excel');

    return (
        <Card className="w-full shadow-md border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-slate-200 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl text-slate-800">
                    Przewodnik po dietach
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600">
                    Wszystko, co musisz wiedzieć o tworzeniu i zarządzaniu dietami
                </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
                    <TabsList className="grid grid-cols-2 sm:flex sm:flex-wrap w-full p-1 rounded-xl bg-slate-100 gap-1">
                        <TabsTrigger
                            value="excel"
                            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2 px-2 sm:px-4 text-sm sm:text-base sm:flex-grow sm:basis-1/4"
                        >
                            <FileSpreadsheet className="w-4 h-4"/>
                            <span className="whitespace-nowrap text-xs sm:text-sm">Struktura Excel</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="rules"
                            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2 px-2 sm:px-4 text-sm sm:text-base sm:flex-grow sm:basis-1/4"
                        >
                            <ListChecks className="w-4 h-4"/>
                            <span className="whitespace-nowrap text-xs sm:text-sm">Zasady diet</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="schedule"
                            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2 px-2 sm:px-4 text-sm sm:text-base sm:flex-grow sm:basis-1/4"
                        >
                            <Clock className="w-4 h-4"/>
                            <span className="whitespace-nowrap text-xs sm:text-sm">Harmonogram</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="warnings"
                            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg py-2 px-2 sm:px-4 text-sm sm:text-base sm:flex-grow sm:basis-1/4"
                        >
                            <AlertTriangle className="w-4 h-4"/>
                            <span className="whitespace-nowrap text-xs sm:text-sm">System ostrzeżeń</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="excel" className="mt-12 sm:mt-6 space-y-4">
                        <ExcelGuide/>
                    </TabsContent>

                    <TabsContent value="rules" className="mt-12 sm:mt-6 space-y-4">
                        <RulesGuide/>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-12 sm:mt-6">
                        <ScheduleGuide/>
                    </TabsContent>

                    <TabsContent value="warnings" className="mt-12 sm:mt-6">
                        <WarningSystemGuide/>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default DietGuide;