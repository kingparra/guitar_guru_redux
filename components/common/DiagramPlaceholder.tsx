import React from 'react';
import { COLORS } from '../../constants';
import DegreePill from './DegreePill';
import { InfoIcon } from './Icons';

interface DiagramPlaceholderProps {
    chordName: string;
    degree: string;
}

const DiagramPlaceholder: React.FC<DiagramPlaceholderProps> = ({
    chordName,
    degree,
}) => (
    <div className="bg-[#171528] p-4 rounded-[14px] overflow-hidden my-4 h-full min-h-[300px] flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-center mb-4" style={{ color: COLORS.textHeader }}>{chordName}</h3>
        <div className="mb-4">
            <DegreePill degree={degree} />
        </div>
        <div className="w-12 h-12 text-purple-400/40 mb-2">
            <InfoIcon />
        </div>
        <p className="font-semibold" style={{ color: COLORS.textPrimary }}>
            Diagram Not Available
        </p>
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            This is likely a non-standard or complex chord voicing.
        </p>
    </div>
);

export default DiagramPlaceholder;
