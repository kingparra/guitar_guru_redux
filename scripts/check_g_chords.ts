import { MusicTheoryService } from '../src/services/MusicTheoryService';
import { generateDiatonicChords } from '../utils/guitarUtils';

async function main(){
  const res = MusicTheoryService.generateScaleNotes('G','Major');
  console.log('G Major scale:', res);
  if(res.type === 'success'){
    const chords = generateDiatonicChords(res.value as any);
    console.log('Diatonic chords (triads and voicing counts):');
    for(const [k,v] of chords){
      console.log(k, v.triadNotes, 'voicings:', v.voicings.length);
    }
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
