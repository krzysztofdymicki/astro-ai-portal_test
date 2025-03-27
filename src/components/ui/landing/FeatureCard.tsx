import { LucideIcon } from 'lucide-react';
import React from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  testId?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  testId
}) => {
  return (
    <div className="bg-indigo-900/40 border border-indigo-300/30 rounded-lg p-6 text-center" data-testid={testId}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-indigo-800/60 flex items-center justify-center">
          <Icon className="h-8 w-8 text-indigo-300" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-indigo-200">{description}</p>
    </div>
  );
};
