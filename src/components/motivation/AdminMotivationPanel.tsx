
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Upload, Video, Mic, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminMotivationPanel = () => {
  const [textMessage, setTextMessage] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSendMotivation = (type: 'text' | 'audio' | 'video') => {
    toast({
      title: "Mensagem Enviada!",
      description: `Mensagem de ${type} enviada para toda a equipe de vendas.`,
    });
    
    // Reset form
    setTextMessage('');
    setAudioFile(null);
    setVideoFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Painel de Motivação da Equipe
        </CardTitle>
        <p className="text-sm text-gray-600">
          Envie mensagens motivacionais, alertas ou orientações para sua equipe de vendas
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">📝 Texto</TabsTrigger>
            <TabsTrigger value="audio">🎤 Áudio</TabsTrigger>
            <TabsTrigger value="video">🎥 Vídeo</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-message">Mensagem de Texto</Label>
              <Textarea
                id="text-message"
                placeholder="Ex: Pessoal, faltam apenas 30% para batermos a meta! Vamos acelerar essas vendas! 💪"
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={() => handleSendMotivation('text')}
              disabled={!textMessage.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem de Texto
            </Button>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-upload">Upload de Áudio</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Mic className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Label htmlFor="audio-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Áudio
                    </span>
                  </Button>
                </Label>
                {audioFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✅ {audioFile.name}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => handleSendMotivation('audio')}
              disabled={!audioFile}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem de Áudio
            </Button>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-upload">Upload de Vídeo</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Vídeo
                    </span>
                  </Button>
                </Label>
                {videoFile && (
                  <p className="mt-2 text-sm text-green-600">
                    ✅ {videoFile.name}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => handleSendMotivation('video')}
              disabled={!videoFile}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem de Vídeo
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
