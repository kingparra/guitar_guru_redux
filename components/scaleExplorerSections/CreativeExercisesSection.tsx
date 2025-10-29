

import React from 'react';
import type { CreativeExercise, PathDiagramNote } from '../../types';
import Card from '../common/Card';
import { parseAndStyleMusicalText } from '../../utils/uiUtils';
import { LightbulbIcon } from '../common/Icons';
import TabPlayerControls from '../common/TabPlayerControls';
import StructuredTabDisplay from '../common/StructuredTabDisplay';

interface CreativeExercisesSectionProps {
    exercise: CreativeExercise;
    onPlayExercise: (path: PathDiagramNote[]) => void;
    onStopExercise: () => void;
    activePath: PathDiagramNote[] | null;
    playbackSpeed: number;
    onPlaybackSpeedChange: (speed: number) => void;
    playbackIndex: number | null;
}

const CreativeExercisesSection: React.FC<CreativeExercisesSectionProps> = ({ 
    exercise, onPlayExercise, onStopExercise, activePath, playbackSpeed, onPlaybackSpeedChange, playbackIndex
}) => {
    if (!exercise) {
        return null;
    }
    
    const isPlayingThisExercise = activePath === exercise.path;

    return (
        <Card>
            <div className="p-4">
                <h3 className="text-2xl font-bold text-gray-100 mb-2">{exercise.title}</h3>
                <div className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-purple-400/20 mb-4">
                    <div className="flex-shrink-0 mt-1">
                        <LightbulbIcon />
                    </div>
                    <p className="text-gray-300 text-sm italic">
                        {parseAndStyleMusicalText(exercise.explanation)}
                    </p>
                </div>
                <TabPlayerControls 
                    onPlay={() => onPlayExercise(exercise.path)}
                    onStop={onStopExercise}
                    isPlaying={isPlayingThisExercise}
                    speed={playbackSpeed}
                    onSpeedChange={onPlaybackSpeedChange}
                />
                <StructuredTabDisplay 
                    path={exercise.path}
                    playbackIndex={isPlayingThisExercise ? playbackIndex : null}
                />
            </div>
        </Card>
    );
};

export default CreativeExercisesSection;