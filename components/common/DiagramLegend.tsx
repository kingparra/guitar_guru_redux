
import React from 'react';
import { COLORS } from '../../constants';

const LegendItem: React.FC<{ shape: 'circle' | 'circle-outline' | 'number'; color: string; label: string; }> = ({ shape, color, label }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {shape === 'circle' && <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={color} /></svg>}
            {shape === 'circle-outline' && <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill={COLORS.tone} stroke={color} strokeWidth="2.5" /></svg>}
            {shape === 'number' && <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: color, color: COLORS.bgPrimary }}>123</div>}
        </div>
        <span style={{ color: COLORS.textSecondary }}>{label}</span>
    </div>
);

const DiagramLegend: React.FC = () => (
    <div className="p-4 rounded-lg bg-black/20 border border-purple-400/20 mb-8">
        <h3 className="font-bold text-lg mb-3 text-gray-200 text-center">Diagram Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 justify-center">
            <LegendItem shape="circle" color={COLORS.root} label="Root Note" />
            <LegendItem shape="circle" color={COLORS.tone} label="Scale Tone" />
            <LegendItem shape="circle-outline" color={COLORS.characteristicOutline} label="Characteristic Note" />
            <LegendItem shape="circle-outline" color={COLORS.tensionNote} label="Tension Note" />
        </div>
    </div>
);

export default DiagramLegend;
