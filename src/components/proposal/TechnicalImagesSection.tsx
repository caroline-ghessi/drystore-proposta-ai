
export const TechnicalImagesSection = () => {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        📐 Imagens Técnicas Explicativas
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
            alt="Diagrama técnico estrutural"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
          <div className="absolute bottom-4 left-4 text-white">
            <h4 className="font-semibold">Estrutura de Apoio</h4>
            <p className="text-sm opacity-90">Detalhamento das vigas e suportes</p>
          </div>
        </div>
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop" 
            alt="Sistema de fixação"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
          <div className="absolute bottom-4 left-4 text-white">
            <h4 className="font-semibold">Sistema de Fixação</h4>
            <p className="text-sm opacity-90">Pontos de ancoragem e estabilidade</p>
          </div>
        </div>
      </div>
    </div>
  );
};
