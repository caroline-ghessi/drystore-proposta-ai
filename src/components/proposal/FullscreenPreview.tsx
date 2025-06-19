
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2 } from 'lucide-react';

interface FullscreenPreviewProps {
  children: React.ReactNode;
  triggerText?: string;
}

const FullscreenPreview = ({ children, triggerText = "Modo Apresentação" }: FullscreenPreviewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = 'auto';
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={exitFullscreen}
            variant="ghost"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
          >
            <X className="w-4 h-4 mr-2" />
            Sair da Apresentação
          </Button>
        </div>
        
        <div className="h-full overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button 
      onClick={enterFullscreen}
      variant="outline"
      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
    >
      <Maximize2 className="w-4 h-4 mr-2" />
      {triggerText}
    </Button>
  );
};

export default FullscreenPreview;
