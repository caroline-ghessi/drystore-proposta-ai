import React from 'react';

export const ShingleComparisonSection: React.FC = () => {
  const comparisonData = [
    { feature: 'Durabilidade', shingle: '30+ anos', ceramica: '20-25 anos', fibrocimento: '15-20 anos', metalica: '20-25 anos' },
    { feature: 'Resistência a intempéries', shingle: 'Excelente', ceramica: 'Boa', fibrocimento: 'Normal', metalica: 'Boa' },
    { feature: 'Isolamento térmico', shingle: 'Superior', ceramica: 'Bom', fibrocimento: 'Normal', metalica: 'Baixa' },
    { feature: 'Isolamento acústico', shingle: 'Excelente', ceramica: 'Bom', fibrocimento: 'Normal', metalica: 'Baixa' },
    { feature: 'Peso (kg/m²)', shingle: '8-12', ceramica: '45-60', fibrocimento: '20-25', metalica: '5-8' },
    { feature: 'Variedade de cores', shingle: 'Alta', ceramica: 'Média', fibrocimento: 'Baixa', metalica: 'Média' },
    { feature: 'Facilidade de instalação', shingle: 'Fácil', ceramica: 'Complexa', fibrocimento: 'Média', metalica: 'Média' },
    { feature: 'Manutenção', shingle: 'Mínima', ceramica: 'Normal', fibrocimento: 'Frequente', metalica: 'Normal' },
  ];

  const getValueStyle = (value: string, isShingle: boolean) => {
    if (isShingle) {
      return 'font-semibold text-orange-800';
    }
    
    // Destaque positivo para valores bons
    if (['Excelente', 'Superior', 'Alta', 'Fácil', 'Mínima'].includes(value)) {
      return 'text-green-700';
    }
    
    // Destaque negativo para valores ruins
    if (['Baixa', 'Complexa', 'Frequente'].includes(value)) {
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que escolher telhas shingle?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Compare as telhas shingle com outras opções do mercado e descubra por que elas são a melhor escolha para seu projeto.
          </p>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-900">Características</th>
                <th className="text-center p-4 font-semibold text-orange-800 bg-orange-50">Telha Shingle</th>
                <th className="text-center p-4 font-semibold text-gray-700">Cerâmica</th>
                <th className="text-center p-4 font-semibold text-gray-700">Fibrocimento</th>
                <th className="text-center p-4 font-semibold text-gray-700">Metálica</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                  <td className={`text-center p-4 bg-orange-50 ${getValueStyle(row.shingle, true)}`}>
                    {row.shingle}
                  </td>
                  <td className={`text-center p-4 ${getValueStyle(row.ceramica, false)}`}>
                    {row.ceramica}
                  </td>
                  <td className={`text-center p-4 ${getValueStyle(row.fibrocimento, false)}`}>
                    {row.fibrocimento}
                  </td>
                  <td className={`text-center p-4 ${getValueStyle(row.metalica, false)}`}>
                    {row.metalica}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile */}
        <div className="lg:hidden space-y-6">
          {comparisonData.map((row, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">{row.feature}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-700 font-medium mb-1">Shingle</div>
                  <div className="font-semibold text-orange-800">{row.shingle}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-1">Cerâmica</div>
                  <div className={getValueStyle(row.ceramica, false)}>{row.ceramica}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-1">Fibrocimento</div>
                  <div className={getValueStyle(row.fibrocimento, false)}>{row.fibrocimento}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-1">Metálica</div>
                  <div className={getValueStyle(row.metalica, false)}>{row.metalica}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Título da próxima seção */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Comparativo Técnico
          </h3>
        </div>
      </div>
    </section>
  );
};