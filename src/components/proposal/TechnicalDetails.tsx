import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Calendar, TrendingUp } from 'lucide-react';
interface TechnicalImage {
  url: string;
  description: string;
}
interface Product {
  name: string;
  description: string;
  area: string;
  unitPrice: number;
  totalPrice: number;
}
interface Solution {
  name: string;
  products: Product[];
}
interface TechnicalDetailsProps {
  technicalDetails: string;
  technicalImages: TechnicalImage[];
  solutions: Solution[];
}
export const TechnicalDetails = ({
  technicalDetails,
  technicalImages,
  solutions
}: TechnicalDetailsProps) => {
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Wrench className="w-5 h-5 mr-2" />
          Detalhes Técnicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed mb-6 text-neutral-900">{technicalDetails}</p>
        
        {/* Imagens Técnicas */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 flex items-center text-zinc-800">
            <Calendar className="w-4 h-4 mr-2" />
            Imagens Técnicas Explicativas
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {technicalImages.map((image, index) => <div key={index} className="bg-white rounded-lg border overflow-hidden">
                <img src={image.url} alt={image.description} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-sm text-gray-600">{image.description}</p>
                </div>
              </div>)}
          </div>
        </div>

        {/* Produtos por Solução */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center text-slate-100">
            <TrendingUp className="w-4 h-4 mr-2" />
            Produtos e Soluções
          </h4>
          <div className="space-y-6">
            {solutions.map((solution, solutionIndex) => <div key={solutionIndex} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 text-lg">{solution.name}</h5>
                <div className="space-y-3">
                  {solution.products.map((product, productIndex) => <div key={productIndex} className="bg-white rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">{product.name}</h6>
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-orange-600 font-medium">
                              {product.area}
                            </span>
                            <span className="text-gray-500">
                              R$ {product.unitPrice}/m²
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            R$ {product.totalPrice.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
      </CardContent>
    </Card>;
};