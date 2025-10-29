





import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import type {
    Song, Tutorial, CreativeVideo, JamTrack,
    SongAnalysisResult, CreativeExercise, DiagramNote,
    ScaleData, Chord, ChordInspectorData, ClickedNote
} from '../types';
import { getArpeggioEtudePrompt, getMotifEtudePrompt, getListeningGuidePrompt, getYoutubeTutorialsPrompt, getCreativeApplicationPrompt, getJamTracksPrompt, getChordInspectorPrompt } from './prompts';
// FIX: Import the MusicTheoryService to resolve the 'Cannot find name' error.
import { MusicTheoryService } from './MusicTheoryService';
import { HarmonyService } from './HarmonyService';

const callApi = async <T>(prompt: string): Promise<T> => {
    if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
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

export const displayNotesOnFretboard: FunctionDeclaration = {
    name: 'displayNotesOnFretboard',
    description: 'Displays a set of notes on the guitar fretboard diagram for the user to see. Can also be used to label notes with custom text.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            notes: {
                type: Type.ARRAY,
                description: 'An array of note objects to display on the fretboard.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        string: { type: Type.INTEGER, description: 'The string number (0 for high E, 6 for low B).' },
                        fret: { type: Type.INTEGER, description: 'The fret number (0 for open string).' },
                        noteName: { type: Type.STRING, description: 'Optional name of the note, e.g., "G#".' },
                        degree: { type: Type.STRING, description: 'Optional scale degree, e.g., "b3".' },
                        finger: { type: Type.STRING, description: 'Optional suggested fingering.' },
                        displayText: { type: Type.STRING, description: 'Optional custom text to display inside the note marker, overriding the default.'}
                    },
                    required: ['string', 'fret'],
                },
            },
        },
        required: ['notes'],
    },
};

export const HAND_MECHANICS_CONTEXT = `
# Hand Mechanics & Ergonomic Pathfinding

This document outlines the biomechanical principles that govern the application's logic for generating ergonomic fingerings and paths on the fretboard. The goal is to create fingerings that are not just technically correct, but also comfortable, efficient, and musically practical.

## Core Principles

The model is based on simplifying the complex movements of the fretting hand into a few core principles:

1.  **The "One Finger Per Fret" Axiom:** Within a stable hand position, the most efficient approach is to assign one finger to cover each fret. This minimizes unnecessary hand movement.
2.  **Positional Play is Primary:** Guitarists think in "positions" or "boxes." Large melodic leaps are achieved by shifting the entire hand position, not by large, inefficient stretches within a single position.
3.  **Conservation of Motion:** The most ergonomic path is the one that requires the least amount of total physical effort. This means minimizing large, rapid shifts, awkward cross-string jumps, and unnecessary stretches.
`;

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
        model: 'gemini-2.5-pro',
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

// This function now uses the Gemini API.
export const generateChordInspectorData = async (
    rootNote: string,
    scaleName: string,
    selectedChord: Chord
): Promise<ChordInspectorData> => {
    const prompt = getChordInspectorPrompt(rootNote, scaleName, selectedChord.name, selectedChord.seventhNotes);
    
    // Using a direct API call here instead of the generic callApi because the response
    // is simple and doesn't need complex parsing beyond what Gemini provides.
    if (!process.env.API_KEY) {
        throw new Error('API_KEY environment variable not set');
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });

    const textResponse = response.text.trim();
    // This simple parsing assumes the AI will respond with a list of comma-separated notes.
    // A more robust implementation might request JSON.
    const tensionNotes = textResponse ? textResponse.split(',').map(n => n.trim()) : [];
    
    // The rest of the data is derived client-side.
    const scaleNotesResult = MusicTheoryService.generateScaleNotes(rootNote, scaleName);
    if (scaleNotesResult.type === 'failure') {
        throw new Error("Could not regenerate scale notes for inspector.");
    }

    const parentScaleNotes = new Set(scaleNotesResult.value.map(n => n.noteName));
    const chordTones = selectedChord.seventhNotes;
    // FIX: Explicitly typing `note` as string to fix type inference issue where it becomes `unknown`.
    const scaleTones = Array.from(parentScaleNotes).filter((note: string) => !chordTones.includes(note));

    return {
        chordTones,
        scaleTones,
        tensionNotes
    };
};