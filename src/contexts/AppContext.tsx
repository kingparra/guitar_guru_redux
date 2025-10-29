
import React, { createContext, useContext, useReducer, ReactNode, useCallback, PropsWithChildren } from 'react';
// FIX: Import AppState and AppAction, which are now defined in the central types file.
import type { ScaleData, LoadingState, ClickedNote, SectionKey, AppCache, AppState, AppAction } from '../types';
import { useScaleGenerator } from '../hooks/useScaleGenerator';

const initialLoadingState: LoadingState = {
    isActive: false,
    status: 'idle',
    sections: {
        listeningGuide: { status: 'pending', error: null, data: null, retryCount: 0 },
        youtubeTutorials: { status: 'pending', error: null, data: null, retryCount: 0 },
        creativeApplication: { status: 'pending', error: null, data: null, retryCount: 0 },
        jamTracks: { status: 'pending', error: null, data: null, retryCount: 0 },
        arpeggioEtude: { status: 'pending', error: null, data: null, retryCount: 0 },
        motifEtude: { status: 'pending', error: null, data: null, retryCount: 0 },
    },
};

const initialState: AppState = {
    rootNote: 'E',
    scaleName: 'Natural Minor',
    scaleData: null,
    loadingState: initialLoadingState,
    cache: {},
    clickedNote: null,
    isSustainOn: false,
    highlightedNotes: [],
    highlightedPitch: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_ROOT_NOTE': return { ...state, rootNote: action.payload };
        case 'SET_SCALE_NAME': return { ...state, scaleName: action.payload };
        case 'START_GENERATION': return { ...state, scaleData: null, loadingState: { ...initialLoadingState, status: 'generating', isActive: true } };
        case 'SET_SCALE_DATA': return { ...state, scaleData: action.payload };
        case 'SET_LOADING_STATE': return { ...state, loadingState: action.payload };
        case 'SET_CACHE': return { ...state, cache: action.payload };
        case 'SET_CLICKED_NOTE': return { ...state, clickedNote: action.payload, highlightedPitch: action.payload, highlightedNotes: [] };
        case 'TOGGLE_SUSTAIN': return { ...state, isSustainOn: !state.isSustainOn };
        case 'SET_HIGHLIGHTED_NOTES': return { ...state, highlightedNotes: action.payload, highlightedPitch: null };
        case 'SET_HIGHLIGHTED_PITCH': return { ...state, highlightedPitch: action.payload, highlightedNotes: [] };
        default: return state;
    }
};

interface AppContextType extends AppState {
    dispatch: React.Dispatch<AppAction>;
    generate: (note: string, scale: string) => Promise<void>;
    generateSection: (sectionKey: SectionKey) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// FIX: Changed component signature to use React.FC<PropsWithChildren> to correctly type components with children in React 18+.
export const AppContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const { generate, generateSection } = useScaleGenerator(
        state,
        dispatch
    );

    const generateWithDispatch = useCallback(async (note: string, scale: string) => {
        dispatch({ type: 'START_GENERATION' });
        await generate(note, scale);
    }, [generate, dispatch]);

    const generateSectionWithDispatch = useCallback(async (sectionKey: SectionKey) => {
        await generateSection(sectionKey);
    }, [generateSection]);
    
    const value = { ...state, dispatch, generate: generateWithDispatch, generateSection: generateSectionWithDispatch };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};