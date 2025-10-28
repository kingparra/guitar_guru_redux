import React, { useState } from 'react';
import Card from '../common/Card';
import DegreePill from '../common/DegreePill';
import type { Chord, ChordProgression, ClickedNote } from '../../types';
import { COLORS } from '../../constants';
import { InfoIcon, RightArrowIcon } from '../common/Icons';
import { calculateFretWindow } from '../../utils/diagramUtils';
import { parseAndStyleMusicalText } from '../../utils/uiUtils';
import { generateChordProgressionAnalysis } from '../../services/geminiService';
import FretboardDiagram from '../FretboardDiagram';
import DiagramPlaceholder from '../common/DiagramPlaceholder';

interface ChordProgressionCardProps {
    progression: ChordProgression;
    rootNote: string; 
    scaleName: string;
    onChordHover: (notes: string[]) => void;
    onNoteClick: (note: ClickedNote) => void;
}

const VoicingSelector: React.FC<{
    chord: Chord;
    selectedVoicingIndex: number;
    setSelectedVoicingIndex: (index: number) => void;
}> = ({ chord, selectedVoicingIndex, setSelectedVoicingIndex }) => {
    const numVoicings = chord.voicings.length;
    if (numVoicings <= 1) return null;

    const currentVoicing = chord.voicings[selectedVoicingIndex];

    const handlePrev = () => setSelectedVoicingIndex((selectedVoicingIndex - 1 + numVoicings) % numVoicings);
    const handleNext = () => setSelectedVoicingIndex((selectedVoicingIndex + 1) % numVoicings);

    return (
        <div className="flex items-center justify-center gap-2 mt-1">
            <button type="button" onClick={handlePrev} className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
                <p className="text-xs font-bold" style={{ color: COLORS.textSecondary }}>Voicing {selectedVoicingIndex + 1}/{numVoicings}</p>
                 <p className="text-xs font-semibold truncate" style={{ color: COLORS.textPrimary }}>({currentVoicing.name})</p>
            </div>
            <button type="button" onClick={handleNext} className="p-1 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-gray-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

const AnalysisSection: React.FC<{
    progression: ChordProgression;
    rootNote: string;
    scaleName: string;
}> = ({ progression, rootNote, scaleName }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateChordProgressionAnalysis(rootNote, scaleName, progression.analysis);
            setAnalysis(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-6 p-4 bg-black/20 rounded-lg border-t-2 border-purple-400/30">
            <h5 className="font-bold text-xl text-purple-300 mb-3 flex items-center gap-2"><InfoIcon /> Musical Analysis</h5>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>}
            {analysis && (
                <div className="text-base leading-relaxed" style={{ color: COLORS.textPrimary }}>
                    {parseAndStyleMusicalText(analysis)}
                </div>
            )}
            {!analysis && !isLoading && !error && (
                <button
                    type="button"
                    onClick={handleGenerateAnalysis}
                    className="bg-purple-600/50 hover:bg-purple-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    Generate Musical Analysis
                </button>
            )}
        </div>
    );
};

const ChordProgressionCard: React.FC<ChordProgressionCardProps> = ({ progression, rootNote, scaleName, onChordHover, onNoteClick }) => {
    const [voicingIndices, setVoicingIndices] = useState<Record<number, number>>({});
    const handleSetVoicingIndex = (chordIndex: number, voicingIndex: number) => {
        setVoicingIndices((prev) => ({ ...prev, [chordIndex]: voicingIndex }));
    };

    return (
        <Card>
            <div className="bg-black/20 p-4 rounded-lg mb-4 border border-purple-400/20 text-center">
                <h4 className="text-2xl font-bold text-gray-100 tracking-wide">{progression.name}</h4>
                <p className="text-xl font-mono text-cyan-300 mt-1 tracking-wider">{progression.analysis}</p>
            </div>

            <AnalysisSection progression={progression} rootNote={rootNote} scaleName={scaleName} />

            <div className="flex flex-row flex-wrap justify-center items-start gap-4 md:gap-6 pb-4">
                {progression.chords.map((chord, index) => {
                    const selectedVoicingIndex = voicingIndices[index] || 0;
                    const hasVoicings = chord.voicings && chord.voicings.length > 0;
                    const currentVoicing = hasVoicings ? chord.voicings[selectedVoicingIndex] : null;

                    return (
                        <React.Fragment key={`${chord.name}-${index}`}>
                            <div 
                                className="flex flex-col items-center gap-2"
                                onMouseEnter={() => onChordHover(chord.triadNotes)}
                                onMouseLeave={() => onChordHover([])}
                            >
                                <DegreePill degree={chord.degree} />
                                 {currentVoicing ? (
                                    <div className="w-80">
                                        <FretboardDiagram
                                            title={chord.name}
                                            frettedNotes={currentVoicing.notes}
                                            barres={currentVoicing.barres}
                                            openStrings={currentVoicing.openStrings}
                                            mutedStrings={currentVoicing.mutedStrings}
                                            characteristicDegrees={[]}
                                            fretRange={calculateFretWindow(currentVoicing.notes, currentVoicing.openStrings)}
                                            fontScale={0.8}
                                            noteDisplayMode="noteName"
                                            onNoteClick={onNoteClick}
                                            // FIX: Pass null for the required 'highlightedPitch' prop.
                                            highlightedPitch={null}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-80">
                                        <DiagramPlaceholder chordName={chord.name} degree={chord.degree} />
                                    </div>
                                )}
                                {hasVoicings && (
                                    <VoicingSelector chord={chord} selectedVoicingIndex={selectedVoicingIndex} setSelectedVoicingIndex={(idx) => handleSetVoicingIndex(index, idx)} />
                                )}
                            </div>
                            {index < progression.chords.length - 1 && (
                                <div className="hidden md:flex self-center pt-20 px-2 items-center justify-center">
                                    <RightArrowIcon />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </Card>
    );
};

export default ChordProgressionCard;