import React from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface PaymentMethodButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  selected: boolean;
}

export const PaymentMethodButton: React.FC<PaymentMethodButtonProps> = ({
  icon,
  label,
  onClick,
  selected,
}) => {
  return (
    <Button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-4 ${
        selected
          ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
          : 'bg-white dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
      }`}
      variant="outline"
    >
      <Image
        src={icon}
        alt={label}
        width={24}
        height={24}
        className="text-gray-600 dark:text-gray-400"
      />
      <span className="flex-1 text-left">{label}</span>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </Button>
  );
};
