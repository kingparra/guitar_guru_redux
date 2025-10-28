import type { DiagramNote, HandPosition, ShiftOption, PathNode } from '../types';

/**
 * A software model representing the guitarist's fretting hand.
 * This "agent" operates on the fretboard according to biomechanical principles
 * to find the most ergonomic paths for musical passages.
 */
export class HandPositionModel {
    private hand: HandPosition;
    private readonly notesOnFretboard: DiagramNote[];
    private readonly notesByString: Map<number, DiagramNote[]>;

    constructor(notesOnFretboard: DiagramNote[]) {
        // Sort master list from low string to high, then low fret to high
        this.notesOnFretboard = [...notesOnFretboard].sort((a,b) => (b.string - a.string) || (typeof a.fret === 'number' && typeof b.fret === 'number' ? a.fret - b.fret : 0));
        
        this.notesByString = new Map();
        for (let i = 0; i < 7; i++) {
            this.notesByString.set(i, 
                this.notesOnFretboard
                    .filter(n => n.string === i)
                    .sort((a, b) => typeof a.fret === 'number' && typeof b.fret === 'number' ? a.fret - b.fret : 0)
            );
        }
        // Initialize with a default hand position
        this.hand = { anchorFret: 1, span: 4 }; 
    }

    /**
     * Finds a phrase of consecutive scale notes on a single string that are playable
     * within the hand's current comfortable reach.
     * @param startNode The note to begin the phrase from.
     * @returns An array of notes forming a playable phrase.
     */
    private findPhraseInReach(startNode: DiagramNote): PathNode[] {
        if (typeof startNode.fret !== 'number') return [];

        const notesOnString = this.notesByString.get(startNode.string) || [];
        const startIndex = notesOnString.findIndex(n => n.fret === startNode.fret);
        
        if (startIndex === -1) return [];
        
        // Anchor the hand based on the start note of the phrase
        this.hand.anchorFret = startNode.fret > 1 ? startNode.fret - 1 : startNode.fret;
        this.hand.span = this.hand.anchorFret < 5 ? 4 : 5; // Wider span on higher frets

        const phrase: PathNode[] = []; 
        for (let i = startIndex; i < notesOnString.length; i++) {
            const nextNote = notesOnString[i];
            if (typeof nextNote.fret !== 'number') continue;
            
            const fretDifference = nextNote.fret - this.hand.anchorFret;

            // Check if the note is within the hand's current span
            if (fretDifference >= 0 && fretDifference <= this.hand.span) {
                // Assign an ergonomic finger based on fret difference
                const finger = Math.min(4, Math.max(1, fretDifference + 1)).toString();
                phrase.push({ ...nextNote, finger });
            } else {
                break; // Note is out of reach, end of phrase
            }
        }
        return phrase;
    }
    
    /**
     * Models the physical movement of the hand by evaluating all possible next moves
     * and choosing the one with the lowest "cost", creating a path of least resistance.
     * @param lastNote The last note played, from which the shift originates.
     * @returns The most ergonomic shift option, or null if no path is found.
     */
    private findNextErgonomicShift(lastNote: DiagramNote): ShiftOption | null {
        if (typeof lastNote.fret !== 'number') return null;
        
        const options: ShiftOption[] = [];
        const masterIndex = this.notesOnFretboard.findIndex(n => n.string === lastNote.string && n.fret === lastNote.fret);

        if (masterIndex === -1) return null;
        
        // Scan ahead in the master sorted list of notes for potential candidates
        for (let i = masterIndex + 1; i < this.notesOnFretboard.length; i++) {
            const candidate = this.notesOnFretboard[i];
            if (typeof candidate.fret !== 'number') continue;
            
            // A. Intra-String Shift (Slide)
            if (candidate.string === lastNote.string) {
                const slideDistance = candidate.fret - lastNote.fret;
                if (slideDistance > 0 && slideDistance <= 4) { // Realistic slides
                     options.push({
                        note: candidate,
                        cost: 1 + slideDistance, // Base cost + distance cost
                        shiftType: 'slide',
                    });
                }
            }

            // B. Inter-String Shift (Repositioning)
            if (candidate.string === lastNote.string - 1) { // Only consider adjacent strings
                const fretDistance = Math.abs(candidate.fret - lastNote.fret);
                 if (fretDistance <= 3) { // Is it an easy reach?
                    options.push({
                        note: candidate,
                        cost: 1.5 + fretDistance, // Cross-string is slightly more "expensive"
                        shiftType: 'reposition',
                    });
                }
            }

            // Optimization: Stop searching if we've moved too far ahead in the scale
            if (candidate.string < lastNote.string - 1) break;
        }

        if (options.length === 0) {
             // Fallback: If no good options are found, take the very next note in the scale
             if (masterIndex + 1 < this.notesOnFretboard.length) {
                return {
                    note: this.notesOnFretboard[masterIndex + 1],
                    cost: 10, // High cost for an awkward jump
                    shiftType: 'reposition',
                }
            }
            return null; // Truly the end of the line
        }

        // Return the shift with the lowest ergonomic cost
        return options.sort((a, b) => a.cost - b.cost)[0];
    }
    
    /**
     * Generates a full, continuous, and ergonomic path up the fretboard.
     * @param startNote The note to begin the entire run.
     * @returns A single array of notes representing the complete diagonal run.
     */
    public generateFullPath(startNote: DiagramNote): PathNode[] {
        let path: PathNode[] = [];
        let currentNode: DiagramNote | null = startNote;
        
        while (currentNode) {
            const phrase = this.findPhraseInReach(currentNode);
            if (phrase.length > 0) {
                // Prevent adding duplicate notes if a slide starts a new phrase
                const lastNoteInPath = path.length > 0 ? path[path.length - 1] : null;
                if (!lastNoteInPath || !(lastNoteInPath.string === phrase[0].string && lastNoteInPath.fret === phrase[0].fret)) {
                   path.push(...phrase);
                } else {
                   // If the phrase starts with the last note, skip it and add the rest
                   path.push(...phrase.slice(1));
                }

                const lastNoteInPhrase = phrase[phrase.length - 1];
                const nextShift = this.findNextErgonomicShift(lastNoteInPhrase);
                
                if (nextShift) {
                    const nextNode = nextShift.note as PathNode;
                    if (nextShift.shiftType === 'slide') {
                        nextNode.shiftType = 'slide';
                    }
                    currentNode = nextNode;
                } else {
                    currentNode = null; // End of the run
                }
            } else {
                 currentNode = null; // End of the run
            }
        }
        return path;
    }
}
