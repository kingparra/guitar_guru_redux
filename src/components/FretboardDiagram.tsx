import React from 'react';
import type { DiagramNote, Barre, FretboardViewModel } from '../types';
import { FRET_MARKERS, COLORS, TUNING } from '../constants';
import { playNote } from '../utils/audioUtils';
import { getNoteFromFret } from '../utils/musicUtils';
import { useFretboardLayout } from '../hooks/useFretboardLayout';
import FretboardNote from './FretboardNote';

const SvgStringLabels: React.FC<{
    numStrings: number;
    openStrings: number[];
    mutedStrings: number[];
    getY: (s: number) => number;
    fontScale: number;
    x: number;
}> = React.memo(({ numStrings, openStrings, mutedStrings, getY, fontScale, x }) => (
    <g className="string-labels-and-symbols">
        {Array.from({ length: numStrings }).map((_, i) => {
            const y = getY(i);
            const isOpen = openStrings?.includes(i);
            const isMuted = mutedStrings?.includes(i);
            const labelColor = (isOpen || isMuted) ? COLORS.textPrimary : COLORS.textSecondary;

            const handlePlayOpen = () => {
                try {
                    const note = getNoteFromFret(i, 0);
                    // debug: log the note being played
                    // eslint-disable-next-line no-console
                    console.debug('Fretboard: play open string', i, note);
                    playNote(note.noteName, note.octave, 1);
                } catch (e) {
                    // swallow errors to avoid UI crash
                    // eslint-disable-next-line no-console
                    console.error('Failed to play open string', e);
                }
            };

            return (
                <g
                    key={`string-label-group-${i}`}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onMouseDown={handlePlayOpen}
                    onClick={handlePlayOpen}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlayOpen(); } }}
                >
                    <text x={x} y={y} dy="0.35em" fontSize={20 * fontScale} fill={labelColor} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'auto' }}>
                        {TUNING[i]}
                    </text>
                    {isOpen && <text x={x - 25} y={y} dy="0.35em" fontSize={22 * fontScale} fill={COLORS.textPrimary} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'auto' }}>○</text>}
                    {isMuted && <text x={x - 25} y={y} dy="0.35em" fontSize={24 * fontScale} fill={COLORS.textSecondary} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'auto' }}>×</text>}
                </g>
            );
        })}
    </g>
));


const SvgFretNumberLabels: React.FC<{
    frets: number[];
    getX: (f: number) => number;
    y: number;
    fontScale: number;
}> = React.memo(({ frets, getX, y, fontScale }) => (
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
));

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


const SvgSlideLines: React.FC<{ lines: { x1: number, y1: number, x2: number, y2: number }[] }> = React.memo(({ lines }) => {
    if (!lines) return null;
    return (
        <g className="slide-lines" opacity={0.7}>
            {lines.map((line, i) => (
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
    onNoteClick?: (note: DiagramNote) => void;
}> = React.memo(({ numStrings, fretsToRender, fretWidth, fretHeight, getX, getY, onNoteClick }) => {
    if (!onNoteClick) return null;
    return (
        <g className="click-targets">
            {/* Click targets for frets are implicitly handled by the note view models */}
        </g>
    );
});

interface FretboardDiagramViewProps {
    title: string;
    viewModel: FretboardViewModel;
    fontScale?: number;
    numStrings?: number;
    fretRange?: [number, number];
}

const FretboardDiagram: React.FC<FretboardDiagramViewProps> = ({
    title, viewModel, fontScale = 1.0, numStrings = 7, fretRange = [0, 24]
}) => {
    const layout = useFretboardLayout(fretRange, numStrings);
    const { diagramWidth, diagramHeight, fretWidth, getX, getY, LABEL_COL_WIDTH, FRET_NUM_HEIGHT, fretsToRender, paddingX, fretHeight } = layout;

    const nutX = paddingX + LABEL_COL_WIDTH;

    return (
        <div className="my-4">
             {title && <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{title}</h3>}
            <svg viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} preserveAspectRatio="xMidYMid meet" className="block mx-auto max-w-full">
                <rect width="100%" height="100%" fill={COLORS.bgPrimary} />

                <SvgStringLabels numStrings={numStrings} openStrings={viewModel.openStrings} mutedStrings={viewModel.mutedStrings} getY={getY} fontScale={fontScale} x={paddingX + LABEL_COL_WIDTH / 2} />
                <SvgFretNumberLabels frets={fretsToRender} getX={getX} y={FRET_NUM_HEIGHT / 2} fontScale={fontScale} />
                
                <SvgStrings count={numStrings} getY={getY} width={diagramWidth} xOffset={nutX} paddingX={paddingX} />
                <SvgFrets numStrings={numStrings} frets={fretsToRender} getX={getX} getY={getY} fretWidth={fretWidth} nutX={nutX} />
                <SvgFretMarkers fretRange={fretRange} getX={getX} getY={getY} numStrings={numStrings} />
                {/* Click targets are now part of FretboardNote */}
                <SvgBarres barres={viewModel.barres} fretRange={fretRange} getX={getX} getY={getY} />
                
                <SvgSlideLines lines={viewModel.slideLines} />

                <g className="notes">
                    {viewModel.notes.map((noteVM) => (
                        <FretboardNote 
                            key={noteVM.key}
                            viewModel={noteVM}
                            fontScale={fontScale} 
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default FretboardDiagram;