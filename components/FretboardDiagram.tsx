import React, { useMemo } from 'react';
import type { FretboardDiagramProps, DiagramNote, Barre, PathDiagramNote, ClickedNote } from '../types';
import { FRET_MARKERS, COLORS, TUNING } from '../constants';
import { useFretboardLayout } from '../hooks/useFretboardLayout';
import FretboardNote from './FretboardNote';
import { getOctaveForNote, getNoteFromFret } from '../utils/musicUtils';

const SvgStringAndSymbolLabels: React.FC<{
    numStrings: number;
    openStrings?: number[];
    mutedStrings?: number[];
    getY: (s: number) => number;
    fontScale: number;
    x: number;
    onNoteClick?: (note: ClickedNote) => void;
}> = React.memo(({ numStrings, openStrings, mutedStrings, getY, fontScale, x, onNoteClick }) => {

    const handleClick = (stringIndex: number) => {
        if (!onNoteClick) return;
        // Fret 0 is an open string
        const { noteName, octave } = getNoteFromFret(stringIndex, 0);
        onNoteClick({ noteName, octave });
    };

    return (
        <g className="string-labels-and-symbols">
            {Array.from({ length: numStrings }).map((_, i) => {
                const y = getY(i);
                const isOpen = openStrings?.includes(i);
                const isMuted = mutedStrings?.includes(i);
                const labelColor = (isOpen || isMuted) ? COLORS.textPrimary : COLORS.textSecondary;

                return (
                    <g key={`string-label-group-${i}`} onClick={() => handleClick(i)} className="cursor-pointer">
                        <text x={x} y={y} dy="0.35em" fontSize={20 * fontScale} fill={labelColor} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                            {TUNING[i]}
                        </text>
                        {isOpen && <text x={x - 25} y={y} dy="0.35em" fontSize={22 * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>○</text>}
                        {isMuted && <text x={x - 25} y={y} dy="0.35em" fontSize={24 * fontScale} fill={COLORS.textSecondary} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>×</text>}
                    </g>
                );
            })}
        </g>
    );
});


const SvgFretNumberLabels: React.FC<{
    frets: number[];
    getX: (f: number) => number;
    y: number;
    fontScale: number;
}> = React.memo(({ frets, getX, y, fontScale }) => {
    return (
        <g className="fret-number-labels">
            {frets.map((fret) => {
                if (fret === 0) return null;
                const isMarker = FRET_MARKERS.includes(fret);
                return (
                    <text key={`fret-num-${fret}`} x={getX(fret)} y={y} dy="0.35em" fontSize={20 * fontScale} fill={isMarker ? COLORS.textPrimary : COLORS.textSecondary} textAnchor="middle" fontWeight="bold">
                        {fret}
                    </text>
                );
            })}
        </g>
    );
});

const SvgStrings: React.FC<{
    count: number;
    getY: (s: number) => number;
    width: number;
    xOffset: number;
    paddingX: number;
}> = React.memo(({ count, getY, width, xOffset, paddingX }) => (
    <g className="strings">
        {Array.from({ length: count }).map((_, i) => (
            <line key={`string-${i}`} x1={xOffset} y1={getY(i)} x2={width - paddingX} y2={getY(i)} stroke={COLORS.grid} strokeWidth={1.5} />
        ))}
    </g>
));

const SvgFrets: React.FC<{
    numStrings: number;
    frets: number[];
    getX: (f: number) => number;
    getY: (s: number) => number;
    fretWidth: number;
    nutX: number;
}> = React.memo(({ numStrings, frets, getX, getY, fretWidth, nutX }) => (
    <g className="frets">
         {frets.includes(0) && <line key="nut" x1={nutX} y1={getY(0)} x2={nutX} y2={getY(numStrings - 1)} stroke={COLORS.textPrimary} strokeWidth={6} />}
        {frets.map((fret) => {
            if (fret === 0) return null;
            const x = getX(fret) - fretWidth / 2;
            return <line key={`fret-${fret}`} x1={x} y1={getY(0)} x2={x} y2={getY(numStrings - 1)} stroke={COLORS.grid} strokeWidth={2} />;
        })}
    </g>
));

const SvgFretMarkers: React.FC<{
    fretRange: [number, number];
    getX: (f: number) => number;
    getY: (s: number) => number;
    numStrings: number;
}> = React.memo(({ fretRange, getX, getY, numStrings }) => (
    <g className="fret-markers" opacity={0.5}>
        {FRET_MARKERS.map((marker) => {
            if (marker > 0 && marker >= fretRange[0] && marker <= fretRange[1]) {
                const markerX = getX(marker);
                const isDoubleDot = marker % 12 === 0;
                const middleString = numStrings === 7 ? 3 : 2.5;
                if (isDoubleDot) {
                    return (
                        <g key={`marker-group-${marker}`}>
                            <circle cx={markerX} cy={getY(middleString - 1.5)} r="6" fill={COLORS.grid} />
                            <circle cx={markerX} cy={getY(middleString + 1.5)} r="6" fill={COLORS.grid} />
                        </g>
                    );
                }
                return <circle key={`marker-${marker}`} cx={markerX} cy={getY(Math.floor(middleString))} r="6" fill={COLORS.grid} />;
            }
            return null;
        })}
    </g>
));

const SvgBarres: React.FC<{
    barres?: Barre[];
    fretRange: [number, number];
    getX: (f: number) => number;
    getY: (s: number) => number;
}> = React.memo(({ barres, fretRange, getX, getY }) => {
    if (!barres || barres.length === 0) return null;
    return (
        <g className="barres">
            {barres.map((barre, index) => {
                if (barre.fret < fretRange[0] || barre.fret > fretRange[1]) return null;
                const fromStringIdx = barre.fromString;
                const toStringIdx = barre.toString;
                return <line key={`barre-${index}`} x1={getX(barre.fret)} y1={getY(toStringIdx)} x2={getX(barre.fret)} y2={getY(fromStringIdx)} stroke={COLORS.tone} strokeWidth={18} strokeLinecap="round" opacity={0.6} />;
            })}
        </g>
    );
});


const SvgSlideLines: React.FC<{ run: PathDiagramNote[], getX: (f: number) => number, getY: (s: number) => number }> = React.memo(({ run, getX, getY }) => {
    if (!run) return null;

    const slideLines = run.reduce((acc, note, index) => {
        if (note.shiftType === 'slide' && index > 0) {
            const prevNote = run[index - 1];
            if (typeof prevNote.fret === 'number' && typeof note.fret === 'number') {
                acc.push({
                    x1: getX(prevNote.fret),
                    y1: getY(prevNote.string),
                    x2: getX(note.fret),
                    y2: getY(note.string),
                });
            }
        }
        return acc;
    }, [] as { x1: number, y1: number, x2: number, y2: number }[]);

    return (
        <g className="slide-lines" opacity={0.7}>
            {slideLines.map((line, i) => (
                <line key={`slide-${i}`} {...line} stroke={COLORS.accentGold} strokeWidth={2} />
            ))}
        </g>
    );
});

const SvgClickTargets: React.FC<{
    numStrings: number;
    fretsToRender: number[];
    fretWidth: number;
    fretHeight: number;
    getX: (f: number) => number;
    getY: (s: number) => number;
    onNoteClick?: (note: ClickedNote) => void;
    isPlaygroundMode?: boolean;
}> = React.memo(({ numStrings, fretsToRender, fretWidth, fretHeight, getX, getY, onNoteClick, isPlaygroundMode }) => {
    if (!onNoteClick) return null;

    const handleClick = (stringIndex: number, fret: number) => {
        const { noteName, octave } = getNoteFromFret(stringIndex, fret);
        onNoteClick({ noteName, octave });
    };

    return (
        <g className="click-targets">
            {Array.from({ length: numStrings }).map((_, stringIndex) =>
                fretsToRender.map((fret) => {
                    if (fret === 0) return null; // Open strings are handled by their labels
                    return (
                        <rect
                            key={`click-${stringIndex}-${fret}`}
                            x={getX(fret) - fretWidth / 2}
                            y={getY(stringIndex) - fretHeight / 2}
                            width={fretWidth}
                            height={fretHeight}
                            fill="transparent"
                            className={isPlaygroundMode ? 'cursor-crosshair' : 'cursor-pointer'}
                            onClick={() => handleClick(stringIndex, fret)}
                        />
                    );
                })
            )}
        </g>
    );
});


const FretboardDiagram: React.FC<FretboardDiagramProps> = ({
    title, frettedNotes, characteristicDegrees, fretRange, noteDisplayMode = 'noteName',
    diagonalRun, barres, openStrings, mutedStrings, fontScale = 1.0, numStrings = 7, highlightedNotes, highlightedPitch, onNoteClick,
    activeLayerType, activeLayerNotes, isPlaygroundMode
}) => {
    const layout = useFretboardLayout(fretRange, numStrings);
    const { diagramWidth, diagramHeight, fretWidth, getX, getY, LABEL_COL_WIDTH, FRET_NUM_HEIGHT, fretsToRender, paddingX, fretHeight } = layout;

    const runSequenceLookup = useMemo(() => {
        if (noteDisplayMode !== 'sequence' || !activeLayerNotes) return new Map<string, number>();
        const map = new Map<string, number>();
        if (diagonalRun) {
            diagonalRun.forEach((note, index) => {
                const key = `${note.string}_${note.fret}`;
                if (activeLayerNotes.has(key)) {
                    map.set(key, index + 1)
                }
            });
        }
        return map;
    }, [diagonalRun, activeLayerNotes, noteDisplayMode]);

    const nutX = paddingX + LABEL_COL_WIDTH;

    return (
        <div className="my-4">
             <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{title}</h3>
            <svg viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} preserveAspectRatio="xMidYMid meet" className="block mx-auto max-w-full">
                <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                <SvgStringAndSymbolLabels numStrings={numStrings} openStrings={openStrings} mutedStrings={mutedStrings} getY={getY} fontScale={fontScale} x={paddingX + LABEL_COL_WIDTH / 2} onNoteClick={onNoteClick} />
                <SvgFretNumberLabels frets={fretsToRender} getX={getX} y={FRET_NUM_HEIGHT / 2} fontScale={fontScale} />
                
                <SvgStrings count={numStrings} getY={getY} width={diagramWidth} xOffset={nutX} paddingX={paddingX} />
                <SvgFrets numStrings={numStrings} frets={fretsToRender} getX={getX} getY={getY} fretWidth={fretWidth} nutX={nutX} />
                <SvgFretMarkers fretRange={fretRange} getX={getX} getY={getY} numStrings={numStrings} />
                <SvgClickTargets numStrings={numStrings} fretsToRender={fretsToRender} fretWidth={fretWidth} fretHeight={fretHeight} getX={getX} getY={getY} onNoteClick={onNoteClick} isPlaygroundMode={isPlaygroundMode}/>
                <SvgBarres barres={barres} fretRange={fretRange} getX={getX} getY={getY} />
                
                {diagonalRun && <SvgSlideLines run={diagonalRun} getX={getX} getY={getY} />}

                <g className="notes">
                    {frettedNotes.map((note, index) => {
                        if (typeof note.fret !== 'number') {
                            return null;
                        }
                        const fret = note.fret;
                        const noteKey = `${note.string}_${fret}`;
                        const handleClick = onNoteClick && note.noteName
                            ? () => onNoteClick({ noteName: note.noteName!, octave: getOctaveForNote(note.string, fret) })
                            : undefined;
                        
                        const octave = getOctaveForNote(note.string, fret);
                        const isPitchHighlighted = !!(highlightedPitch && highlightedPitch.noteName === note.noteName && highlightedPitch.octave === octave);

                        return (
                            <FretboardNote 
                                key={`${noteKey}-${index}`} 
                                note={note} 
                                x={getX(fret)} 
                                y={getY(note.string)} 
                                fontScale={fontScale} 
                                isRoot={note.degree === 'R'} 
                                isCharacteristic={characteristicDegrees.includes(note.degree ?? '')} 
                                sequenceNumber={runSequenceLookup.get(noteKey)} 
                                noteDisplayMode={noteDisplayMode} 
                                highlightedNotes={highlightedNotes} 
                                isPitchHighlighted={isPitchHighlighted}
                                onClick={handleClick}
                                layerNotesLookup={activeLayerNotes}
                                layerType={activeLayerType}
                                isPlaygroundMode={isPlaygroundMode}
                            />
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default FretboardDiagram;