export type UsuarioType = {  
  ativo: boolean;
  cargo: string;
  email: string;
  senha: string;
  confirmaSenha: string;
  id: string;
  nome: string;
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
  tipoProduto: TipoProdutoType | null;
}

export type MateriaPrimaType = {
  id: string;
  quantidadeEstoque: number | null;
  nome: string;
  unidadeMedida: "KG" | "G" | "T" | "L" | "ML" | "UN" | "M" | "CM" | "PCT" | "";
  ativo: boolean;
  quantidadeReceita: number | null;
}

export type VendedorType = {
  ativo: boolean;
  id: string;
  nome: string;
  comissao: number
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
  vendedorId?: string;

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