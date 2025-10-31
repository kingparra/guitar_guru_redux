import React, { useMemo, useState, useEffect } from 'react';
import type { ScaleData, DiagramNote, FretboardNoteViewModel } from '../../types';
import { FONT_SIZES, NUM_FRETS } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { useTabPlayer } from '../../hooks/useTabPlayer';
import { useStudioModes } from '../../hooks/useStudioModes';
import { useChordInspector } from '../../hooks/useChordInspector';
import { useAnchorNote } from '../../hooks/useAnchorNote';
import { useFretboardViewModel } from '../../hooks/useFretboardViewModel';
import { playNote, startSustainedNote } from '../../utils/audioUtils';
import { getOctaveForNote } from '../../utils/musicUtils';
import FretboardDiagram from '../FretboardDiagram';
import DiagramLegend from '../common/DiagramLegend';
import DisplayOptionsPanel from '../common/DisplayOptionsPanel';
import Card from '../common/Card';
import ChordInspectorPanel from '../common/ChordInspectorPanel';
import AnchorContextPanel from '../common/AnchorContextPanel';
import ChatPanel from '../common/ChatPanel';

const DiagramsSection: React.FC<{ scaleData: ScaleData }> = React.memo(({ scaleData }) => {
    const { rootNote, scaleName, isSustainOn, dispatch, highlightedNotes, highlightedPitch, clickedNote } = useAppContext();
    const { activePath, playbackNote, stop: stopPlayback } = useTabPlayer();
    const [fontSize] = React.useState<'M'>('M'); // Assuming fixed font size for now
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));
    const { diagramData, keyChords } = scaleData;
    const { notesOnFretboard, fingering, diagonalRun, characteristicDegrees } = diagramData;
    
    // AI Chat State
    const [aiNotes, setAiNotes] = useState<DiagramNote[] | null>(null);

    const diatonicChordsArray = useMemo(() => Array.from(keyChords.diatonicChords.values()), [keyChords.diatonicChords]);
    const studioModes = useStudioModes(diatonicChordsArray);
    const chordInspector = useChordInspector(studioModes.studioMode, studioModes.selectedChord, rootNote, scaleName);
    const anchorNoteLogic = useAnchorNote(studioModes.studioMode, diatonicChordsArray, notesOnFretboard);
    
    // Effect to clear AI notes when mode changes
    useEffect(() => {
        if (studioModes.studioMode !== 'chat') {
            setAiNotes(null);
        }
    }, [studioModes.studioMode]);

    const handleNoteClick = (note: DiagramNote) => {
        if (!note.noteName) return;
        
        stopPlayback();
        const fret = typeof note.fret === 'number' ? note.fret : 0;
        const octave = getOctaveForNote(note.string, fret);
        const newClickedNote = { noteName: note.noteName, octave };

        if (isSustainOn) {
            startSustainedNote(newClickedNote.noteName, newClickedNote.octave);
        } else {
            playNote(newClickedNote.noteName, newClickedNote.octave);
        }
        dispatch({ type: 'SET_CLICKED_NOTE', payload: newClickedNote });

        if (studioModes.studioMode === 'anchor') {
            anchorNoteLogic.setAnchorNote(note);
        }
    };

    const viewModel = useFretboardViewModel({
        notesOnFretboard,
        fingering,
        fretRange: [0, NUM_FRETS],
        numStrings: 7,
        studioMode: studioModes.studioMode,
        selectedPositionIndex: studioModes.selectedPositionIndex,
        selectedVoicingIndex: studioModes.selectedVoicingIndex,
        selectedChord: studioModes.selectedChord,
        chordInspectorData: chordInspector.data,
        anchorNote: anchorNoteLogic.anchorNote,
        selectedAnchorContext: anchorNoteLogic.selectedAnchorContext,
        aiNotes,
        diagonalRun,
        activePath,
        playbackNote,
        characteristicDegrees,
        highlightedNotes,
        highlightedPitch,
        tensionNotes: chordInspector.data?.tensionNotes || [],
        onNoteClick: handleNoteClick,
    });

    // Small debug overlay for anchor mode to inspect note view-model values
    const anchorDebugInfo = useMemo(() => {
        if (studioModes.studioMode !== 'anchor' || !viewModel) return null;
        return viewModel.notes
            .filter(n => n.highlightState === 'anchor')
            .slice(0, 30)
            .map(n => ({ key: n.key, displayText: n.displayText, intervalLabel: (n as any).intervalLabel, highlightState: n.highlightState, opacity: n.opacity }));
    }, [studioModes.studioMode, viewModel]);

    return (
        <div className="space-y-4">
            <Card>
                <DiagramLegend />
                <FretboardDiagram
                    title={`${rootNote} ${scaleName} - Full Fretboard`}
                    viewModel={viewModel}
                    fontScale={fontScaleValue}
                />
            </Card>

            <DisplayOptionsPanel
                {...studioModes}
                hasRun={!!(diagramData.diagonalRun && diagramData.diagonalRun.length > 0)}
                numPositions={diagramData.fingering.length}
            />
            {anchorDebugInfo && (
                <div className="p-3 bg-black/30 rounded-md text-xs text-gray-200"> 
                    <strong>Anchor debug:</strong>
                    <pre style={{whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto'}}>{JSON.stringify(anchorDebugInfo, null, 2)}</pre>
                </div>
            )}
            
            {studioModes.studioMode === 'inspector' && (
                <ChordInspectorPanel 
                    data={chordInspector.data}
                    isLoading={chordInspector.isLoading}
                    error={chordInspector.error}
                    selectedChord={studioModes.selectedChord}
                    selectedVoicingIndex={studioModes.selectedVoicingIndex}
                    onVoicingChange={studioModes.setSelectedVoicingIndex}
                />
            )}

            {studioModes.studioMode === 'anchor' && (
                <AnchorContextPanel
                    {...anchorNoteLogic}
                />
            )}

            {studioModes.studioMode === 'chat' && (
                 <ChatPanel
                    onVisualize={setAiNotes}
                    scaleData={scaleData}
                    clickedNote={clickedNote}
                />
            )}
        </div>
    );
});

export default DiagramsSection;