import React, { useState } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { ULPIN_REGEX } from '@/types';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  size?: 'md' | 'lg';
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  placeholder = 'Search by ULPIN (e.g. CH-SEC17-0402) or locality...',
  onSearch,
  size = 'md',
  className = '',
}) => {
  const [value, setValue] = useState(initialValue);
  const [hint, setHint] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    if (val.length > 3 && !val.includes('-') && /^[A-Za-z0-9]+$/.test(val)) {
      setHint('Tip: Real ULPINs use format like CH-SEC17-0402 or TN-CH-09124');
    } else {
      setHint(null);
    }
  };

  const handleClear = () => {
    setValue('');
    setHint(null);
    onSearch('');
  };

  const isLarge = size === 'lg';

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} text-neutral-400`} />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            isLarge ? 'py-3.5 pl-11 pr-24 text-base' : 'py-2 pl-9 pr-20 text-sm'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className={`bg-primary hover:bg-primary-dark text-white font-medium rounded px-3 transition-colors ${
              isLarge ? 'py-2 text-sm' : 'py-1 text-xs'
            }`}
          >
            Search
          </button>
        </div>
      </form>
      {hint && (
        <p className="mt-1 text-xs text-secondary flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
};
