import React from 'react';
import { Check, Settings, Brain, Lightbulb, FileOutput } from 'lucide-react';
import { Step } from './types';

interface StepIndicatorProps {
  currentStep: Step;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { step: 'input', icon: Settings, title: 'Configuration' },
    { step: 'analysis', icon: Brain, title: 'Analysis' },
    { step: 'suggestions', icon: Lightbulb, title: 'Suggestions' },
    { step: 'output', icon: FileOutput, title: 'Output' }
  ];

  const getStepIndex = (step: Step) => steps.findIndex(s => s.step === step);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-10">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
        <div className="flex flex-col space-y-3">
          {steps.map((item, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const IconComponent = item.icon;
            
            return (
              <React.Fragment key={item.step}>
                <div className="group relative">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-black border-black text-white'
                      : isCurrent
                      ? 'bg-white border-black text-black'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="ml-5">
                    <div className={`w-px h-3 transition-colors duration-200 ${
                      index < currentIndex ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}