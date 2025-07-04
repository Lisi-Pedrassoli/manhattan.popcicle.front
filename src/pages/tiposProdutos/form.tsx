import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { TipoProdutoType } from "../../utils/types";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { AxiosResponse } from "axios";

export default function TipoProdutoForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TipoProdutoType>();

  const { data, isLoading } = useSWR<AxiosResponse<TipoProdutoType>>(
    id ? `/tipo-produto/${id}` : null,
    api.get
  );

  // Corrigido: só preenche os campos quando os dados estiverem carregados
  useEffect(() => {
    if (id && data?.data) {
      setValue("id", id);
      setValue("ativo", data.data.ativo);
      setValue("tipo", data.data.tipo);
      setValue("valor", data.data.valor);
    }
  }, [id, data, setValue]);

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

  function criarTipoProduto() {
    setLoader(true);
    api
      .post("/tipo-produto", getValues())
      .then(() => {
        mutate("/tipo-produto");
        goBack();
      })
      .finally(() => setLoader(false));
  }

  function atualizarTipoProduto() {
    setLoader(true);
    api
      .put(`/tipo-produto/${id}`, getValues())
      .then(() => {
        mutate("/tipo-produto");
        goBack();
      })
      .finally(() => setLoader(false));
  }

  return (
    <>
      <div
        className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40"
        onClick={() => goBack()}
      />
      <div
        className={`${
          visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
        } z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}
      >
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button
                disabled={loader}
                onClick={() => goBack()}
                className="hover:bg-neutral-200 rounded-lg p-1"
                data-action="go-back"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="font-bold text-xl mb-1">Tipo de Produto</h2>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(
              id ? atualizarTipoProduto : criarTipoProduto
            )}
            className="px-5 space-y-3"
          >
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
              <span>Tipo: </span>
              <input
                disabled={loader}
                type="text"
                {...register("tipo", { required: true })}
                placeholder="Especial, leite, frutas..."
                className="input"
              />
              {errors.tipo && (
                <p className="text-xs text-red-500 mt-1">
                  O campo não deve ser nulo
                </p>
              )}
            </label>
            <label className="flex flex-col">
              <span>Valor: </span>
              <input
                  disabled={loader}
                  type="number"
                  step="0.01"
                  {...register("valor", {
                    required: true,
                    validate: (value) => {
                      if (value == null || Number(value) <= 0) {
                        return "O valor deve ser positivo";
                      }
                      return true;
                    },
                  })}
                  placeholder="R$3,50"
                  className="input"
                />
                {errors.valor && (
                  <p className="text-xs text-red-500 mt-1">{errors.valor.message}</p>
                )}

              {errors.valor && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.valor.message}
                </p>
              )}
            </label>
            <button
              className="bg-pink-500 px-4 py-2 text-white rounded-lg float-right"
              disabled={isLoading || loader}
            >
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
