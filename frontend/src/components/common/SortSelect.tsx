import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SortOption {
  label: string;
  value: string;
}

interface SortSelectProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const SortSelect: React.FC<SortSelectProps> = ({
  options,
  value,
  onChange,
  label = 'Ordenar por'
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
  );
};

export default SortSelect; 