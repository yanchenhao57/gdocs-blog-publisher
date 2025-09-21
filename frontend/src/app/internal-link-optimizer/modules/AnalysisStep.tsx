import React from 'react';
import { Loader2 } from 'lucide-react';

interface AnalysisStepProps {
  analysisProgress: number;
}

export default function AnalysisStep({ analysisProgress }: AnalysisStepProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-16">
        <div className="mb-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Analyzing Blog Content
        </h3>
        
        <p className="text-sm text-gray-500 mb-12" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Analyzing blog content to suggest best insertion points
        </p>
        
        <div className="w-full max-w-xs mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div 
              className="bg-black h-1 rounded-full transition-all duration-300" 
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {analysisProgress}% complete
          </p>
        </div>
      </div>
    </div>
  );
}