import { TUNING, NOTE_MAP, ALL_NOTES } from '../constants';

// Standard tuning for a 7-string guitar with scientific pitch notation octaves
const TUNING_WITH_OCTAVES: { note: string, octave: number }[] = [
    { note: 'E', octave: 4 }, // High E
    { note: 'B', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'A', octave: 2 },
    { note: 'E', octave: 2 },
    { note: 'B', octave: 1 }, // Low B
];

/**
 * Calculates the correct musical octave for a note on the fretboard.
 * @param stringIndex The index of the string (0=high E, 6=low B).
 * @param fret The fret number.
 * @returns The scientific pitch notation octave number.
 */
export const getOctaveForNote = (stringIndex: number, fret: number): number => {
    const openString = TUNING_WITH_OCTAVES[stringIndex];
    if (!openString) {
        console.warn(`Invalid string index: ${stringIndex}`);
        return 4; // Default to a middle octave
    }
    
    const openStringNoteIndex = NOTE_MAP[openString.note];
    
    const totalSemitones = openStringNoteIndex + fret;
    const octave = openString.octave + Math.floor(totalSemitones / 12);
    
    return octave;
};

/**
 * Calculates the note name and octave for any fret on any string.
 * @param stringIndex The index of the string (0=high E, 6=low B).
 * @param fret The fret number.
 * @returns An object with the noteName and octave.
 */
export const getNoteFromFret = (stringIndex: number, fret: number): { noteName: string, octave: number } => {
    const openString = TUNING_WITH_OCTAVES[stringIndex];
    const openStringNoteIndex = NOTE_MAP[openString.note];
    
    const totalSemitonesFromC0 = (openString.octave * 12 + openStringNoteIndex) + fret;
    
    const noteIndex = totalSemitonesFromC0 % 12;
    
    const noteName = ALL_NOTES[noteIndex];

    return { noteName, octave: getOctaveForNote(stringIndex, fret) };
};
