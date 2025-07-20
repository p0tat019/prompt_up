
import React from 'react';
import { Persona } from '../types';
import { CheckIcon } from './icons/CheckIcon';

interface PersonaCardProps {
    persona: Persona;
    isSelected: boolean;
    onSelect: () => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isSelected, onSelect }) => {
    const baseClasses = "relative p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 h-full flex flex-col justify-between";
    const selectedClasses = "bg-slate-700/50 border-purple-500 shadow-lg scale-105";
    const unselectedClasses = "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700/80";

    return (
        <div
            onClick={onSelect}
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
        >
            {isSelected && (
                 <div className="absolute -top-3 -right-3 bg-purple-600 rounded-full p-1 text-white">
                    <CheckIcon className="w-5 h-5" />
                </div>
            )}
            <div>
                <h3 className="text-xl font-bold text-slate-100">{persona.name}</h3>
                <p className="text-purple-400 font-medium mb-2">{persona.title}</p>
                <p className="text-slate-400 text-sm">{persona.description}</p>
            </div>
        </div>
    );
};

export default PersonaCard;
