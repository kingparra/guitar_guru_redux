import { describe, it, expect } from 'vitest';
import { getOctaveForNote, getNoteFromFret } from './musicUtils';

describe('musicUtils', () => {
    describe('getNoteFromFret', () => {
        // Test cases for a 7-string guitar (B E A D G B E)
        it('should return correct note for open strings', () => {
            expect(getNoteFromFret(0, 0).noteName).toBe('E'); // High E
            expect(getNoteFromFret(1, 0).noteName).toBe('B');
            expect(getNoteFromFret(2, 0).noteName).toBe('G');
            expect(getNoteFromFret(3, 0).noteName).toBe('D');
            expect(getNoteFromFret(4, 0).noteName).toBe('A');
            expect(getNoteFromFret(5, 0).noteName).toBe('E');
            expect(getNoteFromFret(6, 0).noteName).toBe('B'); // Low B
        });

        it('should return correct note for fretted positions', () => {
            expect(getNoteFromFret(0, 5).noteName).toBe('A'); // High E string, 5th fret
            expect(getNoteFromFret(6, 7).noteName).toBe('F#'); // Low B string, 7th fret
            expect(getNoteFromFret(3, 12).noteName).toBe('D'); // D string, 12th fret
        });
    });

    describe('getOctaveForNote', () => {
        // Known values
        it('should return correct octaves for specific known notes', () => {
            // High E string (E4)
            expect(getOctaveForNote(0, 0)).toBe(4); // E4
            expect(getOctaveForNote(0, 7)).toBe(4); // B4
            expect(getOctaveForNote(0, 8)).toBe(5); // C5
            expect(getOctaveForNote(0, 12)).toBe(5); // E5

            // G string (G3)
            expect(getOctaveForNote(2, 0)).toBe(3); // G3
            expect(getOctaveForNote(2, 4)).toBe(3); // B3
            expect(getOctaveForNote(2, 5)).toBe(4); // C4

            // Low B string (B1)
            expect(getOctaveForNote(6, 0)).toBe(1); // B1
            expect(getOctaveForNote(6, 1)).toBe(2); // C2
            expect(getOctaveForNote(6, 12)).toBe(2); // B2
            expect(getOctaveForNote(6, 13)).toBe(3); // C3
        });
    });
});