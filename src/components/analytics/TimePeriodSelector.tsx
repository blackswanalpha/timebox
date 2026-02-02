import React, { useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Calendar } from '../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

export type TimePeriod = '7d' | '30d' | 'custom';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomDateChange?: (start: Date, end: Date) => void;
}

const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  value,
  onChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: customStartDate,
    to: customEndDate,
  });

  const handlePeriodChange = (period: TimePeriod) => {
    onChange(period);
    if (period === 'custom') {
      setIsCalendarOpen(true);
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      // Start new selection
      const newRange = { from: selectedDate, to: undefined };
      setDateRange(newRange);
    } else if (dateRange.from && !dateRange.to) {
      // Complete the range
      const from = dateRange.from;
      const to = selectedDate;
      
      // Ensure from is earlier than to
      if (from > to) {
        setDateRange({ from: to, to: from });
        onCustomDateChange?.(to, from);
      } else {
        setDateRange({ from, to });
        onCustomDateChange?.(from, to);
      }
      
      setIsCalendarOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) return 'Select dates';
    if (!dateRange.to) return dateRange.from.toLocaleDateString();
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
  };

  const periods = [
    { id: '7d' as TimePeriod, label: 'Last 7 Days' },
    { id: '30d' as TimePeriod, label: 'Last 30 Days' },
    { id: 'custom' as TimePeriod, label: 'Custom Range' },
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Segmented Control */}
      <div className="flex h-11 w-full max-w-md items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 p-1.5 shadow-inner">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-semibold transition-all ${
              value === period.id
                ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="truncate">{period.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {value === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
              <span>{formatDateRange()}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  handleCalendarSelect(range.from);
                }
                if (range?.to) {
                  handleCalendarSelect(range.to);
                }
              }}
              numberOfMonths={2}
              defaultMonth={new Date()}
            />
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Click to select start date, then click again to select end date
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TimePeriodSelector;
