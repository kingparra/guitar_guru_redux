import type { CreativeExercise, DiagramNote, PathDiagramNote, Result, SectionKey } from '../types';

export class FallbackService {

    /**
     * Generates a systematic, full-fretboard etude as a fallback.
     * This ensures a high-quality, comprehensive exercise is always available,
     * even if the AI generation fails.
     */
    public static generateCreativeExercise(
        type: 'arpeggioEtude' | 'motifEtude',
        rootNote: string,
        scaleName: string,
        notesOnFretboard: DiagramNote[]
    ): Result<CreativeExercise, Error> {
        
        if (!notesOnFretboard || notesOnFretboard.length === 0) {
            return { type: 'failure', error: new Error('Cannot generate fallback exercise without fretboard data.') };
        }

        // Create a copy and sort notes from low-string/low-fret to high-string/high-fret
        const sortedNotes = [...notesOnFretboard].sort((a, b) => {
            if (a.string !== b.string) return b.string - a.string;
            const fretA = typeof a.fret === 'number' ? a.fret : Infinity;
            const fretB = typeof b.fret === 'number' ? b.fret : Infinity;
            return fretA - fretB;
        });

        // The path is simply a systematic traversal of all notes.
        // A simple finger-per-fret logic is used for the fingerings.
        const path: PathDiagramNote[] = sortedNotes.map(note => {
            const fret = typeof note.fret === 'number' ? note.fret : 0;
            // Simple logic: use fingers 1-4 based on fret number modulo 4.
            const finger = (fret > 0) ? ((fret - 1) % 4 + 1).toString() : '0';
            return { ...note, finger };
        });

        const title = type === 'arpeggioEtude' 
            ? 'Systematic Fretboard Study (Fallback)' 
            : 'Linear Sequence Study (Fallback)';
            
        const explanation = type === 'arpeggioEtude'
            ? 'This is a procedurally generated fallback exercise. It systematically covers every fretting of the scale, string by string, from the lowest note to the highest. Use it to build a complete mental map of the fretboard.'
            : 'This is a procedurally generated fallback exercise. It presents a linear traversal of every single note of the scale in ascending order. This is a foundational technical drill for building muscle memory and visualizing the scale\'s complete path across the neck.';

        return {
            type: 'success',
            value: {
                title,
                explanation,
                path
            }
        };
    }
}
