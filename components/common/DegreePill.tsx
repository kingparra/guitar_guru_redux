import React from 'react';
import { DEGREE_COLORS } from '../../constants';

interface DegreePillProps { degree: string }

const parseDegree = (degree: string): { numeral: string; quality: string } => {
    let quality = 'default';
    if (degree.includes('°') || degree.includes('dim')) quality = 'diminished';
    else if (degree.includes('+') || degree.includes('aug')) quality = 'augmented';
    else if (degree.toLowerCase() === degree) quality = 'minor';
    else if (degree.toUpperCase() === degree) quality = 'major';
    if (degree.match(/V|VII/)) quality = 'dominant';
    return { numeral: degree, quality };
};

const DegreePill: React.FC<DegreePillProps> = ({ degree }) => {
    if (!degree) return null;
    const { numeral, quality } = parseDegree(degree);
    const colorClass = DEGREE_COLORS[quality] || DEGREE_COLORS.default;
    return <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${colorClass}`}>{numeral}</span>;
};

export default DegreePill;
