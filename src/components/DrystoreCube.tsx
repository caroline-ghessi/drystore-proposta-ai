
import React from 'react';

interface DrystoreCubeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DrystoreCube: React.FC<DrystoreCubeProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/lovable-uploads/291814a9-274a-4cf1-818c-67ec1b0e1dff.png" 
        alt="Drystore Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default DrystoreCube;
