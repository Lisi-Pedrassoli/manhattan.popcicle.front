import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { ProducaoType, ReceitaType } from "../../utils/types";

export default function ProducaoForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const [selectedReceitas, setSelectedReceitas] = useState<{ receitaId: string; quantidade: number; nome: string }[]>([]);

  const { id } = useParams();
  const { handleSubmit, register, getValues, setValue } = useForm<ProducaoType>();
  const { data: producoes, isLoading: isLoadingProducoes } = useSWR<AxiosResponse<ProducaoType>>(id && `/producao/${id}`, api.get);
  const { data: receitas, isLoading: isLoadingReceitas } = useSWR<AxiosResponse<ReceitaType[]>>(`/receita`, api.get);

  useEffect(() => {
    if (id && producoes?.data) {
      setValue("id", id);
      setValue("ativo", producoes.data.ativo);

      const vencimentoDate = parseDate(producoes.data.vencimento);
      if (vencimentoDate) {
        setValue("vencimento", vencimentoDate.toISOString().split("T")[0]);
      }
    }
  }, [id, producoes, setValue]);

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);
  }, []);

  useEffect(() => {
    if (producoes?.data && producoes.data.receitaProducaoModel) {
      const receitasSelecionadas = producoes.data.receitaProducaoModel.map((item) => ({
        receitaId: item.receita.id,
        quantidade: item.quantidadeProduzida,
        nome: item.receita.produto.nome,
      }));
      setSelectedReceitas(receitasSelecionadas);
    }
  }, [producoes]);

  function adicionarReceita(receitaId: string, nome: string) {
    if (!selectedReceitas.find((r) => r.receitaId === receitaId)) {
      setSelectedReceitas([...selectedReceitas, { receitaId, quantidade: 1, nome }]);
    }
  }

  function removerReceita(receitaId: string) {
    setSelectedReceitas(selectedReceitas.filter((r) => r.receitaId !== receitaId));
  }

  function atualizarQuantidade(receitaId: string, quantidade: number) {
    setSelectedReceitas(
      selectedReceitas.map((r) => (r.receitaId === receitaId ? { ...r, quantidade } : r))
    );
  }

  function parseDate(dateString: string) {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  function goBack() {
    if (loader) return;
    setLoader(true);
    setVisibility(false);
    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function criarProducao() {
    setLoader(true);

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const vencimentoInput = new Date(getValues("vencimento"));
    vencimentoInput.setDate(vencimentoInput.getDate() + 1);
    const dataVencimento = vencimentoInput.toLocaleDateString("pt-BR");

    const data = {
      dataAtual,
      vencimento: dataVencimento,
      receita: selectedReceitas.map((r) => ({
        receitaId: r.receitaId,
        quantidade: r.quantidade,
      })),
    };

    api
      .post("/producao", data)
      .then(() => {
        mutate("/producao");
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function atualizarProducao() {
    setLoader(true);

    const vencimentoInput = new Date(getValues("vencimento"));
    vencimentoInput.setDate(vencimentoInput.getDate() + 1);
    const dataVencimento = vencimentoInput.toLocaleDateString("pt-BR");

    const data = {
      vencimento: dataVencimento,
      ativo: String(getValues("ativo")) === "true",
      receita: selectedReceitas.map((r) => ({
        receitaId: r.receitaId,
        quantidade: r.quantidade,
      })),
    };

    api
      .put(`/producao/${id}`, data)
      .then(() => {
        mutate("/producao");
        goBack();
      })
      .catch((err) => {
        console.error("Erro ao atualizar produção:", err);
      })
      .finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      <div className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40" onClick={goBack} />

      <div className={`${visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={goBack} className="hover:bg-neutral-200 rounded-lg p-1" data-action="go-back">
                <ArrowLeft size={20} />
              </button>
              <h2 className="font-bold text-xl mb-1">Produção</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? atualizarProducao : criarProducao)} className="px-5 space-y-3">
            <label className="flex flex-col">
              <span>Status:</span>
              <select {...register("ativo", { required: true })} className="input w-full">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-neutral-500">Vencimento</span>
              <input type="date" {...register("vencimento", { required: true })} className="border border-pink-300 px-4 py-2 rounded-lg cursor-pointer" />
            </label>

            <label className="flex flex-col">
              <span>Receitas:</span>
              {receitas?.data.length ? (
                <select
                  onChange={(e) => adicionarReceita(e.target.value, e.target.options[e.target.selectedIndex].text)}
                  className="input w-full"
                >
                  <option value="">Selecione uma receita</option>
                  {receitas.data
                    .filter((r) => !selectedReceitas.some((s) => s.receitaId === r.id))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.produto.nome}
                      </option>
                    ))}
                </select>
              ) : (
                <span className="text-sm text-neutral-700">
                  {isLoadingReceitas ? (
                    <span className="flex items-center gap-2 mt-2">
                      Aguarde <Loader2 className="animate-spin" />
                    </span>
                  ) : (
                    "Nenhuma receita encontrada"
                  )}
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              {selectedReceitas.map((r) => (
                <div key={r.receitaId} className="w-full flex items-center gap-2 bg-pink-200 px-2 py-1 rounded-lg">
                  <div className="flex-1 flex items-center gap-2 justify-between">
                    <span className="truncate max-w-56">{r.nome}</span>
                    <input
                      type="number"
                      min="1"
                      value={r.quantidade}
                      onChange={(e) => atualizarQuantidade(r.receitaId, parseInt(e.target.value))}
                      className="w-16 border border-pink-300 rounded-lg px-1 text-center"
                    />
                  </div>
                  <button type="button" onClick={() => removerReceita(r.receitaId)} className="text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button type="submit" className="cursor-pointer bg-pink-500 px-4 py-2 text-white rounded-lg float-right" disabled={isLoadingProducoes || loader}>
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}