import React from 'react';
import type { FretboardNoteProps } from '../types';
import { COLORS } from '../constants';

const FretboardNote: React.FC<FretboardNoteProps> = React.memo(({
    note, x, y, fontScale, isRoot, layerNotesLookup, studioMode, sequenceNumber, noteDisplayMode, highlightState, onClick, fillColor
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
    const textColor = COLORS.bgPrimary;

    // Determine the single text to display based on studio mode and whether the
    // note is part of the active/highlighted layer (isInLayer).
    let displayText = '';

    // If the note is muted we already returned 'x' earlier.
    // Priority rules from the user's request:
    // - In 'run' (diagonal run) mode: highlighted frettings show the sequence number.
    // - In 'anchor', 'inspector', and 'positions' modes: highlighted frettings show the note name.
    // - In 'inspector' mode additionally render a small interval/tag next to the fretting.
    if (studioMode === 'run') {
        if (isInLayer && sequenceNumber !== undefined && sequenceNumber !== null) {
            displayText = sequenceNumber.toString();
        } else if (noteDisplayMode === 'finger' && note.finger) {
            displayText = note.finger;
        }
    } else if (studioMode === 'anchor' || studioMode === 'inspector' || studioMode === 'positions') {
        if (isInLayer) {
            // Always prefer the note name for highlighted notes in these modes
            displayText = note.noteName ?? '';
        } else {
            // Non-highlighted notes fall back to configured display modes
            if (noteDisplayMode === 'finger' && note.finger) displayText = note.finger;
            else if (noteDisplayMode === 'degree' && note.degree) displayText = note.degree;
            else displayText = note.noteName ?? '';
        }
    } else {
        // Default behavior for other modes: follow noteDisplayMode if in layer
        if (isInLayer) {
            if (noteDisplayMode === 'finger' && note.finger) displayText = note.finger;
            else if (noteDisplayMode === 'degree' && note.degree) displayText = note.degree;
            else displayText = note.noteName ?? '';
        } else {
            displayText = note.noteName ?? '';
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

            {/* Chord Inspector interval/tag: render a small rounded rect with degree text to the right of the marker */}
            {studioMode === 'inspector' && isInLayer && note.degree && (
                <g pointerEvents="none">
                    {/* calculate pill size so text stays inside */}
                    {
                        (() => {
                            const tagFontSize = 12 * fontScale;
                            const paddingX = 6 * fontScale;
                            const paddingY = 4 * fontScale;
                            const approxCharWidth = tagFontSize * 0.6; // rough estimate per char
                            const textWidth = Math.max(tagFontSize, note.degree.length * approxCharWidth);
                            const rectWidth = textWidth + paddingX * 2;
                            const rectHeight = tagFontSize + paddingY * 2;
                            const gap = 6 * fontScale; // space between circle and pill
                            const rectX = x + r + gap;
                            const rectY = y - rectHeight / 2;
                            const textX = rectX + rectWidth / 2;
                            const textY = y; // use dominantBaseline to center vertically

                            return (
                                <g>
                                    <rect
                                        x={rectX}
                                        y={rectY}
                                        rx={rectHeight / 2}
                                        ry={rectHeight / 2}
                                        width={rectWidth}
                                        height={rectHeight}
                                        fill={COLORS.bgInput}
                                        stroke={COLORS.characteristicOutline}
                                        strokeWidth={1}
                                        opacity={0.95}
                                    />
                                    <text
                                        x={textX}
                                        y={textY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize={tagFontSize}
                                        fill={COLORS.textPrimary}
                                        fontWeight={600}
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {note.degree}
                                    </text>
                                </g>
                            );
                        })()
                    }
                </g>
            )}
        </g>
    );
});

export default FretboardNote;