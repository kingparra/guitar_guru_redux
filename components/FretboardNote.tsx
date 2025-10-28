

import React from 'react';
import type { FretboardNoteProps } from '../types';
import { COLORS } from '../constants';

const FretboardNote: React.FC<FretboardNoteProps> = React.memo(({
    note, x, y, fontScale, isRoot, isCharacteristic, layerNotesLookup, layerType, sequenceNumber, noteDisplayMode, highlightedNotes, isPitchHighlighted, onClick, isPlaygroundMode
}) => {
    const baseMarkerRadius = 22; 
    const noteFontSize = 16; 
    const r = isRoot ? baseMarkerRadius * fontScale : (baseMarkerRadius - 1) * fontScale;
    
    const noteKey = `${note.string}_${note.fret}`;
    const isInLayer = layerNotesLookup ? (
        layerType === 'run' || layerType === 'positions' ? layerNotesLookup.has(noteKey) : layerNotesLookup.has(note.noteName || '')
    ) : false;
    
    const opacity = layerNotesLookup ? (isInLayer ? 1.0 : 0.2) : 1.0;
    const fillColor = isRoot ? COLORS.root : COLORS.tone;
    const textColor = COLORS.bgPrimary;

    const isNoteNameHighlighted = highlightedNotes?.includes(note.noteName ?? '');

    let mainText = '';
    let subText = '';

    if (layerNotesLookup && !isInLayer) {
        mainText = note.noteName ?? '';
    } else {
        switch (noteDisplayMode) {
            case 'sequence': 
                mainText = sequenceNumber?.toString() ?? ''; 
                break;
            case 'degree': 
                mainText = note.degree ?? ''; 
                break;
            case 'finger': 
                mainText = note.finger ?? ''; 
                subText = note.degree ?? '';
                break;
            default: // noteName
                mainText = note.noteName ?? ''; 
                subText = note.degree ?? '';
                break;
        }
    }


    if (note.fret === 'x') {
        return (
             <text x={x} y={y} dy="0.35em" fontSize={30 * fontScale} fill={COLORS.textSecondary} textAnchor="middle" fontWeight="bold">x</text>
        )
    }

    const strokeColor = isPitchHighlighted || isNoteNameHighlighted ? COLORS.accentGold : (isCharacteristic ? COLORS.characteristicOutline : 'none');
    const strokeWidth = isPitchHighlighted || isNoteNameHighlighted ? 4 : 3;

    return (
        <g 
            opacity={opacity} 
            className={onClick ? (isPlaygroundMode ? 'cursor-crosshair' : 'cursor-pointer') : 'cursor-default'}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            onClick={onClick}
        >
            {isRoot ? (
                <path
                    d={`M ${x} ${y - r} L ${x + r * 0.866} ${y + r * 0.5} L ${x - r * 0.866} ${y + r * 0.5} Z`}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            ) : (
                <circle
                    cx={x} cy={y} r={r} fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            )}

            {subText ? (
                 <text x={x} y={y - (noteFontSize * fontScale * 0.2)} textAnchor="middle" dy="0.35em" fontSize={noteFontSize * fontScale} fill={textColor} fontWeight="bold" style={{ pointerEvents: 'none' }}>
                    {mainText}
                </text>
            ) : (
                <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize={noteFontSize * fontScale} fill={textColor} fontWeight="bold" style={{ pointerEvents: 'none' }}>
                    {mainText}
                </text>
            )}

            {subText && (
                 <text x={x} y={y + (noteFontSize * fontScale * 0.7)} textAnchor="middle" dy="0.35em" fontSize={noteFontSize * fontScale * 0.8} fill={textColor} fontWeight="normal" style={{ pointerEvents: 'none' }}>
                    {subText}
                </text>
            )}
        </g>
    );
});

export default FretboardNote;
