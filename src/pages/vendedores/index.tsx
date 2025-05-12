import { AxiosResponse } from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CheckCircle, File, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { VendedorType } from "../../utils/types";
import { formatPhone, toBrl } from "../../utils/utils";

export default function Vendedores() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const location = useLocation ();
  const [deleteConfirmationId, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [modalReport, setModalReport] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);

  const { data: vendedores, isLoading } = useSWR<AxiosResponse<VendedorType[]>>(`/vendedor?page=${currentPage}&items=${itemsPerPage}`, api.get);

  useEffect(() => {
    api.get("vendedor/count").then((response) => {setTotalItems(response.data.count);});
    mutate(`/vendedor?page=${currentPage}&items=${itemsPerPage}`)
  }, [location.pathname]);

  function desativarVendedor() {
    setLoader(true);
    api.delete(`/vendedores/${deleteConfirmationId}`)
    .then(() => {
      mutate("/vendedor");
      setDeleteConfirmationId("");
      setLoader(false);
    })
    .finally(() => {
      setLoader(false);
    });
  }

  function gerarRelatorioPDF(status: boolean) {
    setLoader(true);

    api.get("/vendedor/report/" + status)
    .then((response) => {
      if(!response.data.length){
        setModalReport(false);
        setNotFoundModal(true);
        return;
      }

      const doc = new jsPDF();
      const totalPagesExp = "{totalPages}";
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toLocaleDateString();
      const horaFormatada = dataAtual.toLocaleTimeString();

      doc.setFontSize(14);
      doc.text("Relatório de Vendedores", 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, 14, 27);

      autoTable(doc, {
        startY: 35,
        head: [["Nome", "Comissão", "Telefone", "Ativo"]],
        body: response.data.map((vendedor: VendedorType) => [
          vendedor.nome,
          toBrl(vendedor.comissao),
          formatPhone(vendedor.telefone),
          vendedor.ativo ? "Sim" : "Não"
        ]),

        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();
          const pageNumber = (doc as any).getNumberOfPages();

          doc.setFontSize(10);
          doc.text(`Página ${pageNumber} de ${totalPagesExp}`, pageWidth / 2, pageHeight - 10, {
            align: "center",
          });
        },
      });

      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesExp);
      }

      doc.save(`relatorio_vendedores_${status ? "ativos" : "inativos"}_${dataAtual.toISOString().split("T")[0]}.pdf`);
      setLoader(false);
    })
    .finally(() => {
      setModalReport(false);
    })
  }

  return (
    <>
      <div className="relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <div className="flex justify-between items-center">
          <Link to="/vendedores/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <Plus className="text-white" size={20} />
            <span>Novo Vendedor</span>
          </Link>

          <button onClick={() => {setModalReport(true)}} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <File className="text-white" size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {!isLoading ? (
          vendedores && vendedores.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Comissao</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {vendedores?.data.map((vendedor: VendedorType) => (
                    <TableRow key={vendedor.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        <Link className="group-hover:cursor-pointer" to={`/vendedores/form/${vendedor.id}`}>{vendedor.nome}</Link>
                      </TableCell>

                      <TableCell>{vendedor.comissao}%</TableCell>

                      <TableCell>{formatPhone(vendedor.telefone)}</TableCell>

                      <TableCell>
                        <Status status={vendedor.ativo} />
                      </TableCell>

                      <TableCell>
                        {deleteConfirmationId == vendedor.id ? (
                          <button
                            type="button"
                            disabled={loader}
                            onClick={() => desativarVendedor()}
                            className="bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 rounded-lg p-1"
                          >
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loader}
                            onClick={() =>
                              setDeleteConfirmationId(vendedor.id!)
                            }
                            className="bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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

      {modalReport && (
        <div className="bg-black/50 fixed z-50 inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-white p-5 font-bold flex flex-col gap-10 min-w-[418px] relative">
            <button className="absolute right-2 top-2 cursor-pointer" onClick={() => setModalReport(false)}>
              <X className="" size={20} />              
            </button>

            <h2 className="flex-1 text-center mt-2">{loader ? "Aguarde..." : "Qual Status deseja considerar no seu relatório?"}</h2>

            {!loader ? (
              <div className="flex items-center gap-5">
                <button onClick={() => gerarRelatorioPDF(true)} className="w-full bg-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer flex gap-2 items-center justify-center">Ativos</button>

                <button onClick={() => gerarRelatorioPDF(false)} className="w-full bg-pink-400 text-white px-4 py-2 rounded-lg cursor-pointer flex gap-2 items-center justify-center">Inativos</button>
              </div>
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
