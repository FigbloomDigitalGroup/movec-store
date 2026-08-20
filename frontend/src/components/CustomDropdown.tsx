import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

interface DropdownOption {
  id: string;
  name: string;
  price?: number;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onComplete?: () => void;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  onComplete
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape closes the dropdown — this was already documented as the intended
  // behavior (see README-Calendar.md) but never actually implemented.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const focusOptionAt = (index: number) => {
    if (options.length === 0) return;
    const clamped = Math.max(0, Math.min(index, options.length - 1));
    optionRefs.current[clamped]?.focus();
  };

  // Standard ARIA listbox keyboard pattern: arrow keys move a real, focused
  // option (roving focus) rather than just relying on Tab, which would jump
  // out of the list after one item.
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      const selectedIndex = options.findIndex((o) => o.id === value);
      requestAnimationFrame(() => focusOptionAt(selectedIndex >= 0 ? selectedIndex : 0));
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = optionRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusOptionAt(currentIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusOptionAt(currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusOptionAt(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusOptionAt(options.length - 1);
    }
  };

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    // The option button that was just clicked unmounts along with the list;
    // without this, focus drops to <body> and keyboard/screen-reader users lose their place.
    triggerRef.current?.focus();

    // Trigger auto-progression after selection
    setTimeout(() => {
      onComplete?.();
    }, 200);
  };

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        className={`
          w-full border border-gray-300 rounded-lg px-4 py-2.5 
          flex items-center justify-between
          transition-all duration-200
          ${isOpen 
            ? 'ring-2 ring-emerald-500 border-transparent' 
            : 'hover:border-gray-400'
          }
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption 
            ? `${selectedOption.name}${selectedOption.price ? ` - KES ${Number(selectedOption.price).toLocaleString()}` : ''}`
            : placeholder
          }
        </span>
        <FiChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 left-0 w-full bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto"
          role="listbox"
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.id === value;

            return (
              <button
                key={option.id}
                ref={(el) => { optionRefs.current[index] = el; }}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full px-4 py-3 text-left flex items-center justify-between
                  transition-colors duration-150
                  ${isSelected 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'hover:bg-gray-50 text-gray-900'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.name}</span>
                  {option.price && (
                    <span className={`text-sm ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                      KES {Number(option.price).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {isSelected && (
                  <FiCheck className="w-5 h-5 text-emerald-600" />
                )}
              </button>
            );
          })}
          
          {options.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
