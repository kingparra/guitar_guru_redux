import React from 'react';
import type { DisplayOptionsPanelProps, LayerType } from '../../types';

const LayerToggle: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
    <div className="flex items-center">
        <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={onClick}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive ? 'bg-cyan-500' : 'bg-gray-600'
            }`}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
        <span className="ml-3 text-md font-semibold text-gray-200">{label}</span>
    </div>
);

const DisplayOptionsPanel: React.FC<DisplayOptionsPanelProps> = ({
    activeLayer, onLayerChange,
    selectedChordName, onChordChange, diatonicChords, hasRun,
    numPositions, selectedPositionIndex, onPositionChange,
    isPlaygroundMode, onPlaygroundModeChange,
}) => {
    
    const handleLayerChange = (layer: LayerType) => {
        onLayerChange(activeLayer === layer ? null : layer);
    };

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20">
             <div className="flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-4 flex-wrap">
                
                {/* Playground Mode */}
                <LayerToggle
                    label="Playground Mode"
                    isActive={isPlaygroundMode}
                    onClick={() => onPlaygroundModeChange(!isPlaygroundMode)}
                />
                <div className="h-6 w-px bg-purple-400/20 hidden md:block"></div>

                {/* Diagonal Run */}
                <LayerToggle
                    label="Diagonal Run"
                    isActive={activeLayer === 'run'}
                    onClick={() => handleLayerChange('run')}
                    disabled={!hasRun || isPlaygroundMode}
                />
                
                {/* Diatonic Chords */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                     <LayerToggle
                        label="Diatonic Chords"
                        isActive={activeLayer === 'chords'}
                        onClick={() => handleLayerChange('chords')}
                        disabled={diatonicChords.length === 0 || isPlaygroundMode}
                    />
                    {activeLayer === 'chords' && (
                        <div className="animate-fade-in">
                            <select
                                value={selectedChordName || ''}
                                onChange={(e) => onChordChange(e.target.value)}
                                className="bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                {diatonicChords.map(chord => (
                                    <option key={chord.name} value={chord.name}>
                                        {chord.degree} - {chord.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Scale Positions */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <LayerToggle
                        label="Scale Positions"
                        isActive={activeLayer === 'positions'}
                        onClick={() => handleLayerChange('positions')}
                        disabled={numPositions === 0 || isPlaygroundMode}
                    />
                    {activeLayer === 'positions' && (
                         <div className="animate-fade-in">
                            <select
                                value={selectedPositionIndex}
                                onChange={(e) => onPositionChange(parseInt(e.target.value, 10))}
                                className="bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            >
                                {Array.from({ length: numPositions }).map((_, index) => (
                                     <option key={index} value={index}>
                                        Position {index + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisplayOptionsPanel;
