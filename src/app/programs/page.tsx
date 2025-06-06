'use client';

import { useState } from 'react';
import SectionTitle from '@/components/shared/SectionTitle';
import ProgramCard from '@/components/programs/ProgramCard';
import { samplePrograms, type Program } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const programCategories = ['All', 'Mentorship', 'Student Project', 'Internship', 'Scholarship'] as const;
type ProgramCategory = typeof programCategories[number];

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState<ProgramCategory>('All');

  const filteredPrograms = activeCategory === 'All'
    ? samplePrograms
    : samplePrograms.filter(program => program.category === activeCategory);

  return (
    <div className="space-y-16">
      <SectionTitle
        title="Our Programs"
        subtitle="Explore a variety of programs designed to help you learn, grow, and connect."
      />

      <section className="container">
        <Tabs defaultValue="All" onValueChange={(value) => setActiveCategory(value as ProgramCategory)} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {programCategories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No programs found for the selected category.</p>
        )}
      </section>
    </div>
  );
}
