import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

interface CustomCalendarProps {
  value: string;
  onChange: (date: string) => void;
  onComplete?: () => void;
}

export default function CustomCalendar({ value, onChange, onComplete }: CustomCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dayRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape closes the calendar — already documented as intended behavior
  // (see README-Calendar.md) but never actually implemented.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateSelect = (day: number) => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const selected = new Date(year, month, day);
    setSelectedDate(selected);
    
    // Format as YYYY-MM-DD
    const formattedDate = selected.toISOString().split('T')[0];
    onChange(formattedDate);
    
    // Close popup and trigger auto-progression. The day button that was just
    // clicked unmounts along with the grid; without refocusing the input,
    // focus drops to <body> and keyboard/screen-reader users lose their place.
    setTimeout(() => {
      setIsOpen(false);
      inputRef.current?.focus();
      onComplete?.();
    }, 200);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Check if valid date format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
      const date = new Date(inputValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setDisplayDate(date);
        // Trigger auto-progression after valid manual input
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }
    }
  };

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1));
  };

  // Standard date-picker grid keyboard pattern: Left/Right move a day, Up/Down
  // move a week, within the currently displayed month. Crossing into the next
  // or previous month via arrow keys isn't handled — a reasonable scope
  // boundary for a single-month grid rather than a full calendar widget.
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, day: number) => {
    const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    const delta = deltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const target = Math.max(1, Math.min(day + delta, daysInMonth));
    dayRefs.current[target]?.focus();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      displayDate.getMonth() === today.getMonth() &&
      displayDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      displayDate.getMonth() === selectedDate.getMonth() &&
      displayDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    return checkDate < today;
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[displayDate.getDay()];
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return '';
    return selectedDate.toISOString().split('T')[0];
  };

  const days = getDaysInMonth(displayDate);
  const today = new Date();
  const isPrevMonthDisabled = 
    displayDate.getFullYear() === today.getFullYear() && 
    displayDate.getMonth() === today.getMonth();

  return (
    <div className="relative w-full" ref={calendarRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayDate()}
          onChange={handleManualInput}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIsOpen(true);
              const day = selectedDate && selectedDate.getMonth() === displayDate.getMonth() ? selectedDate.getDate() : 1;
              requestAnimationFrame(() => dayRefs.current[day]?.focus());
            }
          }}
          placeholder="YYYY-MM-DD"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          aria-label="Select installation date"
        />
        <FiCalendar
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={isPrevMonthDisabled}
              className={`p-1 rounded hover:bg-gray-100 transition ${
                isPrevMonthDisabled ? 'opacity-30 cursor-not-allowed' : ''
              }`}
              aria-label="Previous month"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="font-medium text-gray-900">
              {getDayOfWeek()}, {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
            </div>
            
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 transition"
              aria-label="Next month"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <div key={idx} className="aspect-square">
                {day ? (
                  <button
                    ref={(el) => { dayRefs.current[day] = el; }}
                    onClick={() => !isPast(day) && handleDateSelect(day)}
                    onKeyDown={(e) => handleGridKeyDown(e, day)}
                    disabled={isPast(day)}
                    className={`
                      w-full h-full rounded-full flex flex-col items-center justify-center text-sm
                      transition-all duration-200 relative
                      ${isPast(day) 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'hover:bg-gray-100 cursor-pointer'
                      }
                      ${isSelected(day) 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                        : ''
                      }
                      ${isToday(day) && !isSelected(day)
                        ? 'border-2 border-emerald-500'
                        : ''
                      }
                    `}
                    aria-label={`Select ${monthNames[displayDate.getMonth()]} ${day}`}
                  >
                    <span className="font-medium">{day}</span>
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
