


import * as geminiService from './geminiService';
import type {
    Result,
    SectionKey,
    ClientData,
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


// FIX: Removed unused Hydrator type and related functions for a deprecated feature.

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
            const serviceFunctionName = `generate${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`;
            const serviceFunction = (geminiService as any)[serviceFunctionName];
            
            if (!serviceFunction) {
                throw new Error(`No AI service function found for section key: ${sectionKey}`);
            }

            // Special handling for creative exercises to pass the full note data
            if (sectionKey === 'arpeggioEtude' || sectionKey === 'motifEtude') {
                const data = await serviceFunction(rootNote, scaleName, clientData.diagramData.notesOnFretboard);
                return { type: 'success', value: data };
            }
            
            const data = await serviceFunction(rootNote, scaleName);
            
            // FIX: Removed hydration logic as the feature it supported was removed.
            return { type: 'success', value: data };
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(`Failed to generate section: ${sectionKey}`);
            return { type: 'failure', error };
        }
    }
}