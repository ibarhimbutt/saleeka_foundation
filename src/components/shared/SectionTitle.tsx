import type React from 'react';
import { cn } from '@/lib/utils';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, className, titleClassName, subtitleClassName }) => {
  return (
    <div className={cn("text-center mb-12", className)}>
      <h2 className={cn("font-headline text-3xl md:text-4xl font-bold mb-2 text-primary", titleClassName)}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("text-lg text-muted-foreground max-w-2xl mx-auto", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
