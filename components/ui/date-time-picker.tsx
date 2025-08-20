"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  date: Date | undefined;
  onDateTimeChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

interface TimePickerProps {
  time: string;
  onTimeChange: (time: string) => void;
  className?: string;
}

export function DateTimePicker({
  date,
  onDateTimeChange,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "09:00"
  );

  // Update internal state when external date changes
  React.useEffect(() => {
    setSelectedDate(date);
    if (date) {
      setTimeValue(format(date, "HH:mm"));
    }
  }, [date]);

  // Only update parent when user makes changes
  const updateDateTime = React.useCallback((newDate: Date | undefined, newTime: string) => {
    if (newDate && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDateTime = new Date(newDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      onDateTimeChange(newDateTime);
    } else {
      onDateTimeChange(undefined);
    }
  }, [onDateTimeChange]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    updateDateTime(newDate, timeValue);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    updateDateTime(selectedDate, newTime);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP 'at' HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-l-md"
          />
          <div className="border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-r-md">
            <div className="p-4">
              <TimePicker time={timeValue} onTimeChange={handleTimeChange} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}

export function TimePicker({ time, onTimeChange, className }: TimePickerProps) {
  const [hours, setHours] = React.useState(() => {
    const [h] = time.split(":");
    return parseInt(h, 10);
  });
  
  const [minutes, setMinutes] = React.useState(() => {
    const [, m] = time.split(":");
    return parseInt(m, 10);
  });

  // Update internal state when time prop changes
  React.useEffect(() => {
    const [h, m] = time.split(":").map(Number);
    setHours(h);
    setMinutes(m);
  }, [time]);

  // Notify parent of changes
  const updateTime = React.useCallback((newHours: number, newMinutes: number) => {
    const formattedTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
    onTimeChange(formattedTime);
  }, [onTimeChange]);

  const handleHourChange = (increment: boolean) => {
    const newHours = increment 
      ? (hours === 23 ? 0 : hours + 1)
      : (hours === 0 ? 23 : hours - 1);
    
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const handleMinuteChange = (increment: boolean) => {
    const newMinutes = increment 
      ? (minutes === 59 ? 0 : minutes + 1)
      : (minutes === 0 ? 59 : minutes - 1);
    
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-3 p-2", className)}>
      <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <Clock className="mr-2 h-4 w-4" />
        Select Time
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={() => handleHourChange(true)}
          >
            +
          </Button>
          <div className="text-center text-lg font-mono w-10 py-2 bg-gray-100 dark:bg-gray-700 rounded border">
            {hours.toString().padStart(2, "0")}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={() => handleHourChange(false)}
          >
            -
          </Button>
          <div className="text-xs text-gray-500 dark:text-gray-400">Hours</div>
        </div>
        <div className="text-xl font-bold text-gray-400">:</div>
        <div className="flex flex-col items-center space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={() => handleMinuteChange(true)}
          >
            +
          </Button>
          <div className="text-center text-lg font-mono w-10 py-2 bg-gray-100 dark:bg-gray-700 rounded border">
            {minutes.toString().padStart(2, "0")}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={() => handleMinuteChange(false)}
          >
            -
          </Button>
          <div className="text-xs text-gray-500 dark:text-gray-400">Minutes</div>
        </div>
      </div>
    </div>
  );
}
