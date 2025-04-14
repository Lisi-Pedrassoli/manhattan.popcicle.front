import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { MateriaPrimaType, ProdutoType, ReceitaType } from "../../utils/types";

export default function ReceitaForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMateriasPrimas, setSelectedMateriasPrimas] = useState<MateriaPrimaType[]>([]);
  
  const { id } = useParams();
  const { handleSubmit, register, getValues, formState: { errors } } = useForm<any>();
  const { data: receitas, isLoading: isLoadingReceitas } = useSWR<AxiosResponse<ReceitaType>>(id && `/receita/${id}`, api.get);
  const { data: produtos, isLoading: isLoadingProdutos } = useSWR<AxiosResponse<ProdutoType[]>>("/produto/no-recipe", api.get);
  const { data: materiasPrimas } = useSWR<AxiosResponse<MateriaPrimaType[]>>("/materia-prima", api.get);

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);

    if (id && receitas?.data.receitaMateriaPrima) {
      setSelectedMateriasPrimas(receitas.data.receitaMateriaPrima.map((item: any) => item.materiaPrima));
    }
  }, [id, receitas]);

  function goBack() {
    if (loader) return;
    setLoader(true);
    setVisibility(false);
    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function toggleMateriaPrima(materiaPrima: MateriaPrimaType) {
    setSelectedMateriasPrimas((prev) => {
      const exists = prev.some((mp) => mp.id === materiaPrima.id);
      return exists ? prev.filter((mp) => mp.id !== materiaPrima.id) : [...prev, materiaPrima];
    });
  }

  function criarReceita() {
    setLoader(true);
    const data = {
      produto_id: getValues("produto_id"),
      receitaMateriaPrimaList: selectedMateriasPrimas.map((mp) => ({
        materiaPrima_id: mp.id,
        quantidade: getValues(`quantidade-${mp.id}`) || 0,
      })),
    };

    api
      .post("/receita", data)
      .then(() => {
        mutate("/receita");
        setLoader(false);
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function atualizarReceita() {
    setLoader(true);
    api
      .put(`/receita/${id}`, getValues())
      .then(() => {
        mutate("/receita");
        setLoader(false);
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      {!modalOpen && <div className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40" onClick={() => goBack()} />}

      <div className={`${visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={() => goBack()} className="hover:bg-neutral-200 rounded-lg p-1">
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-xl mb-1">Receita</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? () => atualizarReceita() : () => criarReceita())} className="px-5 space-y-3">
            <label className="flex flex-col">
              <span>Produto:</span>

              <select disabled={loader || isLoadingProdutos} {...register("produto_id", { required: true })} className="input w-full">
                <option value="">Selecione um produto</option>
                {produtos?.data.map((produto) => (
                  <option key={produto.id} value={produto.id}>{produto.nome}</option>
                ))}
              </select>

              {errors.produto && <p className="text-xs text-red-500 mt-1">Selecione um produto</p>}
            </label>

            <div>
              <label className="flex flex-col">
              {selectedMateriasPrimas.length > 0 && <span className="mb-2">Matérias-Primas:</span>}

                <div className="flex flex-wrap gap-2">
                  {selectedMateriasPrimas.map((mp) => (
                    <span key={mp.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">{mp.nome}</span>
                  ))}
                </div>

                {!selectedMateriasPrimas.length && <span className="text-sm text-neutral-700">Nenhuma matéria prima selecionada</span>}
              </label>

              <button type="button" onClick={() => setModalOpen(true)} className="mt-2 bg-pink-500 text-white px-4 py-2 rounded-lg w-full cursor-pointer text-sm">
                Selecionar Matérias-Primas
              </button>
            </div>

            <button className="bg-pink-500 px-4 py-2 text-white rounded-lg w-max" disabled={isLoadingReceitas || loader}>
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-lg font-bold">Selecionar Matérias-Primas</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-600 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {materiasPrimas?.data.map((mp) => (
                <button
                  key={mp.id}
                  onClick={() => toggleMateriaPrima(mp)}
                  className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${selectedMateriasPrimas.some((m) => m.id === mp.id) ? "bg-pink-500 text-white" : "bg-pink-200 text-pink-800"}`}
                >
                  {mp.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
