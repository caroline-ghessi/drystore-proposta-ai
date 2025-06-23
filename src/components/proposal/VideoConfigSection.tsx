
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, Upload } from 'lucide-react';

interface VideoConfigSectionProps {
  includeVideo: boolean;
  onIncludeVideoChange: (include: boolean) => void;
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
}

const VideoConfigSection = ({
  includeVideo,
  onIncludeVideoChange,
  videoUrl,
  onVideoUrlChange
}: VideoConfigSectionProps) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="w-5 h-5 mr-2 text-drystore-blue" />
          Vídeo Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="include-video" className="text-sm font-medium">
              Incluir vídeo na proposta
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Adicione um vídeo personalizado para aumentar a conversão
            </p>
          </div>
          <Switch
            id="include-video"
            checked={includeVideo}
            onCheckedChange={onIncludeVideoChange}
          />
        </div>

        {includeVideo && (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <Label htmlFor="video-url" className="text-sm">
                URL do Vídeo
              </Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => onVideoUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Suporte para YouTube, Vimeo ou links diretos de vídeo
              </p>
            </div>
          </div>
        )}

        {!includeVideo && (
          <div className="text-center py-6 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Vídeo personalizado desabilitado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoConfigSection;
