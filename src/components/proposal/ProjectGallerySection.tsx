
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, MapPin, Calendar } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  image: string;
  stats: {
    area: string;
    capacity: string;
    efficiency: string;
  };
}

export const ProjectGallerySection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const projects: Project[] = [
    {
      id: '1',
      title: 'Centro de Distribuição Metalúrgica Silva',
      category: 'Industrial',
      location: 'São Paulo, SP',
      year: '2024',
      description: 'Sistema de armazenamento vertical automatizado com capacidade para 10.000 toneladas de produtos siderúrgicos.',
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      stats: {
        area: '5.000m²',
        capacity: '10.000 ton',
        efficiency: '+60%'
      }
    },
    {
      id: '2',
      title: 'Galpão Inteligente Distribuidora MC',
      category: 'Comercial',
      location: 'Rio de Janeiro, RJ',
      year: '2024',
      description: 'Solução completa de armazenamento com sistema WMS integrado e controle automatizado de estoque.',
      image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop',
      stats: {
        area: '3.200m²',
        capacity: '8.500 pallets',
        efficiency: '+45%'
      }
    },
    {
      id: '3',
      title: 'Depósito Tech Solutions',
      category: 'Tecnologia',
      location: 'Belo Horizonte, MG',
      year: '2023',
      description: 'Armazenamento especializado para componentes eletrônicos com controle de temperatura e umidade.',
      image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=600&fit=crop',
      stats: {
        area: '2.800m²',
        capacity: '15.000 SKUs',
        efficiency: '+50%'
      }
    },
    {
      id: '4',
      title: 'Complexo Logístico Regional',
      category: 'Logística',
      location: 'Campinas, SP',
      year: '2023',
      description: 'Centro de distribuição multimodal com integração completa entre sistemas de transporte e armazenagem.',
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      stats: {
        area: '8.500m²',
        capacity: '25.000 pallets',
        efficiency: '+70%'
      }
    }
  ];

  const categories = ['todos', 'Industrial', 'Comercial', 'Tecnologia', 'Logística'];

  const filteredProjects = activeCategory === 'todos' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🏗️ Galeria de Projetos Executados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça alguns dos projetos que transformaram a operação de nossos clientes
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {project.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {project.location}
                  <Calendar className="w-4 h-4 ml-4 mr-1" />
                  {project.year}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{project.stats.area}</div>
                    <div className="text-xs text-gray-600">Área</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{project.stats.capacity}</div>
                    <div className="text-xs text-gray-600">Capacidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{project.stats.efficiency}</div>
                    <div className="text-xs text-gray-600">Eficiência</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Detail Modal */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Detalhes do Projeto</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Categoria:</span>
                          <Badge variant="outline">{selectedProject.category}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Localização:</span>
                          <span>{selectedProject.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ano:</span>
                          <span>{selectedProject.year}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Resultados Alcançados</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{selectedProject.stats.area}</div>
                          <div className="text-xs text-gray-600">Área Total</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{selectedProject.stats.capacity}</div>
                          <div className="text-xs text-gray-600">Capacidade</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{selectedProject.stats.efficiency}</div>
                          <div className="text-xs text-gray-600">Ganho Eficiência</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Descrição Completa</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
