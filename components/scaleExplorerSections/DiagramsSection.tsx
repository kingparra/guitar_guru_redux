import React, { useMemo, useState, useEffect } from 'react';
import type { DiagramsSectionProps, FingeringMap, DiagramNote, LayerType } from '../../types';
import { FONT_SIZES, NUM_FRETS } from '../../constants';
import { calculateFretWindow } from '../../utils/diagramUtils';
import FretboardDiagram from '../FretboardDiagram';
import DiagramLegend from '../common/DiagramLegend';
import NotationPanel from '../common/NotationPanel';
import PianoKeyboard from '../common/PianoKeyboard';
import DisplayOptionsPanel from '../common/DisplayOptionsPanel';

const prepareNotesForPosition = (positionMap: FingeringMap, notesOnFretboard: DiagramNote[]): DiagramNote[] => {
    const masterNotesMap = new Map(notesOnFretboard.map(n => [`${n.string}_${n.fret}`, n]));
    return positionMap.map(posEntry => {
        const masterNote = masterNotesMap.get(posEntry.key);
        const [string, fret] = posEntry.key.split('_').map(s => parseInt(s, 10));
        return masterNote ? { ...masterNote, finger: posEntry.finger } : { string, fret, finger: posEntry.finger, degree: '' };
    });
};

const DiagramsSection: React.FC<DiagramsSectionProps> = React.memo(({ 
    diagramData, fontSize, rootNote, scaleName, highlightedNotes, highlightedPitch, onNoteClick, clientData, clickedNote, isSustainOn, onSustainToggle, onPianoKeyClick,
    isPlaygroundMode, onPlaygroundModeChange
}) => {
    const fontScaleValue = parseFloat(FONT_SIZES[fontSize].replace('rem', ''));
    const { notesOnFretboard, fingering, diagonalRun, characteristicDegrees } = diagramData;

    const [activeLayer, setActiveLayer] = useState<LayerType | null>(null);
    const [selectedChordName, setSelectedChordName] = useState<string | null>(null);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);

    const diatonicChords = useMemo(() => Array.from(clientData?.keyChords.diatonicChords.values() || []), [clientData]);
    
    // Effect to manage layer exclusivity and default selections
    useEffect(() => {
        if (isPlaygroundMode) {
            setActiveLayer(null);
        }
    }, [isPlaygroundMode]);

    useEffect(() => {
        const isChordSelectionInvalid = selectedChordName && !diatonicChords.some(c => c.name === selectedChordName);
        if (activeLayer === 'chords' && diatonicChords.length > 0 && (!selectedChordName || isChordSelectionInvalid)) {
            setSelectedChordName(diatonicChords[0].name);
        }

        if (activeLayer === 'positions' && (selectedPositionIndex >= fingering.length || selectedPositionIndex < 0)) {
            setSelectedPositionIndex(0);
        }
    }, [activeLayer, selectedChordName, diatonicChords, selectedPositionIndex, fingering.length]);


    const activeLayerNotes = useMemo(() => {
        if (activeLayer === 'run' && diagonalRun) {
            return new Set(diagonalRun.map(n => `${n.string}_${n.fret}`));
        }
        if (activeLayer === 'chords' && selectedChordName) {
            const chord = diatonicChords.find(c => c.name === selectedChordName);
            return new Set(chord ? chord.triadNotes : []);
        }
        if (activeLayer === 'positions' && fingering[selectedPositionIndex]) {
            return new Set(fingering[selectedPositionIndex].map(entry => entry.key));
        }
        return undefined;
    }, [activeLayer, selectedChordName, diagonalRun, diatonicChords, selectedPositionIndex, fingering]);

    const handlePlaygroundModeChange = (isOn: boolean) => {
        if (isOn) {
            setActiveLayer(null);
        }
        onPlaygroundModeChange(isOn);
    };

    const noteDisplayMode = useMemo(() => {
        if (activeLayer === 'run') return 'sequence';
        if (activeLayer === 'positions') return 'finger';
        return 'noteName';
    }, [activeLayer]);


    const allFrettedNotes = useMemo(() => notesOnFretboard.filter(n => typeof n.fret === 'number' && n.fret > 0), [notesOnFretboard]);
    
    const allOpenStrings = useMemo(() => {
        const openNotes = notesOnFretboard.filter(n => n.fret === 0);
        return openNotes.map(n => n.string);
    }, [notesOnFretboard]);
    
    return (
        <>
            <DiagramLegend />

            {/* --- Music Theory Studio --- */}
            <div className="space-y-8">
                <FretboardDiagram
                    title={`${rootNote} ${scaleName} - Full Neck`}
                    frettedNotes={allFrettedNotes}
                    openStrings={allOpenStrings}
                    characteristicDegrees={characteristicDegrees}
                    fretRange={[0, NUM_FRETS]}
                    fontScale={fontScaleValue * 0.9}
                    noteDisplayMode={noteDisplayMode}
                    highlightedNotes={highlightedNotes}
                    highlightedPitch={highlightedPitch}
                    onNoteClick={onNoteClick}
                    activeLayerType={activeLayer}
                    activeLayerNotes={activeLayerNotes}
                    isPlaygroundMode={isPlaygroundMode}
                />

                <DisplayOptionsPanel
                    activeLayer={activeLayer}
                    onLayerChange={setActiveLayer}
                    selectedChordName={selectedChordName}
                    onChordChange={setSelectedChordName}
                    diatonicChords={diatonicChords}
                    hasRun={diagonalRun && diagonalRun.length > 0}
                    numPositions={fingering.length}
                    selectedPositionIndex={selectedPositionIndex}
                    onPositionChange={setSelectedPositionIndex}
                    isPlaygroundMode={isPlaygroundMode}
                    onPlaygroundModeChange={handlePlaygroundModeChange}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PianoKeyboard onKeyClick={onPianoKeyClick} clickedNote={clickedNote} />
                    </div>
                    <div>
                        <NotationPanel clickedNote={clickedNote} isSustainOn={isSustainOn} onSustainToggle={onSustainToggle} />
                    </div>
                </div>
            </div>
        </>
    );
});

export default DiagramsSection;