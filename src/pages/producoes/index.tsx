import { AxiosResponse } from "axios";
import jsPDF from "jspdf";
import { File, Loader2, Plus, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { ProducaoReceitaType, ProducaoType } from "../../utils/types";
import { useNavigate } from "react-router-dom";

export default function Producoes() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const [, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducaoReceita, setSelectedProducaoReceita] = useState<ProducaoReceitaType[]>([]);
  const [modalReport, setModalReport] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const { data: producoes, isLoading } = useSWR<AxiosResponse<ProducaoType[]>>(`/producao?page=${currentPage}&items=${itemsPerPage}`, api.get);

  useEffect(() => {
    api.get("producao/count").then((response) => setTotalItems(response.data.count));
    mutate(`/producao?page=${currentPage}&items=${itemsPerPage}`)
  }, [location.pathname]);

  function abrirModal(producaoReceita: ProducaoReceitaType[]) {
    if(producaoReceita.length) {
      setSelectedProducaoReceita(producaoReceita);
      setModalOpen(true);
    }
  }

  function parseDate(dateString: string) {
    const date = new Date(dateString).toLocaleDateString()
    return date;
  }

  function gerarRelatorioPDF() {
    if(!startDate || !endDate) {
      return;
    }

    setLoader(true);

    api.get(`/producao/report?start=${parseDate(startDate)}&end=${parseDate(endDate)}`)
    .then((response) => {
      if (!response.data.length) {
        setModalReport(false);
        setStartDate("");
        setEndDate("");
        setNotFoundModal(true);
        return;
      }

      const doc = new jsPDF();
      let y = 20;
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleDateString();
      const horaFormatada = dataAtual.toLocaleTimeString();

      doc.setFontSize(14);
      doc.text("Relatório de Produção", 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, 14, y);
      y += 10;

      (response.data as ProducaoType[]).forEach((producao, index) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.text(`Produção ${index + 1}:`, 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.text(`Criado em: ${producao.dataAtual} | Vencimento: ${producao.vencimento}`, 14, y);
        y += 6;
        doc.text("Receitas:", 14, y);
        y += 6;

        producao.receitaProducaoModel?.forEach((item) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }

          doc.text(`- ${item.receita.produto.nome} (Quantidade Produzida: ${item.quantidadeProduzida})`, 20, y);
          y += 6;

          if (item.receita.receitaMateriaPrima && item.receita.receitaMateriaPrima.length > 0) {
            doc.text("  Ingredientes:", 20, y);
            y += 6;

            item.receita.receitaMateriaPrima.forEach((ingrediente) => {
              if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
              }

              doc.text(`• ${ingrediente.materiaPrima.nome} (Quantidade: ${ingrediente.quantidadeMP})`, 26, y);
              y += 6;
            });
          }

          y += 2;
        });

        if (index < response.data.length - 1) {
          doc.setDrawColor(180);
          doc.setLineWidth(0.3);
          doc.line(14, y, pageWidth - 14, y);
          y += 6;
        } else {
          y += 4;
        }
      });

      const pageCount = doc.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      doc.save(`relatorio_producao_${dataAtual.toISOString().split("T")[0]}.pdf`);
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
          <Link to="/producoes/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <Plus className="text-white size={20}" />
            <span>Nova Produção</span>
          </Link>

          <button onClick={() => setModalReport(true)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <File className="text-white" size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {!isLoading ? (
          producoes && producoes.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {producoes?.data.map((producao: ProducaoType) => (
                    <TableRow key={producao.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        {/* <Link className="group-hover:cursor-pointer" to={`/producoes/form/${producao.id}`}>{producao.dataAtual}</Link> */}
                        {producao.dataAtual}
                      </TableCell>

                      <TableCell>{producao.vencimento}</TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {producao.receitaProducaoModel?.slice(0, 1).map((receitaProducao: any) => (
                            <span key={receitaProducao.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                              {receitaProducao.receita.produto.nome}
                            </span>
                          ))}

                          {producao.receitaProducaoModel && producao.receitaProducaoModel.length > 1 && (
                            <button onClick={() => abrirModal(producao.receitaProducaoModel!)} className="cursor-pointer text-sm text-pink-600 hover:underline flex items-center">
                              <Plus size={12} className="mr-1" /> Ver mais
                            </button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Status status={producao.ativo} />
                      </TableCell>

                      <TableCell>
                       <div
                         onClick={() => navigate(`/producoes/form/${producao.id}`)}
                          className="bg-neutral-100 text-neutral-600 w-max hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                        >
                          <Pencil />
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
            <EmptyList />
          )
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
              {selectedProducaoReceita.map((producaoReceita) => (
                <span key={producaoReceita.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                  {producaoReceita.receita.produto.nome} - {producaoReceita.quantidadeProduzida}
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
                  <div className="w-full flex flex-col">
                    <span className="text-neutral-500">Data Inicial</span>
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>

                  <div className="w-full flex flex-col">
                    <span className="text-neutral-500">Data Vencimento</span>
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>
                </div>

                <button type="button" onClick={gerarRelatorioPDF}  className="bg-pink-400 mx-auto text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex items-center gap-2">
                  <span>Gerar relatório</span>
                </button>

                {!startDate || !endDate ? <span className="text-sm font-normal text-red-500 text-center">Selecione as datas de início e vencimento para gerar o relatório!</span> : null}
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