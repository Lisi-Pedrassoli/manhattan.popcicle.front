import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { ProdutoType, VendaType, VendedorType } from "../../utils/types";

interface ProdutosSelecionadosProps {
  produtoId: string;
  quantidade: number;
  nome: string;
  quantidadeVolta?: number;
}

interface FechaVendaProps {
  produtoVendaId: string;
  quantidadeVolta?: number;
}

export default function VendaForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { id } = useParams();
  const { handleSubmit, register, getValues, setValue } = useForm<VendaType>();
  const [selectedProdutos, setSelectedProdutos] = useState<ProdutosSelecionadosProps[]>([]);
  const { data: venda, isLoading } = useSWR<AxiosResponse<VendaType>>(id ? `/venda/${id}` : null, api.get);
  const { data: vendedores, isLoading: isLoadingVendedores } = useSWR<AxiosResponse<VendedorType[]>>(`/vendedor`, api.get);
  const { data: produtos, isLoading: isLoadingProdutos } = useSWR<AxiosResponse<ProdutoType[]>>(`/produto`, api.get);

  useEffect(() => {
    if (id && venda?.data) {
      setValue("id", id);
      setValue("vendedorId", venda.data.vendedor.id);
      setValue("status", venda.data.status!);
    }
  }, [id, venda, setValue]);

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);
  }, []);

  useEffect(() => {
    if (venda?.data.produtoVenda) {
      const produtosSelecionados = venda.data.produtoVenda.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidadeSaida,
        nome: item.nome,
        quantidadeVolta: item.quantidadeVolta,
      }));
      setSelectedProdutos(produtosSelecionados);
    }
  }, [venda?.data.produtoVenda]);

  function goBack() {
    if (loader) return;

    setLoader(true);
    setVisibility(false);

    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function atualizaStatusVenda() {
    setLoader(true);

    const data = {
      status: getValues("status"),
    };

    api
      .put(`/venda/${id}`, data)
      .then(() => {
        mutate("/venda");
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function adicionarProduto(id: string, nome: string) {
    if (!selectedProdutos.find((prod) => prod.produtoId === id)) {
      setSelectedProdutos([...selectedProdutos, { produtoId: id, quantidade: 1, nome }]);
    }
  }

  function removerProduto(produtoId: string) {
    setSelectedProdutos(selectedProdutos.filter((prod) => prod.produtoId !== produtoId));
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    setSelectedProdutos(
      selectedProdutos.map((prod) => (prod.produtoId === produtoId ? { ...prod, quantidade } : prod))
    );
  }

  function atualizarSaida(produtoId: string, quantidadeVolta: number) {
    const atualizados = selectedProdutos.map((produto) => {
      if (produto.produtoId === produtoId) {
        return { ...produto, quantidadeVolta };
      }
      return produto;
    });
    setSelectedProdutos(atualizados);
  }

  function retornaEstoque(produtoId: string) {
    if (produtos?.data.length) {
      return Number(produtos.data.find((prod: ProdutoType) => prod.id === produtoId)?.estoque ?? 0);
    }
    return 0;
  }

  function convertStatus(status: string) {
    switch (status) {
      case "CANCELED":
        return "Cancelado";
      case "CLOSED":
        return "Fechado";
      case "OPENED":
        return "Aberto";
      default:
        return status;
    }
  }

  function criarVenda() {
    setLoader(true);

    const data = {
      vendedorId: getValues("vendedorId"),
      produtoVenda: selectedProdutos.map((produto) => ({
        productId: produto.produtoId,
        quantidadeSaida: produto.quantidade,
      })),
    };

    api
      .post("/venda", data)
      .then(() => {
        mutate("/venda");
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  async function fechaVenda() {
    setLoader(true);
    setApiError(null);

    const data: FechaVendaProps[] = [];

    venda?.data.produtoVenda.forEach((prod) => {
      const selected = selectedProdutos.find((sp) => sp.produtoId === prod.id);
      if (selected) {
        data.push({
          produtoVendaId: selected.produtoId,
          quantidadeVolta: selected.quantidadeVolta,
        });
      }
    });

    try {
      await api.post(`/venda/${venda?.data.id}`, { produtosVenda: data });
      mutate("/venda");
      goBack();
    } catch (e: any) {
      if (e.response?.data?.detail) {
        setApiError(e.response.data.detail);
      } else {
        setApiError("Erro ao fechar venda.");
      }
    } finally {
      setLoader(false);
    }
  }

  function atualizarVenda() {
    setLoader(true);

    const data = {
      vendedorId: getValues("vendedorId"),
      produtoVenda: selectedProdutos.map((produto) => ({
        productId: produto.produtoId,
        quantidadeSaida: produto.quantidade,
      })),
    };

    api
      .put(`/venda/${id}`, data)
      .then(() => {
        mutate("/venda");
        goBack();
      })
      .catch(() => {
        setApiError("Erro ao salvar alterações da venda.");
      })
      .finally(() => {
        setLoader(false);
      });
  }

  function cancelaVenda() {
    setLoader(true);

    api
      .delete(`/venda/${venda?.data.id}`)
      .then(() => {
        mutate("/venda");
        goBack();
      })
      .finally(() => {
        setLoader(false);
      });
  }

  const status = getValues("status");

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

              <h2 className="font-bold text-xl mb-1">Venda</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? atualizaStatusVenda : criarVenda)} className="px-5 space-y-3">
            {id ? (
              <>
                <label className="flex flex-col">
                  <span>Status:</span>
                  <input
                    type="text"
                    value={convertStatus(venda?.data.status!)}
                    disabled
                    className="w-full text-neutral-500"
                  />
                </label>

                <div className="flex gap-2">
                  {status === "OPENED" && (
                    <>
                      <button
                        onClick={fechaVenda}
                        type="button"
                        className="text-sm w-full whitespace-nowrap bg-pink-500 px-4 py-2 text-white rounded-lg cursor-pointer"
                        disabled={isLoading || loader}
                      >
                        {loader ? <Loader2 className="animate-spin" /> : "Fechar Venda"}
                      </button>

                      <button
                        onClick={cancelaVenda}
                        type="button"
                        className="text-sm w-full whitespace-nowrap bg-pink-500 px-4 py-2 text-white rounded-lg cursor-pointer"
                        disabled={isLoading || loader}
                      >
                        {loader ? <Loader2 className="animate-spin" /> : "Cancelar Venda"}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <label className="flex flex-col">
                <span>Status:</span>
                <input type="text" value="Aberto" disabled className="w-full text-neutral-500" />
              </label>
            )}

            <label className="flex flex-col">
              <span>Vendedor:</span>
              {!id ? (
                !isLoadingVendedores ? (
                  <select {...register("vendedorId", { required: false })} className="input w-full">
                    <option value="">Selecione um vendedor</option>
                   {vendedores?.data
                    .filter((vendedor) => vendedor.ativo) // 👈 só vendedores ativos
                    .map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="flex items-center gap-2 mt-2">
                    Aguarde <Loader2 className="animate-spin" />
                  </span>
                )
              ) : (
                <input type="text" value={venda?.data.vendedor.nome} disabled className="w-full text-neutral-500" />
              )}
            </label>

            <label className="flex flex-col">
              <span>Produtos:</span>
              {!id && produtos?.data?.length && (
                <select
                  onChange={(e) =>
                    adicionarProduto(e.target.value, e.target.options[e.target.selectedIndex].text)
                  }
                  className="input w-full"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.data
                    .filter(
                      (prod) =>
                        prod.ativo &&
                        !selectedProdutos.some((selected) => selected.produtoId === prod.id)
                    )
                    .map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nome}
                      </option>
                    ))}
                </select>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              {selectedProdutos.map((produto) => (
                <div
                  key={produto.produtoId}
                  className="w-full flex items-center gap-2 bg-pink-200 px-2 py-1 rounded-lg"
                >
                  <div className="flex-1 flex items-center gap-2 justify-between">
                    <span className="truncate max-w-56">{produto.nome}</span>

                    <input
                      type="number"
                      value={produto.quantidade}
                      onChange={(e) =>
                        atualizarQuantidade(produto.produtoId, parseInt(e.target.value))
                      }
                      className="w-16 border border-pink-300 rounded-lg px-1 text-center"
                      disabled={!( !id || status === "OPENED" )}
                      min={1}
                      max={retornaEstoque(produto.produtoId)}
                    />

                    {id && (
                      <input
                        type="number"
                        value={produto.quantidadeVolta || 0}
                        onChange={(e) =>
                          atualizarSaida(produto.produtoId, parseInt(e.target.value))
                        }
                        className="w-16 border border-pink-300 rounded-lg px-1 text-center"
                        disabled={status !== "OPENED"}
                        min={0}
                      />
                    )}
                  </div>

                  {!id && (
                    <button
                      type="button"
                      onClick={() => removerProduto(produto.produtoId)}
                      className="text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {apiError && <p className="text-red-600 text-sm mt-2">{apiError}</p>}

            {!id && (
              <button
                type="submit"
                className="bg-pink-500 px-4 py-2 text-white rounded-lg float-right"
                disabled={isLoading || loader}
              >
                {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
