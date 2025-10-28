
import React from 'react';
import type { DisplayOptionsPanelProps, StudioMode } from '../../types';

const ModeButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}> = ({ label, isActive, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isActive
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
        }`}
    >
        {label}
    </button>
);


const DisplayOptionsPanel: React.FC<DisplayOptionsPanelProps> = ({
    studioMode, onModeChange,
    selectedChordName, onChordChange, diatonicChords, hasRun,
    numPositions, selectedPositionIndex, onPositionChange,
}) => {
    
    const handleModeChange = (mode: StudioMode) => {
        onModeChange(studioMode === mode ? null : mode);
    };

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20 space-y-4">
             <div className="flex flex-row items-center justify-center gap-x-4 gap-y-2 flex-wrap">
                <ModeButton
                    label="Anchor Note"
                    isActive={studioMode === 'anchor'}
                    onClick={() => handleModeChange('anchor')}
                />
                <ModeButton
                    label="Diagonal Run"
                    isActive={studioMode === 'run'}
                    onClick={() => handleModeChange('run')}
                    disabled={!hasRun}
                />
                <ModeButton
                    label="Chord Inspector"
                    isActive={studioMode === 'inspector'}
                    onClick={() => handleModeChange('inspector')}
                    disabled={diatonicChords.length === 0}
                />
                <ModeButton
                    label="Scale Positions"
                    isActive={studioMode === 'positions'}
                    onClick={() => handleModeChange('positions')}
                    disabled={numPositions === 0}
                />
            </div>

            {studioMode === 'inspector' && (
                <div className="animate-fade-in border-t border-purple-400/20 pt-4">
                    <div className="flex flex-row items-center justify-center gap-2 flex-wrap">
                        {diatonicChords.map(chord => (
                            <button
                                key={chord.name}
                                onClick={() => onChordChange(chord.name)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                                    selectedChordName === chord.name
                                        ? 'bg-fuchsia-500/80 text-white'
                                        : 'bg-black/30 hover:bg-black/50 text-gray-300'
                                }`}
                            >
                                {chord.degree} - {chord.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {studioMode === 'positions' && (
                 <div className="animate-fade-in border-t border-purple-400/20 pt-4 flex justify-center">
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
    );
};

export default DisplayOptionsPanel;
