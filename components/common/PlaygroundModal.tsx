import React, { useState, useEffect } from 'react';
import type { ClickedNote, PlaygroundSuggestion } from '../../types';
import { generatePlaygroundSuggestions } from '../../services/geminiService';
import FretboardDiagram from '../FretboardDiagram';
import { COLORS } from '../../constants';

interface PlaygroundModalProps {
    anchorNote: ClickedNote;
    onClose: () => void;
    scaleContext: { rootNote: string; scaleName: string };
}

const PlaygroundModal: React.FC<PlaygroundModalProps> = ({ anchorNote, onClose, scaleContext }) => {
    const [suggestions, setSuggestions] = useState<PlaygroundSuggestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const results = await generatePlaygroundSuggestions(anchorNote, scaleContext);
                setSuggestions(results);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load suggestions.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestions();
    }, [anchorNote, scaleContext]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[#171528] rounded-2xl shadow-2xl border border-purple-400/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                        Playground: {anchorNote.noteName}{anchorNote.octave}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">&times;</button>
                </div>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center p-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-400"></div>
                        <p className="mt-4 text-lg font-semibold" style={{ color: COLORS.textPrimary }}>Generating creative ideas...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center p-8 text-red-400">
                        <p className="font-bold">An Error Occurred</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {suggestions && (
                    <div className="space-y-6">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="bg-black/20 p-4 rounded-lg border border-purple-400/20">
                                <h3 className="text-xl font-bold text-cyan-300">{suggestion.name}</h3>
                                <p className="text-gray-300 my-2">{suggestion.description}</p>
                                <div className="max-w-md mx-auto">
                                     <FretboardDiagram
                                        title=""
                                        frettedNotes={suggestion.diagram.notes}
                                        characteristicDegrees={[]}
                                        fretRange={suggestion.diagram.fretRange}
                                        barres={suggestion.diagram.barres}
                                        noteDisplayMode="finger"
                                        fontScale={0.8}
                                        highlightedPitch={null}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaygroundModal;
