export const ALL_NOTES = [
    'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#',
];
export const NOTE_MAP = ALL_NOTES.reduce((acc, note, i) => ({ ...acc, [note]: i }), {} as Record<string, number>);

export const normalizeNoteName = (note: string): string => {
    if (!note) return note;
    const n = note.trim();
    const map: Record<string, string> = {
        'BB': 'A#',
        'DB': 'C#',
        'EB': 'D#',
        'GB': 'F#',
        'AB': 'G#',
        'CB': 'B',
        'E#': 'F',
        'B#': 'C'
    };
    const up = n.toUpperCase();
    if (map[up]) return map[up];
    if (ALL_NOTES.includes(up)) return up;
    const m = up.match(/^([A-G])([#b])?$/);
    if (m) {
        const base = m[1];
        const acc = m[2] || '';
        const candidate = (base + acc) as string;
        if (map[candidate]) return map[candidate];
        if (ALL_NOTES.includes(candidate)) return candidate;
    }
    return up;
};
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
export const TUNING = ['e', 'B', 'G', 'D', 'A', 'E', 'B'];
export const NUM_STRINGS = 7;
export const NUM_FRETS = 24;
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const ENABLE_SHELL_CHORDS = true;

