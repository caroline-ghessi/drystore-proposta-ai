
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoProposalProps {
  videoUrl: string;
  vendorName: string;
  vendorTitle: string;
  duration: string;
}

const VideoProposal = ({ videoUrl, vendorName, vendorTitle, duration }: VideoProposalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mensagem Personalizada</CardTitle>
          <Badge variant="secondary">{duration}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          {vendorName} preparou uma mensagem especial para você
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative bg-gray-900 aspect-video">
          {/* Video placeholder - em produção seria um player real */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">{vendorName}</h3>
              <p className="text-sm opacity-90">{vendorTitle}</p>
            </div>
          </div>

          {/* Video controls overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                "Preparei esta proposta pensando especialmente no seu projeto"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Clique para assistir e conhecer todos os detalhes
              </p>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Assistir Agora
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoProposal;
