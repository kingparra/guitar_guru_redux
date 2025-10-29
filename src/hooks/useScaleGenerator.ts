import React, { useCallback, useEffect } from 'react';
// FIX: Import types from the correct central types file. This will work once AppState and AppAction are moved there.
import type { LoadingState, SectionKey, ScaleData, AppCache, AppAction, AppState, SectionState } from '../types';
import { ScaleGenerationService } from '../services/ScaleGenerationService';
import { FallbackService } from '../services/FallbackService';

const ALL_SECTIONS: SectionKey[] = [
    'listeningGuide', 'youtubeTutorials', 'creativeApplication', 
    'jamTracks', 'arpeggioEtude', 'motifEtude',
];

const createInitialSectionState = (): LoadingState['sections'] => {
    return ALL_SECTIONS.reduce((acc, key) => {
        acc[key] = { status: 'pending', error: null, data: null, retryCount: 0 };
        return acc;
    }, {} as LoadingState['sections']);
};

/**
 * Custom hook to manage the generation of scale data, including client-side
 * calculations and AI-powered content fetching.
 */
export const useScaleGenerator = (
    state: AppState,
    dispatch: React.Dispatch<AppAction>
) => {
    const { cache, rootNote, scaleName, scaleData, loadingState } = state;

    const updateLoadingState = useCallback((updater: (prev: LoadingState) => LoadingState) => {
        dispatch({ type: 'SET_LOADING_STATE', payload: updater(loadingState) });
    }, [dispatch, loadingState]);

    const setCache = useCallback((updater: (prev: AppCache) => AppCache) => {
        dispatch({ type: 'SET_CACHE', payload: updater(cache) });
    }, [dispatch, cache]);

    const setScaleData = useCallback((data: ScaleData | null) => {
        dispatch({ type: 'SET_SCALE_DATA', payload: data });
    }, [dispatch]);
    

    const generateSection = useCallback(async (sectionKey: SectionKey) => {
        if (!scaleData) return;

        updateLoadingState(prev => ({
            ...prev,
            isActive: true,
            sections: {
                ...prev.sections,
                [sectionKey]: { ...prev.sections[sectionKey], status: 'loading', error: null },
            },
        }));

        const result = await ScaleGenerationService.generateAiSection(sectionKey, { rootNote, scaleName, scaleData });
        const cacheKey = `${rootNote}-${scaleName}`;

        const handleSuccess = (data: any) => {
            setCache(prev => ({ ...prev, [cacheKey]: { ...prev[cacheKey], [sectionKey]: data } }));
            updateLoadingState(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionKey]: { status: 'success', error: null, data, retryCount: 0 },
                },
            }));
        };
        
        const handleError = (errorMsg: string) => {
             updateLoadingState(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionKey]: {
                        ...prev.sections[sectionKey],
                        status: 'error',
                        error: errorMsg,
                    },
                },
            }));
        };

        if (result.type === 'success') {
            handleSuccess(result.value);
        } else {
            // Use procedural fallback for creative exercises
            if ((sectionKey === 'arpeggioEtude' || sectionKey === 'motifEtude') && scaleData) {
                console.warn(`AI generation failed for ${sectionKey}. Using procedural fallback.`);
                const fallbackResult = FallbackService.generateCreativeExercise(sectionKey, rootNote, scaleName, scaleData.diagramData.notesOnFretboard);
                if (fallbackResult.type === 'success') {
                    handleSuccess(fallbackResult.value);
                } else {
                    handleError(fallbackResult.error.message);
                }
            } else {
                handleError(result.error.message);
            }
        }

        updateLoadingState(prev => {
            // FIX: Cast `s` to `SectionState<any>` to resolve type error when accessing `s.status`.
            const stillLoading = Object.values(prev.sections).some((s: SectionState<any>) => s.status === 'loading');
            return { ...prev, isActive: stillLoading, status: stillLoading ? 'generating' : 'success' };
        });
    }, [rootNote, scaleName, scaleData, setCache, updateLoadingState]);
    
    const generate = useCallback(async (note: string, scale: string) => {
        const clientResult = ScaleGenerationService.generateClientData(note, scale);

        if (clientResult.type === 'failure') {
            const initialSections = createInitialSectionState();
            (initialSections as any).listeningGuide = { status: 'error', error: clientResult.error.message, data: null, retryCount: 1 };
            dispatch({ type: 'SET_LOADING_STATE', payload: { status: 'error', isActive: false, sections: initialSections } });
            return;
        }
        
        const newScaleData = clientResult.value as ScaleData;
        setScaleData(newScaleData);
        
        const cacheKey = `${note}-${scale}`;
        const cachedSections = cache[cacheKey] || {};
        const newSectionsState = { ...createInitialSectionState() };

        for (const key of ALL_SECTIONS) {
            if (cachedSections[key as SectionKey]) {
                newSectionsState[key as SectionKey] = { status: 'success', data: cachedSections[key as SectionKey] as any, error: null, retryCount: 0 };
            }
        }
        
        dispatch({ type: 'SET_LOADING_STATE', payload: { status: 'generating', isActive: true, sections: newSectionsState } });
        
        // This is a bit of a hack to ensure the state update from setScaleData is available
        // to the generateSection calls that are about to happen.
        await new Promise(resolve => setTimeout(resolve, 0));

    }, [dispatch, setScaleData, cache]);

    // Effect to trigger fetching of missing sections after client data is set
    useEffect(() => {
        if (loadingState.status === 'generating' && scaleData) {
            const missingSections = ALL_SECTIONS.filter(
                sectionKey => loadingState.sections[sectionKey].status === 'pending'
            );
            if(missingSections.length > 0) {
                 Promise.all(missingSections.map(key => generateSection(key)));
            }
        }
    }, [loadingState.status, scaleData, generateSection]);


    return { generate, generateSection };
};