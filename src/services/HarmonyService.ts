import { NOTE_MAP, normalizeNoteName } from '../constants.ts';
import { runtimeConfig } from '../config';
import { generateCAGEDVoicings } from '../../utils/guitarUtils';
import type { Chord, Voicing, DiagramNote, ScaleData, ChordProgression, AnchorNoteContext, ChordInspectorData } from '../types';
import { MusicTheoryService } from './MusicTheoryService';

type ScaleNote = { noteName: string; degree: string };

// FIX: Corrected the array intersection type. It should be an array of intersected objects `(A & B)[]`, not an intersection of arrays `A[] & B[]`.
const CHORD_VOICING_LIBRARY: (Omit<Voicing, 'notes'> & {
    quality: Chord['quality'][];
    root: { string: number; fret: number }; // Root note location in the shape
    notes: (Omit<DiagramNote, 'noteName'>)[];
})[] = [
    // 7-String Barre Chords
    { name: 'E-Shape Barre (7-String)', quality: ['maj', 'maj7', 'dom7'], root: { string: 5, fret: 0 }, notes: [ { string: 6, fret: 0, finger: '1', degree: '5' }, { string: 5, fret: 0, finger: '1', degree: 'R' }, { string: 4, fret: 2, finger: '3', degree: '5' }, { string: 3, fret: 2, finger: '4', degree: 'R' }, { string: 2, fret: 1, finger: '2', degree: '3' }, { string: 1, fret: 0, finger: '1', degree: '5' }, { string: 0, fret: 0, finger: '1', degree: 'R' } ], barres: [{ fromString: 0, toString: 6, fret: 0 }] },
    { name: 'Em-Shape Barre (7-String)', quality: ['min', 'min7'], root: { string: 5, fret: 0 }, notes: [ { string: 6, fret: 0, finger: '1', degree: '5' }, { string: 5, fret: 0, finger: '1', degree: 'R' }, { string: 4, fret: 2, finger: '3', degree: '5' }, { string: 3, fret: 2, finger: '4', degree: 'R' }, { string: 2, fret: 0, finger: '1', degree: 'b3' }, { string: 1, fret: 0, finger: '1', degree: '5' }, { string: 0, fret: 0, finger: '1', degree: 'R' } ], barres: [{ fromString: 0, toString: 6, fret: 0 }] },
    
    // Shell Voicings (R-3-7 or R-7-3)
    { name: 'Shell (EAD)', quality: ['maj7', 'dom7'], root: { string: 5, fret: 0 }, notes: [ { string: 5, fret: 0, finger: '1', degree: 'R' }, { string: 4, fret: -1, finger: '1', degree: '7' }, { string: 3, fret: 1, finger: '2', degree: '3' } ], mutedStrings: [6, 2, 1, 0] },
    { name: 'Shell (EAD)', quality: ['min7', 'min7b5'], root: { string: 5, fret: 0 }, notes: [ { string: 5, fret: 0, finger: '1', degree: 'R' }, { string: 4, fret: -2, finger: '1', degree: 'b7' }, { string: 3, fret: 0, finger: '1', degree: 'b3' } ], mutedStrings: [6, 2, 1, 0] },
    { name: 'Shell (ADG)', quality: ['maj7', 'dom7'], root: { string: 4, fret: 0 }, notes: [ { string: 4, fret: 0, finger: '1', degree: 'R' }, { string: 3, fret: -1, finger: '1', degree: '7' }, { string: 2, fret: 1, finger: '2', degree: '3' } ], mutedStrings: [6, 5, 1, 0] },
    { name: 'Shell (ADG)', quality: ['min7', 'min7b5'], root: { string: 4, fret: 0 }, notes: [ { string: 4, fret: 0, finger: '1', degree: 'R' }, { string: 3, fret: -2, finger: '1', degree: 'b7' }, { string: 2, fret: 0, finger: '1', degree: 'b3' } ], mutedStrings: [6, 5, 1, 0] },
    { name: 'Shell (DGB)', quality: ['maj7', 'dom7'], root: { string: 3, fret: 0 }, notes: [ { string: 3, fret: 0, finger: '1', degree: 'R' }, { string: 2, fret: -1, finger: '1', degree: '7' }, { string: 1, fret: 1, finger: '2', degree: '3' } ], mutedStrings: [6, 5, 4, 0] },
    { name: 'Shell (DGB)', quality: ['min7', 'min7b5'], root: { string: 3, fret: 0 }, notes: [ { string: 3, fret: 0, finger: '1', degree: 'R' }, { string: 2, fret: -2, finger: '1', degree: 'b7' }, { string: 1, fret: 0, finger: '1', degree: 'b3' } ], mutedStrings: [6, 5, 4, 0] },
];

export class HarmonyService {

    public static generateDiatonicChords(scaleNotes: ScaleNote[], notesOnFretboard: DiagramNote[]): Map<string, Chord> {
        const chords = new Map<string, Chord>();
        const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']; // Example for Major
    const scaleNoteNames = scaleNotes.map(n => normalizeNoteName(n.noteName));

        for (let i = 0; i < scaleNotes.length; i++) {
            const root = scaleNoteNames[i];
            const third = scaleNoteNames[(i + 2) % scaleNoteNames.length];
            const fifth = scaleNoteNames[(i + 4) % scaleNoteNames.length];
            const seventh = scaleNoteNames[(i + 6) % scaleNoteNames.length];
            
            const rootIdx = NOTE_MAP[normalizeNoteName(root)];
            const thirdInterval = (NOTE_MAP[normalizeNoteName(third)] - rootIdx + 12) % 12;
            const fifthInterval = (NOTE_MAP[normalizeNoteName(fifth)] - rootIdx + 12) % 12;
            const seventhInterval = (NOTE_MAP[normalizeNoteName(seventh)] - rootIdx + 12) % 12;
            
            let quality: Chord['quality'] = 'maj';
            let degree = '';
            let name = root;

            if (thirdInterval === 4) { // Major 3rd
                if (fifthInterval === 7) { // Perfect 5th
                    if (seventhInterval === 11) { quality = 'maj7'; degree = romanNumerals[i].toUpperCase() + 'M7'; name += 'maj7'; }
                    else if (seventhInterval === 10) { quality = 'dom7'; degree = romanNumerals[i].toUpperCase() + '7'; name += '7'; }
                    else { quality = 'maj'; degree = romanNumerals[i].toUpperCase(); }
                } else if (fifthInterval === 8) { quality = 'aug'; degree = romanNumerals[i].toUpperCase() + '+'; name += 'aug'; }
            } else if (thirdInterval === 3) { // Minor 3rd
                if (fifthInterval === 7) {
                     if (seventhInterval === 10) { quality = 'min7'; degree = romanNumerals[i] + 'm7'; name += 'm7'; }
                     else { quality = 'min'; degree = romanNumerals[i]; name += 'm'; }
                } else if (fifthInterval === 6) {
                    if (seventhInterval === 10) { quality = 'min7b5'; degree = romanNumerals[i] + 'ø7'; name += 'm7b5'; }
                    else if (seventhInterval === 9) { quality = 'dim7'; degree = romanNumerals[i] + '°7'; name += 'dim7'; }
                    else { quality = 'dim'; degree = romanNumerals[i] + '°'; name += 'dim'; }
                }
            }

            const voicings: Voicing[] = [];
            // Start with the static voicing library; then for major chords include CAGED-generated templates
            let templates = CHORD_VOICING_LIBRARY.filter(v => v.quality.includes(quality));
            if (quality === 'maj') {
                const cages = generateCAGEDVoicings(root).map(t => ({
                    name: t.name,
                    quality: [t.quality as any],
                    root: t.root,
                    notes: t.notes,
                    openStrings: t.openStrings,
                    mutedStrings: t.mutedStrings,
                    isMovable: t.isMovable,
                }));
                templates = templates.concat(cages as any);
            }
            if (!runtimeConfig.enableShellVoicings) {
                templates = templates.filter(t => !(t.mutedStrings && t.mutedStrings.length > 0 && (!t.openStrings || t.openStrings.length < (t.mutedStrings.length - 1))));
            }
            templates.forEach(template => {
                      notesOnFretboard
                          .filter(n => normalizeNoteName(n.noteName!) === normalizeNoteName(root) && n.string === template.root.string && typeof n.fret === 'number' && n.fret > 0 && n.fret < 20)
                    .forEach(anchorNote => {
                        const fretDiff = (anchorNote.fret as number) - template.root.fret;
                        const transposedNotes = template.notes.map(note => ({ ...note, fret: (note.fret as number) + fretDiff }));
                        
                        if (transposedNotes.every(n => (n.fret as number) >= 0 && (n.fret as number) <= 24)) {
                            voicings.push({
                                name: `${template.name} @ ${anchorNote.fret}fr`,
                                notes: transposedNotes.map(n => ({...n, noteName: ''})), // noteName to be filled later if needed
                                barres: template.barres?.map(b => ({ ...b, fret: b.fret + fretDiff })),
                                mutedStrings: template.mutedStrings,
                            });
                        }
                    });
            });

            chords.set(degree, { name, degree, quality, voicings, triadNotes: [root, third, fifth], seventhNotes: [root, third, fifth, seventh] });
        }
        return chords;
    }

    public static getChordInspectorData(chord: Chord, parentScale: ScaleNote[]): ChordInspectorData {
    // Normalize parent scale and chord tone names so all interval math uses canonical names
    const parentScaleNotes = new Set(parentScale.map(n => normalizeNoteName(n.noteName)));
    const chordTones = chord.seventhNotes.map(n => normalizeNoteName(n)); // Use 7th chord tones for analysis (normalized)
    const scaleTones = Array.from(parentScaleNotes).filter(note => !chordTones.includes(note));

    if (chordTones.length === 0) return { chordTones, scaleTones, tensionNotes: [] } as any;

    const chordRootIndex = NOTE_MAP[chordTones[0]];
    const tensionNotes: string[] = [];

        for (const note of scaleTones) {
            const noteIndex = NOTE_MAP[note];
            const interval = (noteIndex - chordRootIndex + 12) % 12;
            // Common tensions are 9ths (2), 11ths (5), 13ths (9)
            // And alterations b9 (1), #9 (3), #11 (6), b13 (8)
            if ([1,2,3,5,6,8,9].includes(interval)) {
                 // Avoid P11 on major/dom chords
                if (interval === 5 && (chord.quality.includes('maj') || chord.quality.includes('dom'))) continue;
                tensionNotes.push(note);
            }
        }
        
        return { chordTones, scaleTones, tensionNotes };
    }

    public static generateCommonProgressions(diatonicChords: Map<string, Chord>, scaleName: string): ChordProgression[] {
        const formulas = MusicTheoryService.getProgressionFormulas(scaleName);
        return formulas.map(formula => ({
            name: formula.name,
            analysis: formula.analysis,
            chords: formula.degrees.map(degree => {
                const foundKey = Array.from(diatonicChords.keys()).find(k => k.startsWith(degree));
                return diatonicChords.get(foundKey || degree)!;
            }).filter(Boolean)
        }));
    }

    public static generateAnchorNoteContexts(anchorNote: DiagramNote, diatonicChords: Chord[], notesOnFretboard: DiagramNote[]): AnchorNoteContext[] {
         if (typeof anchorNote.fret !== 'number' || !anchorNote.noteName) return [];
         const contexts: AnchorNoteContext[] = [];

        const getDegreeInTriad = (noteName: string, triad: string[], quality: Chord['quality']): string => {
            const index = triad.findIndex(n => normalizeNoteName(n) === normalizeNoteName(noteName));
            switch (index) {
                case 0: return 'R';
                case 1: return (quality === 'min' || quality === 'dim') ? 'b3' : '3';
                case 2: return quality === 'dim' ? 'b5' : quality === 'aug' ? '#5' : '5';
                default: return '';
            }
        };

        for (const chord of diatonicChords) {
            // Normalize the chord tones for comparison
            const chordTones = (chord.seventhNotes || []).map(n => normalizeNoteName(n));
            if (chordTones.length === 0) continue;

            if (chordTones.includes(normalizeNoteName(anchorNote.noteName!))) {
                const baseFret = Math.max(0, anchorNote.fret - 2);
                const maxFret = baseFret + 4;

                const arpeggioNotesInBox = notesOnFretboard.filter(note =>
                    typeof note.fret === 'number' && chordTones.includes(normalizeNoteName(note.noteName!)) &&
                    note.fret >= baseFret && note.fret <= maxFret
                );
                if (arpeggioNotesInBox.length < 2) continue;

                // Determine chord quality for degree labeling
                let quality: Chord['quality'] = 'maj';
                if (chord.name.includes('dim')) quality = 'dim';
                else if (chord.name.includes('aug')) quality = 'aug';
                else if (chord.name.includes('m')) quality = 'min';

                const fingeredArpeggioNotes = arpeggioNotesInBox.map(note => ({
                    ...note,
                    finger: ((note.fret as number) - baseFret + 1).toString(),
                    degree: getDegreeInTriad(note.noteName!, chord.triadNotes, quality)
                }));

                contexts.push({
                    description: `${anchorNote.noteName} as part of ${chord.name} (${chord.degree})`,
                    arpeggioNotes: fingeredArpeggioNotes,
                });
            }
        }
        return contexts.sort((a, b) => b.arpeggioNotes.length - a.arpeggioNotes.length);
    }
}