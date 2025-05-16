import { AxiosResponse } from "axios";
import { File, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import Skeleton from "../../components/common/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { ProdutoVendaType, VendaType } from "../../utils/types";
import { toBrl } from "../../utils/utils";
import jsPDF from "jspdf";

export default function Vendas() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const location = useLocation ();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProdutosVenda, setSelectedProdutosVenda] = useState<ProdutoVendaType[]>([]);
  const [modalReport, setModalReport] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: vendas, isLoading } = useSWR<AxiosResponse<VendaType[]>>(`/venda?page=${currentPage}&items=${itemsPerPage}`, api.get);

  useEffect(() => {
    api.get("/venda/count").then((response) => setTotalItems(response.data.count));
    mutate(`/venda?page=${currentPage}&items=${itemsPerPage}`, undefined, { revalidate: true });
  }, [location.pathname]);

  function convertStatus(status: string) {
    switch (status)
    {
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

  function abrirModal(produtosVenda: ProdutoVendaType[]) {
    setSelectedProdutosVenda(produtosVenda);
    setModalOpen(true);
  }

  function parseDate(dateString: string): number {
    return new Date(dateString).getTime();
  }

  function gerarRelatorioPDF() {
    
    if (!startDate || !endDate) {
      return;
    }
  
    setLoader(true);
  
    api.get(`/venda/report?start=${parseDate(startDate)}&end=${parseDate(endDate)}`)
      .then((response) => {
        const vendas: VendaType[] = response.data;
  
        if (!vendas.length) {
          setStartDate("");
          setEndDate("");
          setModalReport(false);
          setNotFoundModal(true);
          return;
        }
  
        const doc = new jsPDF();
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
  
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleDateString();
        const horaFormatada = dataAtual.toLocaleTimeString();
  
        doc.setFontSize(14);
        doc.text("Relatório de Vendas", 14, y);
        y += 10;
        doc.setFontSize(10);
        doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, 14, y);
        y += 10;
  
        vendas.forEach((venda, index) => {
          if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
          }
  
          const dataVenda = new Date(venda.dataCriacao).toLocaleString();
  
          doc.setFontSize(12);
          doc.text(`Data: ${dataVenda}`, 14, y);
          y += 6;
          doc.text(`Status: ${convertStatus(venda.status)}`, 14, y);
          y += 6;
          doc.text(`Total: ${toBrl(venda.total)}`, 14, y);
          y += 6;
          doc.text(`Vendedor: ${venda.vendedor?.nome ?? '---'} (${venda.vendedor?.telefone})`, 14, y);
          y += 8;
  
          doc.text("Produtos:", 14, y);
          y += 6;
  
          venda.produtoVenda.forEach((produto) => {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 20;
            }
  
            const totalProduto = produto.quantidadeSaida * produto.valor;
  
            doc.text(
              `• ${produto.nome} - Qtd: ${produto.quantidadeSaida}, Retorno: ${produto.quantidadeVolta}, Valor Unitário: ${toBrl(produto.valor)}, Total: ${toBrl(totalProduto)}`,
              20,
              y
            );
            y += 6;
          });
  
          if (index < vendas.length - 1) {
            doc.setDrawColor(180);
            doc.setLineWidth(0.3);
            doc.line(14, y, doc.internal.pageSize.width - 14, y);
            y += 6;
          }
        });
  
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, pageHeight - 10, { align: "center" });
        }
  
        doc.save(`relatorio_vendas_${dataAtual.toISOString().split("T")[0]}.pdf`);
        setLoader(false);
      })
      .finally(() => {
        setStartDate("");
        setEndDate("");
        setModalReport(false);
        setLoader(false);
      });
  }
  

  return (
    <>
      <div className="relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <div className="flex justify-between items-center">
          <Link to="/vendas/form" className="bg-pink-500 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <Plus className="text-white size={20}" />
            <span>Nova Venda</span>
          </Link>

          <button onClick={() => setModalReport(true)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <File className="text-white" size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {!isLoading ? (
          <>
            <Table className="md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Volta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Produtos</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {vendas?.data.map((venda: VendaType) => (
                  <TableRow key={venda.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                    <TableCell className="group-hover:text-pink-500 group-hover:underline">
                      <Link className="group-hover:cursor-pointer" to={`/vendas/form/${venda.id}`}>{new Date(venda.dataCriacao).toLocaleDateString()}</Link>
                    </TableCell>

                    <TableCell>{toBrl(venda.total)}</TableCell>
                    <TableCell>{venda.produtoVenda.reduce((total, produto) => total + produto.quantidadeSaida, 0)}</TableCell>
                    <TableCell>{venda.produtoVenda.reduce((total, produto) => total + produto.quantidadeVolta, 0)}</TableCell>
                    <TableCell>{convertStatus(venda.status)}</TableCell>
                    <TableCell className="max-w-52 truncate">{venda.vendedor.nome}</TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {venda.produtoVenda.slice(0, 1).map((produto: ProdutoVendaType) => (
                          <span key={produto.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                            {produto.nome}
                          </span>
                        ))}

                        {venda.produtoVenda.length > 1 && (
                          <button onClick={() => abrirModal(venda.produtoVenda)} className="cursor-pointer text-sm text-pink-600 hover:underline flex items-center">
                            <Plus size={12} className="mr-1" /> Ver mais
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)} className="text-neutral-600 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg mx-1 disabled:opacity-50 text-sm">
                Anterior
              </button>

              <span className="px-4 py-2 text-sm text-neutral-600">{`Página ${currentPage + 1} de ${totalPages}`}</span>

              <button disabled={currentPage + 1 === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="text-neutral-600 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg mx-1 disabled:opacity-50 text-sm">
                Próxima
              </button>
            </div>
          </>
        ) : (
          <Skeleton />
        )}
      </div>

      <Outlet />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-lg font-bold">Matérias-Primas</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-600 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {selectedProdutosVenda.map((produtoVenda: ProdutoVendaType) => (
                <span key={produtoVenda.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                  {produtoVenda.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalReport && (
        <div className="bg-black/50 fixed z-50 inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-white p-5 font-bold flex flex-col gap-5 min-w-[418px] relative">
            <button 
              className="absolute right-2 top-2 cursor-pointer" 
              onClick={() => {
                setModalReport(false);
                setStartDate("");
                setEndDate("");
              }}
            >
              <X className="" size={20} />
            </button>

            <h2 className="flex-1 text-center">{loader ? "Aguarde..." : "Defina as datas para o seu relatório"}</h2>

            {!loader ? (
              <>
                <div className="flex items-end gap-5 w-full">
                  <div className="w-full flex items-center gap-1">
                    <span className="text-neutral-500">De</span>
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>

                  <div className="w-full flex items-center gap-1">
                    <span className="text-neutral-500">Até</span>
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>
                </div>

                <button type="button" onClick={gerarRelatorioPDF}  className="bg-pink-400 mx-auto text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex items-center gap-2">
                  <span>Gerar relatório</span>
                </button>

                {!startDate || !endDate ? <span className="text-sm font-normal text-red-500 text-center">Selecione as datas para gerar o relatório!</span> : null}
              </>
            ) : (
              <Loader2 className="animate-spin mx-auto text-pink-500" size={30} />
            )}
          </div>
        </div>
      )}

      {notFoundModal && (
        <div className="bg-black/50 fixed z-50 inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-white p-5 font-bold flex flex-col gap-10">
            <h2 className="flex-1">Nenhum registro para o relatório solicitado foi encontrado!</h2>

            <div className="flex items-center gap-5">
              <button
                onClick={() => {
                  setNotFoundModal(false);
                  setLoader(false);
                }}
                className="w-full bg-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer flex gap-2 items-center justify-center"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}