import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export default function StatusTimeline({ currentStatus = 'Lost' }) {
  const stages = [
    { key: 'Lost', label: '1. Lost' },
    { key: 'Found', label: '2. Found' },
    { key: 'Matched', label: '3. Matched' },
    { key: 'Claimed', label: '4. Claimed' },
    { key: 'Closed', label: '5. Closed' }
  ];

  const statusOrder = {
    'Lost': 1,
    'Found': 2,
    'Matched': 3,
    'Claimed': 4,
    'Closed': 5
  };

  const currentStep = statusOrder[currentStatus] || 1;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
        <div 
          className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-gradient-to-r from-gold-500 to-amber-400 -z-0 transition-all duration-500" 
          style={{ width: `${Math.max(0, ((currentStep - 1) / (stages.length - 1)) * 100)}%` }}
        />

        {stages.map((stage, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gold-500 text-dark-950 shadow-glow-sm'
                    : isCurrent
                    ? 'bg-dark-900 border-2 border-gold-400 text-gold-400 ring-4 ring-gold-500/20 shadow-glow-md'
                    : 'bg-dark-900 border border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={`text-xs font-semibold tracking-wide ${
                  isCurrent ? 'text-gold-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {stage.key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
