import { useAtom } from 'jotai';
import { MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { clockoutModalOpenAtom, selectedReflectionDateAtom, calendarViewMonthAtom, fetchDayActivitiesAtom, fetchReflectionAtom, fetchMonthReflectionsAtom } from '../atoms';

export default function ClockoutButton() {
  const [, setClockoutModalOpen] = useAtom(clockoutModalOpenAtom);
  const [, setSelectedDate] = useAtom(selectedReflectionDateAtom);
  const [, setCalendarViewMonth] = useAtom(calendarViewMonthAtom);
  const [, fetchDayActivities] = useAtom(fetchDayActivitiesAtom);
  const [, fetchReflection] = useAtom(fetchReflectionAtom);
  const [, fetchMonthReflections] = useAtom(fetchMonthReflectionsAtom);

  const handleClick = async () => {
    const today = new Date();
    // Set to today
    setSelectedDate(today);
    setCalendarViewMonth(today);

    // Open modal
    setClockoutModalOpen(true);

    // Load data
    await fetchDayActivities();
    await fetchReflection();
    await fetchMonthReflections();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-amber-500/20"
      title="Clock Out - Daily Reflection"
      type="button"
    >
      <MoonIcon className="h-3.5 w-3.5" />
      <span>Clock Out</span>
    </motion.button>
  );
}
