import { Star } from 'lucide-react';
import React from 'react';
import { Testimonial } from '@/data/landing/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
  testId?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  testId 
}) => {
  return (
    <div className="bg-indigo-900/40 border border-indigo-300/30 rounded-lg p-6" data-testid={testId}>
      <div className="flex mb-4">
        {[...Array(testimonial.rating)].map((_, index) => (
          <Star key={index} className="h-5 w-5 text-yellow-300 fill-yellow-300" />
        ))}
      </div>
      <p className="text-indigo-100 italic mb-4">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <p className="text-indigo-300 font-semibold">
        - {testimonial.author}, {testimonial.location}
      </p>
    </div>
  );
};
