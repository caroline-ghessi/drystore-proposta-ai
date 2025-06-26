
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectGalleryManager } from './ProjectGalleryManager';
import { TestimonialsManager } from './TestimonialsManager';
import { TechnicalImagesManager } from './TechnicalImagesManager';
import { DownloadFilesManager } from './DownloadFilesManager';
import { Image, MessageSquare, Wrench, Download } from 'lucide-react';

export const ContentManagementTabs = () => {
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="gallery" className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          Galeria de Projetos
        </TabsTrigger>
        <TabsTrigger value="testimonials" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Depoimentos
        </TabsTrigger>
        <TabsTrigger value="technical" className="flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          Imagens Técnicas
        </TabsTrigger>
        <TabsTrigger value="downloads" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Downloads
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gallery" className="mt-6">
        <ProjectGalleryManager />
      </TabsContent>

      <TabsContent value="testimonials" className="mt-6">
        <TestimonialsManager />
      </TabsContent>

      <TabsContent value="technical" className="mt-6">
        <TechnicalImagesManager />
      </TabsContent>

      <TabsContent value="downloads" className="mt-6">
        <DownloadFilesManager />
      </TabsContent>
    </Tabs>
  );
};
