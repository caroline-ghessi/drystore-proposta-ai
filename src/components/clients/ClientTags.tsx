
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientTagsProps {
  clientId: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  editable?: boolean;
}

const ClientTags = ({ clientId, tags, onTagsChange, editable = false }: ClientTagsProps) => {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const predefinedTags = [
    'Cliente Quente',
    'Aguardando Projeto',
    'Negociação',
    'Follow-up',
    'Revisão Técnica',
    'Proposta Enviada',
    'Cliente Frio'
  ];

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      onTagsChange(updatedTags);
      toast({
        title: "Tag adicionada",
        description: `Tag "${tag}" foi adicionada ao cliente.`,
      });
    }
    setNewTag('');
    setIsAdding(false);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(updatedTags);
    toast({
      title: "Tag removida",
      description: `Tag "${tagToRemove}" foi removida.`,
    });
  };

  const getTagColor = (tag: string) => {
    const colorMap: Record<string, string> = {
      'Cliente Quente': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Aguardando Projeto': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Negociação': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Follow-up': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Revisão Técnica': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Proposta Enviada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Cliente Frio': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colorMap[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags do Cliente</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} className={getTagColor(tag)}>
            {tag}
            {editable && (
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-white/20 dark:hover:bg-black/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
        
        {editable && (
          <>
            {isAdding ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nova tag..."
                  className="w-32 h-6 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      addTag(newTag.trim());
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => newTag.trim() && addTag(newTag.trim())}
                  className="h-6 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="h-6 px-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            )}
          </>
        )}
      </div>

      {editable && isAdding && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tags sugeridas:</p>
          <div className="flex flex-wrap gap-1">
            {predefinedTags
              .filter(tag => !tags.includes(tag))
              .map(tag => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  onClick={() => addTag(tag)}
                  className="h-6 px-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {tag}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientTags;
