import React from 'react';
import type { FretboardNoteProps } from '../types';
import { COLORS } from '../constants';

const FretboardNote: React.FC<FretboardNoteProps> = React.memo(({
    note, x, y, fontScale, isRoot, layerNotesLookup, studioMode, sequenceNumber, noteDisplayMode, highlightState, onClick
}) => {
    // FIX: Implement rendering for fretted and muted notes ('x' on a fret).
    if (note.isMuted) {
        return (
             <text x={x} y={y} dy="0.35em" fontSize={30 * fontScale} fill={COLORS.textSecondary} textAnchor="middle" fontWeight="bold">x</text>
        )
    }
    
    const baseMarkerRadius = 22; 
    const noteFontSize = 18; // Slightly larger font for single text
    const r = (isRoot ? baseMarkerRadius : baseMarkerRadius - 1) * fontScale;
    
    const noteKey = `${note.string}_${note.fret}`;
    const isInLayer = layerNotesLookup?.has(noteKey) ?? true; // Default to true if no layer is active
    
    const opacity = isInLayer ? 1.0 : 0.2;
    const fillColor = isRoot ? COLORS.root : COLORS.tone;
    const textColor = COLORS.bgPrimary;

    // Determine the single text to display based on priority
    let displayText = note.noteName ?? '';
    // The "run" is a special overlay that should always take display priority.
    if (noteDisplayMode === 'sequence' && sequenceNumber) {
        displayText = sequenceNumber.toString();
    } 
    // For other modes, only show the special text if the note is part of the active layer.
    else if (isInLayer) {
        if (noteDisplayMode === 'finger' && note.finger) {
            displayText = note.finger;
        } else if (noteDisplayMode === 'degree' && note.degree) {
            displayText = note.degree;
        }
    }

    let strokeColor = 'none';
    let strokeWidth = 3;
    let isPulsing = false;

    switch (highlightState) {
        case 'playback':
            strokeColor = COLORS.accentCyan;
            strokeWidth = 5;
            isPulsing = true;
            break;
        case 'anchor':
            strokeColor = COLORS.anchorNote;
            strokeWidth = 5;
            isPulsing = true;
            break;
        case 'pitch':
            strokeColor = COLORS.accentGold;
            break;
        case 'tension':
            strokeColor = COLORS.tensionNote;
            break;
        case 'characteristic':
            strokeColor = COLORS.characteristicOutline;
            break;
    }

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
                className={isPulsing ? 'animate-pulse-stroke' : ''}
            />

            <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize={noteFontSize * fontScale} fill={textColor} fontWeight="bold" style={{ pointerEvents: 'none' }}>
                {displayText}
            </text>
        </g>
    );
});

export default FretboardNote;
