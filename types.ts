

export interface Song {
    title: string;
    artist: string;
    spotifyLink: string;
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
}

export interface ToneSuggestion {
    setting: string;
    description: string;
}

export interface TabNote {
    string: number;
    fret: string;
}

export type TabColumn = TabNote[];

export interface StructuredTab {
    columns: TabColumn[];
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
    voicings: Voicing[];
    triadNotes: string[];
}

export interface ChordProgression {
    name: string;
    analysis: string;
    chords: Chord[];
}

export interface Lick {
    name: string;
    description: string;
    tab: StructuredTab;
    sourceUrl: string;
}

export interface HarmonizationExercise {
    name: string;
    description: string;
    tab?: StructuredTab;
}

export interface Etude {
    name: string;
    description: string;
    tab: StructuredTab;
}

export type PracticeMaterial = Lick | HarmonizationExercise | Etude;

export interface DisplayResource {
    title: string;
    creator: string;
    link: string;
    type: 'spotify' | 'youtube' | 'jam' | 'creative';
}

export interface ModeInfo {
    name: string;
    explanation: string;
    soundAndApplication: string;
}

export interface DiagramNote {
    string: number;
    fret: number | string;
    noteName?: string;
    degree?: string;
    finger?: string;
}

// A note that is part of a path or run, requiring a finger and potentially a shift type
export type PathDiagramNote = DiagramNote & { finger: string; shiftType?: 'slide' };
// A node in the ergonomic path finding algorithm
export type PathNode = DiagramNote & { finger: string; shiftType?: 'slide' };

export type FingeringEntry = { key: string; finger: string };
export type FingeringMap = FingeringEntry[];

export interface DiagramData {
    characteristicDegrees: string[];
    notesOnFretboard: DiagramNote[];
    fingering: FingeringMap[];
    diagonalRun: PathDiagramNote[];
}

export interface ScaleDetails {
    diagramData: DiagramData;
    degreeExplanation: string;
    overview: {
        title: string;
        character: string;
        theory: string;
        usage: string;
        parentScale?: string;
        relativeModes?: string;
    };
    listeningGuide: Song[];
    youtubeTutorials: Tutorial[];
    creativeApplication: CreativeVideo[];
    jamTracks: JamTrack[];
    toneAndGear: {
        suggestions: ToneSuggestion[];
        famousArtists: string;
    };
    keyChords: {
        diatonicChords: Map<string, Chord>;
        progressions: ChordProgression[];
    };
    licks: Lick[];
    advancedHarmonization: HarmonizationExercise[];
    etudes: Etude[];
    modeSpotlight: ModeInfo;
}

// Data that is generated instantly on the client, without AI
export interface ClientData {
    diagramData: DiagramData;
    degreeExplanation: string;
    scaleNotes: { noteName: string; degree: string }[];
    fingering: FingeringMap[];
    keyChords: {
        diatonicChords: Map<string, Chord>;
        progressions: ChordProgression[];
    };
}

export type ClickedNote = {
    noteName: string;
    octave: number;
};

export interface ScaleExplorerProps {
    loadingState: LoadingState;
    fontSize: FontSizeKey;
    onGenerateSection: (sectionKey: SectionKey) => void;
    rootNote: string;
    scaleName: string;
    clientData: ClientData | null;
    highlightedNotes: string[];
    highlightedPitch: ClickedNote | null;
    onChordHover: (notes: string[]) => void;
    onNoteClick: (note: ClickedNote) => void;
    sectionIds: Record<string, string>;
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    onSustainToggle: () => void;
    onPianoKeyClick: (noteName: string, octave: number) => void;
    isPlaygroundMode: boolean;
    onPlaygroundModeChange: (isOn: boolean) => void;
}

export type LayerType = 'run' | 'chords' | 'positions';

export interface FretboardDiagramProps {
    title: string;
    frettedNotes: DiagramNote[];
    characteristicDegrees: string[];
    fretRange: [number, number];
    noteDisplayMode: 'finger' | 'degree' | 'noteName' | 'sequence';
    diagonalRun?: PathDiagramNote[];
    barres?: Barre[];
    openStrings?: number[];
    mutedStrings?: number[];
    fontScale: number;
    numStrings?: number;
    highlightedNotes?: string[];
    highlightedPitch: ClickedNote | null;
    onNoteClick?: (note: ClickedNote) => void;
    activeLayerType?: LayerType | null;
    activeLayerNotes?: Set<string>;
    isPlaygroundMode?: boolean;
}

export interface FretboardNoteProps {
    note: DiagramNote;
    x: number;
    y: number;
    fontScale: number;
    isRoot: boolean;
    isCharacteristic: boolean;
    noteDisplayMode: FretboardDiagramProps['noteDisplayMode'];
    layerNotesLookup?: Set<string>;
    layerType?: LayerType | null;
    sequenceNumber?: number;
    highlightedNotes?: string[];
    isPitchHighlighted?: boolean;
    onClick?: () => void;
    isPlaygroundMode?: boolean;
}

export interface SongAnalysisResult {
    rootNote: string;
    scaleName: string;
    analysis: string;
    suitability: string;
}

export type FontSizeKey = 'S' | 'M' | 'L';

export type LoadingStepStatus = 'pending' | 'loading' | 'success' | 'error';

// Keys for content that must be generated by the AI
export type SectionKey = Exclude<
    keyof ScaleDetails,
    'diagramData' | 'degreeExplanation' | 'keyChords'
>;

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
        [K in SectionKey]: SectionState<ScaleDetails[K]>;
    };
}

export type Success<T> = { type: 'success'; value: T };
export type Failure<E> = { type: 'failure'; error: E };
export type Result<T, E> = Success<T> | Failure<E>;

// Types for the HandPositionModel
export interface HandPosition {
    anchorFret: number;
    span: number;
}

export interface ShiftOption {
    note: DiagramNote;
    cost: number;
    shiftType: 'slide' | 'reposition';
}

// Type for the application's in-memory cache
export type AppCache = Record<string, Partial<ScaleDetails>>;

export interface NotationPanelProps {
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    onSustainToggle: () => void;
}

export interface DiagramsSectionProps {
    diagramData: ScaleDetails['diagramData'];
    fontSize: FontSizeKey;
    rootNote: string;
    scaleName: string;
    highlightedNotes: string[];
    highlightedPitch: ClickedNote | null;
    onNoteClick: (note: ClickedNote) => void;
    clientData: ClientData;
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    onSustainToggle: () => void;
    onPianoKeyClick: (noteName: string, octave: number) => void;
    isPlaygroundMode: boolean;
    onPlaygroundModeChange: (isOn: boolean) => void;
}

export interface DisplayOptionsPanelProps {
    activeLayer: LayerType | null;
    onLayerChange: (layer: LayerType | null) => void;
    
    // Chord layer props
    selectedChordName: string | null;
    onChordChange: (chordName: string) => void;
    diatonicChords: Chord[];
    hasRun: boolean;

    // Position layer props
    numPositions: number;
    selectedPositionIndex: number;
    onPositionChange: (index: number) => void;

    // Playground mode props
    isPlaygroundMode: boolean;
    onPlaygroundModeChange: (isOn: boolean) => void;
}

export interface PianoKeyboardProps {
    onKeyClick: (noteName: string, octave: number) => void;
    clickedNote: ClickedNote | null;
}

export interface PlaygroundSuggestion {
    name: string;
    description: string;
    diagram: {
        notes: DiagramNote[];
        barres?: Barre[];
        fretRange: [number, number];
    };
}
