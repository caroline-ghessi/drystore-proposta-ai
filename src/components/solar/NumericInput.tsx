import React from 'react';
import { Input } from '@/components/ui/input';

interface NumericInputProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  decimals?: number;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  suffix,
  decimals = 2,
  min,
  max,
  className,
  id
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Permitir valores vazios
    if (rawValue === '') {
      onChange(0);
      return;
    }

    // Converter para número
    const numValue = parseFloat(rawValue);
    
    // Validar limites
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) return;
      if (max !== undefined && numValue > max) return;
      
      onChange(numValue);
    }
  };

  const formatValue = (val: number | string) => {
    if (val === '' || val === 0) return '';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? '' : num.toFixed(decimals).replace(/\.?0+$/, '');
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        step={1 / Math.pow(10, decimals)}
        min={min}
        max={max}
        value={formatValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${suffix ? 'pr-16' : ''} ${className || ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-3 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
};