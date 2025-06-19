
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import DrystoreCube from '@/components/DrystoreCube';
import { ArrowRight, FileText, Zap, Shield, Star } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-drystore-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <DrystoreCube size="md" />
              <div>
                <span className="text-2xl font-bold text-drystore-gray-dark">
                  Drystore
                </span>
                <div className="text-sm text-drystore-gray-medium">
                  Soluções Inteligentes
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
            >
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <DrystoreCube size="lg" className="animate-fade-in" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-drystore-gray-dark mb-6 animate-fade-in">
            Orçamentos Inteligentes
            <span className="block drystore-text-gradient mt-2">
              com Poder de IA
            </span>
          </h1>
          
          <p className="text-xl text-drystore-gray-medium mb-10 max-w-3xl mx-auto animate-fade-in">
            Transforme projetos arquitetônicos em propostas comerciais de alta conversão. 
            Upload de PDFs, análise automática e geração de orçamentos personalizados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              size="lg" 
              className="bg-drystore-orange hover:bg-drystore-orange-light text-white text-lg px-8 py-3"
              onClick={() => navigate('/login')}
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-slide-in">
            <div className="text-center">
              <div className="text-3xl font-bold drystore-text-gradient">+50.000</div>
              <div className="text-drystore-gray-medium">Clientes Atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold drystore-text-gradient">22 anos</div>
              <div className="text-drystore-gray-medium">de Atuação</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold drystore-text-gradient">
                4,6 <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="text-drystore-gray-medium">Avaliação Google</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold drystore-text-gradient">+15.000</div>
              <div className="text-drystore-gray-medium">Produtos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-drystore-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-drystore-gray-dark mb-4">
              Revolucione Suas Vendas
            </h2>
            <p className="text-lg text-drystore-gray-medium max-w-2xl mx-auto">
              Tecnologia de ponta para vendedores e representantes comerciais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white shadow-sm border border-drystore-gray-light animate-slide-in">
              <div className="w-16 h-16 bg-drystore-orange rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-drystore-gray-dark mb-4">Upload Inteligente</h3>
              <p className="text-drystore-gray-medium">
                Faça upload de PDFs de projetos arquitetônicos e listas de materiais. 
                Nossa IA analisa automaticamente o documento.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white shadow-sm border border-drystore-gray-light animate-slide-in">
              <div className="w-16 h-16 bg-drystore-green-sustainable rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-drystore-gray-dark mb-4">Geração Automática</h3>
              <p className="text-drystore-gray-medium">
                Orçamentos personalizados gerados automaticamente com base no projeto. 
                Edite e ajuste conforme necessário.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white shadow-sm border border-drystore-gray-light animate-slide-in">
              <div className="w-16 h-16 bg-drystore-blue-technical rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-drystore-gray-dark mb-4">Alta Conversão</h3>
              <p className="text-drystore-gray-medium">
                Propostas comerciais profissionais com alto poder de conversão. 
                Acompanhe o status em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-drystore-gray-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <DrystoreCube size="sm" />
            <div>
              <span className="text-xl font-bold">Drystore</span>
              <div className="text-sm text-drystore-gray-light">Soluções Inteligentes</div>
            </div>
          </div>
          <p className="text-drystore-gray-light">
            © 2024 Drystore - Soluções Inteligentes. Todos os direitos reservados.
          </p>
          <div className="mt-4 text-sm text-drystore-gray-light">
            Desde 2002 • Frete grátis RS/SC/PR/SP/MG/GO • 5% desconto à vista
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
