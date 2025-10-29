

import { TUNING, NOTE_MAP, ALL_NOTES, NUM_FRETS } from '../constants';
import type { DiagramNote, ClickedNote } from '../types';

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
 * The previous implementation had a bug where the octave change was not correctly
 * aligned with the musical convention (i.e., at the note 'C'). This new logic
 * corrects that, ensuring accurate pitch representation across the application.
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
    const cNoteIndex = NOTE_MAP['C'];

    // Calculate how many semitones the open string is above its own octave's C.
    // E.g., for G3, this would be 7 (G is 7 semitones above C3).
    const semitonesFromOctaveC = (openStringNoteIndex - cNoteIndex + 12) % 12;
    
    // Add the fretted interval to get the total distance from that C.
    const totalSemitonesFromC = semitonesFromOctaveC + fret;

    // The number of times we've crossed a 12-semitone boundary is the number of octaves to add.
    const octavesToAdd = Math.floor(totalSemitonesFromC / 12);
    
    return openString.octave + octavesToAdd;
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
    
    const noteIndex = (openStringNoteIndex + fret) % 12;
    const noteName = ALL_NOTES[noteIndex];

    return { noteName, octave: getOctaveForNote(stringIndex, fret) };
};

/**
 * Finds all occurrences of a specific pitch on the fretboard.
 * @param pitch The pitch to find.
 * @returns An array of DiagramNote objects representing the locations of the pitch.
 */
export const findPitchOnFretboard = (pitch: ClickedNote): DiagramNote[] => {
    const locations: DiagramNote[] = [];
    for (let s = 0; s < TUNING.length; s++) {
        for (let f = 0; f <= NUM_FRETS; f++) {
            const currentPitch = getNoteFromFret(s, f);
            if (currentPitch.noteName === pitch.noteName && currentPitch.octave === pitch.octave) {
                locations.push({
                    string: s,
                    fret: f,
                    noteName: pitch.noteName,
                });
            }
        }
    }
    return locations;
};