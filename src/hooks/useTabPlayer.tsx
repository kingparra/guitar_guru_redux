import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { DiagramNote, PathDiagramNote } from '../types';
import { playNote } from '../utils/audioUtils';
import { getOctaveForNote } from '../utils/musicUtils';

interface TabPlayerState {
    activePath: PathDiagramNote[] | null;
    playbackNote: DiagramNote | null;
    isPlaying: boolean;
    playbackSpeed: number;
}

interface TabPlayerContextType extends TabPlayerState {
    play: (path: PathDiagramNote[]) => void;
    stop: () => void;
    setPlaybackSpeed: (speed: number) => void;
}

const TabPlayerContext = createContext<TabPlayerContextType | undefined>(undefined);

export const TabPlayerProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<TabPlayerState>({
        activePath: null,
        playbackNote: null,
        isPlaying: false,
        playbackSpeed: 1,
    });

    const play = useCallback((path: PathDiagramNote[]) => {
        setState(s => ({ ...s, activePath: path, isPlaying: true, playbackNote: null }));
    }, []);

    const stop = useCallback(() => {
        setState(s => ({ ...s, activePath: null, playbackNote: null, isPlaying: false }));
    }, []);

    const setPlaybackSpeed = useCallback((speed: number) => {
        setState(s => ({ ...s, playbackSpeed: speed }));
    }, []);

    useEffect(() => {
        if (!state.isPlaying || !state.activePath) return;

        const currentNoteIndex = state.playbackNote ? state.activePath.findIndex(n => n === state.playbackNote) : -1;
        const nextIndex = currentNoteIndex + 1;

        if (nextIndex >= state.activePath.length) {
            stop();
            return;
        }

        const noteToPlay = state.activePath[nextIndex];
        if (noteToPlay.noteName) {
            const fret = typeof noteToPlay.fret === 'number' ? noteToPlay.fret : 0;
            const octave = getOctaveForNote(noteToPlay.string, fret);
            playNote(noteToPlay.noteName, octave, 600 / state.playbackSpeed / 1000);
        }

        const timer = setTimeout(() => {
            setState(s => s.isPlaying ? { ...s, playbackNote: noteToPlay } : s);
        }, 600 / state.playbackSpeed);

        return () => clearTimeout(timer);
    }, [state.isPlaying, state.activePath, state.playbackNote, state.playbackSpeed, stop]);

    const value = { ...state, play, stop, setPlaybackSpeed };

    return <TabPlayerContext.Provider value={value}>{children}</TabPlayerContext.Provider>;
};

export const useTabPlayer = (): TabPlayerContextType => {
    const context = useContext(TabPlayerContext);
    if (context === undefined) {
        throw new Error('useTabPlayer must be used within a TabPlayerProvider');
    }
    return context;
};