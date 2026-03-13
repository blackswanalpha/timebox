import { useAtom } from 'jotai';
import { timelineActivitiesAtom } from '../atoms';
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${remainingMins}m`;
  }
  return `${mins}m`;
}

function formatTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'h:mm a');
  } catch {
    return '';
  }
}

export default function DailyTimeline() {
  const [activities] = useAtom(timelineActivitiesAtom);

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <ClockIcon className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">No activities recorded for this day</p>
        <p className="text-xs mt-1">Complete Pomodoro sessions or tasks to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Daily Timeline ({activities.length} activities)
      </h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
        
        {/* Activities */}
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex items-start gap-3 pl-1"
            >
              {/* Timeline dot */}
              <div className={`relative z-10 w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                activity.type === 'pomodoro' 
                  ? activity.interrupted 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                  : 'bg-blue-500'
              }`} />
              
              {/* Activity card */}
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {activity.type === 'pomodoro' ? (
                        <ClockIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <CheckCircleIcon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {activity.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{formatTime(activity.startTime)}</span>
                      {activity.duration && (
                        <span className="text-slate-400">
                          {formatDuration(activity.duration)}
                        </span>
                      )}
                      {activity.interrupted && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          Interrupted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
