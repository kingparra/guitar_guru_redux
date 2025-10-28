
import React, { useMemo, useState, useEffect } from 'react';
import type { DiagramsSectionProps, StudioMode, ChordInspectorData, AnchorNoteContext, DiagramNote, Chord, ClickedNote } from '../../types';
import { FONT_SIZES, NUM_FRETS } from '../../constants';
import * as geminiService from '../../services/geminiService';
import { findPitchOnFretboard } from '../../utils/musicUtils';
import FretboardDiagram from '../FretboardDiagram';
import DiagramLegend from '../common/DiagramLegend';
import NotationPanel from '../common/NotationPanel';
import PianoKeyboard from '../common/PianoKeyboard';
import DisplayOptionsPanel from '../common/DisplayOptionsPanel';
import Card from '../common/Card';
import ChordInspectorPanel from '../common/ChordInspectorPanel';
import AnchorContextPanel from '../common/AnchorContextPanel';
import ChatPanel from '../common/ChatPanel';
import VoicingExplorer from '../common/VoicingExplorer';

const DiagramsSection: React.FC<DiagramsSectionProps> = React.memo(({ 
    diagramData, fontSize, rootNote, scaleName, highlightedNotes, highlightedPitch, onNoteClick, clientData, clickedNote, isSustainOn, onSustainToggle, onPianoKeyClick
}) => {
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));
    const { notesOnFretboard, fingering, diagonalRun, characteristicDegrees } = diagramData;

    // Studio Mode State
    const [studioMode, setStudioMode] = useState<StudioMode>(null);
    
    // Layer-specific state
    const [selectedChordName, setSelectedChordName] = useState<string | null>(null);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
    const [selectedVoicingIndex, setSelectedVoicingIndex] = useState(0);

    // Anchor Note State
    const [anchorNote, setAnchorNote] = useState<ClickedNote | null>(null);
    const [anchorContexts, setAnchorContexts] = useState<AnchorNoteContext[] | null>(null);
    const [selectedAnchorContext, setSelectedAnchorContext] = useState<AnchorNoteContext | null>(null);
    const [isAnchorContextLoading, setIsAnchorContextLoading] = useState(false);
    const [anchorContextError, setAnchorContextError] = useState<string | null>(null);

    // Chord Inspector State
    const [inspectorData, setInspectorData] = useState<ChordInspectorData | null>(null);
    const [isInspectorLoading, setIsInspectorLoading] = useState(false);
    const [inspectorError, setInspectorError] = useState<string | null>(null);

    // Derived Data
    const diatonicChords = useMemo(() => Array.from(clientData.keyChords.diatonicChords.values()), [clientData]);
    const selectedChord = useMemo(() => diatonicChords.find(c => c.name === selectedChordName) || null, [selectedChordName, diatonicChords]);

    // Handler for chord change, which also resets voicing index
    const handleChordChange = (chordName: string) => {
        setSelectedChordName(chordName);
        setSelectedVoicingIndex(0); // Reset to first voicing
    };

    // Effects for fetching AI data when modes/selections change
    useEffect(() => {
        if (studioMode === 'inspector' && selectedChord) {
            const fetchData = async () => {
                setIsInspectorLoading(true);
                setInspectorError(null);
                try {
                    const data = await geminiService.generateChordInspectorData(rootNote, scaleName, selectedChord);
                    setInspectorData(data);
                } catch (e) {
                    setInspectorError(e instanceof Error ? e.message : 'Failed to load inspector data.');
                } finally {
                    setIsInspectorLoading(false);
                }
            };
            fetchData();
        } else {
            setInspectorData(null);
        }
    }, [studioMode, selectedChord, rootNote, scaleName]);

    useEffect(() => {
        if (studioMode === 'anchor' && anchorNote) {
            const fetchData = async () => {
                setIsAnchorContextLoading(true);
                setAnchorContextError(null);
                setSelectedAnchorContext(null); // Reset visualization
                try {
                    const data = await geminiService.generateAnchorNoteContexts(rootNote, scaleName, anchorNote, diatonicChords);
                    setAnchorContexts(data);
                } catch (e) {
                    setAnchorContextError(e instanceof Error ? e.message : 'Failed to load anchor contexts.');
                } finally {
                    setIsAnchorContextLoading(false);
                }
            };
            fetchData();
        } else {
            setAnchorContexts(null);
            setSelectedAnchorContext(null);
        }
    }, [studioMode, anchorNote, rootNote, scaleName, diatonicChords]);


    // Effect to manage selections when modes change
    useEffect(() => {
        if (studioMode === 'inspector' && diatonicChords.length > 0 && !selectedChordName) {
            handleChordChange(diatonicChords[0].name);
        }
        if (studioMode !== 'anchor') {
            setAnchorNote(null);
        }
    }, [studioMode, diatonicChords, selectedChordName]);

    const handleNoteClickForStudio = (note: ClickedNote) => {
        if (studioMode === 'anchor') {
            setAnchorNote(note);
        }
        onNoteClick(note);
    }
    
    // Calculate active notes for layers using useMemo for performance
    const activeLayerNotes = useMemo(() => {
        if (studioMode === 'run' && diagonalRun) {
            return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'inspector' && inspectorData) {
            return new Set(inspectorData.chordTones);
        }
        if (studioMode === 'positions' && fingering[selectedPositionIndex]) {
            return new Set(fingering[selectedPositionIndex].map(entry => entry.key));
        }
        if (studioMode === 'anchor' && selectedAnchorContext) {
            return new Set(selectedAnchorContext.arpeggioNotes.map(n => `${n.string}_${n.fret}`));
        }
        return undefined;
    }, [studioMode, diagonalRun, inspectorData, selectedPositionIndex, fingering, selectedAnchorContext]);


    const noteDisplayMode = useMemo(() => {
        if (studioMode === 'run') return 'sequence';
        if (studioMode === 'positions' || studioMode === 'anchor') return 'finger';
        return 'noteName';
    }, [studioMode]);

    const allFrettedNotes = useMemo(() => notesOnFretboard.filter(n => typeof n.fret === 'number' && n.fret > 0), [notesOnFretboard]);
    const allOpenStrings = useMemo(() => notesOnFretboard.filter(n => n.fret === 0).map(n => n.string), [notesOnFretboard]);

    // Handle chromatic notes from piano
    const chromaticNotes = useMemo(() => {
        if (highlightedPitch && !notesOnFretboard.some(n => n.noteName === highlightedPitch.noteName)) {
            return findPitchOnFretboard(highlightedPitch);
        }
        return [];
    }, [highlightedPitch, notesOnFretboard]);
    
    return (
        <Card>
            <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Fretboard Studio
            </h2>
            <DiagramLegend />

            <div className="space-y-8">
                <FretboardDiagram
                    title={`${rootNote} ${scaleName} - Full Neck`}
                    frettedNotes={allFrettedNotes}
                    chromaticNotes={chromaticNotes}
                    openStrings={allOpenStrings}
                    characteristicDegrees={characteristicDegrees}
                    fretRange={[0, NUM_FRETS]}
                    fontScale={fontScaleValue * 0.9}
                    noteDisplayMode={noteDisplayMode}
                    highlightedNotes={highlightedNotes}
                    highlightedPitch={highlightedPitch}
                    onNoteClick={handleNoteClickForStudio}
                    studioMode={studioMode}
                    activeLayerNotes={activeLayerNotes}
                    tensionNotes={studioMode === 'inspector' ? inspectorData?.tensionNotes : undefined}
                    anchorNote={anchorNote}
                />

                <DisplayOptionsPanel
                    studioMode={studioMode}
                    onModeChange={setStudioMode}
                    selectedChordName={selectedChordName}
                    onChordChange={handleChordChange}
                    diatonicChords={diatonicChords}
                    hasRun={diagonalRun && diagonalRun.length > 0}
                    numPositions={fingering.length}
                    selectedPositionIndex={selectedPositionIndex}
                    onPositionChange={setSelectedPositionIndex}
                />

                {studioMode === 'inspector' && (
                    <ChordInspectorPanel 
                        data={inspectorData}
                        isLoading={isInspectorLoading}
                        error={inspectorError}
                        selectedChord={selectedChord}
                        selectedVoicingIndex={selectedVoicingIndex}
                        onVoicingChange={setSelectedVoicingIndex}
                        onNoteClick={onNoteClick}
                    />
                )}

                 {studioMode === 'anchor' && (
                    <AnchorContextPanel
                        contexts={anchorContexts}
                        onContextSelect={setSelectedAnchorContext}
                        isLoading={isAnchorContextLoading}
                        error={anchorContextError}
                        anchorNote={anchorNote}
                    />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PianoKeyboard onKeyClick={onPianoKeyClick} clickedNote={clickedNote} />
                    </div>
                    <div>
                        <NotationPanel clickedNote={clickedNote} isSustainOn={isSustainOn} onSustainToggle={onSustainToggle} />
                    </div>
                </div>

                <ChatPanel />
            </div>
        </Card>
    );
});

export default DiagramsSection;
