
import React from 'react';
import Card from '../common/Card';
import type { Song, Tutorial, CreativeVideo, JamTrack } from '../../types';

type ResourceItem = (Song | JamTrack) & { explanation: string } | Tutorial | CreativeVideo;

interface ResourceListProps {
    items: ResourceItem[];
    icon: React.ReactNode;
    title: string;
}

const adaptItem = (item: ResourceItem) => ({
    title: item.title,
    creator: (item as any).creator || (item as any).artist,
    link: (item as any).youtubeLink || (item as any).spotifyLink,
    explanation: (item as any).explanation,
});

const ResourceList: React.FC<ResourceListProps> = ({ items, icon, title }) => {
    if (!items || items.length === 0) return null;

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-gray-200">{icon}<span>{title}</span></h3>
            <ul className="space-y-3">
                {items.map(adaptItem).map((item, index) => (
                    <li key={index}>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/5 transition-colors group">
                            <p className="font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors truncate">{item.title}</p>
                            <p className="text-sm text-gray-400 truncate">by {item.creator}</p>
                            {item.explanation && (
                                <p className="text-xs text-gray-500 mt-1 italic">{item.explanation}</p>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default ResourceList;
