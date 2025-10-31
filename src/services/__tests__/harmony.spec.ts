import { describe, it, expect } from 'vitest';
import { MusicTheoryService } from '../../services/MusicTheoryService';
import { generateDiatonicChords } from '../../../utils/guitarUtils';

describe('Harmony', () => {
  it('G major I triad should be G B D', () => {
    const res = MusicTheoryService.generateScaleNotes('G', 'Major');
    expect(res.type).toBe('success');
    const chords = generateDiatonicChords((res as any).value);
    const I = chords.get('I');
    expect(I).toBeDefined();
    expect(I!.triadNotes).toEqual(['G','B','D']);
  });
});
