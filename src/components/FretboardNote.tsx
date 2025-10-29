import React from 'react';
import type { FretboardNoteViewModel } from '../types';
import { COLORS } from '../constants';

interface FretboardNoteViewProps {
    viewModel: FretboardNoteViewModel;
    fontScale: number;
}

const FretboardNote: React.FC<FretboardNoteViewProps> = React.memo(({
    viewModel, fontScale
}) => {
    const {
        note, x, y, displayText, fillColor, textColor, radius,
        opacity, highlightState, isPulsing, strokeWidth, onClick
    } = viewModel;

    if (note.isMuted) {
        return (
             <text x={x} y={y} dy="0.35em" fontSize={30 * fontScale} fill={COLORS.textSecondary} textAnchor="middle" fontWeight="bold">x</text>
        )
    }
    
    const noteFontSize = 18; 

    let strokeColor = 'none';
    switch (highlightState) {
        case 'playback': strokeColor = COLORS.accentCyan; break;
        case 'anchor': strokeColor = COLORS.anchorNote; break;
        case 'pitch': strokeColor = COLORS.accentGold; break;
        case 'tension': strokeColor = COLORS.tensionNote; break;
        case 'characteristic': strokeColor = COLORS.characteristicOutline; break;
    }

    return (
        <g 
            opacity={opacity} 
            className={onClick ? 'cursor-pointer' : 'cursor-default'}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            onClick={onClick}
        >
            <circle
                cx={x} cy={y} r={radius * fontScale} fill={fillColor}
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