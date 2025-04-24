import { AxiosResponse } from "axios";
import { File, Loader2, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import useSWR from "swr";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { ProdutoType } from "../../utils/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toBrl } from "../../utils/utils";

export default function Produtos() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const [, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [modalReport, setModalReport] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);

  const { data: produtos, isLoading } = useSWR<AxiosResponse<ProdutoType[]>>(`/produto?page=${currentPage}&items=${itemsPerPage}`, api.get);
  
  useEffect(() => {
    api.get("produto/count").then((response) => setTotalItems(response.data.count));
  }, [])

  function gerarRelatorioPDF() {
    if(start == 0 || end == 0) {
      return;
    }

    setLoader(true);

    api.get(`/produto/report?start=${start}&end=${end}`)
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
      doc.text("Relatório de Produtos", 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, 14, 27);

      autoTable(doc, {
        startY: 35,
        head: [["Nome", "Estoque", "Tipo Produto", "Valor", "Ativo"]],
        body: response.data.map((produto: ProdutoType) => [
          produto.nome,
          produto.estoque,
          produto.tipoProduto.tipo,
          toBrl(produto.tipoProduto.valor),
          produto.ativo ? "Sim" : "Não"
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

      doc.save(`relatorio_produtos_${dataAtual.toISOString().split("T")[0]}.pdf`);
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
          <Link to="/produtos/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <Plus className="text-white size={20}" />
            <span>Novo Produto</span>
          </Link>

          <button onClick={() => {setModalReport(true)}} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <File className="text-white" size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>

        {!isLoading ? (
          produtos && produtos.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {produtos?.data.map((produto: ProdutoType) => (
                    <TableRow key={produto.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        <Link className="group-hover:cursor-pointer" to={`/produtos/form/${produto.id}`}>{produto.nome}</Link>
                      </TableCell>

                      <TableCell>{produto.estoque}</TableCell>

                      <TableCell>
                        <Status status={produto.ativo} />
                      </TableCell>

                      <TableCell>{produto.tipoProduto.tipo}</TableCell>

                      <TableCell>
                      <button
                            type="button"
                            disabled={loader}
                            onClick={() =>
                              setDeleteConfirmationId(produto.id!)
                            }
                            className="bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                          >
                            <Pencil />
                          </button>
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
          <div className="rounded-lg bg-white p-5 font-bold flex flex-col gap-5 min-w-[418px] relative">
            <button className="absolute right-2 top-2 cursor-pointer" onClick={() => setModalReport(false)}>
              <X className="" size={20} />
            </button>

            <h2 className="flex-1 text-center">{loader ? "Aguarde..." : "Defina as datas para o seu relatório"}</h2>

            {!loader ? (
              <>
                <div className="flex items-end gap-5 w-full">
                  <div className="w-full flex flex-col">
                    <span className="text-neutral-500">Estoque Inicial</span>
                    <input type="number" onChange={(e) => setStart(Number(e.target.value))} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>

                  <div className="w-full flex flex-col">
                    <span className="text-neutral-500">Estoque Final</span>
                    <input type="number" onChange={(e) => setEnd(Number(e.target.value))} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max items-center" />
                  </div>
                </div>

                <button type="button" onClick={gerarRelatorioPDF}  className="bg-pink-400 mx-auto text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex items-center gap-2">
                  <span>Gerar relatório</span>
                </button>

                {start == 0 || end == 0 ? <span className="text-sm font-normal text-red-500 text-center">Informe o estoque inicial e final para gerar o relatório!</span> : null}
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
                Endtendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
