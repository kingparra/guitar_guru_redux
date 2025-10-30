import { getNoteFromFret, getOctaveForNote } from '../src/utils/musicUtils';
import { MusicTheoryService } from '../src/services/MusicTheoryService';
import { FretboardService } from '../src/services/FretboardService';

async function main() {
    console.log('getNoteFromFret(0,0):', getNoteFromFret(0,0));
    console.log('getNoteFromFret(6,0):', getNoteFromFret(6,0));
    console.log('getNoteFromFret(0,5):', getNoteFromFret(0,5));

    console.log('getOctaveForNote variations:');
    console.log('string 0 fret 0 ->', getOctaveForNote(0,0));
    console.log('string 0 fret 12 ->', getOctaveForNote(0,12));
    console.log('string 2 fret 0 ->', getOctaveForNote(2,0));
    console.log('string 6 fret 0 ->', getOctaveForNote(6,0));

    const res = MusicTheoryService.generateScaleNotes('E', 'Natural Minor');
    console.log('MusicTheoryService E Natural Minor:', res);
    if (res.type === 'success') {
        const notesOnFretboard = FretboardService.generateNotesOnFretboard(res.value as any);
        console.log('notesOnFretboard count:', notesOnFretboard.length);
        const positions = FretboardService.generateFingeringPositions(notesOnFretboard);
        console.log('positions count:', positions.length);
        console.log('first position sample:', positions[0]?.slice(0,6));
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
