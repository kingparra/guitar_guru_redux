// FIX: Import the 'React' namespace to resolve type errors with React.Dispatch and React.SetStateAction.
import React, { useState, useCallback, useMemo } from 'react';
import type {
    LoadingState,
    SectionKey,
    ClientData,
    SectionState,
    AppCache,
} from '../types';
import { ScaleGenerationService } from '../services/ScaleGenerationService';
import { FALLBACK_EXERCISES } from '../services/mockData';


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

const initialLoadingState: Omit<LoadingState, 'isActive'> = {
    status: 'idle',
    sections: createInitialSectionState(),
};

export const useScaleGenerator = (
    setClientData: (data: ClientData | null) => void,
    cache: AppCache,
    setCache: React.Dispatch<React.SetStateAction<AppCache>>
) => {
    const [rootNote, setRootNote] = useState('E');
    const [scaleName, setScaleName] = useState('Natural Minor');
    const [internalLoadingState, setInternalLoadingState] = useState(initialLoadingState);

    const loadingState = useMemo((): LoadingState => {
        const isActive = Object.values(internalLoadingState.sections).some(
            (s: SectionState<any>) => s.status === 'loading'
        );
        return { ...internalLoadingState, isActive };
    }, [internalLoadingState]);

    const generateSection = useCallback(async (
        sectionKey: SectionKey,
        context: { rootNote: string; scaleName: string; clientData: ClientData }
    ) => {
        setInternalLoadingState((prev) => ({
            ...prev,
            sections: {
                ...prev.sections,
                [sectionKey]: { ...prev.sections[sectionKey], status: 'loading', error: null },
            },
        }));

        const result = await ScaleGenerationService.generateAiSection(sectionKey, context);
        const cacheKey = `${context.rootNote}-${context.scaleName}`;

        if (result.type === 'success') {
            setCache(prevCache => ({
                ...prevCache,
                [cacheKey]: {
                    ...prevCache[cacheKey],
                    [sectionKey]: result.value,
                }
            }));
            setInternalLoadingState((prev) => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionKey]: { status: 'success', error: null, data: result.value, retryCount: 0 },
                },
            }));
        } else {
            // FIX: Use the new, scale-aware fallback system for creative exercises.
            // If the AI fails, it now looks up a hand-crafted etude that matches the
            // current scale, providing a much higher-quality and more relevant fallback.
            if (sectionKey === 'arpeggioEtude' || sectionKey === 'motifEtude') {
                console.warn(`AI generation failed for ${sectionKey}. Using scale-specific fallback data.`);
                
                const fallbackKey = `${context.rootNote}-${context.scaleName}`;
                // Find the correct set of fallbacks for the current scale, or default to E Natural Minor.
                const fallbacksToUse = FALLBACK_EXERCISES[fallbackKey] || FALLBACK_EXERCISES['E-Natural Minor'];

                const fallbackData = sectionKey === 'arpeggioEtude' 
                    ? fallbacksToUse.arpeggioEtude
                    : fallbacksToUse.motifEtude;
                
                // Set state as success with fallback data
                setInternalLoadingState((prev) => ({
                    ...prev,
                    sections: {
                        ...prev.sections,
                        [sectionKey]: { status: 'success', error: null, data: fallbackData, retryCount: 0 },
                    },
                }));
                // Also update cache with fallback data so we don't retry on next load
                setCache(prevCache => ({
                    ...prevCache,
                    [cacheKey]: {
                        ...prevCache[cacheKey],
                        [sectionKey]: fallbackData,
                    }
                }));

            } else {
                // Original error handling for other sections
                setInternalLoadingState((prev) => ({
                    ...prev,
                    sections: {
                        ...prev.sections,
                        [sectionKey]: {
                            status: 'error',
                            error: result.error.message,
                            data: null,
                            retryCount: prev.sections[sectionKey].retryCount + 1,
                        },
                    },
                }));
            }
        }
    }, [setCache]);
    
    const generate = useCallback(async (note: string, scale: string) => {
        setInternalLoadingState({ ...initialLoadingState, status: 'generating' });
        setClientData(null);

        const clientResult = ScaleGenerationService.generateClientData(note, scale);

        if (clientResult.type === 'failure') {
            const initialSections = createInitialSectionState();
            // Create a synthetic error for a section that no longer exists to display an error
            (initialSections as any).listeningGuide = { status: 'error', error: clientResult.error.message, data: null, retryCount: 1 };

            setInternalLoadingState({
                status: 'error',
                sections: initialSections,
            });
            return;
        }
        
        const clientData = clientResult.value;
        setClientData(clientData);
        
        const cacheKey = `${note}-${scale}`;
        const cachedSections = cache[cacheKey] || {};
        const newSectionsState = { ...createInitialSectionState() };

        // Pre-populate state from cache
        for (const key of ALL_SECTIONS) {
            if (cachedSections[key as SectionKey]) {
                newSectionsState[key as SectionKey] = { status: 'success', data: cachedSections[key as SectionKey] as any, error: null, retryCount: 0 };
            }
        }
        
        setInternalLoadingState({ status: 'success', sections: newSectionsState });

        // Proactively fetch any missing sections in parallel
        const missingSections = ALL_SECTIONS.filter(
            sectionKey => newSectionsState[sectionKey].status === 'pending'
        );

        await Promise.all(
            missingSections.map(sectionKey => 
                generateSection(sectionKey, { rootNote: note, scaleName: scale, clientData })
            )
        );
    }, [setClientData, cache, generateSection]);


    return {
        rootNote,
        setRootNote,
        scaleName,
        setScaleName,
        loadingState,
        generate,
        generateSection,
    };
};
