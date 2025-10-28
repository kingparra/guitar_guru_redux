
import React from 'react';
import type { VoicingExplorerProps } from '../../types';
import FretboardDiagram from '../FretboardDiagram';
import DiagramPlaceholder from './DiagramPlaceholder';
import { calculateFretWindow } from '../../utils/diagramUtils';
import { COLORS } from '../../constants';

const VoicingExplorer: React.FC<VoicingExplorerProps> = ({
    voicings,
    selectedVoicingIndex,
    onVoicingChange,
    onNoteClick,
    chordName,
    chordDegree
}) => {
    const numVoicings = voicings.length;

    if (numVoicings === 0) {
        return <DiagramPlaceholder chordName={chordName} degree={chordDegree} />;
    }

    const currentVoicing = voicings[selectedVoicingIndex];

    const handlePrev = () => onVoicingChange((selectedVoicingIndex - 1 + numVoicings) % numVoicings);
    const handleNext = () => onVoicingChange((selectedVoicingIndex + 1) % numVoicings);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                <FretboardDiagram
                    title={currentVoicing.name}
                    frettedNotes={currentVoicing.notes}
                    barres={currentVoicing.barres}
                    openStrings={currentVoicing.openStrings}
                    mutedStrings={currentVoicing.mutedStrings}
                    characteristicDegrees={[]}
                    fretRange={calculateFretWindow(currentVoicing.notes, currentVoicing.openStrings)}
                    fontScale={0.7}
                    noteDisplayMode="noteName"
                    onNoteClick={onNoteClick}
                    highlightedPitch={null}
                    studioMode={null}
                />
            </div>
            {numVoicings > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4 flex-shrink-0">
                    <button type="button" onClick={handlePrev} className="px-4 py-2 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-gray-200 font-semibold transition-colors">
                        &larr; Prev
                    </button>
                    <p className="font-bold text-gray-300">
                        Voicing {selectedVoicingIndex + 1} / {numVoicings}
                    </p>
                    <button type="button" onClick={handleNext} className="px-4 py-2 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-gray-200 font-semibold transition-colors">
                        Next &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoicingExplorer;
