
import React from 'react';
import type { FretboardNoteProps } from '../types';
import { COLORS } from '../constants';

const FretboardNote: React.FC<FretboardNoteProps> = React.memo(({
    note, x, y, fontScale, isRoot, isCharacteristic, layerNotesLookup, studioMode, sequenceNumber, noteDisplayMode, highlightedNotes, isPitchHighlighted, isTension, isAnchor, onClick
}) => {
    const baseMarkerRadius = 22; 
    const noteFontSize = 16; 
    const r = (isRoot ? baseMarkerRadius : baseMarkerRadius - 1) * fontScale;
    
    const noteKey = `${note.string}_${note.fret}`;
    let isInLayer: boolean;

    if (studioMode === 'inspector' && layerNotesLookup) {
        isInLayer = layerNotesLookup.has(note.noteName || '');
    } else if (studioMode === 'anchor' && layerNotesLookup) {
        isInLayer = layerNotesLookup.has(noteKey);
    }
     else if (layerNotesLookup) {
        isInLayer = layerNotesLookup.has(noteKey);
    } else {
        isInLayer = false;
    }
    
    const opacity = layerNotesLookup ? (isInLayer ? 1.0 : 0.2) : 1.0;
    const fillColor = isRoot ? COLORS.root : COLORS.tone;
    const textColor = COLORS.bgPrimary;

    const isNoteNameHighlighted = highlightedNotes?.includes(note.noteName ?? '');

    let mainText = '';
    let subText = '';

    if (layerNotesLookup && !isInLayer && !isTension) {
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

    let strokeColor = 'none';
    if (isAnchor) strokeColor = COLORS.anchorNote;
    else if (isPitchHighlighted || isNoteNameHighlighted) strokeColor = COLORS.accentGold;
    else if (isTension) strokeColor = COLORS.tensionNote;
    else if (isCharacteristic) strokeColor = COLORS.characteristicOutline;

    const strokeWidth = isAnchor ? 5 : 3;

    return (
        <g 
            opacity={opacity} 
            className={onClick ? (studioMode === 'anchor' ? 'cursor-crosshair' : 'cursor-pointer') : 'cursor-default'}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            onClick={onClick}
        >
            <circle
                cx={x} cy={y} r={r} fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className={isAnchor ? 'animate-pulse-stroke' : ''}
            />

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
