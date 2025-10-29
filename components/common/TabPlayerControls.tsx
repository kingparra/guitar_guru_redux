
import React from 'react';
import { JamIcon } from './Icons'; // Using JamIcon for Play

interface TabPlayerControlsProps {
    onPlay: () => void;
    onStop: () => void;
    isPlaying: boolean;
    speed: number;
    onSpeedChange: (speed: number) => void;
}

const TabPlayerControls: React.FC<TabPlayerControlsProps> = ({
    onPlay, onStop, isPlaying, speed, onSpeedChange
}) => {
    return (
        <div className="bg-black/20 p-3 rounded-lg border border-purple-400/20 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
                type="button"
                onClick={isPlaying ? onStop : onPlay}
                className={`w-full sm:w-auto px-6 py-2 rounded-md font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    isPlaying ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-fuchsia-600'
                }`}
            >
                <JamIcon />
                <span>{isPlaying ? 'Stop' : 'Play Etude'}</span>
            </button>
            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-300 text-sm">Speed:</span>
                {[0.5, 1, 2].map(rate => (
                    <button
                        key={rate}
                        onClick={() => onSpeedChange(rate)}
                        className={`w-10 h-8 rounded-md font-bold transition-colors text-xs ${
                            speed === rate ? 'bg-cyan-500 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/40'
                        }`}
                    >
                        {rate}x
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabPlayerControls;
