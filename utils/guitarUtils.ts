import { TUNING, NUM_FRETS, ALL_NOTES, NOTE_MAP, SCALE_FORMULAS } from '../constants';
import type { DiagramNote, FingeringMap, PathDiagramNote, StructuredTab, Chord, Voicing, Result, ChordProgression, AnchorNoteContext } from '../types';
import { HandPositionModel } from '../models/HandPositionModel';

type ScaleNote = { noteName: string; degree: string };

export const generateScaleNotesFromFormula = (rootNote: string, scaleName: string): Result<ScaleNote[], Error> => {
    const formula = SCALE_FORMULAS[scaleName];
    if (!formula) return { type: 'failure', error: new Error(`Scale formula for "${scaleName}" not found.`) };
    
    const scaleNotes: ScaleNote[] = [{ noteName: rootNote, degree: 'R' }];
    let currentNoteIndex = NOTE_MAP[rootNote];
    for (const [interval, degree] of formula) {
        currentNoteIndex = (currentNoteIndex + interval) % ALL_NOTES.length;
        scaleNotes.push({ noteName: ALL_NOTES[currentNoteIndex], degree });
    }
    return { type: 'success', value: scaleNotes };
};

export const getDiagramMetadataFromScaleNotes = (scaleNotes: ScaleNote[]): { characteristicDegrees: string[] } => {
    const degrees = new Set(scaleNotes.map(n => n.degree));
    const characteristicDegrees = ['b2', '#4', 'b6'].filter(d => degrees.has(d));
    if (degrees.has('7') && degrees.has('b6')) characteristicDegrees.push('7');
    if (degrees.has('6') && degrees.has('b7')) characteristicDegrees.push('6');
    return { characteristicDegrees };
};

export const generateNotesOnFretboard = (scaleNotes: ScaleNote[]): DiagramNote[] => {
    const notes: DiagramNote[] = [];
    if (!scaleNotes?.length) return notes;
    const scaleNoteMap = new Map(scaleNotes.map(n => [n.noteName, n.degree]));
    for (let stringIndex = 0; stringIndex < TUNING.length; stringIndex++) {
        const openStringNoteIndex = NOTE_MAP[TUNING[stringIndex].toUpperCase()];
        if (openStringNoteIndex === undefined) continue;
        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const currentNoteName = ALL_NOTES[(openStringNoteIndex + fret) % ALL_NOTES.length];
            if (scaleNoteMap.has(currentNoteName)) {
                notes.push({ string: stringIndex, fret, noteName: currentNoteName, degree: scaleNoteMap.get(currentNoteName)! });
            }
        }
    }
    return notes;
};

type VoicingTemplate = Omit<Voicing, 'notes' | 'openStrings' | 'mutedStrings'> & {
    quality: 'maj' | 'min' | 'dim' | 'aug';
    rootNoteName?: string;
    isMovable: boolean;
    root: { string: number; fret: number };
    notes: (Omit<DiagramNote, 'noteName'>)[];
    openStrings?: number[];
    mutedStrings?: number[];
};

export const CHORD_VOICING_LIBRARY: VoicingTemplate[] = [
    // Open Chords
    { name: 'Open E Major', quality: 'maj', rootNoteName: 'E', isMovable: false, root: { string: 6, fret: 0 }, notes: [ { string: 4, fret: 2, finger: '2', degree: '5' }, { string: 3, fret: 2, finger: '3', degree: 'R' }, { string: 2, fret: 1, finger: '1', degree: '3' } ], openStrings: [6, 5, 1, 0] },
    { name: 'Open E Minor', quality: 'min', rootNoteName: 'E', isMovable: false, root: { string: 6, fret: 0 }, notes: [ { string: 4, fret: 2, finger: '2', degree: '5' }, { string: 3, fret: 2, finger: '3', degree: 'R' } ], openStrings: [6, 5, 2, 1, 0] },
    { name: 'Open A Major', quality: 'maj', rootNoteName: 'A', isMovable: false, root: { string: 5, fret: 0 }, notes: [ { string: 3, fret: 2, finger: '1', degree: '3' }, { string: 2, fret: 2, finger: '2', degree: '5' }, { string: 1, fret: 2, finger: '3', degree: 'R' } ], openStrings: [5, 0], mutedStrings: [6] },
    { name: 'Open A Minor', quality: 'min', rootNoteName: 'A', isMovable: false, root: { string: 5, fret: 0 }, notes: [ { string: 3, fret: 2, finger: '2', degree: 'b3' }, { string: 2, fret: 2, finger: '3', degree: '5' }, { string: 1, fret: 1, finger: '1', degree: 'R' } ], openStrings: [5, 0], mutedStrings: [6] },
    { name: 'Open D Major', quality: 'maj', rootNoteName: 'D', isMovable: false, root: { string: 3, fret: 0 }, notes: [ { string: 2, fret: 2, finger: '1', degree: '3' }, { string: 1, fret: 3, finger: '3', degree: '5' }, { string: 0, fret: 2, finger: '2', degree: 'R' } ], openStrings: [3], mutedStrings: [6, 5] },
    { name: 'Open D Minor', quality: 'min', rootNoteName: 'D', isMovable: false, root: { string: 3, fret: 0 }, notes: [ { string: 2, fret: 2, finger: '2', degree: 'b3' }, { string: 1, fret: 3, finger: '3', degree: '5' }, { string: 0, fret: 1, finger: '1', degree: 'R' } ], openStrings: [3], mutedStrings: [6, 5] },
    { name: 'Open G Major', quality: 'maj', rootNoteName: 'G', isMovable: false, root: { string: 2, fret: 0 }, notes: [ { string: 5, fret: 2, finger: '1', degree: '3' }, { string: 1, fret: 3, finger: '3', degree: '5' }, { string: 0, fret: 3, finger: '4', degree: 'R' } ], openStrings: [3, 2], mutedStrings: [6, 4] },
    { name: 'Open C Major', quality: 'maj', rootNoteName: 'C', isMovable: false, root: { string: 4, fret: 3 }, notes: [ { string: 4, fret: 3, finger: '3', degree: 'R' }, { string: 3, fret: 2, finger: '2', degree: '3' }, { string: 1, fret: 1, finger: '1', degree: 'R' } ], openStrings: [2, 0], mutedStrings: [6, 5] },
    
    // 7-String Barre Chords
    { name: 'E-Shape Barre (7-String)', quality: 'maj', isMovable: true, root: { string: 5, fret: 1 }, notes: [ { string: 6, fret: 1, finger: '1', degree: '5' }, { string: 5, fret: 1, finger: '1', degree: 'R' }, { string: 4, fret: 3, finger: '3', degree: '5' }, { string: 3, fret: 3, finger: '4', degree: 'R' }, { string: 2, fret: 2, finger: '2', degree: '3' }, { string: 1, fret: 1, finger: '1', degree: '5' }, { string: 0, fret: 1, finger: '1', degree: 'R' } ], barres: [{ fromString: 0, toString: 6, fret: 1 }] },
    { name: 'Em-Shape Barre (7-String)', quality: 'min', isMovable: true, root: { string: 5, fret: 1 }, notes: [ { string: 6, fret: 1, finger: '1', degree: '5' }, { string: 5, fret: 1, finger: '1', degree: 'R' }, { string: 4, fret: 3, finger: '3', degree: '5' }, { string: 3, fret: 3, finger: '4', degree: 'R' }, { string: 2, fret: 1, finger: '1', degree: 'b3' }, { string: 1, fret: 1, finger: '1', degree: '5' }, { string: 0, fret: 1, finger: '1', degree: 'R' } ], barres: [{ fromString: 0, toString: 6, fret: 1 }] },
    { name: 'A-Shape Barre (7-String)', quality: 'maj', isMovable: true, root: { string: 4, fret: 1 }, notes: [ { string: 5, fret: 1, finger: '1', degree: '3' }, { string: 4, fret: 1, finger: '1', degree: 'R' }, { string: 3, fret: 3, finger: '2', degree: '3' }, { string: 2, fret: 3, finger: '3', degree: '5' }, { string: 1, fret: 3, finger: '4', degree: 'R' }, { string: 0, fret: 1, finger: '1', degree: '3' } ], barres: [{ fromString: 0, toString: 5, fret: 1 }], mutedStrings: [6] },
    { name: 'Am-Shape Barre (7-String)', quality: 'min', isMovable: true, root: { string: 4, fret: 1 }, notes: [ { string: 5, fret: 1, finger: '1', degree: 'b3' }, { string: 4, fret: 1, finger: '1', degree: 'R' }, { string: 3, fret: 3, finger: '3', degree: 'b3' }, { string: 2, fret: 3, finger: '4', degree: '5' }, { string: 1, fret: 2, finger: '2', degree: 'R' }, { string: 0, fret: 1, finger: '1', degree: 'b3' } ], barres: [{ fromString: 0, toString: 5, fret: 1 }], mutedStrings: [6] },
    
    // Drop 2 Voicings on various string sets
    { name: 'Drop 2 Maj (DGBE)', quality: 'maj', isMovable: true, root: { string: 2, fret: 1 }, notes: [ { string: 3, fret: 0, degree: '5' }, { string: 2, fret: 1, finger: '2', degree: 'R' }, { string: 1, fret: 0, degree: '3' }, { string: 0, fret: 2, finger: '3', degree: '5' } ], mutedStrings: [6, 5, 4] },
    { name: 'Drop 2 Min (DGBE)', quality: 'min', isMovable: true, root: { string: 2, fret: 1 }, notes: [ { string: 3, fret: 0, degree: '5' }, { string: 2, fret: 1, finger: '2', degree: 'R' }, { string: 1, fret: -1, degree: 'b3' }, { string: 0, fret: 2, finger: '3', degree: '5' } ], mutedStrings: [6, 5, 4] }, // Note: -1 fret indicates relative position
    { name: 'Drop 2 Maj (ADGB)', quality: 'maj', isMovable: true, root: { string: 3, fret: 1 }, notes: [ { string: 4, fret: 0, degree: '5' }, { string: 3, fret: 1, finger: '2', degree: 'R' }, { string: 2, fret: 0, degree: '3' }, { string: 1, fret: 2, finger: '3', degree: '5' } ], mutedStrings: [6, 0] },
    { name: 'Drop 2 Min (ADGB)', quality: 'min', isMovable: true, root: { string: 3, fret: 1 }, notes: [ { string: 4, fret: 0, degree: '5' }, { string: 3, fret: 1, finger: '2', degree: 'R' }, { string: 2, fret: -1, degree: 'b3' }, { string: 1, fret: 2, finger: '3', degree: '5' } ], mutedStrings: [6, 0] },

    // Diminished and Augmented
    { name: 'Movable Diminished', quality: 'dim', isMovable: true, root: { string: 4, fret: 1 }, notes: [ { string: 4, fret: 1, finger: '1', degree: 'R' }, { string: 3, fret: 2, finger: '2', degree: 'b5' }, { string: 2, fret: 0, degree: 'R' }, { string: 1, fret: 2, finger: '3', degree: 'b3' } ], mutedStrings: [6, 5, 0] },
    { name: 'Movable Diminished 2', quality: 'dim', isMovable: true, root: { string: 5, fret: 1 }, notes: [ { string: 5, fret: 1, finger: '1', degree: 'R' }, { string: 4, fret: 2, finger: '2', degree: 'b5' }, { string: 3, fret: 0, degree: 'R' }, { string: 2, fret: 2, finger: '3', degree: 'b3' } ], mutedStrings: [6, 1, 0] },
    { name: 'Movable Augmented', quality: 'aug', isMovable: true, root: { string: 3, fret: 2 }, notes: [ { string: 3, fret: 2, finger: '2', degree: 'R' }, { string: 2, fret: 1, finger: '1', degree: '#5' }, { string: 1, fret: 1, finger: '1', degree: '3' } ], mutedStrings: [6, 5, 4, 0] },
    { name: 'Movable Augmented 2', quality: 'aug', isMovable: true, root: { string: 4, fret: 3 }, notes: [ { string: 4, fret: 3, finger: '3', degree: 'R' }, { string: 3, fret: 2, finger: '2', degree: '#5' }, { string: 2, fret: 2, finger: '2', degree: '3' } ], mutedStrings: [6, 5, 1, 0] },
];

export const generateDiatonicChords = (scaleNotes: ScaleNote[]): Map<string, Chord> => {
    const chords = new Map<string, Chord>();
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const notesOnFretboard = generateNotesOnFretboard(scaleNotes);

    for (let i = 0; i < scaleNotes.length; i++) {
        const rootScaleNote = scaleNotes[i];
        const third = scaleNotes[(i + 2) % scaleNotes.length];
        const fifth = scaleNotes[(i + 4) % scaleNotes.length];
        const triadNotes = [rootScaleNote.noteName, third.noteName, fifth.noteName];
        
        const rootIndex = NOTE_MAP[rootScaleNote.noteName];
        const thirdIndex = NOTE_MAP[third.noteName];
        const fifthIndex = NOTE_MAP[fifth.noteName];
        const interval3 = (thirdIndex - rootIndex + 12) % 12;
        const interval5 = (fifthIndex - rootIndex + 12) % 12;

        let quality: 'maj' | 'min' | 'dim' | 'aug' = 'maj';
        let degree = romanNumerals[i];
        let nameSuffix = '';

        if (interval3 === 3) { // Minor third
            quality = 'min';
            degree = degree.toLowerCase();
            nameSuffix = 'm';
            if (interval5 === 6) { // Diminished fifth
                quality = 'dim'; 
                degree = `${degree}°`; 
                nameSuffix = 'dim';
            }
        } else if (interval5 === 8) { // Augmented fifth
            quality = 'aug';
            degree = `${degree}+`;
            nameSuffix = 'aug';
        }

        const voicings: Voicing[] = [];
        CHORD_VOICING_LIBRARY.filter(v => v.quality === quality).forEach(template => {
            if (template.isMovable) {
                notesOnFretboard
                    .filter(n => typeof n.fret === 'number' && n.noteName === rootScaleNote.noteName && n.string === template.root.string && n.fret > 0 && n.fret < 20)
                    .forEach(anchorNote => {
                        const fretDifference = (anchorNote.fret as number) - template.root.fret;
                        const transposedNotes = template.notes.map(note => ({ ...note, fret: (note.fret as number) + fretDifference }));
                        
                        if (transposedNotes.every(n => (n.fret as number) >= 0 && (n.fret as number) <= NUM_FRETS)) {
                            voicings.push({
                                name: `${template.name} @ ${anchorNote.fret}fr`,
                                notes: transposedNotes,
                                barres: template.barres?.map(b => ({ ...b, fret: b.fret + fretDifference })),
                                mutedStrings: template.mutedStrings,
                            });
                        }
                    });
            } else if (template.rootNoteName === rootScaleNote.noteName) {
                voicings.push({
                    name: template.name, notes: template.notes.map(n => ({...n})),
                    barres: template.barres, openStrings: template.openStrings, mutedStrings: template.mutedStrings,
                });
            }
        });
        
        chords.set(degree, {
            name: `${rootScaleNote.noteName}${nameSuffix}`,
            degree: degree,
            voicings: voicings,
            triadNotes: triadNotes,
        });
    }
    return chords;
};

// FIX: Replaced the rigid position generation with a more sophisticated and ergonomic algorithm.
// This new implementation identifies optimal 5-fret windows for the hand, resulting in
// fingerings that are more comfortable and practical for a guitarist to play. It addresses
// the core bug where the previous logic produced awkward or unplayable positions.
export const generateFingeringPositions = (notesOnFretboard: DiagramNote[]): FingeringMap[] => {
    if (notesOnFretboard.length < 7) return [];

    const positions: FingeringMap[] = [];
    const processedWindows = new Set<string>();

    // Iterate up the neck to find potential anchor points for scale positions
    for (let fret = 0; fret <= 15; fret++) {
        // An anchor is a note on one of the two lowest strings, a common starting point for a position.
        const hasAnchorNote = notesOnFretboard.some(
            note => (note.string === 6 || note.string === 5) && note.fret === fret
        );

        if (hasAnchorNote) {
            // For each anchor, evaluate two possible 5-fret hand positions (windows):
            // 1. Starting at the anchor fret (index finger on the anchor).
            // 2. Starting one fret below the anchor (middle finger on the anchor).
            // We choose the window that contains the most scale notes.
            const windowA_Start = fret;
            const windowB_Start = Math.max(0, fret - 1);

            const countNotesInWindow = (start: number, end: number) =>
                notesOnFretboard.filter(n => typeof n.fret === 'number' && n.fret >= start && n.fret <= end).length;
            
            const noteCountA = countNotesInWindow(windowA_Start, windowA_Start + 4);
            const noteCountB = countNotesInWindow(windowB_Start, windowB_Start + 4);

            // Determine the optimal starting fret for the position window.
            const baseFret = (noteCountB > noteCountA && fret > 0) ? windowB_Start : windowA_Start;
            const maxFret = baseFret + 4;
            
            const windowKey = `${baseFret}-${maxFret}`;
            if (processedWindows.has(windowKey)) continue;

            // Collect all notes that fall within this optimal window.
            const notesInPosition = notesOnFretboard.filter(
                note => typeof note.fret === 'number' && note.fret >= baseFret && note.fret <= maxFret
            );

            // Assign fingerings based on a one-finger-per-fret system relative to the window's start.
            const positionFingering: FingeringMap = notesInPosition.map(note => {
                const fret = note.fret as number;
                let finger: string;
                if (fret === 0 && baseFret === 0) {
                    finger = '0'; // Open string
                } else {
                    const fretOffset = fret - baseFret;
                    finger = (fretOffset + 1).toString();
                }
                return { key: `${note.string}_${fret}`, finger };
            });

            // A valid position should cover at least 5 strings and contain a reasonable number of notes.
            const stringsCovered = new Set(notesInPosition.map(n => n.string)).size;
            if (stringsCovered >= 5 && positionFingering.length >= 10) {
                positions.push(positionFingering);
                processedWindows.add(windowKey);
            }
        }
    }

    // Sort positions by their starting fret.
    positions.sort((a, b) => {
        const minFretA = Math.min(...a.map(item => parseInt(item.key.split('_')[1], 10)));
        const minFretB = Math.min(...b.map(item => parseInt(item.key.split('_')[1], 10)));
        return minFretA - minFretB;
    });

    return positions.slice(0, 7); // Return up to 7 distinct positions.
};


export const generateDiagonalRun = (notesOnFretboard: DiagramNote[]): PathDiagramNote[] => {
    if (notesOnFretboard.length === 0) return [];
    
    const handModel = new HandPositionModel(notesOnFretboard);
    
    const lowestRoot = notesOnFretboard
        .filter(n => n.degree === 'R')
        .sort((a, b) => b.string - a.string || (typeof a.fret === 'number' && typeof b.fret === 'number' ? a.fret - b.fret : 0))[0];

    if (!lowestRoot) return [];

    return handModel.generateFullPath(lowestRoot);
};


export const generateHarmonizationTab = (fingering: FingeringMap[], scaleNotes: ScaleNote[], interval: number): StructuredTab => {
    return { columns: [] };
};

export const formatPathAsTab = (path: PathDiagramNote[]): StructuredTab => {
    if (!path || path.length === 0) return { columns: [] };

    const tab: StructuredTab = { columns: [] };
    const NOTES_PER_BAR = 8;

    for (let i = 0; i < path.length; i++) {
        const note = path[i];
        
        // FIX: Add a guard clause to handle potentially malformed data from the AI.
        // If a note has an invalid string index, skip it to prevent a crash.
        if (typeof note.string !== 'number' || note.string < 0 || note.string >= TUNING.length) {
            console.warn('Skipping note with invalid string index from AI-generated path:', note);
            continue;
        }
        
        const prevNote = i > 0 ? path[i - 1] : null;

        const tabColumn = Array.from({ length: 7 }, (_, s) => ({ string: s, fret: '-' }));
        let fretValue = note.fret.toString();

        // If this note is the destination of a slide from the previous note on the same string
        if (note.shiftType === 'slide' && prevNote && prevNote.string === note.string) {
             fretValue = `/${note.fret}`;
        }
        
        tabColumn[note.string].fret = fretValue;
        tab.columns.push(tabColumn);

        // Add a bar line every N notes
        if ((i + 1) % NOTES_PER_BAR === 0 && i < path.length - 1) {
            const barLineColumn = Array.from({ length: 7 }, (_, s) => ({ string: s, fret: '|' }));
            tab.columns.push(barLineColumn);
        }
    }

    return tab;
};

export const generateDegreeTableMarkdown = (scaleNotes: ScaleNote[]): string => {
    const headers = '| Degree | Note |';
    const separator = '|---|---|';
    const rows = scaleNotes.map(n => `| ${n.degree} | ${n.noteName} |`).join('\n');
    return `${headers}\n${separator}\n${rows}`;
};

const PROGRESSION_FORMULAS: Record<string, { name: string; analysis: string; degrees: string[]; }[]> = {
    'Major': [
        { name: 'Classic Pop/Rock', analysis: 'I - V - vi - IV', degrees: ['I', 'V', 'vi', 'IV'] },
        { name: 'Folk & Blues', analysis: 'I - IV - V', degrees: ['I', 'IV', 'V'] },
    ],
    'Natural Minor': [
        { name: 'Standard Minor', analysis: 'i - VI - III - VII', degrees: ['i', 'VI', 'III', 'VII'] },
        { name: 'Andalusian Cadence', analysis: 'i - VII - VI - V', degrees: ['i', 'VII', 'VI', 'V'] },
    ],
    'Harmonic Minor': [
        { name: 'Dramatic Minor', analysis: 'i - iv - V - i', degrees: ['i', 'iv', 'V', 'i'] },
        { name: 'Neoclassical Turnaround', analysis: 'i - VI - vii° - i', degrees: ['i', 'VI', 'vii°', 'i'] },
    ],
};

export const generateCommonProgressions = (diatonicChords: Map<string, Chord>, scaleName: string): ChordProgression[] => {
    const formulas = PROGRESSION_FORMULAS[scaleName] || PROGRESSION_FORMULAS['Natural Minor']; // Default
    
    return formulas.map(formula => {
        const chords = formula.degrees.map(degree => {
            const foundKey = Array.from(diatonicChords.keys()).find(k => k.toLowerCase().replace('°', '').replace('+', '') === degree.toLowerCase());
            return diatonicChords.get(foundKey || degree) || { name: 'N/A', degree, voicings: [], triadNotes: [] };
        });
        return {
            name: formula.name,
            analysis: formula.analysis,
            chords,
        }
    });
};

const getDegreeInTriad = (noteName: string, triad: string[], quality: 'maj' | 'min' | 'dim' | 'aug'): string => {
    const index = triad.indexOf(noteName);
    switch (index) {
        case 0: return 'R';
        case 1: return (quality === 'min' || quality === 'dim') ? 'b3' : '3';
        case 2: return quality === 'dim' ? 'b5' : quality === 'aug' ? '#5' : '5';
        default: return '';
    }
};


export const generateAnchorNoteContextsFromFretboard = (
    anchorNote: DiagramNote,
    diatonicChords: Chord[],
    notesOnFretboard: DiagramNote[]
): AnchorNoteContext[] => {
    const contexts: AnchorNoteContext[] = [];
    if (typeof anchorNote.fret !== 'number') return [];

    for (const chord of diatonicChords) {
        if (chord.triadNotes.includes(anchorNote.noteName!)) {
            // Determine the quality of the chord to correctly label degrees
            let quality: 'maj' | 'min' | 'dim' | 'aug' = 'maj';
            if (chord.name.includes('dim')) quality = 'dim';
            else if (chord.name.includes('aug')) quality = 'aug';
            else if (chord.name.includes('m')) quality = 'min';

            const description = `${getDegreeInTriad(anchorNote.noteName!, chord.triadNotes, quality)} of ${chord.name} (${chord.degree})`;

            // Define an ergonomic 5-fret "hand box" around the anchor note
            const baseFret = Math.max(0, anchorNote.fret - 2);
            const maxFret = baseFret + 4;

            // Find all notes of the current chord's triad that are physically reachable within this box
            const arpeggioNotesInBox = notesOnFretboard.filter(note =>
                typeof note.fret === 'number' &&
                chord.triadNotes.includes(note.noteName!) &&
                note.fret >= baseFret &&
                note.fret <= maxFret
            );
            
            // Ensure the context provides more than just the anchor note itself
            if (arpeggioNotesInBox.length < 2) continue;

            // Assign logical fingerings using a one-finger-per-fret system
            const fingeredArpeggioNotes = arpeggioNotesInBox.map(note => {
                const fret = note.fret as number;
                const finger = (fret - baseFret + 1).toString();
                return {
                    ...note,
                    finger,
                    degree: getDegreeInTriad(note.noteName!, chord.triadNotes, quality)
                };
            });

            contexts.push({
                description,
                arpeggioNotes: fingeredArpeggioNotes,
            });
        }
    }
    
    // Sort contexts to show more complex/useful patterns first
    return contexts.sort((a, b) => b.arpeggioNotes.length - a.arpeggioNotes.length);
};