import { NOTE_MAP } from '../constants';

let audioContext: AudioContext | null = null;
let sustainedOscillator: OscillatorNode | null = null;
let sustainedGain: GainNode | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

const A4_FREQUENCY = 440;
const A4_NOTE_INDEX = NOTE_MAP['A'];

const noteToFrequency = (noteName: string, octave: number): number => {
    const noteIndex = NOTE_MAP[noteName];
    const semitonesFromA4 = (noteIndex - A4_NOTE_INDEX) + (octave - 4) * 12;
    return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12);
};

export const playNote = (noteName: string, octave: number, duration: number = 0.5) => {
    try {
        const context = getAudioContext();
        if (context.state === 'suspended') {
            context.resume();
        }
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const frequency = noteToFrequency(noteName, octave);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    } catch (e) {
        console.error("Web Audio API error.", e);
    }
};

export const startSustainedNote = (noteName: string, octave: number) => {
    try {
        const context = getAudioContext();
        if (context.state === 'suspended') {
            context.resume();
        }
        const frequency = noteToFrequency(noteName, octave);
        const now = context.currentTime;

        if (!sustainedOscillator || !sustainedGain) {
            sustainedOscillator = context.createOscillator();
            sustainedGain = context.createGain();
            sustainedOscillator.type = 'sine';
            sustainedOscillator.connect(sustainedGain);
            sustainedGain.connect(context.destination);
            sustainedOscillator.start();
            
            sustainedGain.gain.setValueAtTime(0, now);
        }
        
        sustainedOscillator.frequency.setTargetAtTime(frequency, now, 0.015); // Smooth transition
        sustainedGain.gain.setTargetAtTime(0.5, now, 0.05); // Fade in

    } catch (e) {
        console.error("Web Audio API error.", e);
    }
};

export const stopSustainedNote = () => {
    if (sustainedGain && audioContext) {
        sustainedGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.1); // Fade out
    }
};
