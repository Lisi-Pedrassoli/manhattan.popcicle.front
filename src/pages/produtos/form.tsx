import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { ProdutoType, TipoProdutoType } from "../../utils/types";

export default function ProdutoForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  const {handleSubmit, register, getValues, setValue, formState: { errors }} = useForm<ProdutoType>();
  const { data, isLoading: isLoadingProduto } = useSWR<AxiosResponse<ProdutoType>>(id && `/produto/${id}`,api.get);
  const { data: tipoProduto, isLoading: isLoadingTipoProduto } = useSWR<AxiosResponse<TipoProdutoType[]>>("/tipo-produto", api.get);

  if (id) {
    setValue("ativo", data?.data.ativo!)
    setValue("id", id)
    setValue("nome", data?.data.nome!)
    setValue("estoque", data?.data.estoque!)
    setValue("tipoProduto", data?.data.tipoProduto!)
  }

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

  function criarProduto() {
    setLoader(true);

    const data = {
      ativo: getValues("ativo"),
      estoque: getValues("estoque"),
      nome: getValues("nome"),
      tipoProdutoId: getValues("tipoProduto")
    }

    api
    .post("/produto", data)
    .then(() => {
      mutate("/produto");
      setLoader(false);
      goBack()
    })
    .finally(() => {
      setLoader(false);
    });
  }

  function atualizarProduto() {
    setLoader(true);
    api
    .put(`/produto/${id}`, getValues())
    .then(() => {
      mutate("/produto");
      setLoader(false);
      goBack()
    })
    .finally(() => {
      setLoader(false);
    });
  }

  return (
    <>
      <div className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40" onClick={() => goBack()} />

      <div className={`${ visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={() => goBack()} className="hover:bg-neutral-200 rounded-lg p-1" data-action="go-back">
                <ArrowLeft size={20} />
              </button>

              <h2 className="font-bold text-xl mb-1">Produto</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? () => atualizarProduto() : () => criarProduto())} className="px-5 space-y-3">
            <label className="flex flex-col">
              <span>Status:</span>
              <select {...register("ativo", { required: true })} className="input w-full">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Nome: </span>
              <input disabled={loader} type="text" {...register("nome", { required: true })} placeholder="Limão..." className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>Estoque: </span>
              <input
                disabled={loader}
                type="number"
                {...register("estoque", {
                  required: true,
                  validate: (value: number | null) =>
                    (value != null && Number(value) >= 0) ||
                    "O valor deve ser positivo",
                })}
                placeholder="10"
                className="input"
              />
            
              {errors.estoque && (<p className="text-xs text-red-500 mt-1">O valor deve ser 0 ou positivo</p>)}
            </label>

            <label className="flex flex-col">
              <span>Tipo do Produto:</span>
              <select disabled={loader || isLoadingTipoProduto} {...register("tipoProduto", { required: true })} className="input w-full">
                <option value="">Selecione um tipo</option>

                {tipoProduto?.data.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.tipo} - R$ {tipo.valor?.toFixed(2)}</option>
                ))}
              </select>
              {errors.tipoProduto && <p className="text-xs text-red-500 mt-1">Selecione um tipo de produto</p>}
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
