import { TUNING, NUM_FRETS, ALL_NOTES, NOTE_MAP } from '../constants';
import type { DiagramNote, FingeringMap, PathDiagramNote } from '../types';
import { HandPositionModel } from '../models/HandPositionModel';

type ScaleNote = { noteName: string; degree: string };

export class FretboardService {

    public static generateNotesOnFretboard(scaleNotes: ScaleNote[]): DiagramNote[] {
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
    }

    public static generateFingeringPositions(notesOnFretboard: DiagramNote[]): FingeringMap[] {
        if (notesOnFretboard.length < 7) return [];
        const positions: FingeringMap[] = [];
        const processedWindows = new Set<string>();

        for (let fret = 0; fret <= 15; fret++) {
            const hasAnchorNote = notesOnFretboard.some(note => (note.string === 6 || note.string === 5) && note.fret === fret);
            if (hasAnchorNote) {
                const windowA_Start = fret;
                const windowB_Start = Math.max(0, fret - 1);
                const countNotes = (start: number, end: number) => notesOnFretboard.filter(n => typeof n.fret === 'number' && n.fret >= start && n.fret <= end).length;
                const noteCountA = countNotes(windowA_Start, windowA_Start + 4);
                const noteCountB = countNotes(windowB_Start, windowB_Start + 4);

                const baseFret = (noteCountB > noteCountA && fret > 0) ? windowB_Start : windowA_Start;
                const maxFret = baseFret + 4;
                const windowKey = `${baseFret}-${maxFret}`;
                if (processedWindows.has(windowKey)) continue;

                const notesInPosition = notesOnFretboard.filter(note => typeof note.fret === 'number' && note.fret >= baseFret && note.fret <= maxFret);
                const positionFingering: FingeringMap = notesInPosition.map(note => {
                    const fret = note.fret as number;
                    const finger = (fret === 0 && baseFret === 0) ? '0' : (fret - baseFret + 1).toString();
                    return { key: `${note.string}_${fret}`, finger };
                });

                const stringsCovered = new Set(notesInPosition.map(n => n.string)).size;
                if (stringsCovered >= 5 && positionFingering.length >= 10) {
                    positions.push(positionFingering);
                    processedWindows.add(windowKey);
                }
            }
        }
        positions.sort((a, b) => {
            const minFretA = Math.min(...a.map(item => parseInt(item.key.split('_')[1], 10)));
            const minFretB = Math.min(...b.map(item => parseInt(item.key.split('_')[1], 10)));
            return minFretA - minFretB;
        });
        return positions.slice(0, 7);
    }

    public static generateDiagonalRun(notesOnFretboard: DiagramNote[]): PathDiagramNote[] {
        if (notesOnFretboard.length === 0) return [];
        const handModel = new HandPositionModel(notesOnFretboard);
        const lowestRoot = notesOnFretboard
            .filter(n => n.degree === 'R')
            .sort((a, b) => b.string - a.string || (typeof a.fret === 'number' && typeof b.fret === 'number' ? a.fret - b.fret : 0))[0];
        return lowestRoot ? handModel.generateFullPath(lowestRoot) : [];
    }

    public static formatPathAsTab(path: PathDiagramNote[]): { columns: {string: number, fret: string}[][] } {
        if (!path || path.length === 0) return { columns: [] };
        const tab: { columns: {string: number, fret: string}[][] } = { columns: [] };
        const NOTES_PER_BAR = 8;

        for (let i = 0; i < path.length; i++) {
            const note = path[i];
            if (typeof note.string !== 'number' || note.string < 0 || note.string >= TUNING.length) {
                console.warn('Skipping note with invalid string index:', note);
                continue;
            }
            const prevNote = i > 0 ? path[i - 1] : null;
            const tabColumn = Array.from({ length: 7 }, (_, s) => ({ string: s, fret: '-' }));
            let fretValue = note.fret.toString();
            if (note.shiftType === 'slide' && prevNote && prevNote.string === note.string) {
                 fretValue = `/${note.fret}`;
            }
            tabColumn[note.string].fret = fretValue;
            tab.columns.push(tabColumn);

            if ((i + 1) % NOTES_PER_BAR === 0 && i < path.length - 1) {
                tab.columns.push(Array.from({ length: 7 }, (_, s) => ({ string: s, fret: '|' })));
            }
        }
        return tab;
    }
}
