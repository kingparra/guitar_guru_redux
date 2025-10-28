
import type { FontSizeKey } from './types';

export const TUNING = ['E', 'B', 'G', 'D', 'A', 'E', 'B']; // High to low
export const NUM_STRINGS = 7;
export const NUM_FRETS = 24;

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const ALL_NOTES = [
    'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#',
];
export const NOTE_MAP = ALL_NOTES.reduce(
    (acc, note, i) => ({ ...acc, [note]: i }),
    {} as Record<string, number>
);

export const SCALE_FORMULAS: Record<string, [number, string][]> = {
    Major: [[2, '2'], [2, '3'], [1, '4'], [2, '5'], [2, '6'], [2, '7']],
    'Natural Minor': [[2, '2'], [1, 'b3'], [2, '4'], [2, '5'], [1, 'b6'], [2, 'b7']],
    'Harmonic Minor': [[2, '2'], [1, 'b3'], [2, '4'], [2, '5'], [1, 'b6'], [3, '7']],
    'Melodic Minor': [[2, '2'], [1, 'b3'], [2, '4'], [2, '5'], [2, '6'], [2, '7']],
    'Major Pentatonic': [[2, '2'], [2, '3'], [3, '5'], [2, '6']],
    'Minor Pentatonic': [[3, 'b3'], [2, '4'], [2, '5'], [3, 'b7']],
    'Blues Scale': [[3, 'b3'], [2, '4'], [1, 'b5'], [1, '5'], [3, 'b7']],
    Dorian: [[2, '2'], [1, 'b3'], [2, '4'], [2, '5'], [2, '6'], [1, 'b7']],
    Phrygian: [[1, 'b2'], [2, 'b3'], [2, '4'], [2, '5'], [1, 'b6'], [2, 'b7']],
    Lydian: [[2, '2'], [2, '3'], [2, '#4'], [1, '5'], [2, '6'], [2, '7']],
    Mixolydian: [[2, '2'], [2, '3'], [1, '4'], [2, '5'], [2, '6'], [1, 'b7']],
    Locrian: [[1, 'b2'], [2, 'b3'], [2, '4'], [1, 'b5'], [2, 'b6'], [2, 'b7']],
    'Whole Tone': [[2, '2'], [2, '3'], [2, '#4'], [2, '#5'], [2, '#6']],
    'Diminished (WH)': [[2, '2'], [1, 'b3'], [2, '4'], [1, 'b5'], [2, 'b6'], [1, '6'], [2, '7']],
    'Diminished (HW)': [[1, 'b2'], [2, 'b3'], [1, '3'], [2, '#4'], [1, '5'], [2, '6'], [1, 'b7']],
    'Augmented Scale': [[3, 'b3'], [1, '3'], [3, '5'], [1, '#5'], [3, '7']],
    'Phrygian Dominant': [[1, 'b2'], [3, '3'], [1, '4'], [2, '5'], [1, 'b6'], [2, 'b7']],
    'Double Harmonic Major': [[1, 'b2'], [3, '3'], [1, '4'], [2, '5'], [1, 'b6'], [3, '7']],
    'Hungarian Minor': [[2, '2'], [1, 'b3'], [3, '#4'], [1, '5'], [1, 'b6'], [3, '7']],
    'Neapolitan Minor': [[1, 'b2'], [2, 'b3'], [2, '4'], [2, '5'], [1, 'b6'], [3, '7']],
};

export const COLORS = {
    bgPrimary: '#0D0B1A',
    bgCard: 'rgba(23, 21, 40, 0.6)',
    bgInput: 'rgba(23, 21, 40, 0.8)',
    textPrimary: '#E0E0E0',
    textSecondary: '#A0A0C0',
    textHeader: '#FFFFFF',
    accentGold: '#FFD700', // For interactive highlights
    accentCyan: '#00FFFF',
    accentMagenta: '#FF00FF',
    grid: '#222030',
    root: '#B8860B', // DarkGoldenRod - subdued
    tone: '#556677',
    characteristicOutline: '#9070C0', // Subdued violet
    tensionNote: '#FF4500', // OrangeRed for tension notes
    anchorNote: '#00BFFF', // DeepSkyBlue for anchor note pulse
};

export const DEGREE_COLORS: Record<string, string> = {
    major: 'bg-sky-500/80 text-sky-100',
    minor: 'bg-purple-500/80 text-purple-100',
    diminished: 'bg-slate-500/80 text-slate-100',
    augmented: 'bg-amber-500/80 text-amber-100',
    dominant: 'bg-rose-500/80 text-rose-100',
    default: 'bg-gray-600/80 text-gray-100',
};

export const FONT_SIZES: Record<FontSizeKey, string> = {
    S: '0.75rem',
    M: '0.875rem',
    L: '1rem',
};
