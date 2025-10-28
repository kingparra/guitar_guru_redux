import React from 'react';
import type { ScaleDetails, ClickedNote } from '../../types';
import ChordProgressionCard from './ChordProgressionCard';
import DegreePill from '../common/DegreePill';
import { InfoIcon, SparklesIcon } from '../common/Icons';

interface KeyChordsSectionProps {
    keyChords: NonNullable<ScaleDetails['keyChords']>;
    rootNote: string;
    scaleName: string;
    onChordHover: (notes: string[]) => void;
    onNoteClick: (note: ClickedNote) => void;
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
                fretboard diagrams above.
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

const KeyChordsSection: React.FC<KeyChordsSectionProps> = ({
    keyChords,
    rootNote,
    scaleName,
    onChordHover,
    onNoteClick,
}) => {
    return (
        <div className="space-y-8">
            <DiatonicChordReferenceStrip
                chords={keyChords.diatonicChords}
                onChordHover={onChordHover}
            />
            {keyChords.progressions.map((p, index) => (
                <ChordProgressionCard
                    key={`${p.name}-${index}`}
                    progression={p}
                    rootNote={rootNote}
                    scaleName={scaleName}
                    onChordHover={onChordHover}
                    onNoteClick={onNoteClick}
                />
            ))}
        </div>
    );
};

export default KeyChordsSection;
