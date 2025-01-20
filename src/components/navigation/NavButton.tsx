import {LucideIcon} from "lucide-react";
import React from "react";

interface NavButtonProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
                                                 icon: Icon,
                                                 label,
                                                 isActive,
                                                 onClick,
                                                 className = ''
                                             }) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center w-full p-4 transition-colors
                ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}
                ${className}
            `}
        >
            <Icon className="w-5 h-5 mr-3"/>
            {label}
        </button>
    );
};

export default NavButton;