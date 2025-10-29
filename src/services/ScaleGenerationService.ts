import * as geminiService from './geminiService';
import type {
    Result,
    SectionKey,
    ScaleData,
    DiagramData,
} from '../types';
import { MusicTheoryService } from './MusicTheoryService';
import { FretboardService } from './FretboardService';
import { HarmonyService } from './HarmonyService';


export class ScaleGenerationService {
    public static generateClientData(rootNote: string, scaleName: string): Result<ScaleData, Error> {
        try {
            const scaleNotesResult = MusicTheoryService.generateScaleNotes(rootNote, scaleName);
            if (scaleNotesResult.type === 'failure') return scaleNotesResult;
            
            const scaleNotes = scaleNotesResult.value;
            const characteristicDegrees = MusicTheoryService.getCharacteristicDegrees(scaleNotes);
            const notesOnFretboard = FretboardService.generateNotesOnFretboard(scaleNotes);
            const fingering = FretboardService.generateFingeringPositions(notesOnFretboard);
            const diagonalRun = FretboardService.generateDiagonalRun(notesOnFretboard);
            
            const diatonicChordsMap = HarmonyService.generateDiatonicChords(scaleNotes, notesOnFretboard);
            const degreeExplanation = MusicTheoryService.generateDegreeTableMarkdown(scaleNotes);
            const progressions = HarmonyService.generateCommonProgressions(diatonicChordsMap, scaleName);

            const diagramData: DiagramData = {
                notesOnFretboard, fingering, diagonalRun, characteristicDegrees,
            };

            const clientData: ScaleData = {
                diagramData, 
                degreeExplanation, 
                scaleNotes, 
                fingering, 
                keyChords: {
                    diatonicChords: diatonicChordsMap,
                    progressions,
                },
            };

            return { type: 'success', value: clientData };

        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error('An unknown error occurred during client-side generation.');
            return { type: 'failure', error };
        }
    }

    public static async generateAiSection(
        sectionKey: SectionKey,
        context: { rootNote: string; scaleName: string; scaleData: ScaleData }
    ): Promise<Result<any, Error>> {
        const { rootNote, scaleName, scaleData } = context;
        try {
            const serviceFunctionName = `generate${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
            const serviceFunction = (geminiService as any)[serviceFunctionName];
            
            if (!serviceFunction) {
                throw new Error(`No AI service function found for section key: ${sectionKey}`);
            }

            // Special handling for creative exercises to pass the full note data
            if (sectionKey === 'arpeggioEtude' || sectionKey === 'motifEtude') {
                const data = await serviceFunction(rootNote, scaleName, scaleData.diagramData.notesOnFretboard);
                return { type: 'success', value: data };
            }
            
            const data = await serviceFunction(rootNote, scaleName);
            return { type: 'success', value: data };
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(`Failed to generate section: ${sectionKey}`);
            return { type: 'failure', error };
        }
    }
}