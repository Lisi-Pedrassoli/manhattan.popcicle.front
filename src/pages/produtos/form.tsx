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
  const { id } = useParams();

  const {
    handleSubmit,
    register,
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
        ativo: produtoData.data.ativo,
        tipoProdutoId: produtoData.data.tipoProduto?.id ?? 0,
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

  async function salvarProduto() {
    setLoader(true);// ativa o carregamento
    const body = getValues();//pega os dados do formulario (que formulario?)
    const url = id ? `/produto/${id}` : "/produto";//se tiver id é edição e se não tiver é criação
    const method = id ? api.put : api.post;//com base na linha acima defini se usara um put ou post

    await method(url, body)//envia os dados ao back
      .then(async () => {
        await mutate(`/produto?page=0&items=10`) //atualiza a pagina  
        goBack();//volta a tela anterior 
      })
      .finally(() => setLoader(false));//desativa o carregamento
  }

  return (
    <>
      <div className="w-screen h-screen bg-black/50 absolute z-40 inset-0" onClick={goBack} />
      <div className={`${visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
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
              <select {...register("ativo", { required: true })} className="input w-full">
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
                {...register("tipoProdutoId", { required: true })}
                disabled={loader || isLoadingTipoProduto}
                className="input w-full"
              >
                <option value="">Selecione um tipo</option>
                {tipoProduto?.data.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.tipo} - R$ {tipo.valor}
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