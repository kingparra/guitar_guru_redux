# Execution Plan: Creative Exercises & Anchor Note Refinements

This document outlines the step-by-step plan to execute the user's request to replace the "Practice Room" with a more musically intelligent "Creative Exercises" section (inspired by the Barry Harris and Jens Larsen videos) and refine the "Anchor Note" system.

## Goal

1.  Remove the generic "Practice Room" entirely.
2.  Create a new "Creative Exercises" section driven by high-level, context-aware AI prompts.
3.  Upgrade the "Composer's Notebook" to include modern improvisational concepts (Triad Pairs).
4.  Refine the UI of the "Anchor Note" panel to be more direct and actionable.
5.  Clean up all deprecated files and types from the codebase.

## Step-by-Step Implementation

1.  **Update Data Structures (`types.ts`):**
    *   In `ScaleDetails` and `SectionKey`, remove all references to `licks`, `etudes`, `advancedHarmonization`.
    *   Add a new section key: `creativeExercise`. The `ScaleDetails` type for this will be a complex object (e.g., `CreativeExercise`).
    *   Modify `composersNotebook` from `string` to an object: `{ analysis: string; triadPairs: { pair: string; explanation: string; }[]; }`.
    *   Modify `AnchorNoteContext` to be an object: `{ chord: string; function: string; arpeggioNotes: DiagramNote[]; }` for a clearer UI.

2.  **Update AI Prompts (`services/prompts.ts`):**
    *   Delete all prompts related to the old practice sections.
    *   Create a new, sophisticated `getCreativeExercisePrompt`. This prompt will have conditional logic: if the scale has a V7 chord, it should favor the "Barry Harris Diminished Harmony" exercise; otherwise, it should favor the "Diatonic Arpeggio Connection" exercise.
    *   Upgrade the `getComposersNotebookPrompt` to instruct the AI to also generate `triadPairs`.
    *   Refine the `getAnchorNoteContextsPrompt` to generate the new, more descriptive `AnchorNoteContext` object structure.

3.  **Update Services & Mocks (`services/`):**
    *   In `geminiService.ts`, remove all deleted generator functions. Add `generateCreativeExercise` and update `generateComposersNotebook` and `generateAnchorNoteContexts`.
    *   In `mockData.ts`, remove all old practice mocks. Add new mocks for the creative exercises (one for Barry Harris, one for Arpeggios) and update the composer's notebook and anchor context mocks.

4.  **Update Core Logic (`hooks/useScaleGenerator.ts`):**
    *   Modify the `ALL_SECTIONS` array to remove the old practice keys and add `creativeExercise`.

5.  **Update Navigation & Layout (`App.tsx`, `ControlPanel.tsx`, `ScaleExplorer.tsx`):**
    *   Update `sectionIds` in `App.tsx` to replace "practice" with "creativeExercises".
    *   Update the nav items in `ControlPanel.tsx`.
    *   In `ScaleExplorer.tsx`, remove the entire `PracticeSection` and add a new `Section` for "Creative Exercises".

6.  **Implement New/Updated Components:**
    *   **`AnchorContextPanel.tsx`:** Rework the UI to clearly display the `chord` and `function` from the new context object (e.g., "Emin (i) - uses this note as the b3rd").
    *   **`CreativeExerciseSection.tsx` (New File):** Create this component. It will need to:
        *   Render the exercise name and explanation.
        *   Render the `StructuredTab` using the existing utility.
        *   Include buttons (e.g., "Highlight Dominant Tones," "Highlight Diminished Tones") that interact with the main Fretboard Studio's `highlightedNotes` state.
    *   **`ComposersNotebookSection.tsx`:** Add a new sub-section to render the `triadPairs` with their explanations.

7.  **Final Cleanup (Delete Files):**
    *   Delete the following component files, as they are now fully deprecated:
        *   `components/practiceSections/KeyChordsSection.tsx`
        *   `components/practiceSections/ChordProgressionCard.tsx`
        *   `components/practiceSections/TabbedPracticeItem.tsx`
        *   `components/practiceSections/TabbedPracticeItemList.tsx`
        *   `components/scaleExplorerSections/PracticeSection.tsx`