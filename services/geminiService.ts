// MOCK IMPLEMENTATION - This file is currently using mock data to avoid API rate limiting.
// To switch to the live API, you would replace the mock imports and function bodies
// with the commented-out real implementations.

import type {
    ScaleDetails, Song, Tutorial, CreativeVideo, JamTrack, Lick, 
    HarmonizationExercise, Etude, SongAnalysisResult,
    PlaygroundSuggestion, ClickedNote
} from '../types';
import { 
    MOCK_OVERVIEW, MOCK_LISTENING_GUIDE, MOCK_YOUTUBE_TUTORIALS, 
    MOCK_CREATIVE_APPLICATION, MOCK_JAM_TRACKS, MOCK_TONE_AND_GEAR, 
    MOCK_LICKS, MOCK_HARMONIZATION, MOCK_ETUDES, MOCK_MODE_SPOTLIGHT,
    MOCK_ANALYSIS_TEXT, MOCK_PLAYGROUND_SUGGESTIONS,
} from './mockData';

// Helper to simulate network latency
const FAKE_DELAY = () => new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));

// --- MOCKED API FUNCTIONS ---
export const generateOverview = async (rootNote: string, scaleName: string): Promise<ScaleDetails['overview']> => {
    await FAKE_DELAY();
    console.log(`MOCK: Generating overview for ${rootNote} ${scaleName}`);
    return MOCK_OVERVIEW;
};

export const generateListeningGuide = async (rootNote: string, scaleName: string): Promise<Song[]> => {
    await FAKE_DELAY();
    return MOCK_LISTENING_GUIDE;
};

export const generateYoutubeTutorials = async (rootNote: string, scaleName: string): Promise<Tutorial[]> => {
    await FAKE_DELAY();
    return MOCK_YOUTUBE_TUTORIALS;
};

export const generateCreativeApplication = async (rootNote: string, scaleName: string): Promise<CreativeVideo[]> => {
    await FAKE_DELAY();
    return MOCK_CREATIVE_APPLICATION;
};

export const generateJamTracks = async (rootNote: string, scaleName: string): Promise<JamTrack[]> => {
    await FAKE_DELAY();
    return MOCK_JAM_TRACKS;
};

export const generateToneAndGear = async (rootNote: string, scaleName: string): Promise<ScaleDetails['toneAndGear']> => {
    await FAKE_DELAY();
    return MOCK_TONE_AND_GEAR;
};

export const generateLicks = async (rootNote: string, scaleName: string): Promise<Lick[]> => {
    await FAKE_DELAY();
    return MOCK_LICKS;
};

export const generateAdvancedHarmonization = async (rootNote: string, scaleName: string): Promise<HarmonizationExercise[]> => {
    await FAKE_DELAY();
    return MOCK_HARMONIZATION;
};

export const generateEtudes = async (rootNote: string, scaleName: string): Promise<Etude[]> => {
    await FAKE_DELAY();
    return MOCK_ETUDES;
};

export const generateModeSpotlight = async (rootNote: string, scaleName: string): Promise<ScaleDetails['modeSpotlight']> => {
    await FAKE_DELAY();
    return MOCK_MODE_SPOTLIGHT;
};

export const generateChordProgressionAnalysis = async (rootNote: string, scaleName: string, progressionAnalysis: string): Promise<string> => {
    await FAKE_DELAY();
    return MOCK_ANALYSIS_TEXT;
};

export const generatePlaygroundSuggestions = async (anchorNote: ClickedNote, scaleContext: {rootNote: string, scaleName: string}): Promise<PlaygroundSuggestion[]> => {
    await FAKE_DELAY();
    console.log(`MOCK: Generating playground suggestions for ${anchorNote.noteName}${anchorNote.octave} in context of ${scaleContext.rootNote} ${scaleContext.scaleName}`);
    return MOCK_PLAYGROUND_SUGGESTIONS;
}

// This function would remain a real API call as it's user-initiated.
export const analyzeMusicNotationImage = async (imageData: string, mimeType: string): Promise<SongAnalysisResult[]> => {
    await FAKE_DELAY();
    // This is mocked to return two valid results for demonstration.
    return [
        {
            rootNote: 'A',
            scaleName: 'Natural Minor',
            analysis: 'The key signature of G major and the frequent use of A as a tonal center strongly suggest A Aeolian mode, which is the natural minor scale.',
            suitability: 'Primary Match'
        },
        {
            rootNote: 'A',
            scaleName: 'Minor Pentatonic',
            analysis: 'This scale is a subset of A Natural Minor and will work well over the chord changes, providing a more bluesy and open sound.',
            suitability: 'Creative Alternative'
        }
    ];
};
