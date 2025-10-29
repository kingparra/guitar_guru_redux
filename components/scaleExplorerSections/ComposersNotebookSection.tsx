
import React from 'react';
import type { ScaleDetails, DiagramNote } from '../../types';
import DegreePill from '../common/DegreePill';
import { InfoIcon, SparklesIcon } from '../common/Icons';
import { parseAndStyleMusicalText } from '../../utils/uiUtils';

interface ComposersNotebookSectionProps {
    composersNotebook: string;
    keyChords: NonNullable<ScaleDetails['keyChords']>;
    onChordHover: (notes: string[]) => void;
}

const DiatonicChordReferenceStrip: React.FC<{
    chords: ScaleDetails['keyChords']['diatonicChords'];
    onChordHover: (notes: string[]) => void;
}> = ({ chords, onChordHover }) => (
    <div className="mt-6">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-3 text-gray-200">
            <SparklesIcon />
            <span>Diatonic Chord Reference</span>
        </h4>
        <p className="text-sm mt-1 mb-4 text-gray-400 flex items-center gap-2">
            <InfoIcon />
            <span>
                Hover over any chord below to see its notes highlighted on the
                fretboard.
            </span>
        </p>
        <ul className="bg-black/20 p-4 rounded-lg flex flex-wrap gap-x-6 gap-y-4 justify-center">
            {Array.from(chords.entries()).map(([degree, chord]) => (
                <li
                    key={degree}
                    className="text-center transition-transform hover:scale-105"
                    onMouseEnter={() => onChordHover(chord.triadNotes)}
                    onMouseLeave={() => onChordHover([])}
                >
                    <DegreePill degree={degree} />
                    <p className="font-bold text-lg mt-1 text-white">
                        {chord.name}
                    </p>
                    <p className="text-xs font-mono text-cyan-300">
                        {chord.triadNotes.join(' - ')}
                    </p>
                </li>
            ))}
        </ul>
    </div>
);

const CommonProgressionsList: React.FC<{
    progressions: ScaleDetails['keyChords']['progressions'];
}> = ({ progressions }) => (
    <div className="mt-6">
         <h4 className="text-xl font-bold mb-3 flex items-center gap-3 text-gray-200">
            <SparklesIcon />
            <span>Common Progressions</span>
        </h4>
        <div className="bg-black/20 p-4 rounded-lg space-y-3">
             {progressions.map((p, index) => (
                <div key={index} className="bg-black/20 p-3 rounded-lg border border-purple-400/20">
                    <p className="font-semibold text-gray-200">{p.name}</p>
                    <p className="font-mono text-cyan-300 text-sm tracking-wider">{p.analysis}</p>
                </div>
             ))}
        </div>
    </div>
);

const ComposersNotebookSection: React.FC<ComposersNotebookSectionProps> = ({
    composersNotebook,
    keyChords,
    onChordHover,
}) => {
    return (
        <div className="space-y-8">
            <div className="text-base leading-relaxed" style={{ color: '#E0E0E0' }}>
                {parseAndStyleMusicalText(composersNotebook)}
            </div>
            <DiatonicChordReferenceStrip
                chords={keyChords.diatonicChords}
                onChordHover={onChordHover}
            />
            <CommonProgressionsList progressions={keyChords.progressions} />
        </div>
    );
};

export default ComposersNotebookSection;
