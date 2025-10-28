import React from 'react';
import type { PracticeMaterial } from '../../types';
import Card from '../common/Card';
import TabbedPracticeItem from './TabbedPracticeItem';

interface TabbedPracticeItemListProps {
    items: PracticeMaterial[];
}

const TabbedPracticeItemList: React.FC<TabbedPracticeItemListProps> = ({ items }) => {
    return (
        <>
            {items.map((item, index) => (
                <Card key={`${item.name}-${index}`}>
                    <TabbedPracticeItem item={item} />
                </Card>
            ))}
        </>
    );
};

export default TabbedPracticeItemList;
