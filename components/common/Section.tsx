import React from 'react';
import SectionHeader from './SectionHeader';

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    id?: string;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, id }) => {
    return (
        <section id={id} className="mb-8">
            <SectionHeader title={title} icon={icon} />
            {children}
        </section>
    );
};

export default Section;
