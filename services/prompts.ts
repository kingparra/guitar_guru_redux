
import { SCALE_FORMULAS } from '../constants';
import type { Chord, ClickedNote } from '../types';

const validScales = Object.keys(SCALE_FORMULAS).join(', ');

export const notationAnalysisPrompt = `
You are an expert music theorist specializing in Optical Music Recognition. Your task is to analyze the provided image of musical notation and suggest appropriate guitar scales.
CRITICAL CONSTRAINT: You MUST choose from the following list of supported scales: ${validScales}.
Analysis Steps:
1. Examine key signature, accidentals, chord markings, and melodic patterns.
2. Determine the primary musical key and mode.
3. Suggest multiple scales from the list only:
    - Primary Match: The single best theoretical fit.
    - Creative Alternatives: 1-2 other scales from the list that would also work.
4. For each suggestion, provide a detailed musical justification.
Output: Return a single, valid JSON array of 2-3 scale suggestion objects, adhering to the schema. No introductory text or markdown.
`;

const commonPromptHeader = (rootNote: string, scaleName: string) => `
### Master Prompt for Generating Guitar Scale Materials
**Request:** Generate a specific section of learning materials for the **${rootNote} ${scaleName}** scale on a seven-string guitar (tuned B E A D G B E, low to high).
**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. **Crucial:** Ensure all string values within the JSON are properly escaped, especially making sure there are no unescaped double quotes within strings.

---
#### Core Mission & Purpose
Your goal is to deliver musically useful, instantly readable guitar scale materials for an intermediate to advanced player. The client application generates ALL diagram data (notes, positions, fingerings, runs), ALL harmonization exercises, and ALL chord diagrams. Your role is to provide the textual, creative, and theoretical content.

---
#### Structured Tablature (\`StructuredTab\`) Format
All linear tablature (licks, etudes) MUST be in this structured JSON format:
{ "columns": [ [ { "string": 5, "fret": "5" } ], [ { "string": 0, "fret": "|" }, ... ] ] }
- columns: An array of columns, each representing a moment in time.
- Column: An array of \`TabNote\` objects played simultaneously.
- Bar Lines: A column where ALL 7 strings have a \`TabNote\` with \`fret: "|"\`.
`;

export const getListeningGuidePrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Listening Guide ONLY
Generate the 'listeningGuide' array. Select 2-4 "deeper cuts" or tracks from technical genres. Avoid over-cited examples.
`;
export const getYoutubeTutorialsPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: YouTube Tutorials ONLY
Generate the 'youtubeTutorials' array. Provide 2-4 links to high-quality lessons.
`;
export const getCreativeApplicationPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Creative Application ONLY
Generate the 'creativeApplication' array. Find 2-4 videos showcasing the scale in a creative, non-tutorial context.
`;
export const getJamTracksPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Jam Tracks ONLY
Generate the 'jamTracks' array. Find 2-4 high-quality backing tracks on YouTube.
`;
export const getLicksPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Licks ONLY
Generate the 'licks' array (1-2 licks). Licks should be musically interesting and use \`StructuredTab\`.
`;
export const getAdvancedHarmonizationPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Advanced Harmonization ONLY
Generate the 'advancedHarmonization' array (1-2 exercises).
CRITICAL: Provide ONLY the \`name\` and \`description\`. DO NOT GENERATE THE \`tab\`.
`;
export const getEtudesPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Etudes ONLY
Generate the 'etudes' array (1-2 etudes). Etudes should be at least 8 bars long using \`StructuredTab\`.
`;

export const getChordProgressionAnalysisPrompt = (rootNote: string, scaleName: string, progressionAnalysis: string) => `
### Master Prompt for Chord Progression Analysis (Composer Mode)
**Act as an expert composer and music theorist.**
**Context:** The user is studying the **${rootNote} ${scaleName}** scale.
**Request:** Provide a deep, insightful musical analysis for the chord progression: **${progressionAnalysis}**.
**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Ensure the 'analysisText' is a well-written, single string.
`;

export const getChordInspectorDataPrompt = (rootNote: string, scaleName: string, chord: Chord) => `
### Master Prompt for Chord Inspector (Composer/Improviser Mode)
**Act as an expert improviser and music theorist.**
**Context:** The user is analyzing the **${chord.name} (${chord.degree})** chord within the key of **${rootNote} ${scaleName}**.
**Request:** Provide a breakdown of the melodic options over this specific chord in this specific key.

**Analysis Steps:**
1.  **Identify Chord Tones:** List the notes of the chord's triad. These are the "safe" notes.
2.  **Identify Scale Tones:** List the remaining notes from the parent **${rootNote} ${scaleName}** scale that are NOT in the chord. These are the "passing" notes.
3.  **Identify Tension Notes:** From the "Scale Tones" list, select the 1-2 most musically interesting "tension" notes that add color and sophistication when played over this chord. For example, the #4 over a major chord (Lydian sound) or the major 7th over a minor chord. Briefly explain WHY each is a good choice.

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the schema: { "chordTones": string[], "scaleTones": string[], "tensionNotes": string[] }. No introductory text or markdown.
`;

export const getAnchorNoteContextsPrompt = (rootNote: string, scaleName: string, anchorNote: ClickedNote, diatonicChords: Chord[]) => `
### Master Prompt for Anchor Note System (Improviser Mode)
**Act as an expert improviser and guitarist.**
**Context:** The user is in "Anchor Note" mode. They have selected the note **${anchorNote.noteName}** (pitch: ${anchorNote.noteName}${anchorNote.octave}) as their physical and melodic anchor point on the fretboard. The key is **${rootNote} ${scaleName}**.
**The available diatonic chords are:** ${diatonicChords.map(c => `${c.name} (${c.degree})`).join(', ')}.

**Request:** Identify the different harmonic functions this anchor note can serve within the key. For each function, generate an ergonomic, 2-5 note arpeggio fragment that a guitarist could realistically play starting from or passing through the anchor note.

**Analysis Steps:**
1.  Iterate through the diatonic chords. Find which chords contain the anchor note **${anchorNote.noteName}**.
2.  For each match, describe the anchor note's function (e.g., "Root of Gmaj (III)", "b3rd of Emin (i)", "5th of Cmaj (VI)").
3.  For each function, devise a short, practical, and ergonomic arpeggio fragment (2-5 notes) on the guitar that includes the anchor note. The fragment should be easily playable and demonstrate the note's role in that chord's sound.
4.  The output must be an array of \`AnchorNoteContext\` objects.

**Output Format:** You MUST return a single, valid JSON array adhering to the schema: [{ "description": string, "arpeggioNotes": [{ "string": number, "fret": number, "finger": string, "degree": string, "noteName": string }] }].
The \`arpeggioNotes\` MUST contain the anchor note. Fingerings should be ergonomic suggestions (1-4). Degrees should be relative to the arpeggio's root (R, b3, 3, 5, etc.). Note names must be included.
`;
