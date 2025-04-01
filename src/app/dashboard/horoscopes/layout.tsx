import React from 'react';

export default function HoroscopesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
      </div>
      
      {children}
    </div>
  );
}
