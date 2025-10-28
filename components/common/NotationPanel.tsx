
import React, { useEffect, useRef } from 'react';
import type { NotationPanelProps } from '../../types';
import { Factory, Accidental, StaveNote, Voice, Formatter } from 'vexflow';
import { InfoIcon } from './Icons';

const NotationPanel: React.FC<NotationPanelProps> = ({ clickedNote, isSustainOn, onSustainToggle }) => {
    const rendererRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.innerHTML = '';
            
            if (clickedNote) {
                try {
                    const { noteName, octave } = clickedNote;
                    const vf = new Factory({ renderer: { elementId: rendererRef.current.id, width: 220, height: 150 } });

                    // Dynamically calculate stave Y position to center the note
                    const noteIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(noteName.charAt(0));
                    const position = (octave - 4) * -7 + (4 - noteIndex); // Heuristic for position on staff
                    const staveY = 40 - position * 5; // Adjust stave Y to center note

                    const stave = vf.Stave({ x: 10, y: staveY, width: 200 });
                    stave.addClef('treble').addTimeSignature('4/4');
                    stave.setContext(vf.getContext()).draw();

                    const noteLetter = noteName.charAt(0).toLowerCase();
                    const hasAccidental = noteName.includes('#');

                    const staveNote = new StaveNote({ keys: [`${noteLetter}/${octave}`], duration: 'w' });
                    if (hasAccidental) staveNote.addModifier(new Accidental('#'), 0);

                    const voice = new Voice({ num_beats: 4, beat_value: 4 });
                    voice.addTickables([staveNote]);
                    new Formatter().joinVoices([voice]).format([voice], 180);
                    voice.draw(vf.getContext(), stave);
                } catch (e) {
                    console.error("VexFlow rendering error:", e);
                    if(rendererRef.current) rendererRef.current.textContent = "Could not render notation.";
                }
            }
        }
    }, [clickedNote]);

    return (
        <div className="p-4 rounded-lg bg-black/20 border border-purple-400/20 h-full flex flex-col">
            <h4 className="text-xl font-bold text-gray-200 mb-2 text-center">Notation Viewer</h4>
             <div className="min-h-[200px] flex-grow flex items-center justify-center bg-white/90 rounded-md overflow-hidden">
                {clickedNote ? (
                     <div id="notation-renderer" ref={rendererRef} className="p-2"></div>
                ) : (
                    <div className="text-center text-gray-600 p-4">
                        <div className="w-8 h-8 mx-auto mb-2 opacity-50"><InfoIcon/></div>
                        <p className="font-semibold">Click any note to see it here</p>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-center mt-4">
                <label htmlFor="sustain-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="sustain-toggle" className="sr-only" checked={isSustainOn} onChange={onSustainToggle} />
                        <div className={`block w-14 h-8 rounded-full transition ${isSustainOn ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${isSustainOn ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-300 font-semibold">Sustain</div>
                </label>
            </div>
        </div>
    );
};

export default NotationPanel;
