import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function PixelCard({
  children,
  title,
  icon,
  hover = false,
  className = '',
  onClick,
  style,
}: PixelCardProps) {
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <div
      className={`card ${hoverClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-200">
          {icon && (
            <div className="text-2xl">{icon}</div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Made with Bob
