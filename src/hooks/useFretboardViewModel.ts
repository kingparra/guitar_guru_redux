import { useMemo } from 'react';
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
        anchorNote, selectedAnchorContext, diagonalRun, activePath, playbackNote,
        characteristicDegrees, highlightedNotes, highlightedPitch, tensionNotes, onNoteClick
    } = params;

    const layout = useFretboardLayout(fretRange, numStrings);
    const { getX, getY } = layout;

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
        return undefined;
    }, [studioMode, diagonalRun, selectedChord, selectedVoicingIndex, chordInspectorData, notesOnFretboard, fingering, selectedPositionIndex, selectedAnchorContext]);

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


    const notes = useMemo((): FretboardNoteViewModel[] => {
        return notesOnFretboard
            .filter(note => typeof note.fret === 'number' && note.fret > 0)
            .map(note => {
                const noteKey = `${note.string}_${note.fret}`;
                const isInLayer = displayNotes?.has(noteKey) ?? true;

                // Determine display text
                let displayText = note.noteName ?? '';
                const sequenceNumber = runSequenceLookup.get(noteKey);
                if (studioMode === 'run' && sequenceNumber) {
                    displayText = sequenceNumber.toString();
                } else if (isInLayer) {
                    const finger = fingeringMap?.get(noteKey);
                    if ((studioMode === 'positions' || studioMode === 'inspector') && finger) {
                        displayText = finger;
                    } else if (studioMode === 'anchor' && note.degree) {
                        displayText = note.degree;
                    }
                }
                
                // Determine highlight state
                const octave = getOctaveForNote(note.string, note.fret as number);
                const isPlaybackNote = !!(playbackNote && playbackNote.string === note.string && playbackNote.fret === note.fret);
                let highlightState: FretboardNoteViewModel['highlightState'] = 'none';
                if (isPlaybackNote) {
                    highlightState = 'playback';
                } else if (anchorNote && anchorNote.string === note.string && anchorNote.fret === note.fret) {
                    highlightState = 'anchor';
                } else if (highlightedPitch && highlightedPitch.noteName === note.noteName && highlightedPitch.octave === octave) {
                    highlightState = 'pitch';
                } else if (highlightedNotes?.includes(note.noteName ?? '')) {
                    highlightState = 'pitch';
                } else if (tensionNotes?.includes(note.noteName || '') && displayNotes?.has(noteKey)) {
                    highlightState = 'tension';
                } else if (characteristicDegrees.includes(note.degree ?? '')) {
                    highlightState = 'characteristic';
                }
                
                const isRoot = note.degree === 'R';

                return {
                    key: noteKey,
                    note,
                    x: getX(note.fret as number),
                    y: getY(note.string),
                    displayText,
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
    }, [notesOnFretboard, getX, getY, displayNotes, studioMode, runSequenceLookup, fingeringMap, playbackNote, anchorNote, highlightedPitch, highlightedNotes, tensionNotes, characteristicDegrees, onNoteClick]);
    
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