
import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExcelUploaderProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onFileUpload, isUploading }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        onFileUpload(file);
      } else {
        alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      }
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload de Planilha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Arraste e solte sua planilha aqui
            </p>
            <p className="text-sm text-gray-500">
              ou clique para selecionar
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceitos: .xlsx, .xls
            </p>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {isUploading ? 'Carregando...' : 'Selecionar Arquivo'}
            </Button>
          </div>
          
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Formato esperado da planilha:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Primeira linha deve conter os cabeçalhos</li>
            <li>Dados organizados em colunas</li>
            <li>Campos obrigatórios: Código, Nome, Categoria, Unidade, Preço</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
