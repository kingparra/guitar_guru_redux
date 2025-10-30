import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getOctaveForNote, getNoteFromFret } from './musicUtils';
import { TUNING, NUM_FRETS, NOTE_MAP, ALL_NOTES } from '../../constants';

describe('musicUtils (property-based)', () => {
    it('round-trip: getNoteFromFret produces noteName consistent with NOTE_MAP and ALL_NOTES', () => {
        fc.assert(
            fc.property(fc.integer({ min: 0, max: TUNING.length - 1 }), fc.integer({ min: 0, max: NUM_FRETS }), (stringIndex, fret) => {
                const result = getNoteFromFret(stringIndex, fret);
                const openNote = TUNING[stringIndex].toUpperCase();
                const expectedIndex = (NOTE_MAP[openNote] + fret) % ALL_NOTES.length;
                expect(result.noteName).toBe(ALL_NOTES[expectedIndex]);
                // octave should be an integer and reasonable
                expect(Number.isInteger(result.octave)).toBe(true);
                expect(result.octave).toBeGreaterThanOrEqual(0);
                expect(result.octave).toBeLessThanOrEqual(10);
            })
        );
    });

    it('getOctaveForNote increases by 1 after crossing C note boundary', () => {
        fc.assert(
            fc.property(fc.integer({ min: 0, max: TUNING.length - 1 }), fc.integer({ min: 0, max: Math.max(1, NUM_FRETS - 1) }), (stringIndex, fret) => {
                const octaveHere = getOctaveForNote(stringIndex, fret);
                const octaveNext = getOctaveForNote(stringIndex, fret + 1);
                // OctaveNext should be >= octaveHere and differ by at most 1
                expect(octaveNext).toBeGreaterThanOrEqual(octaveHere);
                expect(octaveNext - octaveHere).toBeLessThanOrEqual(1);
            })
        );
    });
});