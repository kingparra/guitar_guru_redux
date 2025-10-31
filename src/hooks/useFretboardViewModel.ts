import { useMemo, useRef, useEffect } from 'react';
import type { DiagramNote, PathDiagramNote, StudioMode, FretboardNoteViewModel, FingeringMap, Chord, AnchorNoteContext, ChordInspectorData, ClickedNote } from '../types';
import { useFretboardLayout } from './useFretboardLayout';
import { getOctaveForNote } from '../utils/musicUtils';
import { COLORS } from '../constants';

interface ViewModelParams {
    notesOnFretboard: DiagramNote[];
    fingering: FingeringMap[];
    fretRange: [number, number];
    numStrings: number;
    studioMode: StudioMode;
    selectedPositionIndex: number;
    selectedVoicingIndex: number;
    selectedChord: Chord | null;
    chordInspectorData: ChordInspectorData | null;
    anchorNote: DiagramNote | null;
    selectedAnchorContext: AnchorNoteContext | null;
    aiNotes: DiagramNote[] | null;
    diagonalRun?: PathDiagramNote[];
    activePath?: PathDiagramNote[] | null;
    playbackNote?: DiagramNote | null;
    characteristicDegrees: string[];
    highlightedNotes?: string[];
    highlightedPitch: ClickedNote | null;
    tensionNotes?: string[];
    onNoteClick: (note: DiagramNote) => void;
}

const BASE_NOTE_RADIUS = 22;

export const useFretboardViewModel = (params: ViewModelParams) => {
    const {
        notesOnFretboard, fingering, fretRange, numStrings, studioMode,
        selectedPositionIndex, selectedVoicingIndex, selectedChord, chordInspectorData,
        anchorNote, selectedAnchorContext, aiNotes, diagonalRun, activePath, playbackNote,
        characteristicDegrees, highlightedNotes, highlightedPitch, tensionNotes, onNoteClick
    } = params;

    const layout = useFretboardLayout(fretRange, numStrings);
    const { getX, getY } = layout;

    const allRenderableNotes = useMemo(() => {
        const notesMap = new Map<string, DiagramNote>();
        notesOnFretboard.forEach(note => {
            notesMap.set(`${note.string}_${note.fret}`, note);
        });

        // In chat mode, AI notes can override or add to the base notes
        if (studioMode === 'chat' && aiNotes) {
            aiNotes.forEach(aiNote => {
                notesMap.set(`${aiNote.string}_${aiNote.fret}`, aiNote);
            });
        }
        return Array.from(notesMap.values());
    }, [notesOnFretboard, aiNotes, studioMode]);


    const activeLayerNotes = useMemo(() => {
        if (studioMode === 'run' && diagonalRun) return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
        if (studioMode === 'inspector' && selectedChord) {
            if (selectedVoicingIndex === -1 && chordInspectorData) {
                const names = new Set(chordInspectorData.chordTones);
                return new Set(notesOnFretboard.filter(n => names.has(n.noteName!)).map(n => `${n.string}_${n.fret}`));
            }
            if (selectedVoicingIndex >= 0 && selectedChord.voicings[selectedVoicingIndex]) {
                return new Set(selectedChord.voicings[selectedVoicingIndex].notes.map(n => `${n.string}_${n.fret}`));
            }
        }
        if (studioMode === 'positions' && fingering[selectedPositionIndex]) {
            const pos = new Map(fingering[selectedPositionIndex].map(f => [f.key, f.finger]));
            return new Set(notesOnFretboard.filter(n => pos.has(`${n.string}_${n.fret}`)).map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'anchor' && selectedAnchorContext) {
            return new Set(selectedAnchorContext.arpeggioNotes.map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'chat' && aiNotes) {
            return new Set(aiNotes.map(n => `${n.string}_${n.fret}`));
        }
        return undefined;
    }, [studioMode, diagonalRun, selectedChord, selectedVoicingIndex, chordInspectorData, notesOnFretboard, fingering, selectedPositionIndex, selectedAnchorContext, aiNotes]);

    const displayNotes = useMemo(() => activePath ? new Set(activePath.map(n => `${n.string}_${n.fret}`)) : activeLayerNotes, [activePath, activeLayerNotes]);

    const runSequenceLookup = useMemo(() => {
        const map = new Map<string, number>();
        if (diagonalRun) diagonalRun.forEach((note, index) => map.set(`${note.string}_${note.fret}`, index + 1));
        return map;
    }, [diagonalRun]);
    
    const fingeringMap = useMemo(() => {
        let map: Map<string, string> | null = null;
        if (studioMode === 'positions' && fingering[selectedPositionIndex]) {
            map = new Map(fingering[selectedPositionIndex].map(f => [f.key, f.finger]));
        } else if (studioMode === 'inspector' && selectedChord && selectedVoicingIndex >= 0) {
            const voicing = selectedChord.voicings[selectedVoicingIndex];
            if (voicing) map = new Map(voicing.notes.map(n => [`${n.string}_${n.fret}`, n.finger || '']));
        } else if (studioMode === 'anchor' && selectedAnchorContext) {
            map = new Map(selectedAnchorContext.arpeggioNotes.map(n => [`${n.string}_${n.fret}`, n.finger || '']));
        }
        return map;
    }, [studioMode, fingering, selectedPositionIndex, selectedChord, selectedVoicingIndex, selectedAnchorContext]);

    // Map of `${string}_${fret}` => degree from the currently selected anchor context.
    // This preserves degrees assigned when anchor contexts were generated without mutating
    // the original notesOnFretboard entries.
    const anchorDegreeMap = useMemo(() => {
        if (studioMode === 'anchor' && selectedAnchorContext) {
            return new Map(selectedAnchorContext.arpeggioNotes.map(n => [`${n.string}_${n.fret}`, n.degree]));
        }
        return new Map<string, string | undefined>();
    }, [studioMode, selectedAnchorContext]);

    // Track whether the current anchor note selection was made while in Anchor mode.
    // We only want to show interval pills when the user selected a fretting while
    // in Anchor mode and then picked a function (selectedAnchorContext).
    const prevAnchorNoteRef = useRef<DiagramNote | null>(null);
    const anchorSelectionMadeInAnchorModeRef = useRef(false);

    useEffect(() => {
        // If anchorNote changed, determine whether it was selected while in anchor mode
        if (!anchorNote) return;
        const prev = prevAnchorNoteRef.current;
        const changed = !prev || prev.string !== anchorNote.string || prev.fret !== anchorNote.fret;
        if (changed) {
            anchorSelectionMadeInAnchorModeRef.current = (studioMode === 'anchor');
            prevAnchorNoteRef.current = anchorNote;
        }
    }, [anchorNote, studioMode]);

    // Reset the flag when leaving anchor mode so stale selections don't show pills
    useEffect(() => {
        if (studioMode !== 'anchor') anchorSelectionMadeInAnchorModeRef.current = false;
    }, [studioMode]);


    const notes = useMemo((): FretboardNoteViewModel[] => {
        // When in anchor mode, print debugging info to the console so we can see
        // whether the anchorDegreeMap is populated and whether view-model entries
        // receive intervalLabel values. This runs unconditionally to help debugging
        // in local dev environments.
        if (studioMode === 'anchor') {
            try {
                // eslint-disable-next-line no-console
                console.debug('anchorDegreeMap sample:', Array.from(anchorDegreeMap.entries()).slice(0, 20));
            } catch (e) {}
        }

        const result = allRenderableNotes
            .filter(note => typeof note.fret === 'number' && note.fret > 0)
            .map(note => {
                const noteKey = `${note.string}_${note.fret}`;
                const isInLayer = displayNotes?.has(noteKey) ?? true;

                // Determine display text with custom text override
                let displayText: string;
                // If this note is part of an anchor arpeggio, force the main label to be the note name
                // so the interval/degree is reserved for the pill. Otherwise respect displayText override.
                if (studioMode === 'anchor' && displayNotes?.has(noteKey)) {
                    displayText = note.noteName ?? '';
                } else if (note.displayText) {
                    displayText = note.displayText;
                } else {
                    const sequenceNumber = runSequenceLookup.get(noteKey);
                    if (studioMode === 'run' && sequenceNumber) {
                        displayText = sequenceNumber.toString();
                    } else if (isInLayer) {
                        const finger = fingeringMap?.get(noteKey);
                        if ((studioMode === 'positions' || studioMode === 'inspector') && finger) {
                            displayText = finger;
                        } else if (studioMode === 'anchor' && note.degree) {
                            // For anchor mode: when this note is part of the active arpeggio (isInLayer true),
                            // we still show the note name in the main text, and expose the degree as an intervalLabel
                            // so the UI can render it in a pill for highlighted anchor notes.
                            displayText = note.noteName ?? '';
                        } else {
                            displayText = note.noteName ?? '';
                        }
                    } else {
                        displayText = note.noteName ?? '';
                    }
                }
                
                // Determine highlight state
                const octave = getOctaveForNote(note.string, note.fret as number);
                const isPlaybackNote = !!(playbackNote && playbackNote.string === note.string && playbackNote.fret === note.fret);
                let highlightState: FretboardNoteViewModel['highlightState'] = 'none';
                if (isPlaybackNote) {
                    highlightState = 'playback';
                } else if (studioMode === 'anchor' && displayNotes?.has(noteKey)) {
                    // When in anchor mode, any note that is part of the selected anchor arpeggio
                    // should be highlighted as 'anchor' so the UI can render the interval pill.
                    highlightState = 'anchor';
                } else if (anchorNote && anchorNote.string === note.string && anchorNote.fret === note.fret) {
                    // Fallback: single anchor note selection also uses anchor highlight
                    highlightState = 'anchor';
                } else if (highlightedPitch && highlightedPitch.noteName === note.noteName && highlightedPitch.octave === octave) {
                    highlightState = 'pitch';
                } else if (!highlightedPitch && highlightedNotes?.includes(note.noteName ?? '')) {
                    highlightState = 'pitch';
                } else if (tensionNotes?.includes(note.noteName || '') && displayNotes?.has(noteKey)) {
                    highlightState = 'tension';
                } else if (characteristicDegrees.includes(note.degree ?? '')) {
                    highlightState = 'characteristic';
                }
                
                const isRoot = note.degree === 'R';
                // Prefer degree from the selected anchor context (if present), otherwise fall back to note.degree
                const contextDegree = anchorDegreeMap.get(noteKey);
                // Only expose the interval/degree pill when we're in anchor mode, the user
                // has selected a specific anchor context (a function like "b3 of Am (iv)"),
                // and the anchor fretting was selected while already in Anchor mode. This
                // prevents showing pills when entering Anchor mode with a stale selection.
                const intervalLabel = (studioMode === 'anchor' && selectedAnchorContext && anchorSelectionMadeInAnchorModeRef.current)
                    ? (contextDegree ?? note.degree)
                    : undefined;

                return {
                    key: noteKey,
                    note,
                    x: getX(note.fret as number),
                    y: getY(note.string),
                    displayText,
                    intervalLabel,
                    fillColor: isRoot ? COLORS.root : COLORS.tone,
                    textColor: COLORS.bgPrimary,
                    radius: isRoot ? BASE_NOTE_RADIUS : BASE_NOTE_RADIUS - 1,
                    opacity: isInLayer ? 1.0 : 0.2,
                    highlightState,
                    isPulsing: highlightState === 'playback' || highlightState === 'anchor',
                    strokeWidth: (highlightState === 'playback' || highlightState === 'anchor') ? 5 : 3,
                    onClick: () => onNoteClick(note),
                };
            });

        if (studioMode === 'anchor') {
            try {
                // eslint-disable-next-line no-console
                console.debug('viewModel sample (anchor):', result.slice(0, 20).map(r => ({ key: r.key, displayText: r.displayText, intervalLabel: (r as any).intervalLabel, highlightState: r.highlightState, opacity: r.opacity })) );
            } catch (e) {}
        }

        return result;
    }, [allRenderableNotes, getX, getY, displayNotes, studioMode, runSequenceLookup, fingeringMap, playbackNote, anchorNote, highlightedPitch, highlightedNotes, tensionNotes, characteristicDegrees, onNoteClick]);
    
    const barres = (studioMode === 'inspector' && selectedVoicingIndex >= 0) ? selectedChord?.voicings[selectedVoicingIndex]?.barres || [] : [];
    const openStrings = useMemo(() => {
         const scaleOpen = notesOnFretboard.filter(n => n.fret === 0).map(n => n.string);
         const voicingOpen = (studioMode === 'inspector' && selectedVoicingIndex >= 0) ? selectedChord?.voicings[selectedVoicingIndex]?.openStrings || [] : [];
         return [...new Set([...scaleOpen, ...voicingOpen])];
    }, [notesOnFretboard, studioMode, selectedVoicingIndex, selectedChord]);

    const mutedStrings = (studioMode === 'inspector' && selectedVoicingIndex >= 0) ? selectedChord?.voicings[selectedVoicingIndex]?.mutedStrings || [] : [];

    const slideLines = useMemo(() => {
        const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];
        const path = diagonalRun || activePath;
        if (!path) return lines;
        for (let i = 1; i < path.length; i++) {
            const note = path[i];
            const prevNote = path[i-1];
            if (note.shiftType === 'slide' && typeof prevNote.fret === 'number' && typeof note.fret === 'number') {
                lines.push({
                    x1: getX(prevNote.fret), y1: getY(prevNote.string),
                    x2: getX(note.fret), y2: getY(note.string)
                });
            }
        }
        return lines;
    }, [diagonalRun, activePath, getX, getY]);


    return {
        notes,
        barres,
        openStrings,
        mutedStrings,
        slideLines
    };
};