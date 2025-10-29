import { useState, useEffect } from 'react';
import type { StudioMode, Chord, ChordInspectorData } from '../types';
import * as geminiService from '../services/geminiService';

interface ChordInspectorResult {
    data: ChordInspectorData | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Custom hook to manage fetching and state for the Chord Inspector feature.
 * @param studioMode - The current studio mode.
 * @param selectedChord - The currently selected chord object.
 * @param rootNote - The root note of the scale.
 * @param scaleName - The name of the scale.
 * @returns The state of the chord inspector data.
 */
export const useChordInspector = (
    studioMode: StudioMode,
    selectedChord: Chord | null,
    rootNote: string,
    scaleName: string
): ChordInspectorResult => {
    const [data, setData] = useState<ChordInspectorData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (studioMode !== 'inspector' || !selectedChord) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await geminiService.generateChordInspectorData(rootNote, scaleName, selectedChord);
                setData(result);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load inspector data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studioMode, selectedChord, rootNote, scaleName]);

    return { data, isLoading, error };
};
