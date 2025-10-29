
import React from 'react';
import type { ChordInspectorPanelProps } from '../../types';
import { COLORS } from '../../constants';
import { InfoIcon, SparklesIcon } from './Icons';
import VoicingExplorer from './VoicingExplorer';

const DataPill: React.FC<{ label: string, notes: string[], color: string }> = ({ label, notes, color }) => (
    <div>
        <h4 className={`text-lg font-bold`} style={{ color }}>{label}</h4>
        <div className="flex flex-wrap gap-2 mt-1">
            {notes.map(note => (
                <span key={note} className="px-3 py-1 rounded-full text-sm font-mono font-bold bg-black/30 text-gray-200">
                    {note}
                </span>
            ))}
        </div>
    </div>
);

const ChordInspectorPanel: React.FC<ChordInspectorPanelProps> = ({ 
    data, isLoading, error, selectedChord, selectedVoicingIndex, onVoicingChange
}) => {
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20 animate-fade-in">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-3 text-gray-200">
                <SparklesIcon />
                <span>Chord Inspector: {selectedChord?.name || '...'}</span>
            </h3>
            
            <div>
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                )}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {data && (
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-x-6 gap-y-4">
                        <DataPill label="Chord Tones" notes={data.chordTones} color={COLORS.accentCyan} />
                        <DataPill label="Scale Tones" notes={data.scaleTones} color={COLORS.textSecondary} />
                        <DataPill label="Tension Notes" notes={data.tensionNotes} color={COLORS.tensionNote} />
                    </div>
                )}
                {!isLoading && !data && !error && (
                    <div className="text-center text-gray-500 p-4">
                        <div className="w-8 h-8 mx-auto mb-2 opacity-50"><InfoIcon/></div>
                        <p className="font-semibold">Select a chord to analyze</p>
                    </div>
                )}
                 {selectedChord && (
                    <VoicingExplorer 
                        voicings={selectedChord.voicings}
                        selectedVoicingIndex={selectedVoicingIndex}
                        onVoicingChange={onVoicingChange}
                    />
                )}
            </div>
        </div>
    );
};

export default ChordInspectorPanel;
