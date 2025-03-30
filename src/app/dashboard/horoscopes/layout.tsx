import Link from 'next/link';

export default function HoroscopesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white mystical-glow">Twoje Horoskopy</h1>
      </div>
      
      {children}
    </div>
  );
}
