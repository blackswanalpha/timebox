import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface OptimizationInsightProps {
  lowProductivityHour: number | null;
  hasEnoughData: boolean;
}

const OptimizationInsight: React.FC<OptimizationInsightProps> = ({
  lowProductivityHour,
  hasEnoughData,
}) => {
  if (!hasEnoughData) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 rounded-2xl flex items-center gap-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center">
            <LightBulbIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold">Getting Started</h4>
            <p className="text-indigo-100 max-w-xl mt-1">
              Complete a few focus sessions to unlock personalized insights and see your productivity patterns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative">
      <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-3">
          <LightBulbIcon className="h-6 w-6 text-white" />
          <h4 className="text-2xl font-bold">Optimization Insight</h4>
        </div>
        <p className="text-indigo-100 max-w-xl">
          {lowProductivityHour !== null ? (
            <>
              Based on your heatmap, your focus drops significantly after {formatHour(lowProductivityHour)}. 
              We recommend scheduling low-cognitive tasks like emails and meetings for this period to maximize your morning flow.
            </>
          ) : (
            <>
              Your focus patterns look great! Consider maintaining your current schedule and 
              experimenting with different work blocks to find even more optimal times.
            </>
          )}
        </p>
      </div>
      <button className="relative z-10 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors whitespace-nowrap shadow-xl">
        Adjust Schedule
      </button>
    </div>
  );
};

export default OptimizationInsight;
