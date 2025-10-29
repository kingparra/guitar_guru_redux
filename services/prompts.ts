import { SCALE_FORMULAS } from '../constants';
import type { DiagramNote } from '../types';

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
**Output Format:** You MUST return a single, valid JSON array that strictly adheres to the provided schema. **Crucial:** Ensure all string values within the JSON are properly escaped, especially making sure there are no unescaped double quotes within strings.

---
#### Core Mission & Purpose
Your goal is to deliver musically useful, instantly readable guitar scale materials for an intermediate to advanced player. The client application generates ALL diagram data (notes, positions, fingerings, runs), ALL harmonization exercises, and ALL chord diagrams. Your role is to provide the textual, creative, and theoretical content.
`;

export const getListeningGuidePrompt = (rootNote: string, scaleName: string) => `
${commonPromptHeader(rootNote, scaleName)}
---
#### SECTION TO GENERATE: Listening Guide ONLY
Generate the 'listeningGuide' array. Select 2-4 "deeper cuts" or tracks from technical genres. Avoid over-cited examples.
**CRITICAL:** For each entry, you MUST include a brief 'explanation' field (1-2 sentences) describing why this song is a good example of the scale.
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
**CRITICAL:** For each entry, you MUST include a brief 'explanation' field (1-2 sentences) describing the style and feel of the jam track.
`;

const creativeExerciseBasePrompt = (rootNote: string, scaleName: string) => `
### Master Prompt for Generating a Creative Guitar Etude
**Act as a master guitar instructor and composer.**

**Context:** The user is learning the **${rootNote} ${scaleName}** scale. You have been provided with an exhaustive list of every possible fretting position (each a unique string-and-fret combination) for this scale across a 24-fret, 7-string guitar.

**Primary Mandate (NON-NEGOTIABLE):**
Your task is to transform the purely mechanical exercise of playing every single one of these provided fretting positions into an engaging, musical, and technical etude. The final generated 'path' MUST contain every single provided fretting position exactly once. This is a "connect-the-dots" challenge where the dots are all the scale's physical locations on the neck.

**General Composition Rules:**
- The etude must be monophonic (one note at a time).
- Do not include hammer-ons or pull-offs. Simple slides are acceptable if musically appropriate.
- The path should be ergonomic and playable for an advanced guitarist.
`;

export const getArpeggioEtudePrompt = (rootNote: string, scaleName: string, notesOnFretboard: DiagramNote[]) => `
${creativeExerciseBasePrompt(rootNote, scaleName)}

**Etude to Compose: "Diatonic Arpeggiation Study"**
-   **Concept:** A harmonically rich technical study that builds fretboard mastery by connecting every fretting position with varied diatonic arpeggios, creating melodic interest through changes in direction and contour.
-   **Specific Composition Rules:**
    1.  **Exhaustive Path (CRITICAL):** The final 'path' array you generate MUST contain every single fretting position from the provided fretboard data, each appearing exactly once. Do not omit any, and do not add any that were not provided.
    2.  **Musical Connection:** The path MUST AVOID simple linear ascents or descents. Instead, use a rich variety of diatonic arpeggio fragments (triads, sevenths) as the 'glue' to connect the required fretting positions. Employ both ascending and descending patterns, inversions, and occasional wide melodic leaps to create texture and unexpected, yet musical, turns. The goal is to make the traversal harmonically intelligent and melodically engaging.
    3.  **Melodic Contour:** The overall path should have a dynamic contour. While it must cover the entire fretboard, it should feature shifts in direction, moving both up and down the neck in smaller sections to avoid a monotonous, linear feel.
    4.  **Avoid Horizontal Stagnation:** The path must not contain long, purely horizontal runs (e.g., playing every available note across all strings at a single fret without changing position). The etude must encourage fluid movement both up and down the neck (position shifting) and across the strings.
    5.  **Avoid Simplistic Traversal:** The path MUST NOT be a simple linear run up or down a single string for its entire length, nor a systematic string-by-string traversal of the neck. It needs melodic and rhythmic variety.
-   **Explanation:** Write a brief, encouraging explanation for the user describing how this etude builds a deep connection between the physical scale shape and its underlying harmonic structure.

**Output Format:** You MUST return a single, valid JSON object. Adhere strictly to the schema:
\`\`\`json
{
  "title": "Diatonic Arpeggiation Etude",
  "explanation": "Your explanation for the arpeggio etude goes here.",
  "path": [
    { "string": 6, "fret": 12, "noteName": "B", "degree": "5", "finger": "1" }
  ]
}
\`\`\`
**Provided Fretboard Data (Every possible fretting position):**
${JSON.stringify(notesOnFretboard, null, 2)}
`;

export const getMotifEtudePrompt = (rootNote: string, scaleName: string, notesOnFretboard: DiagramNote[]) => `
${creativeExerciseBasePrompt(rootNote, scaleName)}

**Etude to Compose: "Melodic Motif Development Study"**
-   **Concept:** A technical and creative study that builds picking accuracy and fretboard visualization by applying a repeating melodic/rhythmic idea (a motif) to connect every fretting position across the entire neck.
-   **Specific Composition Rules:**
    1.  **Exhaustive Path (CRITICAL):** The final 'path' array you generate MUST contain every single fretting position from the provided fretboard data, each appearing exactly once. Do not omit any, and do not add any that were not provided.
    2.  **Motif-Based Connection:** Invent a short (3-6 note) melodic/rhythmic motif. The path you create should apply this motif repeatedly, transposing it diatonically as it moves through the scale to connect all the required fretting positions. The motif should be applied across different string sets and octaves to create interest.
    3.  **Melodic Contour:** The overall path should have a dynamic contour. While it must cover the entire fretboard, it should feature shifts in direction, moving both up and down the neck in smaller sections to avoid a monotonous, linear feel.
    4.  **Avoid Horizontal Stagnation:** Similar to the arpeggio study, this etude must not get stuck in one position. The motif should travel fluidly across the fretboard, encouraging a mix of positional and cross-string movement to feel dynamic and practical.
    5.  **Avoid Simplistic Traversal:** The path MUST NOT be a simple linear run up or down a single string for its entire length, nor a systematic string-by-string traversal of the neck. It needs melodic and rhythmic variety.
-   **Explanation:** Write a brief, encouraging explanation for the user describing how practicing with motifs can unlock new creative ideas and improve technical consistency.

**Output Format:** You MUST return a single, valid JSON object. Adhere strictly to the schema:
\`\`\`json
{
  "title": "Melodic Motif Development Etude",
  "explanation": "Your explanation for the motif etude goes here.",
  "path": [
    { "string": 6, "fret": 12, "noteName": "B", "degree": "5", "finger": "1" }
  ]
}
\`\`\`
**Provided Fretboard Data (Every possible fretting position):**
${JSON.stringify(notesOnFretboard, null, 2)}
`;