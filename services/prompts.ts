import { SCALE_FORMULAS } from '../constants';

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

export const getOverviewPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Overview ONLY
Generate the JSON content for the 'overview' section.
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
export const getToneAndGearPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Tone & Gear ONLY
Generate the 'toneAndGear' object. Provide tips for amp settings, effects, and pickups, and list famous artists.
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
export const getModeSpotlightPrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Mode Spotlight ONLY
Generate the 'modeSpotlight' object. Pick a related mode and explain its sound and application.
`;

export const getChordProgressionAnalysisPrompt = (rootNote: string, scaleName: string, progressionAnalysis: string) => `
### Master Prompt for Chord Progression Analysis (Composer Mode)
**Act as an expert composer and music theorist.**
**Context:** The user is studying the **${rootNote} ${scaleName}** scale.
**Request:** Provide a deep, insightful musical analysis for the chord progression: **${progressionAnalysis}**.

**Analysis Guidelines (You must cover all points):**
1.  **Harmonic Function:** Explain the role of each chord (e.g., tonic, dominant, subdominant, pivot chord, etc.) and why this sequence works theoretically.
2.  **Emotional Arc & Storytelling:** Describe the emotional journey the progression creates. Does it feel uplifting, melancholic, tense, resolved? Tell a story with the harmony.
3.  **Voice Leading Insights:** Suggest a simple, effective voice leading path between two key chords in the progression. Describe how a single note moving smoothly (e.g., 'the G on the tonic i chord moves smoothly down to the F# on the V chord') creates a strong connection.
4.  **Improvisational Roadmap:** Give the guitarist a concrete strategy. What are the "money notes" or "target tones" over each chord? Where can they create tension or find resolution?
5.  **Compositional Application:** In what part of a song would this progression work best (e.g., verse, chorus, bridge)? Why?
6.  **Highlighting:** Whenever you mention a musical term that should be highlighted (like a Roman numeral '@@V@@', a note '@@C#@@', or an interval '@@b3@@'), wrap it in '@@' delimiters.

**Output Format:** You MUST return a single, valid JSON object that strictly adheres to the provided schema. Ensure the 'analysisText' is a well-written, single string that weaves all the above points into a cohesive analysis.
`;

export const getPlaygroundSuggestionsPrompt = (anchorNote: {noteName: string, octave: number}, scaleContext: {rootNote: string, scaleName: string}) => `
### Master Prompt for Playground Mode Suggestions
**Act as an expert guitarist, composer, and theorist with deep knowledge of fretboard ergonomics.**
**Context:** The user is in "Playground Mode." They have clicked on the note **${anchorNote.noteName}${anchorNote.octave}**. The overall musical context is the **${scaleContext.rootNote} ${scaleContext.scaleName}** scale.
**Request:** Generate 2-3 creative, musically interesting, and **ergonomically playable** ideas that can be built from this specific anchor note. The ideas should feel like natural "next moves" for an improviser.

**Suggestion Guidelines:**
1.  **Ergonomics First:** All suggestions must be physically comfortable to play, originating from the anchor note. Think about what a player's hand could realistically do from that position.
2.  **Variety:** Provide a mix of suggestions. Examples:
    *   A nearby, playable triad voicing (e.g., "G Major Triad, 1st Inversion").
    *   A small fragment of a related arpeggio (e.g., "E minor arpeggio fragment").
    *   A hint of a different mode or scale that also contains the anchor note, creating a moment of color (e.g., "C Lydian Fragment").
3.  **Clarity:** For each suggestion, provide:
    *   \`name\`: A clear, descriptive name (e.g., "G Major Triad (Root Position)").
    *   \`description\`: A concise explanation of what the idea is and why it's musically useful in this context.
    *   \`diagram\`: A JSON object representing a small fretboard diagram.
        *   \`notes\`: An array of \`DiagramNote\` objects, including \`string\`, \`fret\`, \`finger\`, \`noteName\`, and \`degree\` relative to the suggestion's own root.
        *   The diagram should ONLY contain the notes for the specific suggestion.
        *   Fingering suggestions are CRITICAL for ergonomics.

**Output Format:** You MUST return a single, valid JSON array of 2-3 suggestion objects, strictly adhering to the \`PlaygroundSuggestion[]\` schema. No introductory text or markdown.
`;
