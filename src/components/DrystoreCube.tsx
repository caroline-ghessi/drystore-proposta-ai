
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

  const faceSize = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const translateZ = {
    sm: '12px',
    md: '20px',
    lg: '32px'
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'rotateX(15deg) rotateY(15deg)'
      }}
    >
      {/* Face superior - laranja */}
      <div 
        className={`absolute ${faceSize[size]} bg-drystore-orange`}
        style={{
          transform: `rotateX(90deg) translateZ(${translateZ[size]})`
        }}
      />
      
      {/* Face frontal - cinza claro */}
      <div 
        className={`absolute ${faceSize[size]}`}
        style={{
          background: 'linear-gradient(135deg, #808080 0%, #606060 100%)',
          transform: `translateZ(${translateZ[size]})`
        }}
      />
      
      {/* Face direita - cinza escuro */}
      <div 
        className={`absolute ${faceSize[size]}`}
        style={{
          background: 'linear-gradient(135deg, #606060 0%, #404040 100%)',
          transform: `rotateY(90deg) translateZ(${translateZ[size]})`
        }}
      />
    </div>
  );
};

export default DrystoreCube;
