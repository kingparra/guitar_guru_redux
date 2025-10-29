



import React, { useMemo, useState, useEffect } from 'react';
// FIX: Import Chord type to be used in the client-side logic.
import type { DiagramsSectionProps, StudioMode, ChordInspectorData, AnchorNoteContext, DiagramNote, Chord, ClickedNote } from '../../types';
import { FONT_SIZES, NUM_FRETS, NOTE_MAP } from '../../constants';
import * as geminiService from '../../services/geminiService';
import { generateAnchorNoteContextsFromFretboard } from '../../utils/guitarUtils';
import FretboardDiagram from '../FretboardDiagram';
import DiagramLegend from '../common/DiagramLegend';
import NotationPanel from '../common/NotationPanel';
import PianoKeyboard from '../common/PianoKeyboard';
import DisplayOptionsPanel from '../common/DisplayOptionsPanel';
import Card from '../common/Card';
import ChordInspectorPanel from '../common/ChordInspectorPanel';
import AnchorContextPanel from '../common/AnchorContextPanel';
import ChatPanel from '../common/ChatPanel';

const DiagramsSection: React.FC<DiagramsSectionProps> = React.memo(({ 
    diagramData, fontSize, rootNote, scaleName, highlightedNotes, highlightedPitch, onNoteClick, clientData, clickedNote, isSustainOn, onSustainToggle, onPianoKeyClick,
    playbackNote, activePath
}) => {
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));
    const { notesOnFretboard, fingering, diagonalRun, characteristicDegrees } = diagramData;

    // Studio Mode State
    const [studioMode, setStudioMode] = useState<StudioMode>(null);
    const [isOctaveColorOn, setIsOctaveColorOn] = useState(false);
    
    // Layer-specific state
    const [selectedChordName, setSelectedChordName] = useState<string | null>(null);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
    const [selectedVoicingIndex, setSelectedVoicingIndex] = useState(-1); // -1 signifies "All Chord Tones" view
    const [aiNotes, setAiNotes] = useState<DiagramNote[] | null>(null);


    // Anchor Note State
    const [anchorNote, setAnchorNote] = useState<DiagramNote | null>(null);
    const [anchorContexts, setAnchorContexts] = useState<AnchorNoteContext[] | null>(null);
    const [selectedAnchorContext, setSelectedAnchorContext] = useState<AnchorNoteContext | null>(null);
    const [isAnchorContextLoading, setIsAnchorContextLoading] = useState(false);
    const [anchorContextError, setAnchorContextError] = useState<string | null>(null);

    // Chord Inspector State
    const [inspectorData, setInspectorData] = useState<ChordInspectorData | null>(null);
    const [isInspectorLoading, setIsInspectorLoading] = useState(false);
    const [inspectorError, setInspectorError] = useState<string | null>(null);

    // Derived Data
    // FIX: Explicitly type diatonicChords as Chord[] to fix downstream type inference issues.
    const diatonicChords: Chord[] = useMemo(() => Array.from(clientData.keyChords.diatonicChords.values()), [clientData]);
    const selectedChord = useMemo(() => diatonicChords.find(c => c.name === selectedChordName) || null, [selectedChordName, diatonicChords]);

    // Handler for chord change, which also resets voicing index to the "All Tones" view
    const handleChordChange = (chordName: string) => {
        setSelectedChordName(chordName);
        setSelectedVoicingIndex(-1); 
    };

    // Effects for fetching AI data when modes/selections change
    useEffect(() => {
        if (studioMode === 'inspector' && selectedChord) {
            // FIX: This function is now synchronous as it uses client-side logic.
            const fetchData = () => {
                setIsInspectorLoading(true);
                setInspectorError(null);
                try {
                    // FIX: Replaced call to non-existent Gemini function with client-side logic.
                    const getQualityFromDegree = (degree: string) => {
                        if (degree.includes('°')) return 'dim';
                        if (degree.includes('+')) return 'aug';
                        if (degree.toLowerCase() === degree && degree.length > 0) return 'min';
                        return 'maj';
                    }

                    const { scaleNotes } = clientData;
                    const parentScaleNotes = new Set(scaleNotes.map(n => n.noteName));
                    const chordTones = selectedChord.triadNotes;
                    // FIX: Explicitly typing `note` as string to fix type inference issue where it becomes `unknown`.
                    const scaleTones = [...parentScaleNotes].filter((note: string) => !chordTones.includes(note)) as string[];

                    const chordRootIndex = NOTE_MAP[chordTones[0]];
                    const tensionNotes: string[] = [];

                    const quality = getQualityFromDegree(selectedChord.degree);

                    for (const note of scaleTones) {
                        const noteIndex = NOTE_MAP[note];
                        const interval = (noteIndex - chordRootIndex + 12) % 12;

                        if ([1, 2, 3, 5, 6, 8, 9].includes(interval)) {
                            if (interval === 5 && (quality === 'maj')) {
                                continue; // Avoid P11 on major chords
                            }
                            tensionNotes.push(note);
                        }
                    }
                    
                    const data: ChordInspectorData = { chordTones, scaleTones, tensionNotes };
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
    // FIX: Add clientData to dependency array as it's used in the effect.
    }, [studioMode, selectedChord, clientData]);

    useEffect(() => {
        if (studioMode === 'anchor' && anchorNote) {
            setIsAnchorContextLoading(true);
            setAnchorContextError(null);
            setSelectedAnchorContext(null); // Reset visualization
            // This is now a synchronous, client-side calculation.
            // A small timeout prevents UI jank from the immediate state update.
            setTimeout(() => {
                try {
                    const data = generateAnchorNoteContextsFromFretboard(anchorNote, diatonicChords, notesOnFretboard);
                    setAnchorContexts(data);
                } catch (e) {
                    setAnchorContextError(e instanceof Error ? e.message : 'Failed to generate anchor contexts.');
                } finally {
                    setIsAnchorContextLoading(false);
                }
            }, 50);
        } else {
            setAnchorContexts(null);
            setSelectedAnchorContext(null);
        }
    }, [studioMode, anchorNote, diatonicChords, notesOnFretboard]);


    // Effect to manage selections when modes change
    useEffect(() => {
        if (studioMode === 'inspector' && diatonicChords.length > 0 && !selectedChordName) {
            handleChordChange(diatonicChords[0].name);
        }
        if (studioMode !== 'anchor') {
            setAnchorNote(null);
        }
        if (studioMode !== 'chat') {
            setAiNotes(null);
        }
    }, [studioMode, diatonicChords, selectedChordName]);

    const handleNoteClickForStudio = (note: DiagramNote) => {
        if (studioMode === 'anchor') {
            setAnchorNote(note);
        }
        onNoteClick(note);
    }
    
    const activeLayerNotes = useMemo(() => {
        if (studioMode === 'run' && diagonalRun) {
            return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'inspector' && selectedChord) {
            if (selectedVoicingIndex === -1 && inspectorData) {
                const chordToneNames = new Set(inspectorData.chordTones);
                return new Set(notesOnFretboard.filter(n => chordToneNames.has(n.noteName!)).map(n => `${n.string}_${n.fret}`));
            }
             if (selectedVoicingIndex >= 0 && selectedChord.voicings[selectedVoicingIndex]) {
                const voicing = selectedChord.voicings[selectedVoicingIndex];
                return new Set(voicing.notes.map(n => `${n.string}_${n.fret}`));
            }
        }
        if (studioMode === 'positions' && fingering[selectedPositionIndex]) {
            const positionFingering = new Map(fingering[selectedPositionIndex].map(f => [f.key, f.finger]));
            return new Set(notesOnFretboard.filter(n => positionFingering.has(`${n.string}_${n.fret}`)).map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'anchor' && selectedAnchorContext) {
            return new Set(selectedAnchorContext.arpeggioNotes.map(n => `${n.string}_${n.fret}`));
        }
        if (studioMode === 'chat' && aiNotes) {
            return new Set(aiNotes.map(n => `${n.string}_${n.fret}`));
        }
        return undefined; 
    }, [studioMode, diagonalRun, selectedChord, selectedVoicingIndex, inspectorData, notesOnFretboard, fingering, selectedPositionIndex, selectedAnchorContext, aiNotes]);
    
    // Consolidate active notes for dimming effect, prioritizing exercise playback
    const activeNotes = useMemo(() => {
        if (activePath) {
            return new Set(activePath.map(n => `${n.string}_${n.fret}`));
        }
        return activeLayerNotes;
    }, [activePath, activeLayerNotes]);

    const allNotesWithFingering = useMemo(() => {
        let fingeringMap: Map<string, string> | null = null;
        if (studioMode === 'positions' && fingering[selectedPositionIndex]) {
            fingeringMap = new Map(fingering[selectedPositionIndex].map(f => [f.key, f.finger]));
        } else if (studioMode === 'inspector' && selectedChord && selectedVoicingIndex >= 0) {
            // FIX: Add a null check for selectedChord to prevent crashes when changing modes.
            const voicing = selectedChord?.voicings[selectedVoicingIndex];
            if (voicing) {
                fingeringMap = new Map(voicing.notes.map(n => [`${n.string}_${n.fret}`, n.finger || '']));
            }
        } else if (studioMode === 'anchor' && selectedAnchorContext) {
            fingeringMap = new Map(selectedAnchorContext.arpeggioNotes.map(n => [`${n.string}_${n.fret}`, n.finger || '']));
        }

        if (fingeringMap) {
            return notesOnFretboard.map(note => ({
                ...note,
                finger: fingeringMap!.get(`${note.string}_${note.fret}`) || note.finger
            }));
        }
        return notesOnFretboard;
    }, [notesOnFretboard, studioMode, fingering, selectedPositionIndex, selectedChord, selectedVoicingIndex, selectedAnchorContext]);

    const frettedNotesForDiagram = useMemo(() => {
        // FIX: This logic was incorrect. It was filtering the notes down to ONLY the voicing,
        // which the user did not want. By always returning all notes, we allow the
        // `activeLayerNotes` prop to handle the dimming effect in the FretboardNote component,
        // which correctly highlights the voicing without hiding other scale tones.
        return allNotesWithFingering;
    }, [allNotesWithFingering]);


    const noteDisplayMode = useMemo(() => {
        switch(studioMode) {
            case 'run': return 'sequence';
            case 'positions': return 'finger';
            case 'inspector':
                return 'finger';
            case 'anchor':
                return 'degree';
            case 'chat':
                return 'noteName';
            default:
                return 'noteName';
        }
    }, [studioMode]);

    return (
        <div className="space-y-4">
             <Card>
                <DiagramLegend />
                <FretboardDiagram
                    title={`${rootNote} ${scaleName} - Full Fretboard`}
                    frettedNotes={frettedNotesForDiagram}
                    characteristicDegrees={characteristicDegrees}
                    fretRange={[0, NUM_FRETS]}
                    noteDisplayMode={noteDisplayMode}
                    diagonalRun={diagonalRun}
                    fontScale={fontScaleValue}
                    highlightedNotes={highlightedNotes}
                    highlightedPitch={highlightedPitch}
                    onNoteClick={handleNoteClickForStudio}
                    studioMode={studioMode}
                    activeLayerNotes={activeNotes}
                    tensionNotes={inspectorData?.tensionNotes}
                    anchorNote={anchorNote}
                    playbackNote={playbackNote}
                    barres={studioMode === 'inspector' && selectedVoicingIndex >= 0 ? selectedChord?.voicings[selectedVoicingIndex]?.barres : undefined}
                    openStrings={studioMode === 'inspector' && selectedVoicingIndex >= 0 ? selectedChord?.voicings[selectedVoicingIndex]?.openStrings : undefined}
                    mutedStrings={studioMode === 'inspector' && selectedVoicingIndex >= 0 ? selectedChord?.voicings[selectedVoicingIndex]?.mutedStrings : undefined}
                    isOctaveColorOn={isOctaveColorOn}
                />
            </Card>

            <DisplayOptionsPanel
                studioMode={studioMode}
                onModeChange={setStudioMode}
                selectedChordName={selectedChordName}
                onChordChange={handleChordChange}
                diatonicChords={diatonicChords}
                hasRun={!!(diagramData.diagonalRun && diagramData.diagonalRun.length > 0)}
                numPositions={diagramData.fingering.length}
                selectedPositionIndex={selectedPositionIndex}
                onPositionChange={setSelectedPositionIndex}
                isOctaveColorOn={isOctaveColorOn}
                onOctaveColorToggle={() => setIsOctaveColorOn(prev => !prev)}
            />
            
            {studioMode === 'inspector' && (
                <ChordInspectorPanel 
                    data={inspectorData}
                    isLoading={isInspectorLoading}
                    error={inspectorError}
                    selectedChord={selectedChord}
                    selectedVoicingIndex={selectedVoicingIndex}
                    onVoicingChange={setSelectedVoicingIndex}
                    onNoteClick={() => {}}
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

            {studioMode === 'chat' && (
                <ChatPanel
                    onVisualize={setAiNotes}
                    clientData={clientData}
                    rootNote={rootNote}
                    scaleName={scaleName}
                />
            )}
        </div>
    );
});

export default DiagramsSection;