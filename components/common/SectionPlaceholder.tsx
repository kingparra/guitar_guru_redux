import React from 'react';
import Card from './Card';
import { COLORS } from '../../constants';

interface SectionPlaceholderProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onGenerate: () => void;
    disabled?: boolean;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
    title,
    description,
    icon,
    onGenerate,
    disabled = false,
}) => {
    return (
        <Card>
            <div className="p-4 min-h-[150px] flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-300">{title}</h3>
                    <p
                        className="text-sm mt-1"
                        style={{ color: COLORS.textSecondary }}
                    >
                        {description}
                    </p>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={disabled}
                        className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:shadow-lg hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {disabled ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default SectionPlaceholder;
