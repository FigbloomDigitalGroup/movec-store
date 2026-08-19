import { useId, useState, type ReactNode } from 'react';
import { FiInfo } from 'react-icons/fi';

export default function Tooltip({ text, children }: { text: string; children?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-describedby={id}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
      >
        {children ?? <FiInfo size={13} />}
      </button>
      {visible && (
        <span
          role="tooltip"
          id={id}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg pointer-events-none"
        >
          {text}
        </span>
      )}
    </span>
  );
}
