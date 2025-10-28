import React from 'react';
import type { PianoKeyboardProps } from '../../types';

type KeyInfo = { note: string; octave: number; type: 'white' | 'black' };

// Generate all 88 standard piano keys from A0 to C8
const generatePianoKeys = (): KeyInfo[] => {
    const keys: KeyInfo[] = [];
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Start with A0, A#0, B0
    keys.push({ note: 'A', octave: 0, type: 'white' });
    keys.push({ note: 'A#', octave: 0, type: 'black' });
    keys.push({ note: 'B', octave: 0, type: 'white' });

    // Octaves 1 through 7
    for (let octave = 1; octave <= 7; octave++) {
        for (const note of pitches) {
            keys.push({ note, octave, type: note.includes('#') ? 'black' : 'white' });
        }
    }

    // End with C8
    keys.push({ note: 'C', octave: 8, type: 'white' });

    return keys;
};

const pianoKeys = generatePianoKeys();
const whiteKeys = pianoKeys.filter(k => k.type === 'white');
const blackKeys = pianoKeys.filter(k => k.type === 'black');

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ onKeyClick, clickedNote }) => {
    const isKeyActive = (noteName: string, octave: number) => {
        return clickedNote?.noteName === noteName && clickedNote?.octave === octave;
    };

    const whiteKeyWidthPercent = 100 / whiteKeys.length;

    // Calculate the percentage-based position for each black key
    const blackKeyPositions = blackKeys.map(blackKey => {
        const precedingWhiteKeyNote = blackKey.note.charAt(0);
        const whiteKeyIndex = whiteKeys.findIndex(wk => wk.note === precedingWhiteKeyNote && wk.octave === blackKey.octave);
        const left = (whiteKeyIndex + 1) * whiteKeyWidthPercent;
        return { key: blackKey, left };
    });

    return (
        <div className="p-4 rounded-lg bg-black/20 border border-purple-400/20 h-full flex flex-col">
            <h4 className="text-xl font-bold text-gray-200 mb-4 text-center">Interactive Keyboard</h4>
            <div className="relative w-full h-48">
                {/* White Keys */}
                <div className="flex w-full h-full">
                    {whiteKeys.map(({ note, octave }) => (
                        <button
                            key={`${note}${octave}`}
                            title={`${note}${octave}`}
                            onClick={() => onKeyClick(note, octave)}
                            className={`flex-1 h-full border-x border-gray-800 rounded-b-sm transition-colors ${
                                isKeyActive(note, octave) ? 'bg-cyan-400' : 'bg-white'
                            }`}
                        ></button>
                    ))}
                </div>
                {/* Black Keys */}
                {blackKeyPositions.map(({ key, left }) => (
                    <button
                        key={`${key.note}${key.octave}`}
                        title={`${key.note}${key.octave}`}
                        onClick={() => onKeyClick(key.note, key.octave)}
                        className={`h-2/3 border border-black absolute z-10 top-0 -translate-x-1/2 transition-colors hover:bg-gray-600 ${
                            isKeyActive(key.note, key.octave) ? 'bg-cyan-400 border-cyan-300' : 'bg-gray-800'
                        }`}
                        style={{
                            width: `${whiteKeyWidthPercent * 0.7}%`,
                            left: `${left}%`
                        }}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default PianoKeyboard;
