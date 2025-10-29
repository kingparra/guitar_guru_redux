import { describe, it, expect } from 'vitest';
import { MusicTheoryService } from './MusicTheoryService';

describe('MusicTheoryService', () => {
    describe('generateScaleNotes', () => {
        it('should generate a C Major scale correctly', () => {
            const result = MusicTheoryService.generateScaleNotes('C', 'Major');
            expect(result.type).toBe('success');
            if (result.type === 'success') {
                const noteNames = result.value.map(n => n.noteName);
                expect(noteNames).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
                const degrees = result.value.map(n => n.degree);
                expect(degrees).toEqual(['R', '2', '3', '4', '5', '6', '7']);
            }
        });

        it('should generate an A Natural Minor scale correctly', () => {
            const result = MusicTheoryService.generateScaleNotes('A', 'Natural Minor');
            expect(result.type).toBe('success');
            if (result.type === 'success') {
                const noteNames = result.value.map(n => n.noteName);
                expect(noteNames).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
                 const degrees = result.value.map(n => n.degree);
                expect(degrees).toEqual(['R', '2', 'b3', '4', '5', 'b6', 'b7']);
            }
        });

        it('should generate an E Minor Pentatonic scale correctly', () => {
            const result = MusicTheoryService.generateScaleNotes('E', 'Minor Pentatonic');
            expect(result.type).toBe('success');
            if (result.type === 'success') {
                const noteNames = result.value.map(n => n.noteName);
                expect(noteNames).toEqual(['E', 'G', 'A', 'B', 'D']);
                 const degrees = result.value.map(n => n.degree);
                expect(degrees).toEqual(['R', 'b3', '4', '5', 'b7']);
            }
        });

        it('should handle sharps in the root note', () => {
            const result = MusicTheoryService.generateScaleNotes('F#', 'Major');
            expect(result.type).toBe('success');
            if (result.type === 'success') {
                const noteNames = result.value.map(n => n.noteName);
                expect(noteNames).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F']);
            }
        });
        
        it('should return a failure result for an unknown scale name', () => {
            const result = MusicTheoryService.generateScaleNotes('C', 'Unknown Scale');
            expect(result.type).toBe('failure');
            if (result.type === 'failure') {
                expect(result.error).toBeInstanceOf(Error);
                expect(result.error.message).toContain('Scale formula for "Unknown Scale" not found.');
            }
        });
    });
});