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
        opacity, highlightState, isPulsing, strokeWidth, onClick, intervalLabel
    } = viewModel as any;

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

            {/* Render interval pill when this is an anchor-highlighted or inspector-highlighted note and we have an intervalLabel/degree */}
            {(highlightState === 'anchor' || highlightState === 'characteristic' || highlightState === 'pitch' || highlightState === 'tension' || highlightState === 'playback') && intervalLabel && (
                <g style={{ pointerEvents: 'none' }}>
                    {/* Pill background - positioned to the right-top of the note */}
                    <rect x={x + radius * fontScale + 6} y={y - (noteFontSize * fontScale) / 2 - 4} rx={8} ry={8}
                        width={Math.max(28, (intervalLabel as string).length * 8)} height={(noteFontSize * fontScale) + 6} fill={COLORS.bgSecondary} opacity={0.95} />
                    <text x={x + radius * fontScale + 6 + (Math.max(28, (intervalLabel as string).length * 8) / 2)}
                        y={y} dy="0.35em" textAnchor="middle" fontSize={(noteFontSize - 4) * fontScale} fill={COLORS.textPrimary} fontWeight={700}>{intervalLabel}</text>
                </g>
            )}
        </g>
    );
});

export default FretboardNote;