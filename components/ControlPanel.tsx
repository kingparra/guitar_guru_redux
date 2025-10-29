

import React, { useState } from 'react';
import { ALL_NOTES, SCALE_FORMULAS } from '../constants';
import type { FontSizeKey } from '../types';
import SearchableSelect from './common/SearchableSelect';
import { InfoIcon, SettingsIcon } from './common/Icons';

interface ControlPanelProps {
    rootNote: string;
    setRootNote: (note: string) => void;
    scaleName: string;
    setScaleName: (scale: string) => void;
    onGenerate: () => void;
    onSavePdf: () => void;
    isLoading: boolean;
    isSavingPdf: boolean;
    hasContent: boolean;
    fontSize: FontSizeKey;
    setFontSize: (size: FontSizeKey) => void;
    isAnalyzerVisible: boolean;
    onToggleAnalyzer: () => void;
    sectionIds: Record<string, string>;
}

const scaleNames = Object.keys(SCALE_FORMULAS);

const SetupMode: React.FC<Omit<ControlPanelProps, 'hasContent' | 'sectionIds' | 'onSavePdf'>> = ({ rootNote, setRootNote, scaleName, setScaleName, onGenerate, isLoading, isSavingPdf, onToggleAnalyzer, isAnalyzerVisible }) => (
    <>
        <div className="flex items-center gap-2 w-full md:w-auto z-30">
            <label className="font-bold text-lg text-gray-300">Root:</label>
            <SearchableSelect options={ALL_NOTES} value={rootNote} onChange={setRootNote} disabled={isLoading} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto z-20">
            <label className="font-bold text-lg text-gray-300">Scale:</label>
            <SearchableSelect options={scaleNames} value={scaleName} onChange={setScaleName} disabled={isLoading} />
        </div>
        <button onClick={onGenerate} disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {isLoading && !isSavingPdf ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Generate Materials'}
        </button>
        <button onClick={onToggleAnalyzer} className={`w-full md:w-auto font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${isAnalyzerVisible ? 'bg-gray-600 text-white' : 'bg-indigo-600 text-white'}`}>
            <InfoIcon />
            <span>{isAnalyzerVisible ? 'Hide Analyzer' : 'Analyze...'}</span>
        </button>
    </>
);

const NavigationMode: React.FC<{ sectionIds: Record<string, string>, onSwitchToSetup: () => void }> = ({ sectionIds, onSwitchToSetup }) => {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const navItems = [
        { id: sectionIds.creativeExercises, label: 'Creative Exercises' },
        { id: sectionIds.resources, label: 'Resources' },
    ];

    return (
        <>
            <button onClick={onSwitchToSetup} className="w-full md:w-auto bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                <SettingsIcon />
                New Scale
            </button>
            <div className="h-6 w-px bg-purple-400/20 mx-2"></div>
            {navItems.map(item => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-gray-300 hover:text-cyan-400 font-semibold transition-colors px-3 py-1 text-sm">
                    {item.label}
                </button>
            ))}
        </>
    );
};


const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { hasContent, onSavePdf, isSavingPdf, isLoading, fontSize, setFontSize } = props;
    const [isSetupMode, setIsSetupMode] = useState(!hasContent);

    React.useEffect(() => {
        setIsSetupMode(!hasContent);
    }, [hasContent]);

    return (
        <div className="sticky top-4 z-10 bg-[#171528]/80 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-purple-400/30">
            <div className="flex items-center gap-2 flex-wrap">
                {isSetupMode ? <SetupMode {...props} /> : <NavigationMode sectionIds={props.sectionIds} onSwitchToSetup={() => setIsSetupMode(true)} />}

                <div className="flex-grow"></div>

                {hasContent && (
                    <button onClick={onSavePdf} disabled={isSavingPdf || isLoading} className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm">
                        {isSavingPdf ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save PDF'}
                    </button>
                )}

                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-300 text-sm">Size:</span>
                    {(['S', 'M', 'L'] as FontSizeKey[]).map((key) => (
                        <button key={key} onClick={() => setFontSize(key)} disabled={isLoading} className={`w-7 h-7 rounded-md font-bold transition-colors disabled:opacity-70 text-xs ${fontSize === key ? 'bg-cyan-500 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'}`}>
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
