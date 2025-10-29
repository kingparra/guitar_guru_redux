import { useState, useEffect } from 'react';
import type { StudioMode, DiagramNote, Chord, AnchorNoteContext } from '../types';
import { HarmonyService } from '../services/HarmonyService';

interface AnchorNoteResult {
    anchorNote: DiagramNote | null;
    setAnchorNote: (note: DiagramNote | null) => void;
    anchorContexts: AnchorNoteContext[] | null;
    selectedAnchorContext: AnchorNoteContext | null;
    onContextSelect: (context: AnchorNoteContext) => void;
    isLoading: boolean;
    error: string | null;
}

/**
 * Custom hook to manage the state and logic for the Anchor Note feature.
 * @param studioMode The current studio mode.
 * @param diatonicChords The available diatonic chords.
 * @param notesOnFretboard All scale notes on the fretboard.
 * @returns State and handlers for the anchor note feature.
 */
export const useAnchorNote = (
    studioMode: StudioMode,
    diatonicChords: Chord[],
    notesOnFretboard: DiagramNote[]
): AnchorNoteResult => {
    const [anchorNote, setAnchorNote] = useState<DiagramNote | null>(null);
    const [anchorContexts, setAnchorContexts] = useState<AnchorNoteContext[] | null>(null);
    const [selectedAnchorContext, setSelectedAnchorContext] = useState<AnchorNoteContext | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (studioMode !== 'anchor') {
            setAnchorNote(null);
            return;
        }

        if (anchorNote) {
            setIsLoading(true);
            setError(null);
            setSelectedAnchorContext(null);

            // Using a small timeout to prevent UI jank from immediate state updates
            const timer = setTimeout(() => {
                try {
                    const data = HarmonyService.generateAnchorNoteContexts(anchorNote, diatonicChords, notesOnFretboard);
                    setAnchorContexts(data);
                } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to generate anchor contexts.');
                } finally {
                    setIsLoading(false);
                }
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setAnchorContexts(null);
            setSelectedAnchorContext(null);
        }
    }, [studioMode, anchorNote, diatonicChords, notesOnFretboard]);

    return {
        anchorNote,
        setAnchorNote,
        anchorContexts,
        selectedAnchorContext,
        onContextSelect: setSelectedAnchorContext,
        isLoading,
        error,
    };
};