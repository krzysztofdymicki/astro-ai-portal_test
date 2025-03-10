// src/components/debug/DebugContextPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bug, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

/**
 * Komponent do debugowania stanu kontekstu
 * Wyświetla aktualny stan wszystkich danych z UserContext w prawym dolnym rogu ekranu
 */
export default function DebugContextPanel() {
  const userContext = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Automatyczne odświeżanie co 5 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Funkcja formatująca dane do wyświetlenia
  const formatData = (data: any, level = 0): React.ReactNode => {
    if (data === null || data === undefined) {
      return <span className="text-gray-400">null</span>;
    }
    
    if (typeof data === 'boolean') {
      return <span className="text-yellow-300">{data ? 'true' : 'false'}</span>;
    }
    
    if (typeof data === 'number') {
      return <span className="text-blue-300">{data}</span>;
    }
    
    if (typeof data === 'string') {
      if (data.length === 0) {
        return <span className="text-gray-400">""</span>;
      }
      return <span className="text-green-300">"{data}"</span>;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <span className="text-gray-400">[]</span>;
      }
      
      return (
        <div className="pl-4 border-l border-indigo-700">
          <div className="text-indigo-300">Array({data.length}) [</div>
          {data.map((item, index) => (
            <div key={index} className="pl-4">
              {formatData(item, level + 1)}
              {index < data.length - 1 && <span className="text-gray-400">,</span>}
            </div>
          ))}
          <div className="text-indigo-300">]</div>
        </div>
      );
    }
    
    if (typeof data === 'object') {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        return <span className="text-gray-400">{'{}'}</span>;
      }
      
      return (
        <div className={level > 0 ? "pl-4 border-l border-indigo-700" : ""}>
          <div className="text-indigo-300">{'{'}</div>
          {entries.map(([key, value], index) => (
            <div key={key} className="pl-4 flex">
              <span className="text-purple-300 min-w-24">{key}:</span>
              <div className="flex-1">
                {formatData(value, level + 1)}
                {index < entries.length - 1 && <span className="text-gray-400">,</span>}
              </div>
            </div>
          ))}
          <div className="text-indigo-300">{'}'}</div>
        </div>
      );
    }
    
    return <span>{String(data)}</span>;
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50 bg-indigo-900/80 border border-indigo-500/30 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug Context
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Card className="bg-indigo-900/90 border-indigo-500/30 p-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300">Context Debug</span>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0" 
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Wyodrębnij najważniejsze dane do pokazania w górnej części
  const { 
    profile,
    userName,
    userEmail,
    credits,
    questionsStats,
    loading,
    ...restContext
  } = userContext;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <Card className="bg-indigo-900/90 border-indigo-500/30 p-4 shadow-lg h-[calc(100vh-8rem)] max-h-[600px] w-96 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-indigo-100 flex items-center">
            <Bug className="h-4 w-4 mr-2" /> 
            Context Debug
            <span className="text-xs text-indigo-400 ml-2">
              Last: {lastUpdated.toLocaleTimeString()}
            </span>
          </h3>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={() => setLastUpdated(new Date())}
              title="Refresh"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Summary view */}
        <div className="bg-indigo-950/60 p-2 rounded text-xs mb-2 border border-indigo-800/50">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-indigo-300">User:</div>
            <div className="text-white truncate">{userName} ({userEmail})</div>
            
            <div className="text-indigo-300">Profile complete:</div>
            <div className="text-white">{profile?.profile_completion_percentage || 0}%</div>
            
            <div className="text-indigo-300">Credits:</div>
            <div className="text-white">{credits?.balance || 0}</div>
            
            <div className="text-indigo-300">Questions:</div>
            <div className="text-white">
              {questionsStats?.answeredQuestions || 0}/{questionsStats?.totalQuestions || 0}
            </div>
            
            <div className="text-indigo-300">Loading:</div>
            <div className="text-white">
              {Object.entries(loading).filter(([_, val]) => val).map(([key]) => key).join(', ') || 'none'}
            </div>
          </div>
        </div>
        
        {/* Full context data */}
        <div className="overflow-auto text-xs font-mono flex-grow">
          {formatData(userContext)}
        </div>
      </Card>
    </div>
  );
}