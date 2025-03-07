// app/dashboard/layout.tsx
'use client';

import CosmicBackground from '@/components/background/CosmicBackground';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CosmicBackground />
      {children}
    </>
  );
}