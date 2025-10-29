import { SCALE_FORMULAS, ALL_NOTES, NOTE_MAP } from '../constants';
import type { Result } from '../types';

type ScaleNote = { noteName: string; degree: string };

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

export class MusicTheoryService {
    public static generateScaleNotes(rootNote: string, scaleName: string): Result<ScaleNote[], Error> {
        const formula = SCALE_FORMULAS[scaleName];
        if (!formula) return { type: 'failure', error: new Error(`Scale formula for "${scaleName}" not found.`) };
        
        const scaleNotes: ScaleNote[] = [{ noteName: rootNote, degree: 'R' }];
        let currentNoteIndex = NOTE_MAP[rootNote];
        for (const [interval, degree] of formula) {
            currentNoteIndex = (currentNoteIndex + interval) % ALL_NOTES.length;
            scaleNotes.push({ noteName: ALL_NOTES[currentNoteIndex], degree });
        }
        return { type: 'success', value: scaleNotes };
    }

    public static getCharacteristicDegrees(scaleNotes: ScaleNote[]): string[] {
        const degrees = new Set(scaleNotes.map(n => n.degree));
        const characteristicDegrees = ['b2', '#4', 'b6'].filter(d => degrees.has(d));
        if (degrees.has('7') && degrees.has('b6')) characteristicDegrees.push('7');
        if (degrees.has('6') && degrees.has('b7')) characteristicDegrees.push('6');
        return characteristicDegrees;
    }
    
    public static generateDegreeTableMarkdown(scaleNotes: ScaleNote[]): string {
        const headers = '| Degree | Note |';
        const separator = '|---|---|';
        const rows = scaleNotes.map(n => `| ${n.degree} | ${n.noteName} |`).join('\n');
        return `${headers}\n${separator}\n${rows}`;
    }

    public static getProgressionFormulas(scaleName: string) {
        return PROGRESSION_FORMULAS[scaleName] || PROGRESSION_FORMULAS['Natural Minor']; // Default
    }
}