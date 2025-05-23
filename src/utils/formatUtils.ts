export const formatarUnidadeMedida = (unidade: string): string => {
  // Remove sufixos como _KG, _L, etc. e formata para exibição
  const unidadeFormatada = unidade
    .replace(/_KG$/, '')
    .replace(/_G$/, '')
    .replace(/_L$/, '')
    .replace(/_ML$/, '')
    .replace(/_UN$/, '')
    .replace(/_M$/, '')
    .replace(/_CM$/, '')
    .replace(/_PCT$/, '');

  // Mapeamento para abreviações
  const abreviacoes: Record<string, string> = {
    'QUILOGRAMA': 'Kg',
    'GRAMA': 'g',
    'LITRO': 'L',
    'MILILITRO': 'ml',
    'UNIDADE': 'un',
    'METRO': 'm',
    'CENTIMETRO': 'cm',
    'PACOTE': 'pct',
    'TONELADA': 't'
  };

  return abreviacoes[unidadeFormatada] || unidadeFormatada;
};

export const formatarUnidadeParaSelect = (unidade: string): string => {
  return unidade
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};