import React from 'react';
import { BeltColor, Program } from '../context/DataContext';

interface BeltDisplayProps {
  belt: BeltColor;
  degrees: number;
  program?: Program;
  size?: 'sm' | 'md' | 'lg';
}

export const BELT_COLORS: Record<BeltColor, string> = {
  White: '#FFFFFF',
  Grey: '#9CA3AF',
  Yellow: '#EAB308',
  Orange: '#F97316',
  Green: '#22C55E',
  Blue: '#2563EB',
  Purple: '#9333EA',
  Brown: '#92400E',
  Black: '#111827',
};

export const BELT_NAMES_PT: Record<BeltColor, string> = {
  White: 'Faixa Branca',
  Grey: 'Faixa Cinza',
  Yellow: 'Faixa Amarela',
  Orange: 'Faixa Laranja',
  Green: 'Faixa Verde',
  Blue: 'Faixa Azul',
  Purple: 'Faixa Roxa',
  Brown: 'Faixa Marrom',
  Black: 'Faixa Preta',
};

export function getCardStyle(program: Program, belt: BeltColor, degrees: number) {
  if (program === 'GBK') {
    return {
      outerBg: 'bg-green-500',
      outerBorder: 'border-green-700',
      innerBg: 'bg-green-50',
      textPrimary: 'text-white',
      textSecondary: 'text-green-100',
      gridHeaderBg: 'bg-green-600',
      label: 'CARTÃO DE FREQUÊNCIA — GBK',
      programLabel: 'GBK',
    };
  }
  if (belt === 'White' && degrees <= 2) {
    return {
      outerBg: 'bg-sky-400',
      outerBorder: 'border-sky-600',
      innerBg: 'bg-sky-50',
      textPrimary: 'text-white',
      textSecondary: 'text-sky-100',
      gridHeaderBg: 'bg-sky-500',
      label: 'CARTÃO DE FREQUÊNCIA — GB1',
      programLabel: 'GB1',
    };
  }
  if (belt === 'White' && degrees > 2) {
    return {
      outerBg: 'bg-blue-700',
      outerBorder: 'border-blue-900',
      innerBg: 'bg-blue-50',
      textPrimary: 'text-white',
      textSecondary: 'text-blue-100',
      gridHeaderBg: 'bg-blue-800',
      label: 'CARTÃO DE FREQUÊNCIA — GB1',
      programLabel: 'GB1',
    };
  }
  // Blue → Black
  return {
    outerBg: 'bg-gray-900',
    outerBorder: 'border-gray-700',
    innerBg: 'bg-gray-50',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    gridHeaderBg: 'bg-gray-800',
    label: 'CARTÃO DE FREQUÊNCIA — GB3',
    programLabel: 'GB3',
  };
}

export const BeltDisplay: React.FC<BeltDisplayProps> = ({ belt, degrees, program = 'GB1', size = 'md' }) => {
  const beltColor = BELT_COLORS[belt];
  const isLight = belt === 'White' || belt === 'Yellow' || belt === 'Grey';

  const heights = { sm: 'h-4', md: 'h-6', lg: 'h-8' };
  const stripeWidths = { sm: 'w-2', md: 'w-3', lg: 'w-4' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 ${heights[size]} rounded-sm flex items-center overflow-hidden border`}
        style={{
          backgroundColor: beltColor,
          borderColor: isLight ? '#9CA3AF' : beltColor,
          minWidth: size === 'sm' ? 60 : size === 'md' ? 80 : 100,
        }}
      >
        {/* Stripe area on the right */}
        <div className="flex-1" />
        <div className="flex gap-px pr-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`${stripeWidths[size]} h-full rounded-sm`}
              style={{
                backgroundColor: i < degrees ? '#D10A11' : 'transparent',
                border: i < degrees ? 'none' : `1px solid ${isLight ? '#9CA3AF' : 'rgba(255,255,255,0.3)'}`,
              }}
            />
          ))}
        </div>
      </div>
      <span className={`${textSizes[size]} font-medium text-gray-700`}>
        {BELT_NAMES_PT[belt]} {degrees > 0 ? `${degrees}° grau` : ''}
      </span>
    </div>
  );
};
