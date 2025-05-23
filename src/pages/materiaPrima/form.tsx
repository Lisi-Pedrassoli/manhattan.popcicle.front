import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { MateriaPrimaType } from "../../utils/types";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { AxiosResponse } from "axios";

export default function MateriaPrimaForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  const {handleSubmit, register, getValues, setValue, formState: { errors }} = useForm<MateriaPrimaType>();
  const { data, isLoading } = useSWR<AxiosResponse<MateriaPrimaType>>(id && `/materia-prima/${id}`,api.get);

  useEffect(() => {
    if (id && data?.data) {
      setValue("ativo", data.data.ativo);
      setValue("id", id);
      setValue("nome", data.data.nome);
      setValue("quantidadeEstoque", data.data.quantidadeEstoque);
      setValue("unidadeMedida", data.data.unidadeMedida);
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

  function criarMateriaPrima() {
    setLoader(true);
    api
      .post("/materia-prima", getValues())
      .then(() => {
        mutate("/materia-prima");
        setLoader(false);
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function atualizarMateriaPrima() {
    setLoader(true);
    api
      .put(`/materia-prima/${id}`, getValues())
      .then(() => {
        mutate("/materia-prima");
        setLoader(false);
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      <div className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40" onClick={() => goBack()} />

      <div className={`${visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={() => goBack()} className="hover:bg-neutral-200 rounded-lg p-1" data-action="go-back">
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-xl mb-1">Matéria Prima</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? () => atualizarMateriaPrima() : () => criarMateriaPrima())} className="px-5 space-y-3">
            <label className="flex flex-col">
              <span>Status:</span>
              <select {...register("ativo", { required: true })} className="input w-full">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Unidade de Medida:</span>
              <select {...register("unidadeMedida", { required: true })} className="input w-full">
                <option value="QUILOGRAMA_KG">Quilograma (Kg)</option>
                <option value="GRAMA_G">Grama (g)</option>
                <option value="TONELADA_T">Tonelada (t)</option>
                <option value="LITRO_L">Litro (L)</option>
                <option value="MILILITRO_ML">Mililitro (ml)</option>
                <option value="UNIDADE_UN">Unidade (un)</option>
                <option value="METRO_M">Metro (m)</option>
                <option value="CENTIMETRO_CM">Centímetro (cm)</option>
                <option value="PACOTE_PCT">Pacote (pct)</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Nome:</span>
              <input 
                disabled={loader} 
                type="text" 
                {...register("nome", { required: true })} 
                placeholder="Açúcar..." 
                className="input" 
              />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>Estoque:</span>
              <input
                disabled={loader}
                type="number"
                {...register("quantidadeEstoque", {
                  required: true,
                  validate: (value: number | null) =>
                    (value != null && Number(value) >= 0) ||
                    "O valor deve ser positivo",
                })}
                placeholder="10"
                className="input"
              />
              {errors.quantidadeEstoque && (
                <p className="text-xs text-red-500 mt-1">
                  O valor deve ser 0 ou positivo
                </p>
              )}
            </label>

            <button className="bg-pink-500 px-4 py-2 text-white rounded-lg float-right" disabled={isLoading || loader}>
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}