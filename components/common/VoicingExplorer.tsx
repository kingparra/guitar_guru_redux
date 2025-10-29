
import React from 'react';
import type { VoicingExplorerProps } from '../../types';

const VoicingExplorer: React.FC<VoicingExplorerProps> = ({
    voicings,
    selectedVoicingIndex,
    onVoicingChange,
}) => {
    // Total number of states = All Tones view + number of voicings
    const totalStates = voicings.length + 1; 

    const handlePrev = () => {
        // The effective index for modulo is selectedVoicingIndex + 1
        const newIndex = (selectedVoicingIndex + 1 - 1 + totalStates) % totalStates;
        onVoicingChange(newIndex - 1); // Convert back to -1 to N-1 range
    };
    const handleNext = () => {
        const newIndex = (selectedVoicingIndex + 1 + 1) % totalStates;
        onVoicingChange(newIndex - 1);
    };

    let displayText = "All Chord Tones";
    if (selectedVoicingIndex >= 0) {
        displayText = `Voicing ${selectedVoicingIndex + 1} / ${voicings.length}`;
    }

    return (
        <div className="flex items-center justify-center gap-4 mt-4 flex-shrink-0">
            <button type="button" onClick={handlePrev} className="px-4 py-2 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-gray-200 font-semibold transition-colors">
                &larr; Prev
            </button>
            <p className="font-bold text-gray-300 w-32 text-center">
                {displayText}
            </p>
            <button type="button" onClick={handleNext} className="px-4 py-2 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-gray-200 font-semibold transition-colors">
                Next &rarr;
            </button>
        </div>
    );
};

export default VoicingExplorer;
