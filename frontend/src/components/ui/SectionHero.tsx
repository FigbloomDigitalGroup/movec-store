import React from 'react';

export default function SectionHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="section-hero">
      <div className="w-full px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-6 md:gap-12">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-none">{title}</h1>
          </div>
          {subtitle && (
            <div className="flex-1 text-right text-gray-600">
              <p className="text-lg max-w-md ml-auto">{subtitle}</p>
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
