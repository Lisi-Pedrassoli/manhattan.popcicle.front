export type UsuarioType = {  
  ativo: boolean;
  cargo: string;
  email: string;
  senha: string;
  confirmaSenha: string;
  id: string;
  nome: string;
}

export type ClienteType = {
  id?: string;
  telefone?: string;
  nome?: string;  
  documento?: string;  
  ativo?: boolean
}

export type TipoProdutoType = {
  id?: string;
  tipo: string;
  valor: number | null;
  ativo?: boolean
}

export type ProdutoType = {
  id: string;
  nome: string;
  estoque: number | null;
  ativo: boolean;
  tipoProduto: TipoProdutoType;
}

export type MateriaPrimaType = {
  id: string;
  quantidadeEstoque: number | null;
  nome: string;
  unidadeMedida: "QUILOGRAMA_KG" | "GRAMA_G" | "TONELADA_T" | "LITRO_L" | "MILILITRO_ML" | "UNIDADE_UN" | "METRO_M" | "CENTIMETRO_CM" | "PACOTE_PCT" | "";
  ativo: boolean;
}

export type VendedorType = {
  ativo: boolean;
  id: string;
  nome: string;
  recebimento: number;
  telefone: string;
  cpf: string;
}

export type ReceitaType = {
  id: string;
  ativo: boolean;
  produto_id: string;
  materiaPrima_id: string; 
  quantidade: number;
  produto: ProdutoType;
  receitaMateriaPrima: any
}

export type ProducaoType = {
  id: string;
  ativo: boolean;
  dataAtual: string;
  vencimento: string;

  receita: { 
    receitaId: string;
    quantidade: number; 
  }[];

  receitaProducaoModel?: {
    id: string;
    quantidadeProduzida: number;
    receita: {
      id: string;
      ativo: boolean;
      produto: ProdutoType;
      receitaMateriaPrima: {
        id: string;
        quantidadeMP: number;
        materiaPrima: MateriaPrimaType;
      }[];
    }
  }[];
}

export type ProducaoReceitaType = {
  id: string;
  quantidadeProduzida: number;

  receita: {
    id: string;
    ativo: boolean;
    produto: ProdutoType;

    receitaMateriaPrima: {
      id: string;
      quantidadeMP: number;
      materiaPrima: MateriaPrimaType;
    }[];
  }
}

export type VendaType = {
  id: string;
  dataCriacao: number;
  codigo: number;
  total: number;
  status: "OPENED" | "CLOSED" | "CANCELED";
  clienteId?: string;
  vendedorId?: string;

  cliente: ClienteType;
  vendedor: VendedorType;
  produtoVenda: ProdutoVendaType[];
}

export type ProdutoVendaType = {
  id: string;
  nome: string;
  referenciaProduto: string;
  quantidadeSaida: number;
  quantidadeVolta: number;
  tipo: string;
  valor: number;
}