import {LucideIcon} from "lucide-react";
import React from "react";
import {cn} from "../../utils/cs";

interface NavButtonProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
    isCollapsed?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
                                                 icon: Icon,
                                                 label,
                                                 isActive,
                                                 onClick,
                                                 className = '',
                                                 isCollapsed = false
                                             }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center px-4 py-3 transition-all duration-200",
                "hover:bg-gray-50",
                isActive && "bg-blue-50 text-blue-600",
                isCollapsed ? "justify-center" : "justify-start",
                className
            )}
        >
            <Icon className={cn(
                "w-5 h-5",
                isCollapsed ? "mr-0" : "mr-3"
            )}/>
            {!isCollapsed && (
                <span className="transition-opacity duration-200">
                    {label}
                </span>
            )}
        </button>
    );
};

export default NavButton;