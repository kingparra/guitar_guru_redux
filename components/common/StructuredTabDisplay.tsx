

import React, { useMemo, useRef, useEffect } from 'react';
import type { PathDiagramNote } from '../../types';
import { TUNING } from '../../constants';
import { formatPathAsTab } from '../../utils/guitarUtils';

interface StructuredTabDisplayProps {
    path: PathDiagramNote[];
    playbackIndex: number | null;
}

const StructuredTabDisplay: React.FC<StructuredTabDisplayProps> = ({ path, playbackIndex }) => {
    const tab = useMemo(() => formatPathAsTab(path), [path]);
    const columnRefs = useRef<(HTMLSpanElement | null)[]>([]);

    if (!tab || !tab.columns || tab.columns.length === 0) return null;

    // A map to find which column index corresponds to a note index in the path
    const noteIndexToColumnIndexMap = new Map<number, number>();
    let noteCounter = 0;
    for (let i = 0; i < tab.columns.length; i++) {
        const isBarLine = tab.columns[i].every(n => n.fret === '|');
        if (!isBarLine) {
            noteIndexToColumnIndexMap.set(noteCounter, i);
            noteCounter++;
        }
    }

    const highlightedColumnIndex = playbackIndex !== null ? noteIndexToColumnIndexMap.get(playbackIndex) : null;
    
    useEffect(() => {
        if (highlightedColumnIndex !== null) {
            const targetElement = columnRefs.current[highlightedColumnIndex];
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [highlightedColumnIndex]);

    // Create an array of React nodes for each string/row of the tab.
    const tabRows = Array.from({ length: 7 }, (_, stringIndex) => {
        return tab.columns.map((column, colIndex) => {
            const isBarLine = column.every((note) => note.fret === '|');
            const isHighlighted = colIndex === highlightedColumnIndex;

            // Determine max width for alignment within this column
            let maxWidth = 1;
            if (!isBarLine) {
                column.forEach(colNote => {
                    if (colNote.fret.length > maxWidth) maxWidth = colNote.fret.length;
                });
            }

            const noteInColumnForThisString = column.find(n => n.string === stringIndex);
            const fret = noteInColumnForThisString ? noteInColumnForThisString.fret : (isBarLine ? '|' : '-');

            const padding = '-'.repeat(maxWidth - fret.length);
            const content = `${padding}${fret}${isBarLine ? '' : '-'}`;

            const spanRef = stringIndex === 0 ? (el: HTMLSpanElement | null) => {
                columnRefs.current[colIndex] = el;
            } : undefined;

            return (
                <span key={colIndex} ref={spanRef} className={isHighlighted ? 'bg-cyan-400/25 rounded-sm' : ''}>
                    {content}
                </span>
            );
        });
    });

    return (
        <pre 
            className="bg-[#0D0B1A]/70 text-gray-300 p-4 rounded-md overflow-x-auto text-base font-mono whitespace-pre leading-relaxed border border-purple-400/20" 
            style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
            {tabRows.map((rowNodes, stringIndex) => (
                <div key={stringIndex}>
                    {TUNING[stringIndex].padEnd(2, ' ')}|
                    {rowNodes}
                    |
                </div>
            ))}
        </pre>
    );
};

export default StructuredTabDisplay;