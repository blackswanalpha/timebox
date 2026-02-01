import { format } from "date-fns";
import { CalendarIcon } from "@heroicons/react/24/outline";

import { cn } from "../../lib/utils";
import { Calendar } from "./Calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./Popover";

export interface DatePickerProps {
    date?: Date;
    setDate: (date?: Date) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-lg text-left",
                        !date && "text-slate-500",
                        className
                    )}
                >
                    <CalendarIcon className="h-5 w-5 text-slate-400" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="bg-white dark:bg-slate-900"
                />
            </PopoverContent>
        </Popover>
    );
}
