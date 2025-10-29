



export type NoteHighlightState = 'anchor' | 'pitch' | 'tension' | 'characteristic' | 'playback' | 'none';

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

export interface TabNote {
    string: number;
    fret: string;
}

export type TabColumn = TabNote[];

export interface StructuredTab {
    columns: TabColumn[];
}

export interface CreativeExercise {
    title: string;
    explanation: string;
    path: PathDiagramNote[];
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

export interface DiagramNote {
    string: number;
    fret: number | string;
    noteName?: string;
    degree?: string;
    finger?: string;
    isMuted?: boolean;
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
    listeningGuide: Song[];
    youtubeTutorials: Tutorial[];
    creativeApplication: CreativeVideo[];
    jamTracks: JamTrack[];
    arpeggioEtude: CreativeExercise;
    motifEtude: CreativeExercise;
    // FIX: Add properties from ClientData to create a single, comprehensive data type.
    // This resolves type errors where components expected these properties on ScaleDetails.
    scaleNotes: { noteName: string; degree: string }[];
    fingering: FingeringMap[];
    keyChords: {
        diatonicChords: Map<string, Chord>;
        progressions: ChordProgression[];
    };
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
    onNoteClick: (note: DiagramNote) => void;
    sectionIds: Record<string, string>;
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    onSustainToggle: () => void;
    onPianoKeyClick: (noteName: string, octave: number) => void;
    // Tab Player Props
    playbackNote: DiagramNote | null;
    activePath: PathDiagramNote[] | null;
    onPlayExercise: (path: PathDiagramNote[]) => void;
    onStopExercise: () => void;
    isPlayingExercise: boolean;
    playbackSpeed: number;
    onPlaybackSpeedChange: (speed: number) => void;
    isOctaveColorOn: boolean;
    onOctaveColorToggle: () => void;
}

export type LayerType = 'run' | 'positions' | 'inspector';
export type StudioMode = LayerType | 'anchor' | 'chat' | null;


export interface ChordInspectorData {
    chordTones: string[];
    scaleTones: string[];
    tensionNotes: string[];
}

export interface AnchorNoteContext {
    description: string;
    arpeggioNotes: DiagramNote[];
}

export interface FretboardDiagramProps {
    title: string;
    frettedNotes: DiagramNote[];
    chromaticNotes?: DiagramNote[];
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
    onNoteClick?: (note: DiagramNote) => void;
    studioMode: StudioMode;
    activeLayerNotes?: Set<string>;
    tensionNotes?: string[];
    anchorNote?: DiagramNote | null;
    playbackNote?: DiagramNote | null;
    isOctaveColorOn?: boolean;
}

export interface FretboardNoteProps {
    note: DiagramNote;
    x: number;
    y: number;
    fontScale: number;
    isRoot: boolean;
    noteDisplayMode: FretboardDiagramProps['noteDisplayMode'];
    layerNotesLookup?: Set<string>;
    studioMode: StudioMode;
    sequenceNumber?: number;
    highlightState: NoteHighlightState;
    onClick?: () => void;
    fillColor: string;
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
// FIX: Manually define SectionKey to prevent client-side data keys from being
// included when properties were added to ScaleDetails. This ensures that only
// AI-generatable sections are processed by the generation logic.
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
    playbackNote: DiagramNote | null;
    isOctaveColorOn: boolean;
}

export interface DiagramsSectionProps {
    diagramData: ScaleDetails['diagramData'];
    fontSize: FontSizeKey;
    rootNote: string;
    scaleName: string;
    highlightedNotes: string[];
    highlightedPitch: ClickedNote | null;
    onNoteClick: (note: DiagramNote) => void;
    clientData: ClientData;
    clickedNote: ClickedNote | null;
    isSustainOn: boolean;
    onSustainToggle: () => void;
    onPianoKeyClick: (noteName: string, octave: number) => void;
    playbackNote: DiagramNote | null;
    activePath: PathDiagramNote[] | null;
    isOctaveColorOn: boolean;
    onOctaveColorToggle: () => void;
}

export interface DisplayOptionsPanelProps {
    studioMode: StudioMode;
    onModeChange: (mode: StudioMode) => void;
    
    // Chord Inspector props
    selectedChordName: string | null;
    onChordChange: (chordName: string) => void;
    diatonicChords: Chord[];
    hasRun: boolean;

    // Position layer props
    numPositions: number;
    selectedPositionIndex: number;
    onPositionChange: (index: number) => void;
    
    // Display Toggles
    isOctaveColorOn: boolean;
    onOctaveColorToggle: () => void;
}

export interface PianoKeyboardProps {
    onKeyClick: (noteName: string, octave: number) => void;
    clickedNote: ClickedNote | null;
    playbackNote: DiagramNote | null;
    isOctaveColorOn: boolean;
}

export interface ChordInspectorPanelProps {
    data: ChordInspectorData | null;
    isLoading: boolean;
    error: string | null;
    selectedChord: Chord | null;
    selectedVoicingIndex: number;
    onVoicingChange: (index: number) => void;
    onNoteClick: (note: ClickedNote) => void;
}

export interface VoicingExplorerProps {
    voicings: Voicing[];
    selectedVoicingIndex: number; // Now represents index in voicings array, or -1 for "All Tones"
    onVoicingChange: (index: number) => void;
}

export interface AnchorContextPanelProps {
    contexts: AnchorNoteContext[] | null;
    onContextSelect: (context: AnchorNoteContext) => void;
    isLoading: boolean;
    error: string | null;
    anchorNote: DiagramNote | null;
}