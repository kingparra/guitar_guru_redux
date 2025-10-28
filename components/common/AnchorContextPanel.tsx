
import React from 'react';
import type { AnchorContextPanelProps } from '../../types';
import { InfoIcon, SparklesIcon } from './Icons';

const AnchorContextPanel: React.FC<AnchorContextPanelProps> = ({ contexts, onContextSelect, isLoading, error, anchorNote }) => {
    if (!anchorNote) {
        return (
            <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20 text-center text-gray-500 animate-fade-in">
                <div className="w-8 h-8 mx-auto mb-2 opacity-50"><InfoIcon/></div>
                <p className="font-semibold">Click a note on the fretboard to set it as your Anchor Note.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20 animate-fade-in">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-3 text-gray-200">
                <SparklesIcon />
                <span>Anchor Note: {anchorNote.noteName}{anchorNote.octave}</span>
            </h3>
            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
            )}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {contexts && (
                <div>
                    <p className="text-sm text-gray-400 mb-3">This note can function as the...</p>
                    <div className="flex flex-col gap-2">
                        {contexts.map((context, index) => (
                            <button
                                key={index}
                                onClick={() => onContextSelect(context)}
                                className="w-full text-left p-2 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-gray-200 font-semibold transition-colors"
                            >
                                {context.description}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnchorContextPanel;
