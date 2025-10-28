import { useMemo } from 'react';

const PADDING_Y = 50; 
const PADDING_X = 20; 
const LABEL_COL_WIDTH = 50;
const FRET_NUM_HEIGHT = 60; // Increased from 40 for more space above fret numbers

/**
 * A custom hook to encapsulate all complex layout and coordinate calculations
 * for the FretboardDiagram component. It now uses a dynamic fret width for
 * different diagram types and provides more vertical padding.
 */
export const useFretboardLayout = (fretRange: [number, number], numStrings = 7) => {
    const [startFret, endFret] = fretRange;
    const hasNut = startFret === 0;

    const numFretsToShow = hasNut ? endFret : endFret - startFret + 1;
    
    // A full neck diagram is a special case that needs to be compressed to fit.
    const isFullNeckView = numFretsToShow > 15;
    const fretWidth = isFullNeckView ? 50 : 70; 
    const fretHeight = 40;

    const diagramWidth = LABEL_COL_WIDTH + numFretsToShow * fretWidth + PADDING_X * 2;
    const diagramHeight = FRET_NUM_HEIGHT + (numStrings - 1) * fretHeight + PADDING_Y * 2;

    const getX = useMemo(() => (fret: number) => {
        const baseOffset = PADDING_X + LABEL_COL_WIDTH;
        if (fret === 0) return baseOffset;

        // If the diagram includes the nut, frets are their own index.
        // If it's a position diagram starting higher up, we calculate the index.
        const fretIndex = hasNut ? fret : fret - startFret + 1;
        
        // The center of the fret space is at the halfway point.
        return baseOffset + (fretIndex - 0.5) * fretWidth;
    }, [startFret, fretWidth, hasNut]);

    const getY = useMemo(() => (string: number) => FRET_NUM_HEIGHT + PADDING_Y + string * fretHeight, []);

    const fretsToRender = useMemo(() =>
        Array.from({ length: endFret - startFret + 1 }, (_, i) => startFret + i),
    [startFret, endFret]);

    return {
        diagramWidth,
        diagramHeight,
        fretWidth,
        fretHeight,
        fretsToRender,
        getX,
        getY,
        LABEL_COL_WIDTH,
        FRET_NUM_HEIGHT,
        paddingX: PADDING_X,
        hasNut,
    };
};
