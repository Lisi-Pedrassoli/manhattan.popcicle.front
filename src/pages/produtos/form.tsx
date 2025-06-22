import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { TipoProdutoType } from "../../utils/types";

// Novo tipo para o formulário
interface ProdutoFormType {
  id?: number;
  nome: string;
  estoque: number;
  ativo: boolean;
  tipoProdutoId: number;
}

export default function ProdutoForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { id } = useParams();

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ProdutoFormType>();

  const { data: produtoData, isLoading: isLoadingProduto } = useSWR<AxiosResponse<any>>(id && `/produto/${id}`, api.get);
  const { data: tipoProduto, isLoading: isLoadingTipoProduto } = useSWR<AxiosResponse<TipoProdutoType[]>>("/tipo-produto", api.get);

 useEffect(() => {
  if (produtoData?.data && tipoProduto?.data) {
    reset({
      id: produtoData.data.id,
      nome: produtoData.data.nome,
      estoque: produtoData.data.estoque,
      ativo: produtoData.data.ativo, // Mantém o valor booleano original
      tipoProdutoId: produtoData.data.tipoProduto?.id || 0,
    });
  }
}, [produtoData, tipoProduto, reset]);

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);
  }, []);

  function goBack() {
    if (loader) return;
    setLoader(true);
    setVisibility(false);
    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function salvarProduto() {
  setLoader(true);
  setApiError(null); // limpa erro anterior
  const body = getValues();
  const url = id ? `/produto/${id}` : "/produto";
  const method = id ? api.put : api.post;

  method(url, body)
    .then(() => {
      mutate("/produto");
      goBack();
    })
    .catch((e) => {
      if (e.response?.data?.detail) {
        setApiError(e.response.data.detail); // <-- mostra mensagem vinda do back
      } else {
        setApiError("Erro ao salvar produto");
      }
    })
    .finally(() => setLoader(false));
}


  return (
    <>
      <div className="fixed inset-0 w-screen h-screen bg-black/50 z-40" onClick={goBack} />
    <div className={`${visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} fixed inset-0 z-50 flex justify-end transition-all duration-200 pointer-events-none`}>
      <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={goBack} className="hover:bg-neutral-200 rounded-lg p-1">
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-xl mb-1">Produto</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(salvarProduto)} className="px-5 space-y-3">
          <label className="flex flex-col">
            <span>Status:</span>
            <select
              {...register("ativo", { required: true })}
              className="input w-full"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>

            <label className="flex flex-col">
              <span>Nome:</span>
              <input disabled={loader} type="text" {...register("nome", { required: true })} className="input" placeholder="Nome do produto" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
            </label>

            <label className="flex flex-col">
              <span>Estoque:</span>
              <input
                disabled={loader}
                type="number"
                {...register("estoque", {
                  required: true,
                  validate: (value) => value >= 0 || "Deve ser positivo",
                })}
                className="input"
              />
              {errors.estoque && <p className="text-xs text-red-500 mt-1">{errors.estoque.message}</p>}
            </label>

            <label className="flex flex-col">
              <span>Tipo do Produto:</span>
              <select
                {...register("tipoProdutoId", { 
                  required: "Selecione um tipo de produto"
                })}
                className="input w-full"
                disabled={loader || isLoadingTipoProduto}
              >
                <option value="">Selecione um tipo</option>
                {tipoProduto?.data?.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.tipo} - R$ {tipo.valor?.toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.tipoProdutoId && <p className="text-xs text-red-500 mt-1">Selecione um tipo válido</p>}
            </label>

            <button className="bg-pink-500 px-4 py-2 text-white rounded-lg float-right" disabled={isLoadingProduto || loader}>
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}