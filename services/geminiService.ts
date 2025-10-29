import { GoogleGenAI } from '@google/genai';
import type {
    Song, Tutorial, CreativeVideo, JamTrack,
    SongAnalysisResult, CreativeExercise, DiagramNote
} from '../types';
import { getArpeggioEtudePrompt, getMotifEtudePrompt, getListeningGuidePrompt, getYoutubeTutorialsPrompt, getCreativeApplicationPrompt, getJamTracksPrompt } from './prompts';

const callApi = async <T>(prompt: string): Promise<T> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro-latest',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as T;
    } catch (e) {
        console.error("Failed to parse AI response:", jsonText);
        throw new Error("The AI returned an invalid JSON response. Please try again.");
    }
};


export const generateListeningGuide = (rootNote: string, scaleName: string): Promise<Song[]> => {
    return callApi<Song[]>(getListeningGuidePrompt(rootNote, scaleName));
};

export const generateYoutubeTutorials = (rootNote: string, scaleName: string): Promise<Tutorial[]> => {
    return callApi<Tutorial[]>(getYoutubeTutorialsPrompt(rootNote, scaleName));
};

export const generateCreativeApplication = (rootNote: string, scaleName: string): Promise<CreativeVideo[]> => {
    return callApi<CreativeVideo[]>(getCreativeApplicationPrompt(rootNote, scaleName));
};

export const generateJamTracks = (rootNote: string, scaleName: string): Promise<JamTrack[]> => {
    return callApi<JamTrack[]>(getJamTracksPrompt(rootNote, scaleName));
};

export const generateArpeggioEtude = (rootNote: string, scaleName: string, notesOnFretboard: DiagramNote[]): Promise<CreativeExercise> => {
    const prompt = getArpeggioEtudePrompt(rootNote, scaleName, notesOnFretboard);
    return callApi<CreativeExercise>(prompt);
};

export const generateMotifEtude = (rootNote: string, scaleName: string, notesOnFretboard: DiagramNote[]): Promise<CreativeExercise> => {
    const prompt = getMotifEtudePrompt(rootNote, scaleName, notesOnFretboard);
    return callApi<CreativeExercise>(prompt);
};

export const analyzeMusicNotationImage = async (imageData: string, mimeType: string): Promise<SongAnalysisResult[]> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = { inlineData: { data: imageData, mimeType } };
    const textPart = { text: "Analyze this music notation and suggest guitar scales. Adhere to the specified JSON schema." };

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro-latest',
        contents: { parts: [textPart, imagePart] },
         config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SongAnalysisResult[];
    } catch (e) {
        console.error("Failed to parse AI response for image analysis:", response.text);
        throw new Error("The AI returned an invalid response for the image analysis.");
    }
};