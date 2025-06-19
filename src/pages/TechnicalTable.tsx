
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Brain, Eye, Edit3, Save, AlertCircle } from 'lucide-react';
import DrystoreCube from '@/components/DrystoreCube';

interface TechnicalItem {
  id: string;
  system: string;
  description: string;
  quantity: number;
  unit: string;
  observations: string;
  source: 'ocr' | 'visual' | 'combined';
}

const TechnicalTable = () => {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalItem[]>([
    {
      id: '1',
      system: 'Telhado Shingle',
      description: 'Telhas asfálticas tipo shingle IKO Cambridge',
      quantity: 180,
      unit: 'm²',
      observations: 'Inclinação 30°, sobreposição 15cm, fixação com pregos galvanizados',
      source: 'combined'
    },
    {
      id: '2',
      system: 'Forro Drywall',
      description: 'Placas de gesso 12,5mm padrão',
      quantity: 165,
      unit: 'm²',
      observations: 'Altura 2,60m, estrutura metálica 60x27mm, espaçamento 40cm',
      source: 'visual'
    },
    {
      id: '3',
      system: 'Revestimento Interno',
      description: 'Drywall ST 12,5mm + massa + tinta',
      quantity: 320,
      unit: 'm²',
      observations: 'Paredes internas, tratamento de juntas, tinta acrílica fosca',
      source: 'ocr'
    },
    {
      id: '4',
      system: 'Revestimento Externo',
      description: 'Placa cimentícia 10mm + textura',
      quantity: 280,
      unit: 'm²',
      observations: 'Fachada externa, fixação com parafusos, juntas seladas',
      source: 'visual'
    },
    {
      id: '5',
      system: 'Piso',
      description: 'Contrapiso seco + piso laminado',
      quantity: 145,
      unit: 'm²',
      observations: 'Placas OSB 18mm, manta acústica, laminado AC4 8mm',
      source: 'combined'
    },
    {
      id: '6',
      system: 'Energia Solar',
      description: 'Sistema fotovoltaico 5kWp',
      quantity: 12,
      unit: 'unid.',
      observations: 'Painéis 450W, inversor string, estrutura alumínio',
      source: 'ocr'
    }
  ]);

  const handleEdit = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleSave = (itemId: string, updatedItem: Partial<TechnicalItem>) => {
    setTechnicalData(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    );
    setEditingItem(null);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ocr': return <Brain className="w-4 h-4 text-drystore-blue-technical" />;
      case 'visual': return <Eye className="w-4 h-4 text-drystore-green-sustainable" />;
      case 'combined': return <FileText className="w-4 h-4 text-drystore-orange" />;
      default: return <FileText className="w-4 h-4 text-drystore-gray-medium" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ocr': return 'IA Textual';
      case 'visual': return 'IA Visual';
      case 'combined': return 'Combinado';
      default: return 'Manual';
    }
  };

  const handleContinue = () => {
    // Aqui passaríamos os dados técnicos para a próxima etapa
    console.log('Dados técnicos finalizados:', technicalData);
    navigate('/select-systems');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/technical-analysis')}
            className="mr-4 text-drystore-gray-medium hover:text-drystore-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <DrystoreCube size="md" className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-drystore-gray-dark">Tabela Técnica Combinada</h1>
              <p className="text-drystore-gray-medium mt-1">Dados extraídos e unificados pelas IAs especializadas</p>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-drystore-blue-technical mr-3" />
                <div>
                  <h3 className="font-semibold text-drystore-gray-dark">IA Textual</h3>
                  <p className="text-sm text-blue-700">Memorial + Tabelas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-drystore-green-sustainable mr-3" />
                <div>
                  <h3 className="font-semibold text-drystore-gray-dark">IA Visual</h3>
                  <p className="text-sm text-green-700">Plantas + Símbolos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-drystore-orange mr-3" />
                <div>
                  <h3 className="font-semibold text-drystore-gray-dark">Resultado</h3>
                  <p className="text-sm text-orange-700">{technicalData.length} sistemas identificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Table */}
        <Card className="border border-drystore-gray-light shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-drystore-gray-dark">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-drystore-orange" />
                Quantitativos Técnicos Extraídos
              </div>
              <div className="flex items-center text-sm text-drystore-gray-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                Clique para editar os dados
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-drystore-gray-dark font-semibold">Sistema</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Descrição Técnica</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Qtd.</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Un.</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Observações Técnicas</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Fonte</TableHead>
                  <TableHead className="text-drystore-gray-dark font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicalData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-drystore-gray-dark">
                      {editingItem === item.id ? (
                        <Input 
                          defaultValue={item.system}
                          className="min-w-32"
                          onBlur={(e) => handleSave(item.id, { system: e.target.value })}
                        />
                      ) : (
                        item.system
                      )}
                    </TableCell>
                    <TableCell className="text-drystore-gray-medium max-w-xs">
                      {editingItem === item.id ? (
                        <Input 
                          defaultValue={item.description}
                          className="min-w-48"
                          onBlur={(e) => handleSave(item.id, { description: e.target.value })}
                        />
                      ) : (
                        item.description
                      )}
                    </TableCell>
                    <TableCell className="text-drystore-orange font-semibold">
                      {editingItem === item.id ? (
                        <Input 
                          type="number"
                          defaultValue={item.quantity}
                          className="w-20"
                          onBlur={(e) => handleSave(item.id, { quantity: parseFloat(e.target.value) })}
                        />
                      ) : (
                        item.quantity.toLocaleString('pt-BR')
                      )}
                    </TableCell>
                    <TableCell className="text-drystore-gray-medium">
                      {editingItem === item.id ? (
                        <Input 
                          defaultValue={item.unit}
                          className="w-16"
                          onBlur={(e) => handleSave(item.id, { unit: e.target.value })}
                        />
                      ) : (
                        item.unit
                      )}
                    </TableCell>
                    <TableCell className="text-drystore-gray-medium text-sm max-w-xs">
                      {editingItem === item.id ? (
                        <Input 
                          defaultValue={item.observations}
                          className="min-w-64"
                          onBlur={(e) => handleSave(item.id, { observations: e.target.value })}
                        />
                      ) : (
                        item.observations
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(item.source)}
                        <span className="text-xs text-drystore-gray-medium">
                          {getSourceLabel(item.source)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editingItem === item.id ? setEditingItem(null) : handleEdit(item.id)}
                        className="text-drystore-orange hover:bg-orange-50"
                      >
                        {editingItem === item.id ? (
                          <Save className="w-4 h-4" />
                        ) : (
                          <Edit3 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center pt-6 border-t border-drystore-gray-light mt-6">
              <div className="text-sm text-drystore-gray-medium">
                <span className="font-semibold text-drystore-gray-dark">{technicalData.length}</span> sistemas técnicos identificados
              </div>
              
              <Button 
                onClick={handleContinue}
                className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
                size="lg"
              >
                Avançar para Proposta Comercial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TechnicalTable;
