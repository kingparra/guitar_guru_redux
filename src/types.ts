export type NoteHighlightState = 'anchor' | 'pitch' | 'tension' | 'characteristic' | 'playback' | 'none';

// --- AI-Generated Content Types ---

export interface Song {
    title: string;
    artist: string;
    spotifyLink: string;
    explanation: string;
}

export interface Tutorial {
    title: string;
    creator: string;
    youtubeLink: string;
}

export interface CreativeVideo {
    title: string;
    creator: string;
    youtubeLink: string;
}

export interface JamTrack {
    title: string;
    creator: string;
    youtubeLink: string;
    explanation: string;
}

export interface CreativeExercise {
    title: string;
    explanation: string;
    path: PathDiagramNote[];
}

export interface SongAnalysisResult {
    rootNote: string;
    scaleName: string;
    analysis: string;
    suitability: string;
}

// --- Diagram & Fretboard Types ---

export interface DiagramNote {
    string: number;
    fret: number | string;
    noteName?: string;
    degree?: string;
    finger?: string;
    isMuted?: boolean;
}

export type PathDiagramNote = DiagramNote & { finger: string; shiftType?: 'slide' };
export type PathNode = DiagramNote & { finger: string; shiftType?: 'slide' };

export type FingeringEntry = { key: string; finger: string };
export type FingeringMap = FingeringEntry[];

export interface DiagramData {
    characteristicDegrees: string[];
    notesOnFretboard: DiagramNote[];
    fingering: FingeringMap[];
    diagonalRun: PathDiagramNote[];
}

export interface Barre {
    fromString: number;
    toString: number;
    fret: number;
}

export interface Voicing {
    name: string;
    notes: DiagramNote[];
    barres?: Barre[];
    openStrings?: number[];
    mutedStrings?: number[];
}

export interface Chord {
    name: string;
    degree: string;
    quality: 'maj' | 'min' | 'dim' | 'aug' | 'maj7' | 'min7' | 'dom7' | 'min7b5' | 'dim7';
    voicings: Voicing[];
    triadNotes: string[];
    seventhNotes: string[];
}

export interface ChordProgression {
    name: string;
    analysis: string;
    chords: Chord[];
}

// --- Core Application Data Model ---

/**
 * The single, consolidated data type for a generated scale.
 * Client-generated data is required, while AI-generated data is optional.
 */
export interface ScaleData {
    // Client-generated (always present)
    diagramData: DiagramData;
    degreeExplanation: string;
    scaleNotes: { noteName: string; degree: string }[];
    fingering: FingeringMap[];
    keyChords: {
        diatonicChords: Map<string, Chord>;
        progressions: ChordProgression[];
    };
    // AI-generated (optional)
    listeningGuide?: Song[];
    youtubeTutorials?: Tutorial[];
    creativeApplication?: CreativeVideo[];
    jamTracks?: JamTrack[];
    arpeggioEtude?: CreativeExercise;
    motifEtude?: CreativeExercise;
}

// --- State Management & Component Props ---

export interface ChordInspectorData {
    chordTones: string[];
    scaleTones: string[];
    tensionNotes: string[];
}

export interface AnchorNoteContext {
    description: string;
    arpeggioNotes: DiagramNote[];
}

export type ClickedNote = {
    noteName: string;
    octave: number;
};

export type FontSizeKey = 'S' | 'M' | 'L';
export type LoadingStepStatus = 'pending' | 'loading' | 'success' | 'error';

export type SectionKey =
    | 'listeningGuide'
    | 'youtubeTutorials'
    | 'creativeApplication'
    | 'jamTracks'
    | 'arpeggioEtude'
    | 'motifEtude';

export interface SectionState<T> {
    status: LoadingStepStatus;
    error: string | null;
    data: T | null;
    retryCount: number;
}

export type OverallLoadingStatus = 'idle' | 'generating' | 'success' | 'error';

export interface LoadingState {
    isActive: boolean;
    status: OverallLoadingStatus;
    sections: {
        [K in SectionKey]: SectionState<ScaleData[K]>;
    };
}

// FIX: Moved AppState interface here to serve as a single source of truth for the app's state shape.
export interface AppState {
    rootNote: string;
    scaleName: string;
    scaleData: ScaleData | null;
    loadingState: LoadingState;
    cache: AppCache;
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    highlightedNotes: string[]; // For chord hover
    highlightedPitch: ClickedNote | null; // For specific note click
}

// FIX: Moved AppAction type here to centralize all state-related type definitions.
export type AppAction =
    | { type: 'SET_ROOT_NOTE'; payload: string }
    | { type: 'SET_SCALE_NAME'; payload:string }
    | { type: 'START_GENERATION' }
    | { type: 'SET_SCALE_DATA'; payload: ScaleData | null }
    | { type: 'SET_LOADING_STATE'; payload: LoadingState }
    | { type: 'SET_CACHE'; payload: AppCache }
    | { type: 'SET_CLICKED_NOTE'; payload: ClickedNote | null }
    | { type: 'TOGGLE_SUSTAIN' }
    | { type: 'SET_HIGHLIGHTED_NOTES'; payload: string[] }
    | { type: 'SET_HIGHLIGHTED_PITCH'; payload: ClickedNote | null };


export type StudioMode = 'run' | 'positions' | 'inspector' | 'anchor' | 'chat' | null;

// --- ViewModel Types for Decoupled UI ---

export interface FretboardNoteViewModel {
    key: string;
    note: DiagramNote;
    x: number;
    y: number;
    displayText: string;
    fillColor: string;
    textColor: string;
    radius: number;
    opacity: number;
    highlightState: NoteHighlightState;
    isPulsing: boolean;
    strokeWidth: number;
    onClick?: () => void;
}

export interface FretboardViewModel {
    notes: FretboardNoteViewModel[];
    barres: Barre[];
    openStrings: number[];
    mutedStrings: number[];
    slideLines: { x1: number; y1: number; x2: number; y2: number }[];
}

// --- Utility & Cache Types ---

export type Success<T> = { type: 'success'; value: T };
export type Failure<E> = { type: 'failure'; error: E };
export type Result<T, E> = Success<T> | Failure<E>;
export type AppCache = Record<string, Partial<ScaleData>>;