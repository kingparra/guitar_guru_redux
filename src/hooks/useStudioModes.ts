import { useState, useMemo, useEffect } from 'react';
import type { StudioMode, Chord } from '../types';

/**
 * Custom hook to manage the state and logic for the Fretboard Studio's interactive modes.
 * @param diatonicChords - The list of diatonic chords for the current scale.
 * @returns An object containing the current mode, selections, and handlers.
 */
export const useStudioModes = (diatonicChords: Chord[]) => {
    const [studioMode, setStudioMode] = useState<StudioMode>(null);
    const [selectedChordName, setSelectedChordName] = useState<string | null>(null);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
    const [selectedVoicingIndex, setSelectedVoicingIndex] = useState(-1);

    const selectedChord = useMemo(() => diatonicChords.find(c => c.name === selectedChordName) || null, [selectedChordName, diatonicChords]);

    const handleModeChange = (mode: StudioMode) => {
        setStudioMode(prevMode => (prevMode === mode ? null : mode));
    };

    const handleChordChange = (chordName: string) => {
        setSelectedChordName(chordName);
        setSelectedVoicingIndex(-1);
    };

    const handlePositionChange = (index: number) => {
        const numPositions = 7; // Assuming 7 positions for now
        const newIndex = (index + numPositions) % numPositions;
        setSelectedPositionIndex(newIndex);
    };
    
    // Effect to manage selections when modes change
    useEffect(() => {
        if (studioMode === 'inspector' && diatonicChords.length > 0 && !selectedChordName) {
            handleChordChange(diatonicChords[0].name);
        }
    }, [studioMode, diatonicChords, selectedChordName]);

    return {
        studioMode,
        setStudioMode: handleModeChange,
        selectedChordName,
        selectedChord,
        onChordChange: handleChordChange,
        diatonicChords,
        selectedPositionIndex,
        onPositionChange: handlePositionChange,
        selectedVoicingIndex,
        setSelectedVoicingIndex,
    };
};
