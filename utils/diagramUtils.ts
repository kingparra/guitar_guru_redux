import type { DiagramNote } from '../types';

/**
 * Calculates an intelligent, compact fret window for displaying any diagram.
 * It now more accurately determines when a diagram represents a true "open position",
 * which was the root cause of the bug where the nut was displayed incorrectly.
 * @param {DiagramNote[]} notes - The fretted notes in the diagram.
 * @param {number[] | undefined} openStrings - An array of open string indices.
 * @returns {[number, number]} A tuple representing the start and end frets for the diagram window.
 */
export const calculateFretWindow = (
    notes: DiagramNote[],
    openStrings?: number[]
): [number, number] => {
    const frettedNotes = notes.filter((n) => typeof n.fret === 'number' && n.fret > 0);

    if (frettedNotes.length === 0) {
        return [0, 4]; // Default for open chords or empty diagrams
    }

    const frets = frettedNotes.map((n) => n.fret as number);
    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);

    // A diagram is considered "open position" if its highest fretted note is low on the neck.
    const isOpenPosition = maxFret < 5;

    if (isOpenPosition) {
        // For open positions, always start at the nut (0) and show at least 5 frets.
        return [0, Math.max(maxFret, 4)];
    }
    
    // For movable shapes higher up the neck, start one fret before for context.
    const startFret = minFret - 1;
    let endFret = maxFret;

    // Ensure a minimum span for readability
    if (endFret - startFret < 4) {
        endFret = startFret + 4;
    }

    return [startFret, endFret];
};
