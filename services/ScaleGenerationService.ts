import * as geminiService from './geminiService';
import type {
    Result,
    SectionKey,
    ClientData,
    HarmonizationExercise,
    DiagramData,
} from '../types';
import {
    generateScaleNotesFromFormula,
    getDiagramMetadataFromScaleNotes,
    generateNotesOnFretboard,
    generateFingeringPositions,
    generateDiagonalRun,
    generateHarmonizationTab,
    generateDiatonicChords,
    generateDegreeTableMarkdown,
    generateCommonProgressions,
} from '../utils/guitarUtils';


type Hydrator = (data: any, clientData: ClientData) => any;

const hydrateAdvancedHarmonization: Hydrator = (data, clientData) => {
    if (Array.isArray(data)) {
        data.forEach((ex: HarmonizationExercise) => {
            const interval = ex.description.toLowerCase().includes('third') ? 2 : 5;
            ex.tab = generateHarmonizationTab(clientData.fingering, clientData.scaleNotes, interval);
        });
    }
    return data;
};

const hydrators: Partial<Record<SectionKey, Hydrator>> = {
    advancedHarmonization: hydrateAdvancedHarmonization,
};

export class ScaleGenerationService {
    public static generateClientData(rootNote: string, scaleName: string): Result<ClientData, Error> {
        try {
            const scaleNotesResult = generateScaleNotesFromFormula(rootNote, scaleName);
            if (scaleNotesResult.type === 'failure') return scaleNotesResult;
            
            const scaleNotes = scaleNotesResult.value;
            const { characteristicDegrees } = getDiagramMetadataFromScaleNotes(scaleNotes);
            const notesOnFretboard = generateNotesOnFretboard(scaleNotes);
            const fingering = generateFingeringPositions(notesOnFretboard);
            const diagonalRun = generateDiagonalRun(notesOnFretboard);
            const diatonicChordsMap = generateDiatonicChords(scaleNotes);
            const degreeExplanation = generateDegreeTableMarkdown(scaleNotes);
            
            const progressions = generateCommonProgressions(diatonicChordsMap, scaleName);

            const diagramData: DiagramData = {
                notesOnFretboard, fingering, diagonalRun, characteristicDegrees,
            };

            return {
                type: 'success',
                value: {
                    diagramData, 
                    degreeExplanation, 
                    scaleNotes, 
                    fingering, 
                    keyChords: {
                        diatonicChords: diatonicChordsMap,
                        progressions,
                    },
                },
            };
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('An unknown error occurred during client-side generation.');
            return { type: 'failure', error };
        }
    }

    public static async generateAiSection(
        sectionKey: SectionKey,
        context: { rootNote: string; scaleName: string; clientData: ClientData }
    ): Promise<Result<any, Error>> {
        const { rootNote, scaleName, clientData } = context;
        try {
            const serviceFunction = (geminiService as any)[`generate${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`];
            const data = await serviceFunction(rootNote, scaleName);
            
            const hydrator = hydrators[sectionKey];
            const hydratedData = hydrator ? hydrator(data, clientData) : data;

            return { type: 'success', value: hydratedData };
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(`Failed to generate section: ${sectionKey}`);
            return { type: 'failure', error };
        }
    }
}
