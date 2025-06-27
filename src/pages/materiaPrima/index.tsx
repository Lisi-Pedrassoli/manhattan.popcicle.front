import { useEffect, useState } from "react";
import { MateriaPrimaType } from "../../utils/types";
import api from "../../utils/api";
import { Link, Outlet, useLocation } from "react-router-dom";
import { File, Loader2, Plus, Pencil, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { AxiosResponse } from "axios";
import useSWR, { mutate } from "swr";
import { Status } from "../../components/common/status";
import { conversorUnidadeMedida } from "../../components/materia-prima/unidade";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

export default function MateriaPrima() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const [, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [modalReport, setModalReport] = useState(false);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const navigate = useNavigate();

  const { data: materiasPrimas, isLoading } = useSWR<AxiosResponse<MateriaPrimaType[]>>(`/materia-prima?page=${currentPage}&items=${itemsPerPage}`, api.get);
  
  useEffect(() => {
    api.get("materia-prima/count").then((response) => setTotalItems(response.data.count));
    mutate(`/materia-prima?page=${currentPage}&items=${itemsPerPage}`)
  }, [location.pathname]);

  function gerarRelatorioPDF() {
    if(start == 0 || end == 0) {
      return;
    }

    setLoader(true);

    api.get(`/materia-prima/report?start=${start}&end=${end}`)
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
      doc.text("Relatório de Matérias Primas", 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dataFormatada} às ${horaFormatada}`, 14, 27);

      autoTable(doc, {
        startY: 35,
        head: [["Nome", "Estoque", "Unidade de medida", "Ativo"]],
        body: response.data.map((materiaPrima: MateriaPrimaType) => [
          materiaPrima.nome,
          materiaPrima.quantidadeEstoque,
          materiaPrima.unidadeMedida,
          materiaPrima.ativo ? "Sim" : "Não"
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
      <div className="pt-12 sm:pt-0 relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
      <div className="flex justify-between items-center">
        <Link to="/materias-primas/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
          <Plus className="text-white size={20}" />
          <span>Nova Matéria Prima</span>
        </Link>

          <button onClick={() => {setModalReport(true)}} className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
            <File className="text-white" size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>


        {!isLoading ? (
          materiasPrimas && materiasPrimas.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Un. Medida</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {materiasPrimas?.data.map((materiaPrima: MateriaPrimaType) => (
                    <TableRow key={materiaPrima.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        {/* <Link className="group-hover:cursor-pointer" to={`/materias-primas/form/${materiaPrima.id}`}>{materiaPrima.nome}</Link> */}
                        {materiaPrima.nome}
                      </TableCell>
                      <TableCell>{materiaPrima.quantidadeEstoque}</TableCell>
                      <TableCell>{conversorUnidadeMedida(materiaPrima.unidadeMedida)}</TableCell>
                      <TableCell>
                        <Status status={materiaPrima.ativo} />
                      </TableCell>
                      <TableCell>
                      <div
                         onClick={() => navigate(`/materias-primas/form/${materiaPrima.id}`)}
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
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
